<template>
  <el-dialog
    v-model="dialogVisible"
    title="数据导入"
    width="600px"
    :close-on-click-modal="false"
    :before-close="handleClose"
    class="import-dialog"
  >
    <div class="import-container">
      <!-- 栅格数据文件选择 -->
      <div class="file-select section">
        <span class="label">选择栅格数据文件</span>
        <div class="file-input">
          <el-upload
            class="upload-hidden"
            :show-file-list="false"
            :auto-upload="false"
            :file-list="fileList"
            :on-change="handleFileChange"
            accept=".zip,.geojson,.tiff,.tif"
          >
            <el-button type="primary" class="upload-button">
              <el-icon class="upload-icon"><Upload /></el-icon>
              选择文件
            </el-button>
          </el-upload>
          <el-input
            v-model="selectedFileName"
            placeholder="未选择文件"
            readonly
            class="custom-input"
            style="margin-left: 10px; width: 250px;"
          />
        </div>
        <div class="file-tip">
          <el-icon><InfoFilled /></el-icon>
          支持上传 zip（矢量包）、geojson（矢量）、tiff/tif（栅格）格式的文件
        </div>
      </div>

      <!-- MTL 文件选择 -->
      <div class="file-select section">
        <span class="label">选择元数据文件 (MTL)</span>
        <div class="file-input">
          <el-upload
            class="upload-hidden"
            :show-file-list="false"
            :auto-upload="false"
            :file-list="mtlFileList"
            :on-change="handleMtlFileChange"
            accept=".txt"
          >
            <el-button type="primary" class="upload-button">
              <el-icon class="upload-icon"><Upload /></el-icon>
              选择文件
            </el-button>
          </el-upload>
          <el-input
            v-model="selectedMtlFileName"
            placeholder="未选择文件"
            readonly
            class="custom-input"
            style="margin-left: 10px; width: 250px;"
          />
        </div>
        <div class="file-tip">
          <el-icon><InfoFilled /></el-icon>
          支持上传 MTL 格式的文件(txt)
        </div>
      </div>

      <!-- 描述输入 -->
      <div class="description-input section">
        <span class="label">描述</span>
        <el-input
          v-model="description"
          type="textarea"
          :rows="3"
          placeholder="请输入数据描述"
          class="custom-textarea"
          resize="none"
        />
      </div>

      <!-- 导入说明 -->
      <div class="import-info section">
        <div class="info-tip">
          <el-icon><InfoFilled /></el-icon>
          <span>导入说明：此操作将同时完成以下功能：</span>
        </div>
        <div class="info-list">
          <div class="info-item">• 将栅格数据文件保存到服务器</div>
          <div class="info-item">• 将MTL文件内容保存到raster_data表</div>
          <div class="info-item">• 解析MTL文件并保存元数据信息</div>
          <div class="info-item">• 生成缩略图用于预览</div>
        </div>
      </div>

      <!-- 同步导入按钮 -->
      <div style="margin-top: 20px; text-align: right;">
        <el-button type="primary" @click="handleSyncImport" :disabled="!selectedFile || !selectedMtlFile">
          <el-icon><Upload /></el-icon>
          导入栅格数据及元数据
        </el-button>
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, defineEmits, watch } from 'vue'
import { Upload, InfoFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'
import apiConfig from '../config/api'

const emit = defineEmits(['update:modelValue', 'success'])
const dialogVisible = ref(false)
const selectedFile = ref(null)
const selectedMtlFile = ref(null)
const selectedFileName = ref('')
const selectedMtlFileName = ref('')
const description = ref('')
const fileList = ref([])
const mtlFileList = ref([])

const handleFileChange = (file, fileListArr) => {
  fileList.value = fileListArr.slice(-1)
  selectedFile.value = file.raw
  selectedFileName.value = file.name
}
const handleMtlFileChange = (file, fileListArr) => {
  mtlFileList.value = fileListArr.slice(-1)
  selectedMtlFile.value = file.raw
  selectedMtlFileName.value = file.name
}

const handleSyncImport = async () => {
  if (!selectedFile.value) {
    ElMessage.warning('请先选择栅格数据文件')
    return
  }
  if (!selectedMtlFile.value) {
    ElMessage.warning('请先选择MTL元数据文件')
    return
  }
  
  try {
    // 显示加载状态
    ElMessage.info('正在导入数据，请稍候...')
    
    // 调用新接口：将栅格数据和MTL内容导入到raster_data表
    const formData = new FormData()
    formData.append('rasterFile', selectedFile.value)
    formData.append('mtlFile', selectedMtlFile.value)
    formData.append('description', description.value)
    
    const res = await axios.post(apiConfig.raster.importRasterWithMtlContent, formData)
    
    if (!res.data || !res.data.success) {
      throw new Error(res.data?.error || '栅格数据和MTL内容导入失败')
    }
    
    // 检查是否需要额外的元数据导入（如果后端接口没有自动处理）
    try {
      // 等待一下让后端处理完成
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // 检查是否有元数据
      const checkRes = await axios.get(apiConfig.raster.getMetadata(res.data.id))
      if (!checkRes.data.success) {
        // 如果没有元数据，尝试导入
        const metadataFormData = new FormData()
        metadataFormData.append('rasterId', res.data.id)
        metadataFormData.append('mtl', selectedMtlFile.value)
        
        await axios.post(apiConfig.raster.importMetadata, metadataFormData)
        console.log('额外元数据导入成功')
      }
    } catch (metadataError) {
      console.warn('元数据检查/导入失败，但不影响主流程:', metadataError)
    }
    
    ElMessage.success('数据导入成功！栅格数据、MTL内容和元数据已保存到数据库')
    emit('success', res.data)
    handleClose()
    
  } catch (err) {
    console.error('导入失败:', err)
    ElMessage.error(err.response?.data?.error || err.message || '同步导入失败')
  }
}

const handleClose = () => {
  dialogVisible.value = false
  emit('update:modelValue', false)
  selectedFile.value = null
  selectedMtlFile.value = null
  selectedFileName.value = ''
  selectedMtlFileName.value = ''
  description.value = ''
  fileList.value = []
  mtlFileList.value = []
}

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})
watch(
  () => props.modelValue,
  (newVal) => {
    dialogVisible.value = newVal
  }
)
</script>

<style scoped>
.import-dialog :deep(.el-dialog__header) {
  padding: 20px 30px;
  margin-right: 0;
  border-bottom: 1px solid #f0f0f0;
}

.import-dialog :deep(.el-dialog__title) {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
}

.import-dialog :deep(.el-dialog__body) {
  padding: 24px 30px;
}

.import-dialog :deep(.el-dialog__footer) {
  padding: 20px 30px;
  border-top: 1px solid #f0f0f0;
}

.import-container {
  font-size: 14px;
}

.section {
  margin-bottom: 24px;
}

.section:last-child {
  margin-bottom: 0;
}

.label {
  display: inline-block;
  margin-bottom: 10px;
  color: #2c3e50;
  font-weight: 500;
  font-size: 15px;
}

.file-input {
  display: flex;
  align-items: center;
}

.file-tip,
.dir-tip {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
}

.file-tip .el-icon,
.dir-tip .el-icon {
  font-size: 14px;
  color: #909399;
}

.full-width {
  width: 100%;
}

.upload-hidden {
  display: inline-block;
}

.upload-hidden :deep(.el-upload) {
  display: block;
}

.upload-button,
.create-button {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 16px;
  font-weight: 500;
}

.upload-icon {
  font-size: 16px;
}

.custom-input :deep(.el-input__wrapper) {
  box-shadow: 0 0 0 1px #dcdfe6 inset;
  transition: all 0.3s ease;
}

.custom-input :deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #c0c4cc inset;
}

.custom-input :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #409eff inset;
}

.custom-textarea :deep(.el-textarea__inner) {
  box-shadow: 0 0 0 1px #dcdfe6 inset;
  transition: all 0.3s ease;
  padding: 12px;
  font-size: 14px;
  line-height: 1.6;
}

.custom-textarea :deep(.el-textarea__inner:hover) {
  box-shadow: 0 0 0 1px #c0c4cc inset;
}

.custom-textarea :deep(.el-textarea__inner:focus) {
  box-shadow: 0 0 0 1px #409eff inset;
}

.custom-select :deep(.el-input__wrapper) {
  box-shadow: 0 0 0 1px #dcdfe6 inset;
}

.select-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.select-option .el-icon {
  font-size: 16px;
  color: #606266;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.cancel-button,
.confirm-button {
  padding: 9px 20px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.confirm-button {
  display: flex;
  align-items: center;
  gap: 6px;
}

.confirm-button .el-icon {
  font-size: 16px;
}

:deep(.el-radio) {
  height: auto;
  margin-right: 0;
}

:deep(.el-radio__input) {
  margin-right: 8px;
}

:deep(.el-select-dropdown__item) {
  padding: 8px 16px;
}

:deep(.el-button) {
  border-radius: 4px;
}

:deep(.el-dialog) {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 导入说明样式 */
.import-info {
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  padding: 16px;
}

.info-tip {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  color: #495057;
  font-weight: 500;
  font-size: 14px;
}

.info-tip .el-icon {
  color: #409eff;
  font-size: 16px;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.info-item {
  color: #6c757d;
  font-size: 13px;
  line-height: 1.4;
  padding-left: 8px;
}
</style> 