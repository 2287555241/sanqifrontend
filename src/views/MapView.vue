<template>
  <div class="map-page-container">
    <indexHeader />
    <div class="main-content">
      <navMenu />
      <div class="amap-container">
        <div v-if="loading" class="map-loading-container">
          <div class="map-loading-content">
            <el-icon class="loading-icon is-loading"><svg class="circular" viewBox="0 0 50 50"><circle class="path" cx="25" cy="25" r="20" fill="none" /></svg></el-icon>
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
        <!-- 数据查询组件 -->
        <transition name="slide-fade-right" mode="out-in">
          <RasterDataSearch 
            v-if="props.showRasterDataSearch"
            @close="emit('closeRasterDataSearch')"
            @view-data="handleViewRasterData"
          />
        </transition>
        <!-- Data Analysis Panel -->
        <transition name="slide-fade-right" mode="out-in">
          <DataAnalysisPanel 
            v-if="props.dataAnalysisPanelVisible"
            :loading="sanqiLayerLoading"
            v-model:show-thumbnails="showThumbnails"
            @close="emit('closeDataAnalysisPanel')"
            @toggle-sanqi-layer="toggleSanqiLayer"
            @highlight-raster="onHighlightRaster"
          />
        </transition>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed, defineProps, defineEmits, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { useRoute } from 'vue-router';
import navMenu from './navMenu.vue';
import indexHeader from './indexHeader.vue';
import DataAnalysisPanel from './DataAnalysisPanel.vue';
import RasterDataSearch from '../components/RasterDataSearch.vue';
import { emitter } from '../utils/eventBus';
import L from 'leaflet';
import axios from 'axios';
import apiConfig from '../config/api';

const route = useRoute();
const mapContainer = ref(null);
const loading = ref(true);
const error = ref(null);
const loadingText = ref('正在加载地图...');
const sanqiLayerLoading = ref(false);
const props = defineProps({
  showRasterDataSearch: {
    type: Boolean,
    default: false
  },
  dataAnalysisPanelVisible: {
    type: Boolean,
    default: false
  }
});
const emit = defineEmits(['closeRasterDataSearch', 'closeDataAnalysisPanel']);
const isOnlyMapMode = computed(() => route.query.onlyMap === 'true');

let map = null;
let highlightOverlay = null;
let thumbnailOverlays = [];
let sanqiLayer = null;
let sanqiLayerVisible = false;
const showThumbnails = ref(false);

const handleViewRasterData = (data) => {
  // 这里可根据需要实现数据查看逻辑
};

const toggleSanqiLayer = async () => {
  if (!map) return;
  if (sanqiLayer && sanqiLayerVisible) {
    map.removeLayer(sanqiLayer);
    sanqiLayerVisible = false;
    return;
  }
  if (sanqiLayer && !sanqiLayerVisible) {
    sanqiLayer.addTo(map);
    sanqiLayerVisible = true;
    return;
  }
  // 首次加载
  try {
    const res = await axios.get('/api/SanqiRegion');
    if (res.data) {
      sanqiLayer = L.geoJSON(res.data, {
        style: {
          color: '#90ee90',
          weight: 2,
          fillOpacity: 0.3
        }
      }).addTo(map);
      sanqiLayerVisible = true;
    }
  } catch (e) {
    ElMessage.error('三七种植区数据加载失败');
  }
};

watch(showThumbnails, async (val) => {
  console.log('showThumbnails changed:', val);
  if (!map) return;
  // 先移除所有已存在的缩略图 overlay
  if (thumbnailOverlays.length > 0) {
    thumbnailOverlays.forEach(overlay => map.removeLayer(overlay));
    thumbnailOverlays = [];
  }
  if (val) {
    // 获取所有栅格数据
    const res = await axios.get(apiConfig.raster.mapData);
    if (res.data.success) {
      for (const raster of res.data.data.filter(r => r.hasMetadata)) {
        const ul = [raster.cornerUlLat, raster.cornerUlLon];
        const ur = [raster.cornerUrLat, raster.cornerUrLon];
        const lr = [raster.cornerLrLat, raster.cornerLrLon];
        const ll = [raster.cornerLlLat, raster.cornerLlLon];
        const lats = [ul[0], ur[0], lr[0], ll[0]];
        const lons = [ul[1], ur[1], lr[1], ll[1]];
        const bounds = [
          [Math.min(...lats), Math.min(...lons)],
          [Math.max(...lats), Math.max(...lons)]
        ];
        const url = apiConfig.raster.thumbnail(raster.id);
        const overlay = L.imageOverlay(url, bounds, { opacity: 0.5 }).addTo(map);
        thumbnailOverlays.push(overlay);
      }
    }
  }
});

function onHighlightRaster(raster) {
  if (!map) return;
  // 移除上一个高亮缩略图
  if (highlightOverlay) {
    map.removeLayer(highlightOverlay);
    highlightOverlay = null;
  }
  if (raster && raster.hasMetadata) {
    const ul = [raster.cornerUlLat, raster.cornerUlLon];
    const ur = [raster.cornerUrLat, raster.cornerUrLon];
    const lr = [raster.cornerLrLat, raster.cornerLrLon];
    const ll = [raster.cornerLlLat, raster.cornerLlLon];
    const lats = [ul[0], ur[0], lr[0], ll[0]];
    const lons = [ul[1], ur[1], lr[1], ll[1]];
    const bounds = [
      [Math.min(...lats), Math.min(...lons)],
      [Math.max(...lats), Math.max(...lons)]
    ];
    const url = apiConfig.raster.thumbnail(raster.id);
    highlightOverlay = L.imageOverlay(url, bounds, { opacity: 0.8 }).addTo(map);
    map.fitBounds(bounds);
  }
}

const initMap = () => {
  loading.value = true;
  error.value = null;
  loadingText.value = '正在加载地图...';
  try {
    map = L.map(mapContainer.value).setView([25, 102.8], 8);
    const tk = 'cbd48f39fb1e392a76ab69f7090b93c4';
    L.tileLayer(
      `http://t0.tianditu.gov.cn/DataServer?T=vec_w&x={x}&y={y}&l={z}&tk=${tk}`,
      { maxZoom: 18 }
    ).addTo(map);
    L.tileLayer(
      `http://t0.tianditu.gov.cn/DataServer?T=cva_w&x={x}&y={y}&l={z}&tk=${tk}`,
      { maxZoom: 18 }
    ).addTo(map);
    loading.value = false;
  } catch (err) {
    error.value = `地图加载失败: ${err.message}`;
    loading.value = false;
  }
};

onMounted(() => {
  window._mapEmitter = emitter;
  initMap();
  // 监听 highlight-raster 事件
  emitter.on('highlight-raster', onHighlightRaster);
  // 监听内容刷新事件，控制数据分析区面板显示
  emitter.on('REFRESH_CONTENT', (data) => {
    if (data && data.id === 2) {
      props.dataAnalysisPanelVisible = true;
    } else {
      props.dataAnalysisPanelVisible = false;
    }
  });
  // 监听地图数据刷新事件
  emitter.on('refresh-map-data', () => {
    // 如果当前正在显示缩略图，则重新加载数据
    if (showThumbnails.value) {
      // 触发缩略图重新加载
      showThumbnails.value = false;
      setTimeout(() => {
        showThumbnails.value = true;
      }, 100);
    }
  });
});

onBeforeUnmount(() => {
  emitter.off('highlight-raster', onHighlightRaster);
  emitter.off('REFRESH_CONTENT');
  if (map) map.remove();
});
</script>

<style scoped>
.map-page-container {
  position: relative; width: 100%; height: 100vh;
  overflow: hidden; display: flex; flex-direction: column;
}
.main-content {
  display: flex; flex: 1; height: calc(100vh - 60px); overflow: hidden;
}
.amap-container {
  flex: 1; height: 100%; position: relative;
  overflow: hidden; display: flex;
}
.map-content {
  flex: 1; height: 100%; background: #f8f9fa;
  transition: width 0.3s ease;
}
.map-loading-container, .map-error-container {
  position: absolute; top: 0; left: 0; right: 0; bottom: 0;
  display: flex; align-items: center; justify-content: center;
  background-color: #f8f9fa; z-index: 10; flex-direction: column;
}
.loading-icon { width: 40px; height: 40px; margin-bottom: 15px; }
.loading-text, .error-message, .error-title { color: #333; }
.map-error-card { background: #fff !important; }
.el-icon.is-loading { animation: rotating 2s linear infinite; }
@keyframes rotating {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
.data-management-dialog {
  background-color: #fff;
  padding: 10px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
.slide-fade-right-enter-active, .slide-fade-right-leave-active {
  transition: all 0.4s cubic-bezier(.55,0,.1,1);
}
.slide-fade-right-enter-from, .slide-fade-right-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
.slide-fade-right-enter-to, .slide-fade-right-leave-from {
  transform: translateX(0);
  opacity: 1;
}
</style>
