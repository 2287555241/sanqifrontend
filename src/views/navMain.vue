<template>
  <div class="nav-main-container">
    <div id="mapView" class="map-container"></div>
    <div 
      class="panel panel-1"
      :style="{
        top: defaultPositions.panel1.top,
        right: defaultPositions.panel1.right
      }"
    >
      <div class="panel-header">
        <h3>数据管理概览</h3>
      </div>
      <div class="panel-content card-panel-content">
        <div class="tab-header">
          <div 
            class="tab-item" 
            :class="{ active: activeTab === 'local' }" 
            @click="activeTab = 'local'"
          >
            本地数据
          </div>
          <div 
            class="tab-item" 
            :class="{ active: activeTab === 'user' }" 
            @click="activeTab = 'user'"
          >
            用户数据
          </div>
        </div>
        <div class="scroll-wrapper">
          <vue3-seamless-scroll
            v-if="activeTab === 'local'"
            class="scroll-card-list"
            :list="localDataList"
            :step="0.2"
            :hover="true"
            :limitScrollNum="3"
            :singleHeight="60"
            :wait="5000"
          >
            <div class="scroll-content">
              <div class="scroll-card-item" v-for="item in localDataList" :key="item.id">
                <div class="item-content">
                  <div class="item-title">{{ item.name }}</div>
                  <div class="item-meta">
                    <span class="meta-type">{{ item.type }}</span>
                    <span class="meta-size">{{ item.size }}</span>
                    <span class="meta-time">{{ item.createTime }}</span>
                  </div>
                </div>
              </div>
            </div>
          </vue3-seamless-scroll>
          <vue3-seamless-scroll
            v-if="activeTab === 'user'"
            class="scroll-card-list"
            :list="userDataList"
            :step="0.2"
            :hover="true"
            :limitScrollNum="3"
            :singleHeight="60"
            :wait="5000"
          >
            <div class="scroll-content">
              <div class="scroll-card-item" v-for="item in userDataList" :key="item.id">
                <div class="item-content">
                  <div class="item-title">{{ item.name }}</div>
                  <div class="item-meta">
                    <span class="meta-type">{{ item.type }}</span>
                    <span class="meta-size">{{ item.size }}</span>
                    <span class="meta-time">{{ item.createTime }}</span>
                  </div>
                </div>
              </div>
            </div>
          </vue3-seamless-scroll>
        </div>
      </div>
    </div>
    <div 
      class="panel panel-2"
      :style="{
        top: defaultPositions.panel2.top,
        right: defaultPositions.panel2.right
      }"
    >
      <div class="panel-header">
        <h3>系统状态</h3>
      </div>
      <div class="panel-content">
        <div class="status-item">
          <span class="label">CPU使用率</span>
          <el-progress :percentage="systemStatus.cpuUsage" :format="format" />
        </div>
        <div class="status-item">
          <span class="label">内存使用</span>
          <el-progress :percentage="systemStatus.memoryUsage" :format="format" />
        </div>
        <div class="status-item">
          <span class="label">存储空间</span>
          <el-progress :percentage="systemStatus.diskUsage" :format="format" />
        </div>
      </div>
    </div>
    <div 
      class="panel panel-3"
      :style="{
        top: defaultPositions.panel3.top,
        right: defaultPositions.panel3.right
      }"
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
import { ref, onMounted, computed, onUnmounted } from 'vue';
import { loadModules } from 'esri-loader';
import { ElProgress } from 'element-plus';
import { Bell, User, Setting } from '@element-plus/icons-vue';
import { Vue3SeamlessScroll } from 'vue3-seamless-scroll';
import { useDataStore } from '../stores/dataStore';
import axios from 'axios';

const tk = "cbd48f39fb1e392a76ab69f7090b93c4";
const basemapUrls = [
  `http://t0.tianditu.gov.cn/DataServer?T=vec_w&x={x}&y={y}&l={z}&tk=${tk}`,
  `http://t0.tianditu.gov.cn/DataServer?T=cva_w&x={x}&y={y}&l={z}&tk=${tk}`
];

// 使用数据存储
const dataStore = useDataStore();

const format = (percentage) => percentage + '%';

// 面板位置
const defaultPositions = {
  panel1: { top: '80px', right: '24px' },
  panel2: { top: '345px', right: '24px' },
  panel3: { top: '590px', right: '24px' }
};

// 激活的选项卡
const activeTab = ref('local')

// 本地数据列表
const localDataList = computed(() => dataStore.localDataList);

// 用户数据列表
const userDataList = computed(() => dataStore.userDataList);

// 系统状态数据
const systemStatus = ref({
  cpuUsage: 45,
  memoryUsage: 60,
  diskUsage: 30
});

// 获取系统状态
const fetchSystemStatus = async () => {
  try {
    // 这里替换为您的后端API地址
    const response = await axios.get('http://localhost:8200/api/system/status');
    if (response.data) {
      systemStatus.value = {
        cpuUsage: response.data.cpuUsage || 0,
        memoryUsage: response.data.memoryUsage || 0,
        diskUsage: response.data.diskUsage || 0
      };
    }
  } catch (error) {
    console.error('获取系统状态失败:', error);
    // 如果API请求失败，使用模拟数据
    systemStatus.value = {
      cpuUsage: Math.floor(Math.random() * 60) + 20,
      memoryUsage: Math.floor(Math.random() * 40) + 40,
      diskUsage: Math.floor(Math.random() * 30) + 20
    };
  }
};

// 定时获取系统状态的定时器
let statusUpdateInterval = null;

onMounted(() => {
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
  
  // 首次获取系统状态
  fetchSystemStatus();
  
  // 设置定时器，每30秒更新一次系统状态
  statusUpdateInterval = setInterval(fetchSystemStatus, 30000);
});

onUnmounted(() => {
  // 清除定时器
  if (statusUpdateInterval) {
    clearInterval(statusUpdateInterval);
  }
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
  transition: box-shadow 0.3s ease;
  z-index: 1000;
}

.panel:hover {
  box-shadow: 0 6px 32px 0 rgba(0,0,0,0.12);
}

.panel-header {
  margin-bottom: 16px;
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

.card-panel-content {
  height: 180px;
  min-height: 180px;
  max-height: 180px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(10px);
  border-radius: 12px;
}

.tab-header {
  display: flex;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  margin-bottom: 8px;
}

.tab-item {
  padding: 8px 16px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
  border-bottom: 2px solid transparent;
  color: #666;
}

.tab-item.active {
  color: #409EFF;
  border-bottom-color: #409EFF;
  font-weight: 500;
}

.tab-item:hover {
  color: #409EFF;
}

.scroll-wrapper {
  flex: 1;
  overflow: hidden;
  position: relative;
}

.scroll-card-list {
  height: 100%;
  width: 100%;
}

.scroll-content {
  width: 100%;
}

.scroll-card-item {
  padding: 8px 16px;
  transition: all 0.3s ease;
  cursor: pointer;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.scroll-card-item:hover {
  background: rgba(64, 158, 255, 0.1);
}

.item-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.item-title {
  font-size: 14px;
  color: #333;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
}

.meta-type {
  color: #67C23A;
}

.meta-size {
  color: #E6A23C;
}

.meta-time {
  color: #909399;
}

:deep(.el-progress-bar__outer) {
  background-color: rgba(0, 0, 0, 0.1);
}

:deep(.el-progress-bar__inner) {
  background-color: #409EFF;
}
</style>
