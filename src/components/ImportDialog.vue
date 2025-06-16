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
      <!-- 文件选择 -->
      <div class="file-select section">
        <span class="label">选择文件</span>
        <div class="file-input">
          <el-input 
            v-model="selectedFileName" 
            placeholder="未选择文件" 
            readonly
            class="custom-input"
          >
            <template #append>
              <el-upload
                class="upload-hidden"
                action="/api/raster/import"
                :show-file-list="false"
                :on-success="handleSuccess"
                :on-error="handleError"
                :before-upload="beforeUpload"
                accept=".zip,.geojson,.tiff,.tif"
                :auto-upload="false"
                :file-list="fileList"
                ref="uploadRef"
                :on-change="handleFileChange"
                :data="uploadData"
                name="files"
              >
                <el-button type="primary" class="upload-button">
                  <el-icon class="upload-icon"><Upload /></el-icon>
                  选择文件
                </el-button>
                <template #tip>
                  <div class="el-upload__tip">
                    支持上传 zip（矢量包）、geojson（矢量）、tiff/tif（栅格）格式的文件
                  </div>
                </template>
              </el-upload>
            </template>
          </el-input>
        </div>
        <div class="file-tip">
          <el-icon><InfoFilled /></el-icon>
          支持上传 zip（矢量包）、geojson（矢量）、tiff/tif（栅格）格式的文件
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
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose" class="cancel-button">取消</el-button>
        <el-button type="primary" @click="handleConfirm" :loading="uploading" class="confirm-button">
          <el-icon v-if="!uploading"><Upload /></el-icon>
          <span>{{ uploading ? '上传中...' : '上传' }}</span>
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, defineEmits, watch } from 'vue'
import { 
  Upload, 
  Grid, 
  Location, 
  InfoFilled, 
  FolderOpened, 
  FolderAdd,
  Plus
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'

const emit = defineEmits(['update:modelValue', 'success'])
const dialogVisible = ref(false)
const uploading = ref(false)
const selectedFileName = ref('')
const description = ref('')
const fileList = ref([])
const uploadRef = ref(null)
const uploadData = ref({
  description: '',
  directory: 'default'
})
const uploadInfo = ref({
  show: false,
  type: '',
  message: '',
  description: ''
})

// 文件上传前的验证
const beforeUpload = (file) => {
  // 允许的扩展名
  const allowedExts = ['.zip', '.geojson', '.tiff', '.tif']
  const name = file.name.toLowerCase()
  const ext = allowedExts.find(e => name.endsWith(e))
  if (!ext) {
    ElMessage.error('只能上传 zip、geojson、tiff、tif 文件!')
    return false
  }
  // 类型初步判断
  let fileType = '未知类型'
  if (ext === '.zip' || ext === '.geojson') fileType = '矢量文件'
  if (ext === '.tiff' || ext === '.tif') fileType = '栅格文件'
  uploadInfo.value = {
    show: true,
    type: 'info',
    message: '正在上传... (' + fileType + ')',
    description: `文件名：${file.name}`
  }
  // 更新上传数据
  uploadData.value.description = description.value
  uploading.value = true
  return true
}

// 文件选择变化时
const handleFileChange = (file, fileListArr) => {
  fileList.value = fileListArr.slice(-1) // 只保留最后一个文件
  selectedFileName.value = file.name
}

// 上传成功的回调
const handleSuccess = (response) => {
  uploading.value = false
  if (response.success) {
    ElMessage.success(response.message || '上传成功')
    emit('success', response.data)
  } else {
    ElMessage.error(response.error || '上传失败')
  }
  fileList.value = []
  selectedFileName.value = ''
  description.value = ''
}

// 上传失败的回调
const handleError = (error) => {
  uploading.value = false
  selectedFileName.value = ''
  fileList.value = []
  ElMessage.error(error.response?.data?.error || '上传失败，请重试')
}

// 关闭弹窗
const handleClose = () => {
  dialogVisible.value = false
  emit('update:modelValue', false)
  // 重置状态
  selectedFileName.value = ''
  description.value = ''
  uploading.value = false
  fileList.value = []
}

// 确认导入
const handleConfirm = () => {
  if (!fileList.value.length) {
    ElMessage.warning('请先选择文件')
    return
  }
  if (!description.value.trim()) {
    ElMessage.warning('请输入数据描述')
    return
  }
  uploading.value = true
  // 手动触发上传
  uploadRef.value.submit()
}

// 监听父组件传入的显示状态
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

// 监听modelValue的变化
watch(
  () => props.modelValue,
  (newVal) => {
    dialogVisible.value = newVal
  }
)

// 监听描述变化
watch(description, (newVal) => {
  uploadData.value.description = newVal
})
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
</style> 