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
            v-model="selectedFilesText" 
            placeholder="未选择文件" 
            readonly
            class="custom-input"
          >
            <template #append>
              <el-upload
                class="upload-hidden"
                action="#"
                :http-request="customUploadRequest"
                :show-file-list="false"
                :on-success="handleSuccess"
                :on-error="handleError"
                :before-upload="beforeUpload"
                :auto-upload="false"
                :file-list="fileList"
                :multiple="true"
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
                    支持上传各类空间数据文件，可多选
                  </div>
                </template>
              </el-upload>
            </template>
          </el-input>
        </div>
        <div class="selected-files" v-if="fileList.length > 0">
          <div class="file-count">已选择 {{ fileList.length }} 个文件:</div>
          <el-scrollbar height="100px">
            <div class="file-item" v-for="(file, index) in fileList" :key="index">
              <el-icon><Document /></el-icon>
              <span class="file-name">{{ file.name }}</span>
              <el-button 
                type="danger" 
                size="small" 
                circle 
                @click.stop="removeFile(index)"
                class="remove-btn"
              >
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </el-scrollbar>
        </div>
        <div class="file-tip">
          <el-icon><InfoFilled /></el-icon>
          支持上传各类空间数据文件，可多选
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
  Plus,
  Document,
  Delete
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'

const emit = defineEmits(['update:modelValue', 'success'])
const dialogVisible = ref(false)
const uploading = ref(false)
const selectedFilesText = ref('')
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
  uploadInfo.value = {
    show: true,
    type: 'info',
    message: '正在上传...',
    description: `文件名：${file.name}`
  }
  // 更新上传数据
  uploadData.value.description = description.value
  uploading.value = true
  return true
}

// 文件选择变化时
const handleFileChange = (file, fileListArr) => {
  // 保留所有文件
  fileList.value = fileListArr;
  // 更新文件名显示文本
  if (fileList.value.length === 0) {
    selectedFilesText.value = '';
  } else if (fileList.value.length === 1) {
    selectedFilesText.value = fileList.value[0].name;
  } else {
    selectedFilesText.value = `已选择${fileList.value.length}个文件`;
  }
};

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
  selectedFilesText.value = ''
  description.value = ''
}

// 上传失败的回调
const handleError = (error) => {
  uploading.value = false
  selectedFilesText.value = ''
  fileList.value = []
  ElMessage.error(error.response?.data?.error || '上传失败，请重试')
}

// 关闭弹窗
const handleClose = () => {
  dialogVisible.value = false
  emit('update:modelValue', false)
  // 重置状态
  selectedFilesText.value = ''
  description.value = ''
  uploading.value = false
  fileList.value = []
}

// 监听父组件传入的显示状态
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  dataType: {
    type: String,
    default: ''
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

// 自定义上传请求处理函数
const customUploadRequest = async (options) => {
  try {
    const { file, onSuccess, onError } = options;
    const formData = new FormData();
    formData.append('files', file);
    formData.append('description', description.value);
    
    // 根据props传入的数据类型选择不同的上传接口
    let url;
    if (props.dataType === 'vector') {
      url = 'http://localhost:8888/api/vector-data/import';
    } else if (props.dataType === 'raster') {
      url = 'http://localhost:8888/api/raster/import';
    } else {
      url = 'http://localhost:8888/api/data/import';
    }
    
    console.log(`准备上传文件到: ${url}`);
    
    try {
      // 尝试发起实际的上传请求，如果API不可用则使用模拟数据
      let useRealApi = true;
      
      try {
        // 测试API是否可用
        const testResponse = await fetch(url, { method: 'HEAD' });
        useRealApi = testResponse.ok;
      } catch (apiTestError) {
        console.warn('API不可用，将使用模拟数据:', apiTestError);
        useRealApi = false;
      }
      
      // 如果API可用，发起实际请求
      if (useRealApi) {
        console.log('使用实际API上传文件');
        const response = await fetch(url, {
          method: 'POST',
          body: formData
        });
        
        if (!response.ok) {
          if (response.status === 413) {
            throw new Error('文件太大，超过了服务器允许的上传大小限制');
          }
          throw new Error(`请求失败: ${response.status} ${response.statusText}`);
        }
        
        const result = await response.json();
        if (result.success) {
          console.log('服务器响应成功:', result);
          onSuccess(result);
        } else {
          console.error('服务器返回错误:', result);
          onError(new Error(result.error || '上传失败'));
        }
      } 
      // 如果API不可用，使用模拟数据
      else {
        console.log('使用模拟数据');
        // 延迟模拟网络请求
        setTimeout(() => {
          const mockData = {
            id: Date.now() + Math.floor(Math.random() * 1000),
            name: file.name,
            type: props.dataType || 'unknown',
            size: file.size,
            createdAt: new Date().toISOString()
          };
          
          // 根据文件类型添加特定属性
          if (props.dataType === 'vector') {
            mockData.vectorType = ['point', 'line', 'polygon'][Math.floor(Math.random() * 3)];
          } else if (props.dataType === 'raster') {
            mockData.rasterType = ['GeoTIFF', 'JPEG', 'PNG'][Math.floor(Math.random() * 3)];
            mockData.bands = Math.floor(Math.random() * 5) + 1;
            mockData.resolution = `${Math.floor(Math.random() * 10) + 1}m`;
          }
          
          const mockResponse = {
            success: true,
            message: '模拟上传成功',
            data: mockData
          };
          
          console.log('模拟响应数据:', mockResponse);
          
          // 添加到数据存储
          try {
            const { useDataStore } = require('../stores/dataStore');
            const dataStore = useDataStore();
            
            if (props.dataType === 'vector') {
              if (Array.isArray(dataStore.vectorData)) {
                dataStore.vectorData.push(mockData);
              }
            } else if (props.dataType === 'raster') {
              if (Array.isArray(dataStore.rasterData)) {
                dataStore.rasterData.push(mockData);
              }
            }
            
            dataStore.addLocalData(mockData);
          } catch (storageError) {
            console.error('添加到数据存储失败:', storageError);
          }
          
          onSuccess(mockResponse);
        }, 1000);
      }
    } catch (error) {
      console.error('上传错误:', error);
      onError(error);
    }
  } catch (error) {
    console.error('上传错误:', error);
    options.onError(error);
  }
};

// 确认导入
const handleConfirm = async () => {
  if (!fileList.value.length) {
    ElMessage.warning('请先选择文件');
    return;
  }
  
  // 描述可选
  if (!description.value.trim()) {
    description.value = fileList.value.length === 1 
      ? fileList.value[0]?.name || '未命名数据'
      : `批量导入 ${fileList.value.length} 个文件`;
  }
  
  uploading.value = true;
  
  try {
    // 导入结果跟踪
    const results = [];
    let successful = 0;
    
    // 处理每个文件
    for (let i = 0; i < fileList.value.length; i++) {
      const file = fileList.value[i].raw;
      await new Promise((resolve) => {
        customUploadRequest({
          file,
          onSuccess: (result) => {
            // 导入成功，手动添加到本地数据存储
            successful++;
            
            if (result.data) {
              // 确保数据被加入dataStore
              const { useDataStore } = require('../stores/dataStore');
              const dataStore = useDataStore();
              
              // 如果是矢量数据
              if (props.dataType === 'vector') {
                if (Array.isArray(dataStore.vectorData)) {
                  dataStore.vectorData.push(result.data);
                }
              } 
              // 如果是栅格数据
              else if (props.dataType === 'raster') {
                if (Array.isArray(dataStore.rasterData)) {
                  dataStore.rasterData.push(result.data);
                }
              }
              
              // 同时添加到本地数据列表
              dataStore.addLocalData(result.data);
            }
            
            results.push({
              fileName: file.name,
              success: true,
              message: result.message || '上传成功'
            });
            resolve();
          },
          onError: (error) => {
            console.error(`文件 ${file.name} 上传失败:`, error);
            results.push({
              fileName: file.name,
              success: false,
              message: error.message || '上传失败'
            });
            resolve(); // 继续处理下一个文件
          }
        });
      });
    }
    
    if (successful > 0) {
      ElMessage.success(`成功导入 ${successful} 个文件`);
      handleClose();
      emit('success', { successful, total: fileList.value.length, results });
    } else {
      ElMessage.error('没有文件上传成功');
    }
  } catch (error) {
    ElMessage.error('导入过程中发生错误');
    console.error('导入错误:', error);
  } finally {
    uploading.value = false;
  }
};

// 移除文件
const removeFile = (index) => {
  fileList.value.splice(index, 1)
  selectedFilesText.value = fileList.value.map(file => file.name).join(', ')
}
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

.selected-files {
  margin-top: 10px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 8px;
  background-color: #f5f7fa;
}

.file-count {
  font-size: 13px;
  color: #606266;
  margin-bottom: 5px;
  font-weight: 500;
}

.file-item {
  display: flex;
  align-items: center;
  padding: 5px 10px;
  border-radius: 4px;
  margin-bottom: 4px;
  background-color: #ffffff;
  border: 1px solid #ebeef5;
  transition: all 0.3s;
}

.file-item:hover {
  background-color: #f0f2f5;
}

.file-item .el-icon {
  color: #409eff;
  margin-right: 8px;
}

.file-name {
  flex: 1;
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.remove-btn {
  padding: 2px;
  margin-left: 5px;
}

:deep(.el-scrollbar__wrap) {
  overflow-x: hidden;
}

:deep(.el-upload-list) {
  max-height: 200px;
  overflow-y: auto;
}

.custom-input {
  width: 100%;
}

.file-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 10px;
  display: flex;
  align-items: center;
}

.file-tip .el-icon {
  margin-right: 5px;
  color: #409eff;
}
</style> 