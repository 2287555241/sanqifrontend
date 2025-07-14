<template>
  <div class="analysis-panel-container">
    <div class="sidebar-resizer" @mousedown="startResizing"></div>
    <div class="analysis-panel-content" :style="{ width: width + 'px' }">
      <div class="panel-header">
        <h3>数据分析区</h3>
        <el-icon class="close-button" @click="closePanel"><Close /></el-icon>
      </div>
      <div class="panel-body">
        <div class="tool-section">
          <h4>图层控制</h4>
          <div class="tool-item">
            <span>显示三七种植区</span>
            <el-switch 
              v-model="layerVisible" 
              @change="toggleLayer"
              :loading="loading"
              active-color="#90ee90"
              inline-prompt
              active-text="开"
              inactive-text="关"
            />
          </div>
        </div>
        <div class="tool-section">
          <h4>缩略图显示</h4>
          <div class="tool-item">
            <span>显示所有缩略图</span>
            <el-switch
              v-model="showThumbnailsProxy"
              active-color="#409eff"
              inline-prompt
              active-text="开"
              inactive-text="关"
            />
          </div>
          <div class="tool-item">
            <el-select
              v-model="selectedRasterId"
              placeholder="选择缩略图高亮"
              size="small"
              style="width: 160px"
              @change="onSelectRaster"
              filterable
            >
              <el-option
                v-for="raster in rasterList"
                :key="raster.id"
                :label="raster.name"
                :value="raster.id"
              />
            </el-select>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits, onMounted, computed } from 'vue';
import { Close } from '@element-plus/icons-vue';
import axios from 'axios';
import apiConfig from '../config/api';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false,
  },
  showThumbnails: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits([
  'close',
  'toggle-sanqi-layer',
  'highlight-raster',
  'update:showThumbnails'
]);

const showThumbnailsProxy = computed({
  get: () => props.showThumbnails,
  set: val => {
    console.log('emit update:showThumbnails', val);
    emit('update:showThumbnails', val);
  }
});

const width = ref(350);
const isResizing = ref(false);
const layerVisible = ref(false);

// 新增：缩略图相关
const selectedRasterId = ref(null);
const rasterList = ref([]);

const fetchRasterMapData = async () => {
  try {
    const res = await axios.get(apiConfig.raster.mapData);
    if (res.data.success) {
      rasterList.value = res.data.data;
    }
  } catch (e) {
    console.error('获取栅格数据失败', e);
  }
};

onMounted(() => {
  fetchRasterMapData();
  // 监听地图数据刷新事件
  if (window._mapEmitter) {
    window._mapEmitter.on('refresh-map-data', () => {
      fetchRasterMapData();
    });
  }
});

function onSelectRaster(id) {
  const raster = rasterList.value.find(r => r.id === id);
  if (raster) {
    console.log('emit highlight-raster', raster);
    emit('highlight-raster', raster);
    window._mapEmitter && window._mapEmitter.emit('highlight-raster', raster);
  }
}

const closePanel = () => {
  emit('close');
};

const toggleLayer = () => {
  emit('toggle-sanqi-layer');
}

const startResizing = (e) => {
  isResizing.value = true;
  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', stopResizing);
  e.preventDefault();
};

const handleMouseMove = (e) => {
  if (!isResizing.value) return;
  const newWidth = window.innerWidth - e.clientX;
  if (newWidth >= 250 && newWidth <= 600) {
    width.value = newWidth;
  }
};

const stopResizing = () => {
  isResizing.value = false;
  document.removeEventListener('mousemove', handleMouseMove);
  document.removeEventListener('mouseup', stopResizing);
};
</script>

<style scoped>
.analysis-panel-container {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  height: 100vh;
  z-index: 3002;
  display: flex;
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.5);
}
.analysis-panel-content {
  background-color: #1a1a1a;
  color: #fff;
  height: 100%;
  display: flex;
  flex-direction: column;
}
.sidebar-resizer {
  width: 8px;
  height: 100%;
  cursor: ew-resize;
  background: transparent;
}
.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  border-bottom: 1px solid #333;
}
.panel-header h3 {
  margin: 0;
  font-size: 16px;
}
.close-button {
  cursor: pointer;
}
.panel-body {
  padding: 15px;
  overflow-y: auto;
  flex: 1;
}
.tool-section h4 {
    font-size: 14px;
    font-weight: 500;
    margin-bottom: 10px;
    padding-left: 10px;
    position: relative;
    color: #e6e6e6;
}
.tool-section h4::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 3px;
    height: 14px;
    background: #409eff;
}
.tool-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0;
    color: #e6e6e6;
    font-size: 14px;
}
</style> 