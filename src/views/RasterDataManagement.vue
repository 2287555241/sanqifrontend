<template>
  <div class="raster-management-container">
    <el-tabs type="border-card">
      <el-tab-pane label="带元数据的栅格数据导入">
        <!-- 引入栅格数据导入组件 -->
        <RasterDataImport @refresh="loadRasterData" />
      </el-tab-pane>
      <el-tab-pane label="栅格数据列表">
        <div class="list-section">
          <!-- 搜索栏 -->
          <el-card class="search-card">
            <el-tabs v-model="activeSearchTab">
              <el-tab-pane label="云量检索" name="cloud-cover">
                <el-form inline>
                  <el-form-item label="云量大于等于 (%)">
                    <el-input-number 
                      v-model="searchParams.cloudCover.min" 
                      :min="0" 
                      :max="100" 
                      :step="0.01"
                      placeholder="输入最小云量"
                    />
                  </el-form-item>
                  <el-form-item>
                    <el-button type="primary" @click="searchByCloudCover">按云量查询</el-button>
                  </el-form-item>
                </el-form>
              </el-tab-pane>
              <el-tab-pane label="采集日期检索" name="acquisition-date">
                <el-form inline>
                  <el-form-item label="开始日期">
                    <el-date-picker
                      v-model="searchParams.date.startDate"
                      type="date"
                      placeholder="选择开始日期"
                      format="YYYY-MM-DD"
                    />
                  </el-form-item>
                  <el-form-item label="结束日期">
                    <el-date-picker
                      v-model="searchParams.date.endDate"
                      type="date"
                      placeholder="选择结束日期"
                      format="YYYY-MM-DD"
                    />
                  </el-form-item>
                  <el-form-item>
                    <el-button type="primary" @click="searchByDate">按日期查询</el-button>
                  </el-form-item>
                </el-form>
              </el-tab-pane>
              <el-tab-pane label="太阳高度角检索" name="sun-elevation">
                <el-form inline>
                  <el-form-item label="太阳高度角大于等于 (度)">
                    <el-input-number
                      v-model="searchParams.sunElevation.min"
                      :min="0"
                      :max="90"
                      :step="0.01"
                      placeholder="输入最小太阳高度角"
                    />
                  </el-form-item>
                  <el-form-item>
                    <el-button type="primary" @click="searchBySunElevation">按太阳高度角查询</el-button>
                  </el-form-item>
                </el-form>
              </el-tab-pane>
              <el-tab-pane label="组合检索" name="combined">
                <el-form>
                  <el-form-item label="云量大于等于 (%)">
                    <el-input-number
                      v-model="searchParams.combined.cloudCover"
                      :min="0"
                      :max="100"
                      :step="0.01"
                      placeholder="输入最小云量"
                    />
                  </el-form-item>
                  <el-form-item label="开始日期">
                    <el-date-picker
                      v-model="searchParams.combined.startDate"
                      type="date"
                      placeholder="选择开始日期"
                      format="YYYY-MM-DD"
                    />
                  </el-form-item>
                  <el-form-item label="结束日期">
                    <el-date-picker
                      v-model="searchParams.combined.endDate"
                      type="date"
                      placeholder="选择结束日期"
                      format="YYYY-MM-DD"
                    />
                  </el-form-item>
                  <el-form-item label="太阳高度角大于等于 (度)">
                    <el-input-number
                      v-model="searchParams.combined.sunElevation"
                      :min="0"
                      :max="90"
                      :step="0.01"
                      placeholder="输入最小太阳高度角"
                    />
                  </el-form-item>
                  <el-form-item>
                    <el-button type="primary" @click="combinedSearch">组合查询</el-button>
                  </el-form-item>
                </el-form>
              </el-tab-pane>
            </el-tabs>
          </el-card>

          <!-- 数据列表 -->
          <div class="list-actions">
            <el-button type="primary" @click="loadRasterData">
              <el-icon><Refresh /></el-icon> 刷新数据列表
            </el-button>
          </div>

          <!-- 使用固定高度的表格，避免动态计算 -->
          <div class="table-container">
            <el-table
              v-loading="tableLoading"
              :data="rasterDataList"
              style="width: 100%"
              border
              stripe
              height="500px"
            >
              <el-table-column prop="id" label="ID" width="60" />
              <el-table-column prop="name" label="名称" min-width="120" />
              <el-table-column prop="description" label="描述" min-width="180">
                <template #default="scope">
                  {{ scope.row.description || '-' }}
                </template>
              </el-table-column>
              <el-table-column prop="rasterType" label="类型" width="100" />
              <el-table-column prop="bands" label="波段数" width="80" />
              <el-table-column prop="resolution" label="分辨率" width="100" />
              <el-table-column prop="cloudCover" label="云量 (%)" width="100">
                <template #default="scope">
                  {{ scope.row.cloudCover !== null ? scope.row.cloudCover : '-' }}
                </template>
              </el-table-column>
              <el-table-column prop="acquisitionDate" label="采集日期" width="120">
                <template #default="scope">
                  {{ scope.row.acquisitionDate || '-' }}
                </template>
              </el-table-column>
              <el-table-column prop="sunElevation" label="太阳高度角" width="120">
                <template #default="scope">
                  {{ scope.row.sunElevation !== null ? scope.row.sunElevation : '-' }}
                </template>
              </el-table-column>
              <el-table-column label="操作" width="150" fixed="right">
                <template #default="scope">
                  <el-button size="small" @click="viewDetails(scope.row)">查看</el-button>
                  <el-button
                    size="small"
                    type="danger"
                    @click="deleteRaster(scope.row.id)"
                  >删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <div v-if="tableMessage" class="table-message">
            <el-alert
              :title="tableMessage.title"
              :type="tableMessage.type"
              :description="tableMessage.description"
              show-icon
              :closable="true"
              @close="tableMessage = null"
            />
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 详情对话框 -->
    <el-dialog
      v-model="detailsDialogVisible"
      title="栅格数据详情"
      width="50%"
      destroy-on-close
    >
      <div v-if="selectedRaster" class="details-content">
        <div class="detail-item">
          <span class="detail-label">ID:</span>
          <span class="detail-value">{{ selectedRaster.id }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">名称:</span>
          <span class="detail-value">{{ selectedRaster.name }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">描述:</span>
          <span class="detail-value">{{ selectedRaster.description || '无' }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">类型:</span>
          <span class="detail-value">{{ selectedRaster.rasterType }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">波段数:</span>
          <span class="detail-value">{{ selectedRaster.bands }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">分辨率:</span>
          <span class="detail-value">{{ selectedRaster.resolution }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">云量:</span>
          <span class="detail-value">{{ selectedRaster.cloudCover !== null ? selectedRaster.cloudCover + '%' : '未知' }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">采集日期:</span>
          <span class="detail-value">{{ selectedRaster.acquisitionDate || '未知' }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">太阳高度角:</span>
          <span class="detail-value">{{ selectedRaster.sunElevation !== null ? selectedRaster.sunElevation + '°' : '未知' }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">文件路径:</span>
          <span class="detail-value">{{ selectedRaster.filePath }}</span>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="detailsDialogVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'
import axios from 'axios'
import RasterDataImport from './RasterDataImport.vue'

// 表格数据
const rasterDataList = ref([])
const tableLoading = ref(false)
const tableMessage = ref(null)

// 搜索相关
const activeSearchTab = ref('cloud-cover')
const searchParams = reactive({
  cloudCover: {
    min: null
  },
  date: {
    startDate: null,
    endDate: null
  },
  sunElevation: {
    min: null
  },
  combined: {
    cloudCover: null,
    startDate: null,
    endDate: null,
    sunElevation: null
  }
})

// 详情对话框
const detailsDialogVisible = ref(false)
const selectedRaster = ref(null)

// 页面加载时获取数据
onMounted(() => {
  loadRasterData()
})

// 加载栅格数据列表
const loadRasterData = async () => {
  tableLoading.value = true
  tableMessage.value = null
  
  try {
    const response = await axios.get('http://localhost:8888/api/raster/list')
    
    if (response.data.success) {
      rasterDataList.value = response.data.data || []
      
      if (rasterDataList.value.length === 0) {
        tableMessage.value = {
          type: 'info',
          title: '暂无数据',
          description: '没有找到任何栅格数据'
        }
      } else {
        tableMessage.value = {
          type: 'success',
          title: '加载成功',
          description: `成功加载 ${rasterDataList.value.length} 条数据`
        }
      }
    } else {
      tableMessage.value = {
        type: 'error',
        title: '加载失败',
        description: response.data.error || '服务器返回错误'
      }
    }
  } catch (error) {
    console.error('Error:', error)
    tableMessage.value = {
      type: 'error',
      title: '加载失败',
      description: error.message || '未知错误'
    }
  } finally {
    tableLoading.value = false
  }
}

// 按云量查询
const searchByCloudCover = async () => {
  tableLoading.value = true
  tableMessage.value = null
  
  try {
    const params = {}
    if (searchParams.cloudCover.min !== null) {
      params.min = searchParams.cloudCover.min
    }
    
    const response = await axios.get('http://localhost:8888/api/raster/search/cloud-cover', { params })
    
    handleSearchResponse(response, `云量大于等于 ${searchParams.cloudCover.min}% 的`)
  } catch (error) {
    console.error('Error:', error)
    tableMessage.value = {
      type: 'error',
      title: '查询失败',
      description: error.message || '未知错误'
    }
    tableLoading.value = false
  }
}

// 按采集日期查询
const searchByDate = async () => {
  tableLoading.value = true
  tableMessage.value = null
  
  try {
    const params = {}
    if (searchParams.date.startDate) {
      params.startDate = formatDate(searchParams.date.startDate)
    }
    if (searchParams.date.endDate) {
      params.endDate = formatDate(searchParams.date.endDate)
    }
    
    const response = await axios.get('http://localhost:8888/api/raster/search/acquisition-date', { params })
    
    let queryDesc = ''
    if (searchParams.date.startDate && searchParams.date.endDate) {
      queryDesc = `采集日期在 ${formatDate(searchParams.date.startDate)} 至 ${formatDate(searchParams.date.endDate)} 之间的`
    } else if (searchParams.date.startDate) {
      queryDesc = `采集日期大于等于 ${formatDate(searchParams.date.startDate)} 的`
    } else if (searchParams.date.endDate) {
      queryDesc = `采集日期小于等于 ${formatDate(searchParams.date.endDate)} 的`
    }
    
    handleSearchResponse(response, queryDesc)
  } catch (error) {
    console.error('Error:', error)
    tableMessage.value = {
      type: 'error',
      title: '查询失败',
      description: error.message || '未知错误'
    }
    tableLoading.value = false
  }
}

// 按太阳高度角查询
const searchBySunElevation = async () => {
  tableLoading.value = true
  tableMessage.value = null
  
  try {
    const params = {}
    if (searchParams.sunElevation.min !== null) {
      params.min = searchParams.sunElevation.min
    }
    
    const response = await axios.get('http://localhost:8888/api/raster/search/sun-elevation', { params })
    
    handleSearchResponse(response, `太阳高度角大于等于 ${searchParams.sunElevation.min}° 的`)
  } catch (error) {
    console.error('Error:', error)
    tableMessage.value = {
      type: 'error',
      title: '查询失败',
      description: error.message || '未知错误'
    }
    tableLoading.value = false
  }
}

// 组合查询
const combinedSearch = async () => {
  tableLoading.value = true
  tableMessage.value = null
  
  try {
    const params = {}
    if (searchParams.combined.cloudCover !== null) {
      params.cloudCover = searchParams.combined.cloudCover
    }
    if (searchParams.combined.startDate) {
      params.startDate = formatDate(searchParams.combined.startDate)
    }
    if (searchParams.combined.endDate) {
      params.endDate = formatDate(searchParams.combined.endDate)
    }
    if (searchParams.combined.sunElevation !== null) {
      params.sunElevation = searchParams.combined.sunElevation
    }
    
    const response = await axios.get('http://localhost:8888/api/raster/search/combined', { params })
    
    handleSearchResponse(response, '组合查询的')
  } catch (error) {
    console.error('Error:', error)
    tableMessage.value = {
      type: 'error',
      title: '查询失败',
      description: error.message || '未知错误'
    }
    tableLoading.value = false
  }
}

// 处理查询响应
const handleSearchResponse = (response, queryDesc) => {
  if (response.data.success) {
    rasterDataList.value = response.data.data || []
    
    if (rasterDataList.value.length === 0) {
      tableMessage.value = {
        type: 'info',
        title: '暂无数据',
        description: '没有找到符合条件的栅格数据'
      }
    } else {
      tableMessage.value = {
        type: 'success',
        title: '查询成功',
        description: `成功查询到 ${rasterDataList.value.length} 条${queryDesc}数据`
      }
    }
  } else {
    tableMessage.value = {
      type: 'error',
      title: '查询失败',
      description: response.data.error || '服务器返回错误'
    }
  }
  
  tableLoading.value = false
}

// 查看详情
const viewDetails = async (row) => {
  try {
    const response = await axios.get(`http://localhost:8888/api/raster/${row.id}`)
    
    if (response.data.success) {
      selectedRaster.value = response.data.data
      detailsDialogVisible.value = true
    } else {
      ElMessage.error(`获取详情失败: ${response.data.error}`)
    }
  } catch (error) {
    console.error('Error:', error)
    ElMessage.error(`获取详情失败: ${error.message}`)
  }
}

// 删除栅格数据
const deleteRaster = (id) => {
  ElMessageBox.confirm(
    `确定要删除ID为 ${id} 的栅格数据吗？此操作不可恢复！`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
    .then(async () => {
      try {
        const response = await axios.delete(`http://localhost:8888/api/raster/${id}`)
        
        if (response.data.success) {
          ElMessage.success('删除成功')
          loadRasterData() // 重新加载数据列表
        } else {
          ElMessage.error(`删除失败: ${response.data.error}`)
        }
      } catch (error) {
        console.error('Error:', error)
        ElMessage.error(`删除失败: ${error.message}`)
      }
    })
    .catch(() => {
      // 取消删除
    })
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return null
  
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  
  return `${year}-${month}-${day}`
}
</script>

<style scoped>
.raster-management-container {
  padding: 20px;
}

.list-section {
  margin-top: 20px;
}

.search-card {
  margin-bottom: 20px;
}

.list-actions {
  margin-bottom: 15px;
  display: flex;
  justify-content: flex-end;
}

/* 添加表格容器样式，确保表格有固定的高度和宽度 */
.table-container {
  width: 100%;
  margin-bottom: 15px;
  /* 添加溢出处理，确保表格不会导致页面溢出 */
  overflow: hidden;
}

.table-message {
  margin-top: 15px;
}

.details-content {
  padding: 10px;
}

.detail-item {
  margin-bottom: 10px;
  display: flex;
}

.detail-label {
  font-weight: bold;
  width: 120px;
  color: #606266;
}

.detail-value {
  flex: 1;
}
</style> 