<template>
  <div class="map-page-container">
    <div class="main-content">
      <div class="leaflet-container">
        <div v-if="loading" class="map-loading-container">
          <div class="map-loading-content">
            <el-icon class="loading-icon is-loading">
              <svg class="circular" viewBox="0 0 50 50">
                <circle class="path" cx="25" cy="25" r="20" fill="none" />
              </svg>
            </el-icon>
            <div class="loading-text">{{ loadingText }}</div>
          </div>
        </div>
        
        <div v-if="error" class="map-error-container">
          <el-card class="map-error-card">
            <div class="map-error-content">
              <div class="error-title">加载错误</div>
              <div class="error-message">{{ error }}</div>
              <el-button @click="initMap" type="primary">重试</el-button>
            </div>
          </el-card>
        </div>
        
        <div ref="mapContainer" class="map-content"></div>
        
        <!-- 地图控制面板 -->
        <div class="map-controls-sidebar">
          <div class="control-panel">
            <div class="control-panel-section">
              <div class="control-panel-title">地图样式</div>
              <div class="control-panel-item">
                <el-radio-group v-model="currentStyle" size="small" @change="changeMapStyle">
                  <el-radio-button label="normal">标准</el-radio-button>
                  <el-radio-button label="satellite">卫星</el-radio-button>
                  <el-radio-button label="dark">深色</el-radio-button>
                </el-radio-group>
              </div>
            </div>

            <div class="control-panel-section">
              <div class="control-panel-title">位置搜索</div>
              <div class="search-box">
                <el-input 
                  v-model="searchKeyword" 
                  placeholder="搜索位置" 
                  @keyup.enter="handleSearch"
                  class="search-input"
                >
                  <template #suffix>
                    <el-button class="search-btn" @click="handleSearch">
                      <el-icon><Search /></el-icon>
                    </el-button>
                  </template>
                </el-input>
              </div>
              
              <div v-if="searchResults.length > 0" class="search-results">
                <el-scrollbar height="200px">
                  <div 
                    v-for="(item, index) in searchResults" 
                    :key="index" 
                    class="search-result-item"
                    @click="handleSelectLocation(item)"
                  >
                    <div class="result-name">{{ item.name }}</div>
                    <div class="result-address">{{ item.address }}</div>
                  </div>
                </el-scrollbar>
              </div>
            </div>

            <div class="control-panel-section">
              <div class="control-panel-title">栅格数据</div>
              <el-select 
                v-model="selectedRasterId" 
                placeholder="选择栅格数据" 
                @change="handleRasterSelect"
                class="raster-select"
              >
                <el-option
                  v-for="raster in rasterList"
                  :key="raster.id"
                  :label="raster.name"
                  :value="raster.id"
                />
              </el-select>
              <div v-if="currentRaster" class="raster-info">
                <div class="info-item">
                  <span>透明度:</span>
                  <el-slider 
                    v-model="rasterOpacity" 
                    :min="0" 
                    :max="1" 
                    :step="0.1"
                    @change="updateRasterOpacity"
                  />
                </div>
                <el-button 
                  type="danger" 
                  size="small" 
                  @click="clearRasterLayers"
                >
                  清除栅格
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { ElMessage } from 'element-plus';
import { Search } from '@element-plus/icons-vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// 地图实例
const mapContainer = ref(null);
const map = ref(null);
const loading = ref(true);
const error = ref(null);
const loadingText = ref('正在加载地图...');

// 地图样式控制
const currentStyle = ref('normal');
const baseLayers = {
  normal: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }),
  satellite: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
  }),
  dark: L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
  })
};

// 搜索功能
const searchKeyword = ref('');
const searchResults = ref([]);
const currentMarker = ref(null);

// 栅格数据
const rasterList = ref([]);
const selectedRasterId = ref(null);
const currentRaster = ref(null);
const rasterLayers = ref([]);
const rasterOpacity = ref(0.8);

// 初始化地图
const initMap = () => {
  try {
    loading.value = true;
    
    // 创建地图实例
    map.value = L.map(mapContainer.value, {
      center: [25.040609, 102.712251],
      zoom: 8,
      layers: [baseLayers.normal]
    });
    
    // 添加缩放控件
    L.control.zoom({ position: 'topright' }).addTo(map.value);
    
    // 加载栅格数据列表
    loadRasterData();
    
    loading.value = false;
  } catch (err) {
    error.value = `地图初始化失败: ${err.message}`;
    loading.value = false;
  }
};

// 切换地图样式
const changeMapStyle = (style) => {
  if (!map.value) return;
  
  // 移除所有基础图层
  Object.values(baseLayers).forEach(layer => {
    map.value.removeLayer(layer);
  });
  
  // 添加选中的图层
  map.value.addLayer(baseLayers[style]);
};

// 位置搜索
const handleSearch = async () => {
  if (!searchKeyword.value.trim()) {
    ElMessage.warning('请输入搜索关键词');
    return;
  }

  try {
    // 使用Nominatim进行搜索（OpenStreetMap的搜索API）
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchKeyword.value)}&format=json&limit=10&viewbox=97.31833,21.14163,106.19016,29.22041&bounded=1`
    );
    
    const data = await response.json();
    searchResults.value = data.map(item => ({
      id: item.place_id,
      name: item.display_name.split(',')[0],
      address: item.display_name,
      location: [parseFloat(item.lat), parseFloat(item.lon)]
    }));
  } catch (err) {
    ElMessage.error('搜索失败');
    console.error('搜索出错:', err);
  }
};

// 选择位置
const handleSelectLocation = (item) => {
  if (!map.value) return;
  
  // 清除之前的标记
  if (currentMarker.value) {
    map.value.removeLayer(currentMarker.value);
  }
  
  // 创建新标记
  currentMarker.value = L.marker(item.location)
    .addTo(map.value)
    .bindPopup(`<b>${item.name}</b><br>${item.address}`);
  
  // 定位到标记位置
  map.value.flyTo(item.location, 14);
};

// 加载栅格数据列表
const loadRasterData = async () => {
  try {
    // 模拟API请求
    const response = await fetch('/api/raster/list');
    rasterList.value = await response.json();
  } catch (err) {
    ElMessage.error('加载栅格数据列表失败');
    console.error('加载栅格数据失败:', err);
  }
};

// 显示栅格数据
const showRasterData = async (rasterId) => {
  try {
    clearRasterLayers();
    
    // 模拟获取栅格数据地理信息
    const response = await fetch(`/api/raster/${rasterId}/geo`);
    const geoInfo = await response.json();
    
    // 创建边界 (示例坐标，实际应从geoInfo获取)
    const bounds = L.latLngBounds(
      L.latLng(geoInfo.minY, geoInfo.minX),
      L.latLng(geoInfo.maxY, geoInfo.maxX)
    );
    
    // 创建图片图层
    const rasterLayer = L.imageOverlay(
      `/api/raster/thumbnail/view/${rasterId}`,
      bounds,
      { opacity: rasterOpacity.value }
    ).addTo(map.value);
    
    rasterLayers.value.push(rasterLayer);
    currentRaster.value = { id: rasterId, geoInfo };
    
    // 定位到栅格数据范围
    map.value.flyToBounds(bounds);
  } catch (err) {
    ElMessage.error('加载栅格数据失败');
    console.error('显示栅格数据失败:', err);
  }
};

// 更新栅格透明度
const updateRasterOpacity = () => {
  rasterLayers.value.forEach(layer => {
    layer.setOpacity(rasterOpacity.value);
  });
};

// 清除栅格图层
const clearRasterLayers = () => {
  rasterLayers.value.forEach(layer => {
    map.value.removeLayer(layer);
  });
  rasterLayers.value = [];
  currentRaster.value = null;
};

// 处理栅格选择
const handleRasterSelect = (rasterId) => {
  if (rasterId) {
    showRasterData(rasterId);
  } else {
    clearRasterLayers();
  }
};

// 生命周期
onMounted(() => {
  initMap();
});

onBeforeUnmount(() => {
  if (map.value) {
    map.value.remove();
  }
});
</script>

<style scoped>
.map-page-container {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.main-content {
  display: flex;
  flex: 1;
  height: calc(100vh - 60px);
  overflow: hidden;
}

.leaflet-container {
  flex: 1;
  height: 100%;
  position: relative;
}

.map-content {
  width: 100%;
  height: 100%;
}

.map-controls-sidebar {
  position: absolute;
  top: 10px;
  left: 10px;
  width: 300px;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  padding: 10px;
}

.control-panel-section {
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.control-panel-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.control-panel-title {
  font-weight: bold;
  margin-bottom: 8px;
}

.search-results {
  margin-top: 10px;
  max-height: 200px;
  overflow-y: auto;
}

.search-result-item {
  padding: 8px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
}

.search-result-item:hover {
  background-color: #f5f5f5;
}

.raster-info {
  margin-top: 10px;
}

.info-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.info-item span {
  margin-right: 10px;
  min-width: 50px;
}

.map-loading-container,
.map-error-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.8);
  z-index: 1000;
}

.loading-icon {
  width: 40px;
  height: 40px;
  margin-bottom: 15px;
}
</style>