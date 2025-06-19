<template>
  <div class="raster-search-container">
    <!-- 搜索选项卡 -->
    <div class="search-tabs">
      <div 
        v-for="tab in tabs" 
        :key="tab.name" 
        :class="['search-tab', { active: activeTab === tab.name }]"
        @click="activeTab = tab.name"
      >
        {{ tab.label }}
      </div>
    </div>

    <!-- 云量检索 -->
    <div v-show="activeTab === 'cloudCover'" class="search-panel">
      <div class="search-form">
        <div class="form-item">
          <label>云量大于等于 (%)</label>
          <div class="input-group">
            <el-button size="small" @click="decreaseCloud" :disabled="cloudCover <= 0">
              <el-icon><Minus /></el-icon>
            </el-button>
            <el-input-number 
              v-model="cloudCover" 
              size="small"
              :min="0" 
              :max="100" 
              :step="0.01"
              controls-position="right"
              placeholder="输入最小云量"
            />
            <el-button size="small" @click="increaseCloud" :disabled="cloudCover >= 100">
              <el-icon><Plus /></el-icon>
            </el-button>
          </div>
        </div>
        <el-button type="primary" @click="searchByCloudCover">按云量查询</el-button>
      </div>
    </div>

    <!-- 采集日期检索 -->
    <div v-show="activeTab === 'date'" class="search-panel">
      <div class="search-form">
        <div class="form-item">
          <label>开始日期</label>
          <el-date-picker
            v-model="startDate"
            type="date"
            placeholder="选择开始日期"
            format="YYYY-MM-DD"
            size="small"
            style="width: 100%"
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
          />
        </div>
        <el-button type="primary" @click="searchByDate">按日期查询</el-button>
      </div>
    </div>

    <!-- 太阳高度角检索 -->
    <div v-show="activeTab === 'sunElevation'" class="search-panel">
      <div class="search-form">
        <div class="form-item">
          <label>太阳高度角大于等于 (度)</label>
          <div class="input-group">
            <el-button size="small" @click="decreaseSunElevation" :disabled="sunElevation <= 0">
              <el-icon><Minus /></el-icon>
            </el-button>
            <el-input-number
              v-model="sunElevation"
              size="small"
              :min="0"
              :max="90"
              :step="0.01"
              controls-position="right"
              placeholder="输入最小太阳高度角"
            />
            <el-button size="small" @click="increaseSunElevation" :disabled="sunElevation >= 90">
              <el-icon><Plus /></el-icon>
            </el-button>
          </div>
        </div>
        <el-button type="primary" @click="searchBySunElevation">按太阳高度角查询</el-button>
      </div>
    </div>

    <!-- 组合检索 -->
    <div v-show="activeTab === 'combined'" class="search-panel">
      <div class="search-form">
        <div class="form-item">
          <label>云量大于等于 (%)</label>
          <el-input-number
            v-model="combinedParams.cloudCover"
            size="small"
            :min="0"
            :max="100"
            :step="0.01"
            controls-position="right"
            placeholder="输入最小云量"
            style="width: 100%"
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
          />
        </div>
        <div class="form-item">
          <label>太阳高度角大于等于 (度)</label>
          <el-input-number
            v-model="combinedParams.sunElevation"
            size="small"
            :min="0"
            :max="90"
            :step="0.01"
            controls-position="right"
            placeholder="输入最小太阳高度角"
            style="width: 100%"
          />
        </div>
        <el-button type="primary" @click="combinedSearch">组合查询</el-button>
      </div>
    </div>

    <!-- 数据表格 -->
    <div class="search-results">
      <div class="result-header">
        <div class="title">查询结果</div>
        <el-button type="primary" size="small" @click="refreshData" icon="Refresh">刷新</el-button>
      </div>
      
      <el-table
        :data="rasterDataList"
        style="width: 100%"
        size="small"
        border
        stripe
        height="180px"
        v-loading="loading"
      >
        <el-table-column prop="id" label="ID" width="40" />
        <el-table-column prop="name" label="名称" min-width="110" show-overflow-tooltip />
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="scope">
            <el-button type="primary" size="small" @click="viewRasterData(scope.row)">查看</el-button>
            <el-button type="danger" size="small" @click="deleteRasterData(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Minus, Plus, Refresh } from '@element-plus/icons-vue'
import apiConfig from '../config/api'
import axios from 'axios'

// 搜索选项卡定义
const tabs = [
  { name: 'cloudCover', label: '云量检索' },
  { name: 'date', label: '采集日期检索' },
  { name: 'sunElevation', label: '太阳高度角检索' },
  { name: 'combined', label: '组合检索' }
]

// 当前激活的选项卡
const activeTab = ref('cloudCover')

// 云量检索参数
const cloudCover = ref(null)

// 采集日期检索参数
const startDate = ref(null)
const endDate = ref(null)

// 太阳高度角检索参数
const sunElevation = ref(null)

// 组合检索参数
const combinedParams = reactive({
  cloudCover: null,
  startDate: null,
  endDate: null,
  sunElevation: null
})

// 数据列表
const rasterDataList = ref([])
const loading = ref(false)

// 云量增减函数
const increaseCloud = () => {
  if (cloudCover.value === null) {
    cloudCover.value = 0
  }
  cloudCover.value = Math.min(100, cloudCover.value + 1)
}

const decreaseCloud = () => {
  if (cloudCover.value === null) {
    cloudCover.value = 0
    return
  }
  cloudCover.value = Math.max(0, cloudCover.value - 1)
}

// 太阳高度角增减函数
const increaseSunElevation = () => {
  if (sunElevation.value === null) {
    sunElevation.value = 0
  }
  sunElevation.value = Math.min(90, sunElevation.value + 1)
}

const decreaseSunElevation = () => {
  if (sunElevation.value === null) {
    sunElevation.value = 0
    return
  }
  sunElevation.value = Math.max(0, sunElevation.value - 1)
}

// 按云量查询
const searchByCloudCover = async () => {
  loading.value = true
  
  try {
    const params = {}
    if (cloudCover.value !== null) {
      params.min = cloudCover.value
    }
    
    const response = await axios.get(apiConfig.raster.search.cloudCover, { params })
    
    if (response.data.success) {
      rasterDataList.value = response.data.data || []
      if (rasterDataList.value.length === 0) {
        ElMessage.info('没有找到符合条件的栅格数据')
      }
    } else {
      ElMessage.error(response.data.error || '查询失败')
    }
  } catch (error) {
    console.error('Error:', error)
    ElMessage.error(error.message || '查询失败')
  } finally {
    loading.value = false
  }
}

// 按采集日期查询
const searchByDate = async () => {
  loading.value = true
  
  try {
    const params = {}
    if (startDate.value) {
      params.startDate = formatDate(startDate.value)
    }
    if (endDate.value) {
      params.endDate = formatDate(endDate.value)
    }
    
    const response = await axios.get(apiConfig.raster.search.date, { params })
    
    if (response.data.success) {
      rasterDataList.value = response.data.data || []
      if (rasterDataList.value.length === 0) {
        ElMessage.info('没有找到符合条件的栅格数据')
      }
    } else {
      ElMessage.error(response.data.error || '查询失败')
    }
  } catch (error) {
    console.error('Error:', error)
    ElMessage.error(error.message || '查询失败')
  } finally {
    loading.value = false
  }
}

// 按太阳高度角查询
const searchBySunElevation = async () => {
  loading.value = true
  
  try {
    const params = {}
    if (sunElevation.value !== null) {
      params.min = sunElevation.value
    }
    
    const response = await axios.get(apiConfig.raster.search.sunElevation, { params })
    
    if (response.data.success) {
      rasterDataList.value = response.data.data || []
      if (rasterDataList.value.length === 0) {
        ElMessage.info('没有找到符合条件的栅格数据')
      }
    } else {
      ElMessage.error(response.data.error || '查询失败')
    }
  } catch (error) {
    console.error('Error:', error)
    ElMessage.error(error.message || '查询失败')
  } finally {
    loading.value = false
  }
}

// 组合查询
const combinedSearch = async () => {
  loading.value = true
  
  try {
    const params = {}
    if (combinedParams.cloudCover !== null) {
      params.cloudCover = combinedParams.cloudCover
    }
    if (combinedParams.startDate) {
      params.startDate = formatDate(combinedParams.startDate)
    }
    if (combinedParams.endDate) {
      params.endDate = formatDate(combinedParams.endDate)
    }
    if (combinedParams.sunElevation !== null) {
      params.sunElevation = combinedParams.sunElevation
    }
    
    const response = await axios.get(apiConfig.raster.search.combined, { params })
    
    if (response.data.success) {
      rasterDataList.value = response.data.data || []
      if (rasterDataList.value.length === 0) {
        ElMessage.info('没有找到符合条件的栅格数据')
      }
    } else {
      ElMessage.error(response.data.error || '查询失败')
    }
  } catch (error) {
    console.error('Error:', error)
    ElMessage.error(error.message || '查询失败')
  } finally {
    loading.value = false
  }
}

// 刷新数据列表
const refreshData = async () => {
  loading.value = true
  
  try {
    const response = await axios.get(apiConfig.raster.list)
    
    if (response.data.success) {
      rasterDataList.value = response.data.data || []
      if (rasterDataList.value.length === 0) {
        ElMessage.info('暂无数据')
      }
    } else {
      ElMessage.error(response.data.error || '加载数据失败')
    }
  } catch (error) {
    console.error('Error:', error)
    ElMessage.error(error.message || '加载数据失败')
  } finally {
    loading.value = false
  }
}

// 查看栅格数据
const viewRasterData = (data) => {
  ElMessage.info(`查看栅格数据: ${data.name}`)
  // 这里可以添加查看栅格数据的逻辑
}

// 删除栅格数据
const deleteRasterData = (data) => {
  ElMessageBox.confirm(`确定要删除 ${data.name} 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const response = await axios.delete(apiConfig.raster.delete(data.id))
      
      if (response.data.success) {
        ElMessage.success('删除成功')
        refreshData() // 重新加载数据列表
      } else {
        ElMessage.error(response.data.error || '删除失败')
      }
    } catch (error) {
      console.error('Error:', error)
      ElMessage.error(error.message || '删除失败')
    }
  }).catch(() => {
    // 取消删除
  })
}

// 格式化日期函数
const formatDate = (date) => {
  if (!date) return null
  
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  
  return `${year}-${month}-${day}`
}

// 组件初始化时加载数据
refreshData()
</script>

<style scoped>
.raster-search-container {
  padding: 8px;
  background-color: #1a1a1a;
  color: #e6e6e6;
  height: 100%;
  display: flex;
  flex-direction: column;
  max-height: 100vh;
  overflow: hidden;
}

.search-tabs {
  display: flex;
  border-bottom: 1px solid #333;
  margin-bottom: 8px;
  overflow-x: auto;
}

.search-tab {
  padding: 6px 10px;
  cursor: pointer;
  position: relative;
  color: #b8b8b8;
  white-space: nowrap;
  font-size: 12px;
}

.search-tab.active {
  color: #409EFF;
}

.search-tab.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: #409EFF;
}

.search-panel {
  margin-bottom: 8px;
}

.search-form {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-item {
  display: flex;
  flex-direction: column;
  margin-bottom: 4px;
}

.form-item label {
  margin-bottom: 2px;
  font-size: 12px;
  color: #b8b8b8;
}

.input-group {
  display: flex;
  align-items: center;
}

.input-group .el-input-number {
  flex: 1;
  margin: 0 4px;
}

.search-results {
  flex: 0 0 auto;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: auto;
  min-height: 200px;
  max-height: 200px;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.result-header .title {
  font-size: 13px;
  font-weight: bold;
}

/* 自定义 Element-Plus 样式，使其适应深色主题 */
:deep(.el-input__inner),
:deep(.el-input-number__decrease),
:deep(.el-input-number__increase),
:deep(.el-input__wrapper) {
  background-color: #2c2c2c !important;
  color: #e6e6e6 !important;
  border-color: #444 !important;
}

:deep(.el-date-editor),
:deep(.el-date-editor .el-input__wrapper) {
  background-color: #2c2c2c !important;
  width: 100% !important;
}

:deep(.el-button) {
  background-color: #2c2c2c;
  border-color: #444;
  padding: 6px 10px;
  font-size: 12px;
}

:deep(.el-button--primary) {
  background-color: #409EFF;
  border-color: #409EFF;
}

:deep(.el-button--danger) {
  background-color: #F56C6C;
  border-color: #F56C6C;
}

:deep(.el-table) {
  background-color: transparent !important;
  color: #e6e6e6 !important;
  font-size: 12px !important;
}

:deep(.el-table tr),
:deep(.el-table th) {
  background-color: #2c2c2c !important;
  color: #e6e6e6 !important;
  padding: 4px 0 !important;
  height: 32px !important;
}

:deep(.el-table td) {
  background-color: #1a1a1a !important;
  color: #e6e6e6 !important;
  border-color: #444 !important;
  padding: 4px 0 !important;
  height: 32px !important;
}

:deep(.el-table--border),
:deep(.el-table--border th),
:deep(.el-table--border td) {
  border-color: #444 !important;
}

:deep(.el-table--striped .el-table__body tr.el-table__row--striped td) {
  background-color: #252525 !important;
}

:deep(.el-table__body tr:hover>td) {
  background-color: #303030 !important;
}

:deep(.el-loading-mask) {
  background-color: rgba(0, 0, 0, 0.7) !important;
}

:deep(.el-table .cell) {
  padding-left: 5px !important;
  padding-right: 5px !important;
}

:deep(.el-button--small) {
  padding: 4px 8px;
  min-height: 24px;
}
</style> 