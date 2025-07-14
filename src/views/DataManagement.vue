<template>
  <div class="data-management-container">
    <div class="data-content">
      <el-card class="data-card">
        <template #header>
          <div class="card-header">
            <span>数据管理</span>
            <div class="header-actions">
              <!-- 编辑模式下显示删除按钮，否则显示编辑按钮 -->
              <template v-if="editMode">
                <el-button type="danger" size="small" :disabled="selectedRows.length === 0" @click="handleBatchDelete">删除</el-button>
                <el-button type="primary" size="small" @click="toggleEditMode">取消</el-button>
              </template>
              <template v-else>
                <el-button type="primary" size="small" @click="toggleEditMode">编辑</el-button>
                <el-button type="primary" size="small" @click="showImportDialog">数据导入</el-button>
              </template>
              <el-button type="primary" size="small" @click="$emit('close')">关闭</el-button>
            </div>
          </div>
        </template>
        
        <div class="tab-header">
          <div 
            class="tab-item" 
            :class="{ active: activeTab === 'project' }" 
            @click="activeTab = 'project'"
          >
            项目列表
          </div>
          <div 
            class="tab-item" 
            :class="{ active: activeTab === 'data' }" 
            @click="activeTab = 'data'"
          >
            数据列表
          </div>
        </div>
        
        <el-table 
          :data="pagedTableData" 
          style="width: 100%" 
          border: boolean
          :row-style="{ height: '120px' }"
          @selection-change="handleSelectionChange"
          align="center"
          header-align="center"
          v-loading="loading"
        >
          <template v-if="activeTab === 'data'">
            <el-table-column v-if="editMode" type="selection" width="55" />
            <el-table-column prop="name" label="数据名称" align="center" header-align="center" />
            <el-table-column prop="rasterType" label="数据类型" align="center" header-align="center">
              <template #default="scope">
                <span>{{ scope.row.rasterType || '无' }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="size" label="大小" align="center" header-align="center" />
            <el-table-column prop="createdAt" label="创建时间" align="center" header-align="center">
              <template #default="scope">
                <span>{{ formatDate(scope.row.createdAt) }}</span>
              </template>
            </el-table-column>
            <el-table-column label="图像预览" width="120">
              <template #default="scope">
                <div class="image-preview-cell">
                  <img 
                    v-if="scope.row.thumbnailUrl"
                    :src="scope.row.thumbnailUrl" 
                    :alt="scope.row.name"
                    class="preview-thumbnail"
                    @click="handlePreview(scope.row)"
                    @error="handleImageError(scope.row)"
                  />
                  <div v-else class="preview-placeholder"></div>
                </div>
              </template>
            </el-table-column>
          </template>
          <template v-else>
            <el-table-column label="暂无数据" align="center">
              <template #default>
                <span>暂无项目数据</span>
              </template>
            </el-table-column>
          </template>
        </el-table>
        
        <div class="pagination-container">
          <el-pagination
            background
            layout="prev, pager, next"
            :total="totalDataCount"
            :page-size="pageSize"
            :current-page="currentPage"
            @current-change="handlePageChange"
          />
        </div>
      </el-card>
    </div>
    
    <!-- 图像预览对话框 -->
    <el-dialog
      v-model="previewDialogVisible"
      title="图像预览"
      width="80%"
      :before-close="closePreviewDialog"
    >
      <div class="preview-container" v-if="currentPreviewItem">
        <div class="preview-info">
          <h4>{{ currentPreviewItem.name }}</h4>
          <p>类型: {{ currentPreviewItem.rasterType }} | 大小: {{ currentPreviewItem.size }} | 上传时间: {{ formatDate(currentPreviewItem.createdAt) }}</p>
        </div>
        <div class="preview-image">
          <img 
            v-if="currentPreviewItem.hasPreview"
            :src="currentPreviewItem.thumbnailUrl" 
            alt="预览图片"
            class="preview-full-image"
            @error="handlePreviewImageError"
          />
          <div v-else class="preview-placeholder-large">
            <el-icon class="preview-icon"><Document /></el-icon>
            <span>无预览图</span>
          </div>
        </div>
      </div>
    </el-dialog>
    
    <!-- 数据导入对话框 -->
    <import-dialog v-model="importDialogVisible" @success="handleImportSuccess" />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useDataStore } from '../stores/dataStore'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Document, Location, Loading } from '@element-plus/icons-vue'
import ImportDialog from '../components/ImportDialog.vue'
import axios from 'axios'
import apiConfig from '../config/api'

// 定义emit
const emit = defineEmits(['close', 'disableDrag', 'enableDrag'])

// 使用数据存储
const dataStore = useDataStore()

// 数据导入对话框
const importDialogVisible = ref(false)

// 监听importDialogVisible变化，通知父组件禁用/启用拖动
watch(importDialogVisible, (newVal) => {
if (newVal) {
  emit('disableDrag')
} else {
  emit('enableDrag')
}
})

// 激活的选项卡
const activeTab = ref('data')

// 数据相关
const tableData = ref([])
const loading = ref(false)
const totalDataCount = ref(0)
const pageSize = ref(5)
const currentPage = ref(1)

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString || dateString === '无') return '无'
  try {
    const date = new Date(dateString)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  } catch (error) {
    console.error('日期格式化失败:', error)
    return dateString
  }
}

// 获取数据列表
const fetchData = async () => {
  loading.value = true
  try {
    const response = await axios.get(apiConfig.raster.list)
    if (response.data.success) {
      // 获取每个文件的详细信息
      const detailedData = await Promise.all(
        response.data.data.map(async (item) => {
          try {
            // 获取文件大小
            const sizeResponse = await axios.get(apiConfig.raster.getSize(item.id))
            return {
              ...item,
              size: sizeResponse.data.fileSizeFormatted,
              thumbnailUrl: apiConfig.raster.thumbnail(item.id)
            }
          } catch (error) {
            console.error(`获取文件 ${item.id} 大小失败:`, error)
            return {
              ...item,
              size: '未知',
              thumbnailUrl: apiConfig.raster.thumbnail(item.id)
            }
          }
        })
      )
      
      tableData.value = detailedData
      totalDataCount.value = response.data.count
    } else {
      ElMessage.error(response.data.error || '获取数据列表失败')
    }
  } catch (error) {
    console.error('获取数据列表失败:', error)
    ElMessage.error('获取数据列表失败')
  } finally {
    loading.value = false
  }
}

// 分页后的数据
const pagedTableData = computed(() => {
  if (activeTab.value === 'project') {
    return [] // 项目列表暂时为空
  }
  const start = (currentPage.value - 1) * pageSize.value
  return tableData.value.slice(start, start + pageSize.value)
})

// 编辑模式
const editMode = ref(false)
const selectedRows = ref([])

const toggleEditMode = () => {
editMode.value = !editMode.value
// 切换模式时清空选中
if (!editMode.value) {
  selectedRows.value = []
}
}

const handleSelectionChange = (rows) => {
selectedRows.value = rows
}

// 删除数据
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除这条数据吗？此操作不可恢复。',
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    const response = await axios.delete(apiConfig.raster.delete(row.id))
    if (response.data.success) {
      ElMessage.success('删除成功')
      fetchData() // 重新获取数据列表
    } else {
      ElMessage.error(response.data.error || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 批量删除
const handleBatchDelete = async () => {
  if (selectedRows.value.length === 0) return
  
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedRows.value.length} 项吗？`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    const deletePromises = selectedRows.value.map(row => 
      axios.delete(apiConfig.raster.delete(row.id))
    )
    
    await Promise.all(deletePromises)
    ElMessage.success('批量删除成功')
    selectedRows.value = []
    fetchData() // 重新获取数据列表
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量删除失败:', error)
      ElMessage.error('批量删除失败')
    }
  }
}

// 预览相关
const previewDialogVisible = ref(false)
const currentPreviewItem = ref(null)

// 预览处理
const handlePreview = (row) => {
  if (!row.thumbnailUrl) return
  currentPreviewItem.value = {
    ...row,
    thumbnailUrl: apiConfig.raster.thumbnail(row.id)
  }
  previewDialogVisible.value = true
}

// 处理预览对话框中的图片加载错误
const handlePreviewImageError = () => {
  if (currentPreviewItem.value) {
    currentPreviewItem.value.hasPreview = false
  }
}

// 关闭预览对话框
const closePreviewDialog = () => {
previewDialogVisible.value = false
currentPreviewItem.value = null
}

// 监听分页变化
const handlePageChange = (page) => {
currentPage.value = page
}

// 监听切换tab时重置分页
watch(activeTab, (newTab) => {
  currentPage.value = 1
  if (newTab === 'data') {
    fetchData() // 切换到数据列表时获取数据
  }
})

const handleEdit = (row) => {
// 实现编辑逻辑
console.log('编辑', row)
}

// 显示导入对话框
const showImportDialog = () => {
importDialogVisible.value = true
}

// 导入成功的回调
const handleImportSuccess = () => {
ElMessage.success('数据导入成功')
// 延迟一下再刷新数据，确保后端处理完成
setTimeout(() => {
  fetchData() // 重新获取数据列表
  // 通知地图组件刷新数据
  if (window._mapEmitter) {
    window._mapEmitter.emit('refresh-map-data')
  }
}, 1000)
}

// 处理图片加载错误
const handleImageError = (row) => {
  row.thumbnailUrl = null
}

// 组件挂载时获取数据
onMounted(() => {
fetchData()
})
</script>

<style scoped>
/* 外层容器 */
.data-management-container {
padding: 0 20px 20px; /* 上边距设为0，通过margin控制 */
height: 100vh;
display: flex;
flex-direction: column;
box-sizing: border-box;
}

/* 页面标题 */
.page-title {
margin: 60px 0 0 20px; /* 顶部间距60px */
padding: 0;
font-size: 20px;
font-weight: 600;
}

/* 内容区域 */
.data-content {
margin: 0;  /* 移除左边距，让内容区域完全展开 */
flex: 1;
display: flex;
flex-direction: column;
min-height: 0;
width: 100%;
padding: 0 20px; /* 使用padding代替margin来控制间距 */
cursor: default; /* 设置默认鼠标样式 */
}

/* 卡片样式 */
.data-card {
flex: 1;
display: flex;
flex-direction: column;
overflow: hidden;
margin-top: 20px;
min-width: 1000px; /* 设置最小宽度 */
width: 100%; /* 让卡片占满容器宽度 */
}

/* 卡片头部样式 */
.card-header {
display: flex;
justify-content: space-between;
align-items: center;
padding: 12px 20px;
cursor: default; /* 设置默认鼠标样式 */
}

/* 头部按钮组 */
.header-actions {
display: flex;
gap: 10px;
align-items: center;
}

/* 表格容器 */
.data-card :deep(.el-card__body) {
flex: 1;
display: flex;
flex-direction: column;
overflow: hidden;
padding: 0;
cursor: default; /* 设置默认鼠标样式 */
}

/* 表格样式 */
.data-card :deep(.el-table) {
flex: 1;
overflow: auto;
width: 100% !important; /* 强制表格宽度为100% */
cursor: default; /* 设置默认鼠标样式 */
}

/* 表格单元格样式 */
.data-card :deep(.el-table td) {
cursor: default; /* 设置默认鼠标样式 */
}

/* 表格头部样式 */
.data-card :deep(.el-table th) {
cursor: default; /* 设置默认鼠标样式 */
}

/* 行高设置 */
.data-card :deep(.el-table .el-table__row) {
height: 120px;
}

/* 分页样式 */
.pagination-container {
margin-top: auto;
padding: 16px 20px;
background: #fff;
border-top: 1px solid #ebeef5;
display: flex;
justify-content: center;
}

/* 选项卡样式 */
.tab-header {
display: flex;
border-bottom: 1px solid rgba(0, 0, 0, 0.1);
margin-bottom: 16px;
padding: 0 20px;
cursor: default; /* 设置默认鼠标样式 */
}

.tab-item {
padding: 10px 20px;
cursor: pointer; /* 保持选项卡的可点击样式 */
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

/* 预览相关样式 */
.preview-container {
display: flex;
flex-direction: column;
gap: 20px;
}

.preview-info {
border-bottom: 1px solid #ebeef5;
padding-bottom: 15px;
}

.preview-info h4 {
margin: 0 0 10px 0;
font-size: 18px;
color: #303133;
}

.preview-info p {
margin: 0;
color: #909399;
font-size: 14px;
}

.preview-image {
display: flex;
justify-content: center;
align-items: center;
min-height: 400px;
background-color: #f5f7fa;
border-radius: 4px;
overflow: hidden;
}

.preview-placeholder-large {
width: 100%;
height: 400px;
display: flex;
flex-direction: column;
justify-content: center;
align-items: center;
background-color: #f5f7fa;
border-radius: 4px;
color: #909399;
font-size: 14px;
gap: 8px;
}

.preview-placeholder-large .preview-icon {
font-size: 48px;
}

/* 表格中的图像预览样式 */
.image-preview-cell {
display: flex;
justify-content: center;
align-items: center;
height: 80px;
width: 100px;
margin: 0 auto;
}

.preview-thumbnail {
max-width: 100px;
max-height: 80px;
object-fit: contain;
cursor: pointer;
}

.preview-placeholder {
width: 100px;
height: 80px;
background-color: #f5f7fa;
border-radius: 4px;
}

.preview-full-image {
max-width: 100%;
max-height: 600px;
object-fit: contain;
border-radius: 4px;
box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.preview-loading {
width: 100px;
height: 80px;
display: flex;
flex-direction: column;
justify-content: center;
align-items: center;
background-color: #f5f7fa;
border-radius: 4px;
color: #909399;
font-size: 12px;
gap: 4px;
}

.preview-loading .loading-icon {
font-size: 24px;
animation: rotating 2s linear infinite;
}

@keyframes rotating {
from {
  transform: rotate(0deg);
}
to {
  transform: rotate(360deg);
}
}
</style>

