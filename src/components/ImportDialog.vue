<template>
  <el-dialog
    v-model="dialogVisible"
    title="数据导入"
    width="500px"
    :close-on-click-modal="false"
    :before-close="handleClose"
  >
    <div class="import-container">
      <el-upload
        class="upload-demo"
        drag
        action="/api/upload"
        :on-success="handleSuccess"
        :on-error="handleError"
        :before-upload="beforeUpload"
        accept=".zip,.geojson,.tiff,.tif"
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">
          将文件拖到此处，或 <em>点击上传</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">
            支持上传 zip（矢量包）、geojson（矢量）、tiff/tif（栅格）格式的文件
          </div>
        </template>
      </el-upload>
      
      <div class="upload-info" v-if="uploadInfo.show">
        <el-alert
          :title="uploadInfo.message"
          :type="uploadInfo.type"
          :description="uploadInfo.description"
          show-icon
        />
      </div>
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleConfirm" :loading="uploading">
          确认导入
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, defineEmits, watch } from 'vue'
import { UploadFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const emit = defineEmits(['update:modelValue', 'success'])
const dialogVisible = ref(false)
const uploading = ref(false)
const uploadInfo = ref({
  show: false,
  type: 'info',
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
  const isLt200M = file.size / 1024 / 1024 < 200
  if (!isLt200M) {
    ElMessage.error('文件大小不能超过 200MB!')
    return false
  }
  uploadInfo.value = {
    show: true,
    type: 'info',
    message: '正在上传... (' + fileType + ')',
    description: `文件名：${file.name}`
  }
  uploading.value = true
  return true
}

// 上传成功的回调
const handleSuccess = (response) => {
  uploading.value = false
  uploadInfo.value = {
    show: true,
    type: 'success',
    message: '上传成功',
    description: '文件已成功上传，请点击确认导入按钮完成导入'
  }
  ElMessage.success('上传成功')
}

// 上传失败的回调
const handleError = (error) => {
  uploading.value = false
  uploadInfo.value = {
    show: true,
    type: 'error',
    message: '上传失败',
    description: '请检查文件格式或网络连接后重试'
  }
  ElMessage.error('上传失败')
}

// 关闭弹窗
const handleClose = () => {
  dialogVisible.value = false
  emit('update:modelValue', false)
  // 重置状态
  uploadInfo.value.show = false
  uploading.value = false
}

// 确认导入
const handleConfirm = () => {
  if (!uploadInfo.value.show || uploadInfo.value.type !== 'success') {
    ElMessage.warning('请先上传文件')
    return
  }
  
  // TODO: 这里可以添加实际的导入逻辑
  emit('success')
  handleClose()
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
</script>

<style scoped>
.import-container {
  padding: 20px 0;
}

.upload-demo {
  width: 100%;
}

.upload-info {
  margin-top: 20px;
}

:deep(.el-upload-dragger) {
  width: 100%;
  height: 200px;
}

:deep(.el-upload__text) {
  margin-top: 10px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style> 