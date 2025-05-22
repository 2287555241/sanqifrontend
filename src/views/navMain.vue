<template>
  <div class="nav-main-container">
    <div id="mapView" class="map-container"></div>
    <div 
      class="panel panel-1"
      :style="{
        top: panelPositions.panel1.top,
        right: panelPositions.panel1.right
      }"
      @mousedown="(e) => startDrag(e, 'panel1')"
    >
      <div class="panel-header">
        <h3>数据概览</h3>
      </div>
      <div class="panel-content">
        <div class="data-item">
          <span class="label">总用户数</span>
          <span class="value">1,234</span>
        </div>
        <div class="data-item">
          <span class="label">今日活跃</span>
          <span class="value">256</span>
        </div>
        <div class="data-item">
          <span class="label">本月新增</span>
          <span class="value">89</span>
        </div>
      </div>
    </div>
    <div 
      class="panel panel-2"
      :style="{
        top: panelPositions.panel2.top,
        right: panelPositions.panel2.right
      }"
      @mousedown="(e) => startDrag(e, 'panel2')"
    >
      <div class="panel-header">
        <h3>系统状态</h3>
      </div>
      <div class="panel-content">
        <div class="status-item">
          <span class="label">CPU使用率</span>
          <el-progress :percentage="45" :format="format" />
        </div>
        <div class="status-item">
          <span class="label">内存使用</span>
          <el-progress :percentage="60" :format="format" />
        </div>
        <div class="status-item">
          <span class="label">存储空间</span>
          <el-progress :percentage="30" :format="format" />
        </div>
      </div>
    </div>
    <div 
      class="panel panel-3"
      :style="{
        top: panelPositions.panel3.top,
        right: panelPositions.panel3.right
      }"
      @mousedown="(e) => startDrag(e, 'panel3')"
    >
      <div class="panel-header">
        <h3>最近活动</h3>
      </div>
      <div class="panel-content">
        <div class="activity-item">
          <el-icon><Bell /></el-icon>
          <div class="activity-info">
            <div class="activity-title">系统更新通知</div>
            <div class="activity-time">10分钟前</div>
          </div>
        </div>
        <div class="activity-item">
          <el-icon><User /></el-icon>
          <div class="activity-info">
            <div class="activity-title">新用户注册</div>
            <div class="activity-time">30分钟前</div>
          </div>
        </div>
        <div class="activity-item">
          <el-icon><Setting /></el-icon>
          <div class="activity-info">
            <div class="activity-title">系统配置更新</div>
            <div class="activity-time">2小时前</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { loadModules } from 'esri-loader';
import { ElProgress } from 'element-plus';
import { Bell, User, Setting, Plus, Upload, Download } from '@element-plus/icons-vue';

const tk = "cbd48f39fb1e392a76ab69f7090b93c4";
const basemapUrls = [
  `http://t0.tianditu.gov.cn/DataServer?T=vec_w&x={x}&y={y}&l={z}&tk=${tk}`,
  `http://t0.tianditu.gov.cn/DataServer?T=cva_w&x={x}&y={y}&l={z}&tk=${tk}`
];

const format = (percentage) => percentage + '%';

// 面板的默认位置
const defaultPositions = {
  panel1: { top: '90px', right: '24px' },
  panel2: { top: '340px', right: '24px' },
  panel3: { top: '600px', right: '24px' }
};

// 面板的当前位置
const panelPositions = ref({
  panel1: { ...defaultPositions.panel1 },
  panel2: { ...defaultPositions.panel2 },
  panel3: { ...defaultPositions.panel3 }
});

// 拖拽相关状态
const isDragging = ref(false);
const currentPanel = ref(null);
const dragOffset = ref({ x: 0, y: 0 });

// 开始拖拽
const startDrag = (e, panelId) => {
  if (e.target.closest('.el-button')) return; // 如果点击的是按钮，不启动拖拽
  isDragging.value = true;
  currentPanel.value = panelId;
  const panel = e.target.closest('.panel');
  const rect = panel.getBoundingClientRect();
  dragOffset.value = {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  };
  document.addEventListener('mousemove', onDrag);
  document.addEventListener('mouseup', stopDrag);
};

// 拖拽中
const onDrag = (e) => {
  if (!isDragging.value) return;
  
  const container = document.querySelector('.nav-main-container');
  const containerRect = container.getBoundingClientRect();
  
  // 计算新位置
  let newTop = e.clientY - containerRect.top - dragOffset.value.y;
  let newRight = containerRect.right - e.clientX - dragOffset.value.x;
  
  // 限制在容器内
  newTop = Math.max(0, Math.min(newTop, containerRect.height - 200));
  newRight = Math.max(0, Math.min(newRight, containerRect.width - 300));
  
  // 更新位置
  panelPositions.value[currentPanel.value] = {
    top: `${newTop}px`,
    right: `${newRight}px`
  };
};

// 停止拖拽
const stopDrag = () => {
  isDragging.value = false;
  currentPanel.value = null;
  document.removeEventListener('mousemove', onDrag);
  document.removeEventListener('mouseup', stopDrag);
};

onMounted(() => {
  // 重置面板位置
  panelPositions.value = {
    panel1: { ...defaultPositions.panel1 },
    panel2: { ...defaultPositions.panel2 },
    panel3: { ...defaultPositions.panel3 }
  };
  
  loadModules([
    'esri/Map',
    'esri/views/MapView',
    'esri/layers/WebTileLayer',
    'esri/layers/WMSLayer',
    'esri/layers/BaseTileLayer'
  ]).then(([Map, MapView, WebTileLayer, WMSLayer, BaseTileLayer]) => {
    const baseLayers = basemapUrls.map(url => {
      return new WebTileLayer({ urlTemplate: url });
    });

    const wmsLayer = new WMSLayer({
      url: "http://localhost:8200/geoserver/sanqi/wms",
      sublayers: [
        {
          name: "sanqi:sanqiresearcharea"
        }
      ],
      version: "1.3.0",
      spatialReference: { wkid: 4490 },
      opacity: 0.8
    });

    const map = new Map({
      basemap: {
        baseLayers: baseLayers
      }
    });

    map.add(wmsLayer);

    const view = new MapView({
      map: map,
      center: [102.7064, 25.0431],
      zoom: 10,
      container: 'mapView',
      ui: {
        components: []
      }
    });

    view.when(() => {
      console.log("地图加载完成");
    });
  }).catch(err => {
    console.error('Error loading ArcGIS modules:', err);
  });
});
</script>

<style scoped>
.nav-main-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: transparent;
  padding: 0;
  box-sizing: border-box;
  position: relative;
  overflow: hidden;
}

.map-container {
  flex: 1;
  min-height: 400px;
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  margin: 0 auto;
}

.panel {
  position: fixed;
  width: 300px;
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 4px 24px 0 rgba(0,0,0,0.08);
  cursor: move;
  user-select: none;
  transition: box-shadow 0.3s ease;
  z-index: 1000;
}

.panel:hover {
  box-shadow: 0 6px 32px 0 rgba(0,0,0,0.12);
}

.panel-header {
  margin-bottom: 16px;
  cursor: move;
}

.panel-header h3 {
  margin: 0;
  color: #333;
  font-size: 16px;
  font-weight: 500;
}

.panel-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.data-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.data-item .label {
  color: #666;
  font-size: 14px;
}

.data-item .value {
  color: #333;
  font-size: 16px;
  font-weight: 500;
}

.status-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.status-item .label {
  color: #666;
  font-size: 14px;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
}

.activity-item .el-icon {
  font-size: 18px;
  color: #409EFF;
}

.activity-info {
  flex: 1;
}

.activity-title {
  font-size: 14px;
  color: #333;
  margin-bottom: 4px;
}

.activity-time {
  font-size: 12px;
  color: #909399;
}

.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.quick-actions .el-button {
  width: 100%;
  justify-content: flex-start;
  gap: 8px;
}

.quick-actions .el-icon {
  margin-right: 4px;
}

:deep(.el-progress-bar__outer) {
  background-color: rgba(0, 0, 0, 0.1);
}

:deep(.el-progress-bar__inner) {
  background-color: #409EFF;
}
</style>
