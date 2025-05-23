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
import { Bell, User, Setting } from '@element-plus/icons-vue';

const tk = "cbd48f39fb1e392a76ab69f7090b93c4";
const basemapUrls = [
  `http://t0.tianditu.gov.cn/DataServer?T=vec_w&x={x}&y={y}&l={z}&tk=${tk}`,
  `http://t0.tianditu.gov.cn/DataServer?T=cva_w&x={x}&y={y}&l={z}&tk=${tk}`
];

const format = (percentage) => percentage + '%';

// 面板位置相关逻辑
const defaultPositions = {
  panel1: { top: '90px', right: '24px' },
  panel2: { top: '340px', right: '24px' },
  panel3: { top: '600px', right: '24px' }
};

const panelPositions = ref({
  panel1: { ...defaultPositions.panel1 },
  panel2: { ...defaultPositions.panel2 },
  panel3: { ...defaultPositions.panel3 }
});

const isDragging = ref(false);
const currentPanel = ref(null);
const dragOffset = ref({ x: 0, y: 0 });

const startDrag = (e, panelId) => {
  if (e.target.closest('.el-button')) return;
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

const onDrag = (e) => {
  if (!isDragging.value) return;
  
  const container = document.querySelector('.nav-main-container');
  const containerRect = container.getBoundingClientRect();
  
  let newTop = e.clientY - containerRect.top - dragOffset.value.y;
  let newRight = containerRect.right - e.clientX - dragOffset.value.x;
  
  newTop = Math.max(0, Math.min(newTop, containerRect.height - 200));
  newRight = Math.max(0, Math.min(newRight, containerRect.width - 300));
  
  panelPositions.value[currentPanel.value] = {
    top: `${newTop}px`,
    right: `${newRight}px`
  };
};

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
    'esri/layers/GeoJSONLayer',
    'esri/widgets/Legend'
  ]).then(([Map, MapView, WebTileLayer, GeoJSONLayer, Legend]) => {
    // 创建天地图底图
    const baseLayers = basemapUrls.map(url => {
      return new WebTileLayer({ 
        urlTemplate: url,
        copyright: "天地图"
      });
    });

    const map = new Map({
      basemap: {
        baseLayers: baseLayers
      }
    });

    const view = new MapView({
      map: map,
      center: [102.7064, 25.0431], // 云南文山三七主产区坐标
      zoom: 10,
      container: 'mapView',
      ui: {
        components: []
      }
    });

    // 从后端API获取GeoJSON数据
    fetch('http://localhost:8200/api/SanqiRegion')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        // 确保数据格式正确
        if (!data || !data.features) {
          console.error('Invalid GeoJSON data format:', data);
          return;
        }

        // 创建GeoJSON图层
        const geojsonLayer = new GeoJSONLayer({
          url: 'http://localhost:8200/api/SanqiRegion',
          copyright: "三七种植区域数据",
          opacity: 0.8,
          renderer: {
            type: "simple",
            symbol: {
              type: "simple-fill",
              color: [51, 204, 102, 0.5], // 半透明绿色
              outline: {
                color: [0, 102, 51],
                width: 1
              }
            }
          },
          popupTemplate: {
            title: "三七种植区域",
            content: [{
              type: "fields",
              fieldInfos: [
                {
                  fieldName: "name",
                  label: "区域名称"
                },
                {
                  fieldName: "gid",
                  label: "区域ID"
                }
              ]
            }]
          }
        });

        map.add(geojsonLayer);

        // 添加图例
        view.when(() => {
          const legend = new Legend({
            view: view,
            container: document.createElement("div")
          });
          
          // 可以在这里添加其他UI组件或事件监听
          console.log("地图和图层加载完成");
        });
      })
      .catch(error => {
        console.error('Error fetching or processing GeoJSON data:', error);
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
  background: rgba(255, 255, 255, 0.9);
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

:deep(.el-progress-bar__outer) {
  background-color: rgba(0, 0, 0, 0.1);
}

:deep(.el-progress-bar__inner) {
  background-color: #409EFF;
}
</style>

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
