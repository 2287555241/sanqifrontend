<template>
  <div v-if="visible" class="data-management-dialog-container">
    <div class="dialog-header">
      <div class="dialog-title">数据管理</div>
      <el-button icon="Close" circle @click="$emit('close')" class="close-btn" />
    </div>
    
    <div class="dialog-content">
      <el-tabs v-model="activeTab" type="border-card" class="full-height-tabs">
        <el-tab-pane label="系统数据" name="system">
          <el-table
            :data="[]"
            style="width: 100%"
            border
            stripe
            max-height="600px"
          >
            <el-table-column type="selection" width="55" />
            <el-table-column prop="id" label="ID" width="70" />
            <el-table-column prop="name" label="名称" min-width="150" />
            <el-table-column prop="type" label="类型" width="100" />
            <el-table-column prop="size" label="大小" width="100" />
            <el-table-column prop="createTime" label="创建时间" width="180" />
            <el-table-column label="操作" fixed="right" width="200">
              <template #default>
                <el-button type="primary" size="small">查看</el-button>
                <el-button type="success" size="small">导入</el-button>
                <el-button type="danger" size="small">删除</el-button>
              </template>
            </el-table-column>
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
            border
            stripe
            max-height="600px"
            v-loading="userLoading"
          >
            <el-table-column type="selection" width="55" />
            <el-table-column prop="id" label="ID" width="70" />
            <el-table-column prop="name" label="名称" min-width="150" />
            <el-table-column prop="description" label="描述" min-width="150">
              <template #default="scope">
                {{ scope.row.description || '-' }}
              </template>
            </el-table-column>
            <el-table-column prop="rasterType" label="类型" width="80">
              <template #default="scope">
                {{ scope.row.rasterType || '栅格' }}
              </template>
            </el-table-column>
            <el-table-column prop="bands" label="波段数" width="80">
              <template #default="scope">
                {{ scope.row.bands || '-' }}
              </template>
            </el-table-column>
            <el-table-column prop="resolution" label="分辨率" width="80">
              <template #default="scope">
                {{ scope.row.resolution || '-' }}
              </template>
            </el-table-column>
            <el-table-column prop="cloudCover" label="云量 (%)" width="100">
              <template #default="scope">
                {{ scope.row.cloudCover !== null ? scope.row.cloudCover : '-' }}
              </template>
            </el-table-column>
            <el-table-column prop="acquisitionDate" label="采集日期" width="100">
              <template #default="scope">
                {{ scope.row.acquisitionDate || '-' }}
              </template>
            </el-table-column>
            <el-table-column prop="sunElevation" label="太阳高度角" width="100">
              <template #default="scope">
                {{ scope.row.sunElevation !== null ? scope.row.sunElevation : '-' }}
              </template>
            </el-table-column>
            <el-table-column label="操作" fixed="right" width="200">
              <template #default="scope">
                <el-button type="primary" size="small" @click="viewData(scope.row)">查看</el-button>
                <el-button type="success" size="small" @click="importData(scope.row)">导入</el-button>
                <el-button type="danger" size="small" @click="deleteData(scope.row)">删除</el-button>
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
      width="800px"
      destroy-on-close
      @closed="resetRasterImportForm"
    >
      <div class="raster-import-container">
        <div class="file-section">
          <h3>选择TIF文件:</h3>
          <div class="file-upload-box">
            <el-upload
              class="tif-upload"
              action="http://localhost:8888/api/raster/upload"
              :auto-upload="false"
              :limit="1"
              :on-change="handleTifChange"
              :file-list="tifFileList"
            >
              <el-button class="upload-button">选择文件</el-button>
              <template #tip>
                <div class="upload-tip">{{ tifFileName || '未选择文件' }}</div>
              </template>
            </el-upload>
          </div>
        </div>

        <div class="file-section">
          <h3>选择MTL文件:</h3>
          <div class="file-upload-box">
            <el-upload
              class="mtl-upload"
              action="http://localhost:8888/api/raster/upload-mtl"
              :auto-upload="false"
              :limit="1"
              :on-change="handleMtlChange"
              :file-list="mtlFileList"
            >
              <el-button class="upload-button">选择文件</el-button>
              <template #tip>
                <div class="upload-tip">{{ mtlFileName || '未选择文件' }}</div>
              </template>
            </el-upload>
          </div>
          <div class="mtl-description">包含云量等元数据信息的文件</div>
        </div>

        <div class="description-section">
          <h3>数据描述:</h3>
          <el-input
            type="textarea"
            v-model="rasterDescription"
            :rows="6"
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
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'
import { DocumentDelete } from '@element-plus/icons-vue'
import apiConfig from '@/config/api'

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

// 组件挂载时加载数据
onMounted(async () => {
  const isConnected = await testConnection()
  if (isConnected) {
    fetchUserData()
  }
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
</script>

<style scoped>
.data-management-dialog-container {
  width: 1000px;
  height: 800px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 2000;
  display: flex;
  flex-direction: column;
}

/* 移除遮罩层 */

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background-color: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
}

.dialog-title {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
}

.close-btn {
  padding: 6px;
}

.dialog-content {
  padding: 0;
  overflow-y: hidden;
  flex: 1;
  height: 700px;
}

.full-height-tabs {
  height: 100%;
}

:deep(.el-tabs__content) {
  height: calc(100% - 40px);
  overflow: hidden;
}

:deep(.el-tab-pane) {
  height: 100%;
}

.table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  margin-top: 15px;
}

.batch-actions {
  display: flex;
  gap: 10px;
}

/* 确保表格固定高度，避免ResizeObserver问题 */
:deep(.el-table__body-wrapper) {
  overflow-y: hidden;
  max-height: 600px;
}

/* 栅格数据导入样式 */
.raster-import-container {
  padding: 30px;
  max-height: 600px;
  overflow-y: hidden;
}

.file-section {
  margin-bottom: 30px;
}

.file-section h3 {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 10px;
  color: #333;
}

.file-upload-box {
  display: flex;
  align-items: center;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 20px;
  background-color: #f8f8f8;
  height: 80px;
}

.upload-button {
  margin-right: 10px;
}

.upload-tip {
  color: #606266;
  font-size: 14px;
  flex: 1;
}

.mtl-description {
  color: #909399;
  font-size: 12px;
  margin-top: 5px;
}

.description-section {
  margin-bottom: 30px;
}

.description-section h3 {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 10px;
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

.empty-data-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

.error-hint {
  color: #f56c6c;
  margin-top: 10px;
  margin-bottom: 20px;
}
</style>