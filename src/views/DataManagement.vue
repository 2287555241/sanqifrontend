<<<<<<< Updated upstream
<<<<<<< Updated upstream
<template>
    <div class="data-management-container">
      <h2 class="page-title"></h2>
      
      <div class="data-content">
        <el-card class="data-card">
          <template #header>
            <div class="card-header">
              <span>数据列表</span>
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
          
          <el-table 
            :data="currentTableData" 
            style="width: 100%" 
            border: boolean
            :row-style="{ height: '120px' }"
            @selection-change="handleSelectionChange"
          >
            <el-table-column v-if="editMode" type="selection" width="55" />
            <el-table-column prop="name" label="数据名称" />
            <el-table-column prop="type" label="数据类型" width="90" />
            <el-table-column prop="size" label="大小" width="80" />
            <el-table-column prop="createTime" label="创建时间" width="160" />
            <el-table-column label="图像预览" width="140">
              <template #default="scope">
                <div class="image-preview-cell">
                  <img 
                    v-if="isImageType(scope.row.type)" 
                    :src="getPreviewImageUrl(scope.row)" 
                    :alt="scope.row.name"
                    class="preview-thumbnail"
                    @click="handlePreview(scope.row)"
                  />
                  <div v-else-if="isPreviewable(scope.row.type)" class="preview-icon-container" @click="handlePreview(scope.row)">
                    <el-icon class="geo-icon"><Location /></el-icon>
                  </div>
                  <div v-else class="preview-icon-container">
                    <el-icon><Document /></el-icon>
                  </div>
                </div>
              </template>
            </el-table-column>
          </el-table>
          
          <div class="pagination-container">
            <el-pagination
              background
              layout="prev, pager, next"
              :total="100"
              :page-size="10"
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
            <p>类型: {{ currentPreviewItem.type }} | 大小: {{ currentPreviewItem.size }} | 上传时间: {{ currentPreviewItem.createTime }}</p>
          </div>
          <div class="preview-image">
            <img 
              v-if="isImageType(currentPreviewItem.type)" 
              :src="getPreviewImageUrl(currentPreviewItem)" 
              alt="预览图片"
            />
            <div v-else class="preview-placeholder">
              <el-icon class="preview-icon"><Document /></el-icon>
              <span>{{ getPreviewMessage(currentPreviewItem.type) }}</span>
            </div>
          </div>
        </div>
      </el-dialog>
      
      <!-- 数据导入对话框 -->
      <import-dialog v-model="importDialogVisible" @success="handleImportSuccess" />
    </div>
</template>
  
  <script setup>
  import { ref, computed, watch } from 'vue'
  import { useDataStore } from '../stores/dataStore'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { Document, Location } from '@element-plus/icons-vue'
  import ImportDialog from '../components/ImportDialog.vue'
  
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
  const activeTab = ref('local')
  
  // 根据当前激活的选项卡显示不同的数据
  const currentTableData = computed(() => {
    return activeTab.value === 'local' ? dataStore.localDataList : dataStore.userDataList
  })
  
  // 预览相关
  const previewDialogVisible = ref(false)
  const currentPreviewItem = ref(null)
  
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
  
  const handleBatchDelete = () => {
    if (selectedRows.value.length === 0) return
    
    ElMessageBox.confirm(
      `确定要删除选中的 ${selectedRows.value.length} 项吗？`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
      .then(() => {
        selectedRows.value.forEach(row => {
          if (activeTab.value === 'local') {
            dataStore.deleteLocalData(row.id)
          } else {
            dataStore.deleteUserData(row.id)
          }
        })
        selectedRows.value = []
        ElMessage({
          type: 'success',
          message: '删除成功',
        })
      })
      .catch(() => {
        ElMessage({
          type: 'info',
          message: '已取消删除',
        })
      })
  }
  
  // 判断文件类型是否可预览
  const isPreviewable = (type) => {
    const previewableTypes = ['GeoJSON', 'TIFF', 'JPG', 'PNG', 'JPEG', 'GIF']
    return previewableTypes.includes(type)
  }
  
  // 判断是否为图像类型
  const isImageType = (type) => {
    const imageTypes = ['JPG', 'PNG', 'JPEG', 'GIF', 'TIFF']
    return imageTypes.includes(type)
  }
  
  // 获取预览图片URL (这里使用模拟数据)
  const getPreviewImageUrl = (item) => {
    // 实际项目中这里应该返回真实的图片URL
    if (isImageType(item.type)) {
      // 根据文件类型返回不同的占位图片
      return `https://via.placeholder.com/100x100.png?text=${item.type}`
    }
    return ''
  }
  
  // 获取不同类型文件的预览信息
  const getPreviewMessage = (type) => {
    if (type === 'GeoJSON') {
      return '地理空间数据，需要专用工具查看'
    } else {
      return '该类型文件无法直接预览'
    }
  }
  
  // 预览处理
  const handlePreview = (row) => {
    currentPreviewItem.value = row
    previewDialogVisible.value = true
  }
  
  // 关闭预览对话框
  const closePreviewDialog = () => {
    previewDialogVisible.value = false
    currentPreviewItem.value = null
  }
  
  const handlePageChange = (currentPage) => {
    console.log('页码变化', currentPage)
  }

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
    // 可以在这里刷新数据列表
    if (activeTab.value === 'local') {
      dataStore.fetchLocalData()
    } else {
      dataStore.fetchUserData()
    }
  }
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
  
  .preview-image img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }
  
  .preview-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #909399;
    gap: 20px;
  }
  
  .preview-icon {
    font-size: 64px;
  }
  
  /* 表格中的图像预览样式 */
  .image-preview-cell {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 80px;
  }
  
  .preview-thumbnail {
    max-width: 100px;
    max-height: 80px;
    object-fit: contain;
    border-radius: 4px;
    cursor: pointer;
    transition: transform 0.2s;
  }
  
  .preview-thumbnail:hover {
    transform: scale(1.05);
    box-shadow: 0 0 8px rgba(0, 0, 0, 0.1);
  }
  
  .preview-icon-container {
    width: 60px;
    height: 60px;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #f5f7fa;
    border-radius: 4px;
    color: #909399;
    font-size: 24px;
  }
  
  .preview-icon-container .geo-icon {
    color: #67C23A;
    cursor: pointer;
  }

  /* 调整表格列宽度 */
  .data-card :deep(.el-table .el-table__header-wrapper) {
    width: 100%;
  }
  </style>
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes

