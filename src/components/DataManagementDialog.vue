<template>
  <div v-if="visible" class="data-management-dialog-container">
    <div class="dialog-content">
      <div class="close-button" @click="handleClose">
        <el-icon><Close /></el-icon>
      </div>
      
      <el-tabs v-model="activeTab" type="border-card" class="full-height-tabs">
        <el-tab-pane label="系统数据" name="system">
          <el-table
            :data="[]"
            style="width: 100%"
            stripe
            height="450px"
            table-layout="auto"
          >
            <el-table-column type="selection" width="55" />
            <el-table-column prop="id" label="ID" width="100" />
            <el-table-column prop="name" label="名称" min-width="300" />
            <el-table-column prop="type" label="类型" width="150" />
            <el-table-column prop="size" label="大小" width="150" />
            <el-table-column prop="createTime" label="创建时间" width="200" />

          </el-table>
          
          <div class="table-footer">
            <div class="batch-actions">
              <el-button type="primary" @click="showRasterImportDialog">栅格数据导入</el-button>
            </div>
            
            <el-pagination
              :current-page="1"
              :page-size="10"
              :total="30"
              layout="total, prev, pager, next"
              background
            />
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="用户数据" name="user">
          <el-table
            :data="userData"
            style="width: 100%"
            stripe
            height="450px"
            table-layout="auto" 
            v-loading="userLoading"
            @selection-change="handleSelectionChange"
          >
            <el-table-column type="selection" width="55" />
            <el-table-column prop="id" label="ID" width="90" />
            <el-table-column prop="name" label="名称" min-width="250" />
            <el-table-column prop="description" label="描述" min-width="200">
              <template #default="scope">
                {{ scope.row.description || '-' }}
              </template>
            </el-table-column>
            <el-table-column prop="rasterType" label="类型" width="120">
              <template #default="scope">
                {{ scope.row.rasterType || '栅格' }}
              </template>
            </el-table-column>
            <el-table-column prop="bands" label="波段数" width="100">
              <template #default="scope">
                {{ scope.row.bands || '-' }}
              </template>
            </el-table-column>
            <el-table-column prop="resolution" label="分辨率" width="100">
              <template #default="scope">
                {{ scope.row.resolution || '-' }}
              </template>
            </el-table-column>
            <el-table-column prop="cloudCover" label="云量 (%)" width="120">
              <template #default="scope">
                {{ scope.row.cloudCover !== null ? scope.row.cloudCover : '-' }}
              </template>
            </el-table-column>
            <el-table-column prop="acquisitionDate" label="采集日期" width="130">
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
                <el-button type="primary" size="small" @click="handleEdit(scope.row)">编辑</el-button>
              </template>
            </el-table-column>
            <template #empty>
              <div class="empty-data-container">
                <el-icon><DocumentDelete /></el-icon>
                <p>暂无数据</p>
                <p v-if="loadingError" class="error-hint">{{ loadingError }}</p>
                <el-button type="primary" @click="retryFetchData">重新加载</el-button>
              </div>
            </template>
          </el-table>
          
          <div class="table-footer">
            <div class="batch-actions">
              <el-button type="primary" @click="showRasterImportDialog">栅格数据导入</el-button>
              <el-button type="danger" @click="batchDelete" :disabled="selectedRows.length === 0">批量删除</el-button>
            </div>
            
            <el-pagination
              :current-page="1"
              :page-size="10"
              :total="30"
              layout="total, prev, pager, next"
              background
            />
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
    
    <!-- 栅格数据导入对话框 -->
    <el-dialog
      v-model="rasterImportDialogVisible"
      title="栅格数据导入"
      width="550px"
      :top="'100px'"
      destroy-on-close
      @closed="resetRasterImportForm"
    >
      <div class="raster-import-container">
        <div class="file-section">
          <h3>选择TIF文件:</h3>
          <div class="file-upload-box">
            <el-upload
              class="tif-upload horizontal-upload"
              action="http://localhost:8888/api/raster/upload"
              :auto-upload="false"
              :limit="1"
              :on-change="handleTifChange"
              :file-list="tifFileList"
            >
              <div class="upload-row">
                <el-button class="upload-button" size="small">选择文件</el-button>
                <div class="upload-tip">{{ tifFileName || '未选择文件' }}</div>
              </div>
            </el-upload>
          </div>
        </div>

        <div class="file-section">
          <h3>选择MTL文件: <span class="mtl-description">包含云量等元数据信息的文件</span></h3>
          <div class="file-upload-box">
            <el-upload
              class="mtl-upload horizontal-upload"
              action="http://localhost:8888/api/raster/upload-mtl"
              :auto-upload="false"
              :limit="1"
              :on-change="handleMtlChange"
              :file-list="mtlFileList"
            >
              <div class="upload-row">
                <el-button class="upload-button" size="small">选择文件</el-button>
                <div class="upload-tip">{{ mtlFileName || '未选择文件' }}</div>
              </div>
            </el-upload>
          </div>
        </div>

        <div class="description-section">
          <h3>数据描述:</h3>
          <el-input
            type="textarea"
            v-model="rasterDescription"
            :rows="3"
            placeholder="请输入栅格数据的描述信息"
            class="description-textarea"
          ></el-input>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="rasterImportDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitRasterImport" :loading="rasterImportLoading">
            导入带元数据的数据
          </el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 编辑数据对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      title="编辑数据"
      width="600px"
      destroy-on-close
    >
      <div class="edit-container">
        <el-form label-position="top">
          <el-form-item label="名称">
            <el-input v-model="editForm.name" placeholder="输入数据名称"></el-input>
          </el-form-item>
          <el-form-item label="描述">
            <el-input 
              type="textarea" 
              v-model="editForm.description" 
              :rows="4" 
              placeholder="输入描述信息">
            </el-input>
          </el-form-item>
        </el-form>
        
        <div class="operation-options">
          <el-divider>操作选项</el-divider>
          <el-row>
            <el-col :span="12">
              <el-checkbox v-model="editForm.delete">删除此数据</el-checkbox>
            </el-col>
          </el-row>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="danger" @click="confirmDelete" v-if="editForm.delete">
            确认删除
          </el-button>
          <el-button type="primary" @click="submitEdit" v-else :loading="editLoading">
            保存修改
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, onBeforeUnmount } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'
import { DocumentDelete, Close } from '@element-plus/icons-vue'
import apiConfig from '@/config/api'
import { emitter, Events } from '@/utils/eventBus'

// 定义props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})

// 定义emit事件
const emit = defineEmits(['close'])

// 监听visible变化，当变为true时加载数据
watch(() => props.visible, (newVal) => {
  if (newVal) {
    fetchUserData()
  }
})

// 当前选中的标签页
const activeTab = ref('system')

// 处理切换到用户数据标签页的事件
const handleSwitchToUserData = () => {
  console.log('切换到用户数据标签页')
  activeTab.value = 'user'
}

// 组件挂载时加载数据和注册事件监听
onMounted(async () => {
  const isConnected = await testConnection()
  if (isConnected) {
    fetchUserData()
  }
  
  // 注册事件监听，当收到切换到用户数据标签页的事件时执行
  emitter.on('switch-to-user-data', handleSwitchToUserData)
})

// 组件卸载前清理事件监听
onBeforeUnmount(() => {
  emitter.off('switch-to-user-data', handleSwitchToUserData)
})

// 栅格数据导入相关
const rasterImportDialogVisible = ref(false)
const tifFileList = ref([])
const mtlFileList = ref([])
const tifFileName = ref('')
const mtlFileName = ref('')
const rasterDescription = ref('')
const rasterImportLoading = ref(false)

// 用户数据相关
const userData = ref([])
const userLoading = ref(false)
const loadingError = ref(null)
const selectedRows = ref([])

// 显示栅格数据导入对话框
const showRasterImportDialog = () => {
  rasterImportDialogVisible.value = true
}

// 获取用户数据
const fetchUserData = async () => {
  userLoading.value = true
  try {
    console.log('开始获取用户数据...')
    // 发送请求获取用户数据
    const response = await axios.get(apiConfig.raster.userData, { 
      timeout: 5000,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })
    
    console.log('获取用户数据成功:', response)
    
    // 处理返回数据，兼容直接返回数组或包装在对象中的情况
    let dataArray = response.data
    
    // 如果响应是一个对象且包含data字段，则使用data字段的值
    if (response.data && typeof response.data === 'object' && !Array.isArray(response.data) && response.data.data) {
      dataArray = response.data.data
    }
    
    if (Array.isArray(dataArray)) {
      userData.value = dataArray.map(item => ({
        id: item.id,
        name: item.name || item.fileName || '未命名数据',
        description: item.description || '',
        // 将原始数据的属性直接映射到当前对象，便于表格直接访问
        rasterType: item.rasterType || '栅格',
        bands: item.bands || null,
        resolution: item.resolution || null,
        cloudCover: item.cloudCover || null,
        acquisitionDate: item.acquisitionDate || null,
        sunElevation: item.sunElevation || null,
        // 保存原始数据，以便后续操作
        rawData: item
      }))
    } else {
      // 如果没有数据或格式不对，设置为空数组
      userData.value = []
      console.log('未检测到有效的数组数据，返回内容:', dataArray)
    }
  } catch (error) {
    console.error('获取用户数据失败:', error)
    console.error('错误详情:', {
      message: error.message,
      response: error.response ? {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      } : '无响应对象',
      request: error.request ? '请求已发送' : '未发送请求',
      config: error.config ? {
        url: error.config.url,
        method: error.config.method,
        headers: error.config.headers,
        timeout: error.config.timeout
      } : '无配置对象'
    })
    
    // 区分不同类型的错误
    if (error.code === 'ECONNABORTED') {
      ElMessage.error('获取用户数据超时，请检查后端服务是否启动')
      loadingError.value = '请求超时，请检查网络连接和后端服务'
    } else if (error.response) {
      // 服务器返回错误响应
      const statusMessage = `${error.response.status} ${error.response.statusText}`
      const errorDetails = error.response.data && error.response.data.error 
        ? error.response.data.error 
        : '未知服务器错误'
      
      ElMessage.error(`获取用户数据失败: 服务器返回错误 (${statusMessage})`)
      loadingError.value = `服务器错误 (${statusMessage}): ${errorDetails}`
    } else if (error.request) {
      // 请求已发送但没有收到响应
      ElMessage.error('获取用户数据失败: 无法连接到后端服务，请确保服务已启动')
      loadingError.value = '无法连接到后端服务，请确保服务已启动'
    } else {
      // 请求设置触发的错误
      ElMessage.error(`获取用户数据失败: ${error.message}`)
      loadingError.value = error.message || '未知错误'
    }
    userData.value = []
  } finally {
    userLoading.value = false
  }
}

// TIF文件选择处理
const handleTifChange = (file, fileList) => {
  if (fileList.length > 0) {
    tifFileName.value = fileList[0].name
    tifFileList.value = fileList
  } else {
    tifFileName.value = ''
    tifFileList.value = []
  }
}

// MTL文件选择处理
const handleMtlChange = (file, fileList) => {
  if (fileList.length > 0) {
    mtlFileName.value = fileList[0].name
    mtlFileList.value = fileList
  } else {
    mtlFileName.value = ''
    mtlFileList.value = []
  }
}

// 查看数据
const viewData = (data) => {
  ElMessage.info(`查看数据: ${data.name}`)
  console.log('查看数据详情:', data)
  // 这里可以实现查看数据的详细信息，例如打开新的对话框或页面
}

// 导入数据
const importData = (data) => {
  ElMessage.success(`已导入数据: ${data.name}`)
  console.log('导入数据:', data)
  // 这里可以实现导入数据到地图或其他位置的逻辑
}

// 删除数据
const deleteData = async (data) => {
  try {
    // 发送删除请求
    const response = await axios.delete(apiConfig.raster.delete(data.id))
    
    if (response.data && response.data.success) {
      ElMessage.success(`已删除数据: ${data.name}`)
      // 关闭编辑对话框（如果是从编辑对话框发起的删除操作）
      editDialogVisible.value = false
      // 重新获取数据列表
      fetchUserData()
    } else {
      ElMessage.error(`删除失败: ${response.data.error || '未知错误'}`)
    }
  } catch (error) {
    console.error('删除数据失败:', error)
    ElMessage.error(`删除失败: ${error.message || '未知错误'}`)
  }
}

// 提交栅格数据导入
const submitRasterImport = async () => {
  // 表单验证
  if (tifFileList.value.length === 0) {
    ElMessage.warning('请选择TIF文件')
    return
  }
  
  rasterImportLoading.value = true
  
  try {
    // 准备上传数据
    const formData = new FormData()
    
    // 添加TIF文件
    if (tifFileList.value.length > 0) {
      formData.append('tifFile', tifFileList.value[0].raw)
    }
    
    // 添加MTL文件（如果有）
    if (mtlFileList.value.length > 0) {
      formData.append('mtlFile', mtlFileList.value[0].raw)
    }
    
    // 添加描述
    formData.append('description', rasterDescription.value)
    
    // 发送请求
    const response = await axios.post(apiConfig.raster.importWithMetadata, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    
    if (response.data.success) {
      ElMessage.success('栅格数据导入成功')
      resetRasterImportForm()
      
      // 导入成功后切换到用户数据标签页并刷新数据
      activeTab.value = 'user'
      fetchUserData()
      
      // 关闭导入对话框
      rasterImportDialogVisible.value = false
    } else {
      ElMessage.error(`导入失败: ${response.data.error || '未知错误'}`)
    }
  } catch (error) {
    console.error('Error:', error)
    ElMessage.error(`导入失败: ${error.message || '未知错误'}`)
  } finally {
    rasterImportLoading.value = false
  }
}

// 重置栅格导入表单
const resetRasterImportForm = () => {
  tifFileList.value = []
  mtlFileList.value = []
  tifFileName.value = ''
  mtlFileName.value = ''
  rasterDescription.value = ''
}

// 重新加载数据
const retryFetchData = () => {
  loadingError.value = null
  fetchUserData()
}

// 测试连接
const testConnection = async () => {
  try {
    console.log('测试后端连接...')
    const response = await axios.get(apiConfig.raster.list, { 
      timeout: 3000,
      headers: {
        'Accept': 'application/json'
      }
    })
    console.log('测试连接成功:', response)
    ElMessage.success('后端连接测试成功')
    return true
  } catch (error) {
    console.error('测试连接失败:', error)
    ElMessage.error(`后端连接测试失败: ${error.message}`)
    return false
  }
}

// 编辑数据相关
const editDialogVisible = ref(false)
const editForm = ref({})
const editLoading = ref(false)

// 编辑数据
const handleEdit = (data) => {
  editForm.value = {
    id: data.id,
    name: data.name,
    description: data.description
  }
  editDialogVisible.value = true
}

// 提交编辑
const submitEdit = async () => {
  editLoading.value = true
  try {
    // 发送请求更新数据
    const response = await axios.put(apiConfig.raster.update(editForm.value.id), editForm.value)
    
    if (response.data && response.data.success) {
      ElMessage.success('数据更新成功')
      editDialogVisible.value = false
      fetchUserData()
    } else {
      ElMessage.error(`更新失败: ${response.data.error || '未知错误'}`)
    }
  } catch (error) {
    console.error('更新数据失败:', error)
    ElMessage.error(`更新失败: ${error.message || '未知错误'}`)
  } finally {
    editLoading.value = false
  }
}

// 确认删除
const confirmDelete = () => {
  ElMessageBox.confirm('确认删除此数据吗？', '警告', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    deleteData(editForm.value)
  }).catch(() => {
    // 取消删除
  })
}

// 处理选择变化
const handleSelectionChange = (selected) => {
  console.log('选择变化:', selected)
  selectedRows.value = selected
}

// 批量删除
const batchDelete = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请至少选择一条数据')
    return
  }
  
  ElMessageBox.confirm(`确认删除选中的 ${selectedRows.value.length} 条数据吗？`, '警告', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    // 执行批量删除
    let successCount = 0
    let failCount = 0
    
    for (const row of selectedRows.value) {
      try {
        // 发送删除请求
        const response = await axios.delete(apiConfig.raster.delete(row.id))
        
        if (response.data && response.data.success) {
          successCount++
        } else {
          failCount++
        }
      } catch (error) {
        console.error(`删除数据 ${row.id} 失败:`, error)
        failCount++
      }
    }
    
    // 提示删除结果
    if (successCount > 0 && failCount === 0) {
      ElMessage.success(`成功删除 ${successCount} 条数据`)
    } else if (successCount > 0 && failCount > 0) {
      ElMessage.warning(`部分删除成功: ${successCount} 成功, ${failCount} 失败`)
    } else {
      ElMessage.error(`删除失败: ${failCount} 条数据未能删除`)
    }
    
    // 重新获取数据列表
    fetchUserData()
  }).catch(() => {
    // 取消删除
  })
}

const handleClose = () => {
  emit('close')
}
</script>

<style scoped>
.data-management-dialog-container {
  width: 350px;
  height: calc(100vh - 30px);
  background-color: #1a1a1a;
  border-radius: 8px 0 0 8px;
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.5);
  overflow: hidden;
  position: fixed;
  top: 30px;
  right: 0;
  z-index: 2000;
  display: flex;
  flex-direction: column;
  color: #fff;
  padding: 0;
  border: none !important;
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.5);
}

.dialog-content {
  padding: 0 0 0 0;
  overflow-y: auto;
  flex: 1;
  height: 100%;
  width: 100%;
  background: #1a1a1a;
}

.full-height-tabs {
  height: 100%;
  width: 100%;
  background: #232323;
}

:deep(.el-tabs__header) {
  background: #232323 !important;
  border-bottom: 1px solid #333 !important;
}
:deep(.el-tabs__nav) {
  background: #232323 !important;
}
:deep(.el-tabs__item) {
  color: #b8b8b8 !important;
  background: #232323 !important;
  border: none !important;
}
:deep(.el-tabs__item.is-active) {
  color: #409EFF !important;
  background: #232323 !important;
  border-bottom: 2px solid #409EFF !important;
}

:deep(.el-tabs__content),
:deep(.el-tab-pane),
:deep(.el-tabs__content > *),
:deep(.el-tab-pane > *),
:deep(.dialog-content > *) {
  border: none !important;
  background: #1a1a1a !important;
  box-shadow: none !important;
  padding: 0 !important;
}

.table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  margin-top: 15px;
  width: 100%;
}

.batch-actions {
  display: flex;
  gap: 10px;
}

:deep(.el-table),
:deep(.el-table__header-wrapper),
:deep(.el-table__body-wrapper),
:deep(.el-table__empty-block),
:deep(.el-table__cell),
:deep(.el-table__row),
:deep(.el-table__header) th {
  background: #232323 !important;
}

.empty-data-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  color: #fff;
}

.error-hint {
  color: #f56c6c;
  margin-top: 10px;
  margin-bottom: 20px;
}

:deep(.el-button) {
  min-width: 90px;
  font-size: 15px;
  border-radius: 6px;
  background: #232323 !important;
  color: #fff !important;
  border: 1px solid #409EFF !important;
  transition: all 0.2s;
}
:deep(.el-button--primary) {
  background: #409EFF !important;
  border-color: #409EFF !important;
  color: #fff !important;
}
:deep(.el-button--primary:hover) {
  background: #66b1ff !important;
  border-color: #66b1ff !important;
}
:deep(.el-button--danger) {
  background: #f56c6c !important;
  border-color: #f56c6c !important;
  color: #fff !important;
}

/* 栅格数据导入样式 */
.raster-import-container {
  padding: 15px;
  max-height: 400px;
  overflow-y: auto;
}

.file-section {
  margin-bottom: 15px;
}

.file-section h3 {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 5px;
  color: #333;
}

.file-upload-box {
  display: flex;
  align-items: center;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 8px;
  background-color: #f8f8f8;
  height: 42px;
}

.upload-button {
  margin-right: 8px;
  height: 28px;
  line-height: 8px;
}

.upload-tip {
  color: #606266;
  font-size: 13px;
  flex: 1;
}

.mtl-description {
  color: #909399;
  font-size: 12px;
  margin-left: 5px;
  font-weight: normal;
}

.description-section {
  margin-bottom: 10px;
}

.description-section h3 {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 5px;
  color: #333;
}

.description-textarea {
  width: 100%;
}

.submit-section {
  margin-top: 30px;
}

.submit-button {
  width: 100%;
  padding: 12px 0;
  font-size: 16px;
}

/* 编辑数据对话框样式 */
.edit-container {
  padding: 20px;
}

.operation-options {
  margin-top: 20px;
}

/* 对话框样式优化 */
:deep(.el-dialog__body) {
  padding: 10px 20px 15px;
  max-height: 400px;
}

:deep(.el-dialog__header) {
  padding: 10px;
}

:deep(.el-dialog__footer) {
  padding: 15px 20px 20px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.upload-row {
  display: flex;
  align-items: center;
  width: 100%;
}
.upload-row .upload-button {
  margin-right: 12px;
}
.upload-row .upload-tip {
  flex: 1;
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.horizontal-upload .el-upload {
  width: 100%;
}

/* 统一弹窗风格 */
:deep(.el-dialog) {
  border-radius: 12px !important;
  box-shadow: 0 4px 32px 0 rgba(0,0,0,0.12) !important;
  background: #fff !important;
}
:deep(.el-dialog__header) {
  padding: 18px 24px 10px 24px !important;
  border-bottom: 1px solid #f0f0f0;
}
:deep(.el-dialog__title) {
  font-size: 20px !important;
  font-weight: bold !important;
  color: #222 !important;
  letter-spacing: 1px;
}
:deep(.el-dialog__body) {
  padding: 20px 32px 10px 32px !important;
  background: #fff !important;
}
:deep(.el-dialog__footer) {
  padding: 16px 32px 24px 32px !important;
  border-top: 1px solid #f0f0f0;
  background: #fff !important;
}
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
}
/* 统一表单项间距和输入框样式 */
:deep(.el-form-item) {
  margin-bottom: 18px !important;
}
:deep(.el-input), :deep(.el-textarea) {
  border-radius: 6px !important;
  font-size: 15px !important;
}
:deep(.el-input__inner), :deep(.el-textarea__inner) {
  background: #fafbfc !important;
  border: 1px solid #dcdfe6 !important;
  color: #222 !important;
}
:deep(.el-button) {
  min-width: 90px;
  font-size: 15px;
  border-radius: 6px;
}
:deep(.el-button--primary) {
  background: #409eff;
  border-color: #409eff;
}
:deep(.el-button--danger) {
  background: #f56c6c;
  border-color: #f56c6c;
}

:deep(.el-table),
:deep(.el-table__header-wrapper),
:deep(.el-table__body-wrapper),
:deep(.el-table__cell),
:deep(.el-table__row),
:deep(.el-table__inner-wrapper),
:deep(.el-table__border),
:deep(.el-table__outer-wrapper) {
  border: none !important;
  box-shadow: none !important;
}
:deep(.el-table__header) th {
  border-bottom: 2px solid #333 !important;
}
:deep(.el-table__cell) {
  border-bottom: 1px solid #232323 !important;
}
:deep(.el-table__row:last-child .el-table__cell) {
  border-bottom: none !important;
}
/* 可选：列分隔线（如不需要可注释掉） */
/*
:deep(.el-table__cell:not(:last-child)) {
  border-right: 1px solid #232323 !important;
}
*/
:deep(.el-table__empty-block) {
  border-top: 1px solid #232323 !important;
}

/* 添加关闭按钮样式 */
.close-button {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  background-color: #232323;
  border-radius: 50%;
  color: #fff;
  transition: all 0.3s;
}

.close-button:hover {
  background-color: #f56c6c;
  transform: rotate(90deg);
}

.close-button .el-icon {
  font-size: 18px;
}
</style>