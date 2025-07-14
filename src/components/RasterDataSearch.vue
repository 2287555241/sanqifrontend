<template>
  <div class="map-controls-sidebar" :style="{ width: sidebarWidth + 'px' }">
    <div class="sidebar-resizer" @mousedown="startResizing"></div>
    <div class="sidebar-content">
      <div class="control-panel">
        <div class="control-panel-header">
          <h3>栅格数据检索</h3>
          <el-icon class="close-button" @click="closePanel"><Close /></el-icon>
        </div>
        <div class="control-panel-section">
          <div class="control-panel-title">栅格数据检索</div>
          <div class="search-tabs">
            <div class="search-type-buttons">
              <el-button 
                :class="{ active: activeSearchType === 'cloudCover' }" 
                :type="activeSearchType === 'cloudCover' ? 'primary' : ''" 
                size="small" 
                @click="activeSearchType = 'cloudCover'"
              >
                云量检索
              </el-button>
              <el-button 
                :class="{ active: activeSearchType === 'date' }" 
                :type="activeSearchType === 'date' ? 'primary' : ''" 
                size="small" 
                @click="activeSearchType = 'date'"
              >
                日期检索
              </el-button>
              <el-button 
                :class="{ active: activeSearchType === 'sunElevation' }" 
                :type="activeSearchType === 'sunElevation' ? 'primary' : ''" 
                size="small" 
                @click="activeSearchType = 'sunElevation'"
              >
                高度角检索
              </el-button>
              <el-button 
                :class="{ active: activeSearchType === 'combined' }" 
                :type="activeSearchType === 'combined' ? 'primary' : ''" 
                size="small" 
                @click="activeSearchType = 'combined'"
              >
                组合检索
              </el-button>
            </div>
          </div>
          
          <!-- 云量检索 -->
          <div v-if="activeSearchType === 'cloudCover'" class="search-panel">
            <div class="form-item">
              <label>云量大于等于 (%)</label>
              <el-input 
                v-model="cloudCoverInput" 
                size="small" 
                placeholder="输入最小云量" 
                class="simple-input" 
                @input="handleCloudCoverInput" 
                @keyup.enter="searchByCloudCover"
              />
            </div>
            <el-button type="primary" @click="searchByCloudCover" class="search-btn-full">
              按云量查询
            </el-button>
          </div>
          
          <!-- 日期检索 -->
          <div v-if="activeSearchType === 'date'" class="search-panel">
            <div class="form-item">
              <label>开始日期</label>
              <el-date-picker 
                v-model="startDate" 
                type="date" 
                placeholder="选择开始日期" 
                format="YYYY-MM-DD" 
                size="small" 
                style="width: 100%" 
                class="search-date-input" 
              />
            </div>
            <div class="form-item">
              <label>结束日期</label>
              <el-date-picker 
                v-model="endDate" 
                type="date" 
                placeholder="选择结束日期" 
                format="YYYY-MM-DD" 
                size="small" 
                style="width: 100%" 
                class="search-date-input" 
              />
            </div>
            <el-button type="primary" @click="searchByDate" class="search-btn-full">
              按日期查询
            </el-button>
          </div>
          
          <!-- 太阳高度角检索 -->
          <div v-if="activeSearchType === 'sunElevation'" class="search-panel">
            <div class="form-item">
              <label>太阳高度角大于等于 (度)</label>
              <el-input 
                v-model="sunElevationInput" 
                size="small" 
                placeholder="输入最小太阳高度角" 
                class="simple-input" 
                @input="handleSunElevationInput" 
                @keyup.enter="searchBySunElevation"
              />
            </div>
            <el-button type="primary" @click="searchBySunElevation" class="search-btn-full">
              按太阳高度角查询
            </el-button>
          </div>
          
          <!-- 组合检索 -->
          <div v-if="activeSearchType === 'combined'" class="search-panel">
            <div class="form-item">
              <label>云量大于等于 (%)</label>
              <el-input 
                v-model="combinedCloudCoverInput" 
                size="small" 
                placeholder="输入最小云量" 
                class="simple-input" 
                @input="handleCombinedCloudCoverInput"
              />
            </div>
            <div class="form-item">
              <label>开始日期</label>
              <el-date-picker 
                v-model="combinedParams.startDate" 
                type="date" 
                placeholder="选择开始日期" 
                format="YYYY-MM-DD" 
                size="small" 
                style="width: 100%" 
                class="search-date-input" 
              />
            </div>
            <div class="form-item">
              <label>结束日期</label>
              <el-date-picker 
                v-model="combinedParams.endDate" 
                type="date" 
                placeholder="选择结束日期" 
                format="YYYY-MM-DD" 
                size="small" 
                style="width: 100%" 
                class="search-date-input" 
              />
            </div>
            <div class="form-item">
              <label>太阳高度角大于等于 (度)</label>
              <el-input 
                v-model="combinedSunElevationInput" 
                size="small" 
                placeholder="输入最小太阳高度角" 
                class="simple-input" 
                @input="handleCombinedSunElevationInput"
              />
            </div>
            <el-button type="primary" @click="combinedSearch" class="search-btn-full">
              组合查询
            </el-button>
          </div>
          
          <!-- 查询结果 -->
          <div class="search-results-title">
            <div class="title">查询结果</div>
            <el-button type="primary" size="small" @click="refreshData" :icon="Refresh">
              刷新
            </el-button>
          </div>
          <div class="search-results">
            <el-scrollbar>
              <el-table 
                :data="rasterDataList" 
                style="width: 100%" 
                size="small" 
                :show-header="true" 
                v-loading="loading"
              >
                <el-table-column prop="id" label="ID" width="50" />
                <el-table-column prop="name" label="名称" min-width="120" show-overflow-tooltip />
                <el-table-column label="操作" width="90" fixed="right">
                  <template #default="scope">
                    <el-button type="primary" size="small" @click="viewRasterData(scope.row)">
                      查看
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-scrollbar>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { Close, Refresh } from '@element-plus/icons-vue';
import { emitter, Events } from '../utils/eventBus';
import apiConfig from '../config/api';
import axios from 'axios';

// Props
const props = defineProps({
  visible: {
    type: Boolean,
    default: true
  }
});



// Emits
const emit = defineEmits(['close', 'view-data']);

// State
const sidebarWidth = ref(350);
const minSidebarWidth = 250;
const maxSidebarWidth = 600;
const isResizing = ref(false);

const activeSearchType = ref('cloudCover');
const rasterDataList = ref([]);
const loading = ref(false);

// 搜索参数
const cloudCoverInput = ref('');
let cloudCover = ref(null);
const startDate = ref(null);
const endDate = ref(null);
const sunElevationInput = ref('');
let sunElevation = ref(null);

const combinedCloudCoverInput = ref('');
const combinedSunElevationInput = ref('');
const combinedParams = reactive({
  cloudCover: null,
  startDate: null,
  endDate: null,
  sunElevation: null
});

// 方法
const closePanel = () => {
  emit('close');
};

const startResizing = (e) => {
  isResizing.value = true;
  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', stopResizing);
  e.preventDefault();
};

const handleMouseMove = (e) => {
  if (!isResizing.value) return;
  const newWidth = window.innerWidth - e.clientX;
  if (newWidth >= minSidebarWidth && newWidth <= maxSidebarWidth) {
    sidebarWidth.value = newWidth;
  }
};

const stopResizing = () => {
  isResizing.value = false;
  document.removeEventListener('mousemove', handleMouseMove);
  document.removeEventListener('mouseup', stopResizing);
};

const formatDate = (date) => {
  if (!date) return null;
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const performSearch = async (params, url) => {
  loading.value = true;
  try {
    const response = await axios.get(url, { params });
    if (response.data.success) {
      rasterDataList.value = response.data.data || [];
      if (!rasterDataList.value.length) {
        ElMessage.info('没有找到符合条件的数据');
      } else {
        ElMessage.success('查询成功');
      }
    } else {
      ElMessage.error(response.data.error || '查询失败');
    }
  } catch (err) {
    ElMessage.error(err.message || '查询异常');
    rasterDataList.value = [];
  } finally {
    loading.value = false;
  }
};

const searchByCloudCover = async () => {
  if (cloudCover.value === null) return;
  await performSearch({ min: cloudCover.value }, apiConfig.raster.search.cloudCover);
};

const searchByDate = async () => {
  await performSearch(
    { 
      startDate: formatDate(startDate.value), 
      endDate: formatDate(endDate.value) 
    }, 
    apiConfig.raster.search.date
  );
};

const searchBySunElevation = async () => {
  if (sunElevation.value === null) return;
  await performSearch({ min: sunElevation.value }, apiConfig.raster.search.sunElevation);
};

const combinedSearch = async () => {
  const params = {
    cloudCover: combinedParams.cloudCover,
    startDate: formatDate(combinedParams.startDate),
    endDate: formatDate(combinedParams.endDate),
    sunElevation: combinedParams.sunElevation
  };
  await performSearch(params, apiConfig.raster.search.combined);
};

const refreshData = async () => {
  await performSearch({}, apiConfig.raster.list);
};

const viewRasterData = (data) => {
  emit('view-data', data);
};

const createNumericInputHandler = (targetRef, modelRef, key, isFloat = true, max) => (value) => {
  let cleaned = value.replace(isFloat ? /[^\d.]/g : /[^\d]/g, '');
  if (isFloat) {
    const parts = cleaned.split('.');
    if (parts.length > 2) cleaned = `${parts[0]}.${parts.slice(1).join('')}`;
  }
  const numValue = isFloat ? parseFloat(cleaned) : parseInt(cleaned, 10);
  if (!isNaN(numValue) && max !== undefined && numValue > max) cleaned = String(max);
  targetRef.value = cleaned;
  const finalValue = cleaned === '' ? null : numValue;
  if (key) {
    modelRef[key] = finalValue;
  } else {
    modelRef.value = finalValue;
  }
};

const handleCloudCoverInput = createNumericInputHandler(cloudCoverInput, cloudCover, null, true, 100);
const handleSunElevationInput = createNumericInputHandler(sunElevationInput, sunElevation, null, true, 90);
const handleCombinedCloudCoverInput = createNumericInputHandler(combinedCloudCoverInput, combinedParams, 'cloudCover', true, 100);
const handleCombinedSunElevationInput = createNumericInputHandler(combinedSunElevationInput, combinedParams, 'sunElevation', true, 90);

// 生命周期
onMounted(() => {
  refreshData();
});

onBeforeUnmount(() => {
  document.removeEventListener('mousemove', handleMouseMove);
  document.removeEventListener('mouseup', stopResizing);
});
</script>

<style scoped>
.map-controls-sidebar {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  height: 100%;
  z-index: 3003;
  background: #1a1a1a;
  display: flex;
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.5);
}

.sidebar-content {
  background-color: #1a1a1a;
  color: #fff;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.sidebar-resizer {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 8px;
  background-color: transparent;
  cursor: ew-resize;
  z-index: 91;
}

.control-panel {
  padding: 15px;
  overflow-y: auto;
  flex: 1;
}

.control-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  border-bottom: 1px solid #333;
  margin: -15px -15px 15px -15px;
}

.close-button {
  cursor: pointer;
}

.control-panel-header h3 {
  margin: 0;
  font-size: 16px;
}

.control-panel-section {
  padding-bottom: 15px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.control-panel-title {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 12px;
  padding-left: 12px;
  position: relative;
}

.control-panel-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 14px;
  background: #409EFF;
}

.search-tabs {
  margin-bottom: 10px;
}

.search-type-buttons {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  row-gap: 6px;
}

.search-type-buttons .el-button {
  width: calc(50% - 3px);
  margin: 0;
}

.form-item {
  margin-bottom: 8px;
}

.form-item label {
  display: block;
  margin-bottom: 4px;
  color: #b8b8b8;
  font-size: 12px;
}

.simple-input :deep(.el-input__wrapper) {
  background-color: #333 !important;
  box-shadow: none !important;
  border: none;
}

.simple-input :deep(.el-input__inner) {
  color: #e6e6e6 !important;
  text-align: center;
}

.search-btn-full {
  width: 100%;
  margin-top: 8px;
}

.search-results-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 15px 0 8px;
  padding-bottom: 6px;
  border-bottom: 1px solid #333;
}

.search-results-title .title {
  font-weight: 500;
}

.search-results {
  flex: 1;
  overflow-y: auto;
  min-height: 150px;
}
</style> 