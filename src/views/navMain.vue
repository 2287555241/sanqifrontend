<template>
  <div class="nav-main-container">
    <div class="workspace">
      <div class="workspace-content">
        <!-- 使用条件渲染显示不同的内容视图 -->
        <template v-if="activeView === 'home'">
          <div class="welcome-content">
            <div class="welcome-message">
              <h1>欢迎使用三七遥感监测系统</h1>
              <p>开始您的三七种植监测项目</p>
            </div>
            
            <div class="projects-section">
              <div 
                class="project-creator"
                @click="createNewProject"
              >
                <el-icon class="folder-icon"><Folder /></el-icon>
                <div class="project-button">
                  <div class="button-text">
                    <el-icon><Plus /></el-icon>
                    <span>新建项目</span>
                  </div>
                </div>
              </div>
              
              <div class="quick-actions">
                <div class="action-card" @click="handleActionClick('import')">
                  <el-icon><Document /></el-icon>
                  <span>导入数据</span>
                </div>
                <div class="action-card" @click="handleActionClick('templates')">
                  <el-icon><Collection /></el-icon>
                  <span>模板中心</span>
                </div>
                <div class="action-card" @click="handleActionClick('help')">
                  <el-icon><Help /></el-icon>
                  <span>使用帮助</span>
                </div>
              </div>
            </div>
          </div>
        </template>
        
        <!-- 地图视图 -->
        <MapView v-if="activeView === 'map'" />
        
        <!-- 其他视图占位符 -->
        <div v-if="activeView === 'analysis'" class="module-content">
          <h2>数据分析区</h2>
          <p>此处显示数据分析功能</p>
        </div>
        
        <div v-if="activeView === 'yield'" class="module-content">
          <h2>产量估算</h2>
          <p>此处显示产量估算功能</p>
        </div>
        
        <div v-if="activeView === 'overlay'" class="module-content">
          <h2>耕地数据叠加与分析</h2>
          <p>此处显示耕地数据叠加与分析功能</p>
        </div>
        
        <div v-if="activeView === 'export'" class="module-content">
          <h2>数据导出</h2>
          <p>此处显示数据导出功能</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed, watch, defineExpose } from 'vue';
import { useRouter } from 'vue-router';
import MapView from './MapView.vue';
import { emitter, activeView, Events } from '../utils/eventBus';
import { Plus, Folder, Document, Collection, Help } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

const router = useRouter();
const currentView = ref(null);

// 创建新项目
const createNewProject = () => {
  emitter.emit('show-project-management');
};

// 处理快捷操作点击
const handleActionClick = (action) => {
  switch(action) {
    case 'import':
      // 处理导入数据
      emitter.emit('open-import-dialog');
      break;
    case 'templates':
      // 处理模板中心
      router.push('/templates');
      break;
    case 'help':
      // 处理使用帮助
      router.push('/help');
      break;
  }
};

// 添加遥感处理结果图层 - 参考combinedMap.js中的方法实现
const addProcessedLayer = async (layerInfo) => {
  try {
    console.log('添加图层到地图:', layerInfo);
    
    // 确保当前是地图视图
    if (activeView.value !== 'map') {
      activeView.value = 'map';
      console.log('切换到地图视图');
      await new Promise(resolve => setTimeout(resolve, 300)); // 等待视图切换
    }
    
    // 确保地图已初始化
    if (!map || !view) {
      console.error('地图尚未初始化');
      ElMessage.error('地图组件尚未初始化，无法添加图层');
      return;
    }
    
    // 确保图像URL是完整的
    const imageUrl = layerInfo.url.startsWith('http') ? layerInfo.url : `http://localhost:9191${layerInfo.url}`;
    // 替换主机名
    const finalUrl = imageUrl.replace('laptop-9sa3drlj', 'localhost');
    console.log('处理后的图像URL:', finalUrl);

    // 检查我们是使用ArcGIS API还是Leaflet
    if (window.L && typeof window.L.map === 'function') {
      // Leaflet实现 - 类似combinedMap.js
      console.log('使用Leaflet实现图层添加');
      
      // 确保边界格式正确 [[north, west], [south, east]]
      const bounds = [
        [layerInfo.bounds.ymax, layerInfo.bounds.xmin], // 左上角 [north, west]
        [layerInfo.bounds.ymin, layerInfo.bounds.xmax]  // 右下角 [south, east]
      ];
      
      // 创建ID
      const overlayId = `gsf-result-${Date.now()}`;
      
      // 添加图像覆盖层
      const imageOverlay = L.imageOverlay(finalUrl, bounds, {
        opacity: 0.8,
        id: overlayId
      }).addTo(map);
      
      // 缩放到图层范围
      map.fitBounds(bounds);
      
      ElMessage.success(`已添加处理结果: ${layerInfo.name || '栅格处理结果'}`);
      return;
    }

    // ArcGIS API实现
    console.log('使用ArcGIS API实现图层添加');
    
    // 准备创建图层
    await loadModules([
      'esri/layers/ImageryLayer',
      'esri/Graphic', 
      'esri/layers/GraphicsLayer',
      'esri/geometry/Extent',
      'esri/layers/support/ImageParameters',
      'esri/geometry/SpatialReference'
    ]).then(([ImageryLayer, Graphic, GraphicsLayer, Extent, ImageParameters, SpatialReference]) => {
      // 创建唯一ID
      const layerId = `gsf-result-${Date.now()}`;
      
      // 创建边界范围对象
      const extent = new Extent({
        xmin: layerInfo.bounds.xmin,
        ymin: layerInfo.bounds.ymin,
        xmax: layerInfo.bounds.xmax,
        ymax: layerInfo.bounds.ymax,
        spatialReference: { wkid: 4326 }
      });
      
      // 移除同ID的已有图层
      const existingLayer = map.findLayerById(layerId);
      if (existingLayer) {
        map.remove(existingLayer);
      }

      // 创建图形图层
      const graphicsLayer = new GraphicsLayer({
        id: `graphics-${layerId}`
      });
      map.add(graphicsLayer);
      
      // 创建边界框图形
      const boundaryGraphic = new Graphic({
        geometry: extent,
        symbol: {
          type: "simple-fill",
          color: [255, 255, 0, 0.1],
          outline: {
            color: [255, 0, 0],
            width: 2
          }
        }
      });
      graphicsLayer.add(boundaryGraphic);

      // 使用简单的方法：DOM方式添加图像覆盖
      const imageOverlayId = `overlay-${layerId}`;
      
      // 移除已有的图像叠加
      const existingOverlay = document.getElementById(imageOverlayId);
      if (existingOverlay) existingOverlay.remove();
      
      // 创建图像元素
      const img = document.createElement('img');
      img.id = imageOverlayId;
      img.src = finalUrl;
      img.style.position = 'absolute';
      img.style.pointerEvents = 'none';
      img.style.opacity = '0.8';
      img.style.zIndex = '100';
      img.style.transformOrigin = 'top left';
      
      // 添加图像到视图容器
      view.container.appendChild(img);
      
      // 图像加载完成后处理
      img.onload = function() {
        console.log('处理结果图像加载完成');
        
        // 定义图像定位函数
        const positionImage = () => {
          try {
            // 转换地理坐标到屏幕坐标
            const topLeft = view.toScreen({
              x: extent.xmin,
              y: extent.ymax,
              spatialReference: { wkid: 4326 }
            });
            
            const bottomRight = view.toScreen({
              x: extent.xmax,
              y: extent.ymin,
              spatialReference: { wkid: 4326 }
            });
            
            if (topLeft && bottomRight) {
              // 设置图像位置和大小
              img.style.left = `${topLeft.x}px`;
              img.style.top = `${topLeft.y}px`;
              img.style.width = `${bottomRight.x - topLeft.x}px`;
              img.style.height = `${bottomRight.y - topLeft.y}px`;
              img.style.display = 'block';
            }
          } catch (e) {
            console.error('图像定位错误:', e);
          }
        };
        
        // 初始定位并缩放到范围
        view.goTo({target: extent}, {duration: 1000}).then(() => {
          console.log('已缩放到处理结果区域');
          positionImage();
        });
        
        // 监听视图变化事件
        view.watch('extent', positionImage);
        view.watch('rotation', positionImage);
        view.on('resize', positionImage);
      };
      
      img.onerror = function() {
        console.error('图像加载失败:', finalUrl);
        ElMessage.error('结果图像加载失败');
      };
      
      ElMessage.success(`已添加处理结果: ${layerInfo.name || '栅格处理结果'}`);
    }).catch(err => {
      console.error('加载ArcGIS模块失败:', err);
      ElMessage.error('地图组件加载失败');
    });
    
  } catch (error) {
    console.error('添加图层失败:', error);
    ElMessage.error('添加图层失败: ' + (error.message || '未知错误'));
  }
};

// 监听内容刷新事件
const refreshContentHandler = (data) => {
  console.log('接收到内容刷新事件:', data);
};

// 监听地图清除事件
const clearMapHandler = () => {
  console.log('接收到地图清除事件');
  // 这里可以调用地图组件的清除方法
};

// 监听activeView变化
watch(() => activeView.value, (newView, oldView) => {
  console.log(`视图从 ${oldView} 切换到 ${newView}`);
  
  // 如果从地图视图切换出来，确保清理地图资源
  if (oldView === 'map' && newView !== 'map') {
    console.log('从地图视图切换出来，清理地图资源');
    emitter.emit(Events.CLEAR_MAP);
  }
});

onMounted(() => {
  // 注册事件监听
  emitter.on(Events.REFRESH_CONTENT, refreshContentHandler);
  emitter.on(Events.CLEAR_MAP, clearMapHandler);
});

onBeforeUnmount(() => {
  // 移除事件监听
  emitter.off(Events.REFRESH_CONTENT, refreshContentHandler);
  emitter.off(Events.CLEAR_MAP, clearMapHandler);
});

// 暴露方法给父组件
defineExpose({
  addProcessedLayer
});
</script>

<style scoped>
.nav-main-container {
  width: 100%;
  height: 100vh;
  background-color: #1a1a1a;
  padding: 30px 64px 0 64px; /* 顶部30px(header高度)，左侧64px(收起的菜单宽度) */
  box-sizing: border-box;
}

.workspace {
  width: 100%;
  height: 100%;
  background-color: #1a1a1a;
  border-radius: 4px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.workspace-content {
  width: 100%;
  height: 100%;
  background-color: #2c2c2c; /* 调整为稍浅的深色 */
  border-radius: 4px;
  position: relative;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2); /* 添加轻微阴影以增加层次感 */
  overflow: hidden; /* 防止内容溢出 */
}

/* 首页欢迎内容样式 */
.welcome-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.welcome-message {
  text-align: center;
  margin-bottom: 30px;
  color: rgba(255, 255, 255, 0.9);
}

.welcome-message h1 {
  font-size: 24px;
  font-weight: 500;
  margin-bottom: 10px;
  letter-spacing: 1px;
}

.welcome-message p {
  font-size: 16px;
  opacity: 0.8;
}

.projects-section {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.project-creator {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: transform 0.3s ease;
  margin-bottom: 30px;
}

.project-creator:hover {
  transform: scale(1.02);
}

.folder-icon {
  font-size: 100px;
  color: rgba(255, 255, 255, 0.9);
  transition: transform 0.3s ease;
  margin-bottom: 15px;
}

.project-creator:hover .folder-icon {
  transform: translateY(-8px);
}

.project-button {
  padding: 16px 30px;
  background: rgba(255, 255, 255, 0.08);
  border: 2px dashed rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  min-width: 120px;
  transition: all 0.3s ease;
}

.project-creator:hover .project-button {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.4);
}

.button-text {
  display: flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
}

.button-text .el-icon {
  font-size: 14px;
  margin-right: 4px;
}

.quick-actions {
  display: flex;
  gap: 20px;
  margin-top: 10px;
}

.action-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 15px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 80px;
}

.action-card:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-3px);
}

.action-card .el-icon {
  font-size: 24px;
  margin-bottom: 8px;
  color: rgba(255, 255, 255, 0.9);
}

.action-card span {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.9);
}

/* 模块内容样式 */
.module-content {
  padding: 30px;
  color: rgba(255, 255, 255, 0.9);
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.module-content h2 {
  font-size: 24px;
  margin-bottom: 20px;
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
