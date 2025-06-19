<template>
  <div class="raster-data-import-container">
    <div class="import-header">
      <h2>带元数据的栅格数据导入</h2>
    </div>
    <div class="import-content">
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
          v-model="description"
          :rows="4"
          placeholder="请输入栅格数据的描述信息"
          class="description-textarea"
        ></el-input>
      </div>

      <div class="submit-section">
        <el-button type="primary" @click="submitForm" :loading="loading" class="submit-button">
          导入带元数据的数据
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineEmits } from 'vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'

const emit = defineEmits(['refresh'])

// 文件上传相关
const tifFileList = ref([])
const mtlFileList = ref([])
const tifFileName = ref('')
const mtlFileName = ref('')
const description = ref('')
const loading = ref(false)

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

// 提交表单
const submitForm = async () => {
  // 表单验证
  if (tifFileList.value.length === 0) {
    ElMessage.warning('请选择TIF文件')
    return
  }
  
  loading.value = true
  
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
    formData.append('description', description.value)
    
    // 发送请求
    const response = await axios.post('http://localhost:8888/api/raster/import-with-metadata', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    
    if (response.data.success) {
      ElMessage.success('栅格数据导入成功')
      resetForm()
      emit('refresh') // 通知父组件刷新数据列表
    } else {
      ElMessage.error(`导入失败: ${response.data.error || '未知错误'}`)
    }
  } catch (error) {
    console.error('Error:', error)
    ElMessage.error(`导入失败: ${error.message || '未知错误'}`)
  } finally {
    loading.value = false
  }
}

// 重置表单
const resetForm = () => {
  tifFileList.value = []
  mtlFileList.value = []
  tifFileName.value = ''
  mtlFileName.value = ''
  description.value = ''
}
</script>

<style scoped>
.raster-data-import-container {
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.import-header {
  background-color: #409EFF;
  color: white;
  padding: 15px 20px;
}

.import-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
}

.import-content {
  padding: 20px;
}

.file-section {
  margin-bottom: 20px;
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
  padding: 10px;
  background-color: #f8f8f8;
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
  margin-bottom: 20px;
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
</style>