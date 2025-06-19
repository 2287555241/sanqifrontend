<template>
  <DraggableWindow
    :visible="modelValue"
    @update:visible="$emit('update:modelValue', $event)"
    title="GSF服务 - 栅格处理"
    :initial-position="{ x: 100, y: 100 }"
    :width="900"
    :height="600"
    @close="closeDialog"
  >
    <div class="gsf-service-container">
      <!-- 任务选择按钮 -->
      <div class="task-buttons">
        <el-button 
          :type="activeTask === 'subset' ? 'primary' : 'default'" 
          @click="activeTask = 'subset'"
        >
          栅格子集
        </el-button>
        <el-button 
          :type="activeTask === 'spectral' ? 'primary' : 'default'" 
          @click="activeTask = 'spectral'"
        >
          光谱指数
        </el-button>
        <el-button 
          :type="activeTask === 'upload' ? 'primary' : 'default'" 
          @click="activeTask = 'upload'"
        >
          本地文件上传
        </el-button>
      </div>

      <!-- 栅格子集表单 -->
      <el-form 
        v-show="activeTask === 'subset'"
        @submit.prevent="submitTask('subset')" 
        class="task-form"
      >
        <el-card>
          <template #header>
            <div class="card-header">
              <span>栅格子集处理</span>
            </div>
          </template>
          <el-form-item label="任务:">
            <el-input v-model="subsetTask" readonly></el-input>
          </el-form-item>
          <el-form-item label="输入栅格 (JSON):">
            <el-input v-model="subsetInputRaster"></el-input>
          </el-form-item>
          <el-form-item label="输入参数 (JSON):">
            <el-input 
              type="textarea" 
              v-model="subsetInputParameters" 
              :rows="9"
            ></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="submitTask('subset')">提交</el-button>
          </el-form-item>
        </el-card>
      </el-form>

      <!-- 光谱指数表单 -->
      <el-form 
        v-show="activeTask === 'spectral'"
        @submit.prevent="submitTask('spectral')" 
        class="task-form"
      >
        <el-card>
          <template #header>
            <div class="card-header">
              <span>光谱指数处理</span>
            </div>
          </template>
          <el-form-item label="任务:">
            <el-input v-model="spectralTask" readonly></el-input>
          </el-form-item>
          <el-form-item label="输入栅格 (JSON):">
            <el-input v-model="spectralInputRaster"></el-input>
          </el-form-item>
          <el-form-item label="输入参数 (JSON):">
            <el-input 
              type="textarea" 
              v-model="spectralInputParameters" 
              :rows="9"
            ></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="submitTask('spectral')">提交</el-button>
          </el-form-item>
        </el-card>
      </el-form>

      <!-- 本地文件上传表单 -->
      <div v-show="activeTask === 'upload'" class="task-form">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>本地文件处理</span>
            </div>
          </template>

          <!-- 文件上传部分 -->
          <div class="upload-section">
            <h3>文件上传</h3>
            <el-form>
              <el-form-item label="选择文件：">
                <el-upload
                  ref="uploadRef"
                  action=""
                  :auto-upload="false"
                  :multiple="true"
                  :limit="10"
                  :on-exceed="handleExceed"
                  :on-change="handleFileChange"
                >
                  <template #trigger>
                    <el-button type="primary">选择文件</el-button>
                  </template>
                  <template #tip>
                    <div class="el-upload__tip">支持多个文件上传，按住Ctrl键可选择多个文件</div>
                  </template>
                </el-upload>
              </el-form-item>
              <el-progress 
                v-if="uploadProgress > 0" 
                :percentage="uploadProgress" 
                :status="uploadProgress < 100 ? '' : 'success'"
              ></el-progress>
              <el-form-item>
                <el-button type="success" @click="uploadFiles">上传文件</el-button>
              </el-form-item>
            </el-form>
          </div>

          <!-- 文件处理部分 -->
          <div class="file-selection">
            <h3>处理已上传的文件</h3>
            <el-form>
              <el-form-item label="选择文件：">
                <el-select v-model="selectedFile" style="width: 100%;">
                  <el-option value="" label="-- 请选择一个文件 --"></el-option>
                  <el-option
                    v-for="file in uploadedFiles"
                    :key="file.url"
                    :label="file.originalName"
                    :value="file.url"
                  ></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="处理任务：">
                <el-select v-model="processTask" style="width: 100%;">
                  <el-option value="SubsetRaster" label="栅格子集"></el-option>
                  <el-option value="SpectralIndex" label="光谱指数"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="文件URL路径：">
                <el-input v-model="fileUrl" readonly></el-input>
              </el-form-item>
              <el-form-item label="输入参数 (JSON)：">
                <el-input 
                  type="textarea" 
                  v-model="jsonPreview" 
                  readonly 
                  :rows="6"
                ></el-input>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="processSelectedFile" :disabled="!selectedFile">处理选中文件</el-button>
              </el-form-item>
            </el-form>
          </div>

          <!-- 文件列表部分 -->
          <div class="file-list-section">
            <h3>已上传文件列表</h3>
            <el-table
              v-if="uploadedFiles.length > 0"
              :data="uploadedFiles"
              border
              style="width: 100%"
            >
              <el-table-column label="文件名" prop="originalName" min-width="200">
                <template #default="scope">
                  <a :href="scope.row.url" target="_blank">{{ scope.row.originalName }}</a>
                </template>
              </el-table-column>
              <el-table-column label="大小" prop="size" width="120">
                <template #default="scope">
                  {{ formatFileSize(scope.row.size) }}
                </template>
              </el-table-column>
              <el-table-column label="上传时间" prop="lastModified" width="180">
                <template #default="scope">
                  {{ new Date(scope.row.lastModified).toLocaleString() }}
                </template>
              </el-table-column>
              <el-table-column label="操作" width="100" align="center">
                <template #default="scope">
                  <el-button
                    size="small"
                    type="danger"
                    @click="deleteFile(scope.row.name)"
                  >删除</el-button>
                </template>
              </el-table-column>
            </el-table>
            <div v-else class="no-files">
              <p>暂无上传文件</p>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 进度显示 -->
      <el-progress 
        v-if="processingProgress > 0 && processingProgress < 100" 
        :percentage="processingProgress" 
        :format="progressFormat" 
        class="progress-bar"
      ></el-progress>
      <el-alert
        v-if="processingMessage"
        :title="processingMessage"
        :type="processingError ? 'error' : 'info'"
        :closable="false"
        class="progress-message"
      ></el-alert>

      <!-- 处理结果提示 -->
      <el-alert
        v-if="processingProgress === 100 && !processingError"
        title="处理完成，结果已添加到主地图"
        type="success"
        :closable="false"
        class="result-message"
      ></el-alert>
    </div>
  </DraggableWindow>
</template>

<script setup>
import { ref, onMounted, watch, defineProps, defineEmits, computed } from 'vue';
import DraggableWindow from '../components/DraggableWindow.vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import axios from 'axios';

// 组件可见性控制
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue', 'addLayer']);

const activeTask = ref('subset');

// 进度跟踪
const processingProgress = ref(0);
const processingMessage = ref('');
const processingError = ref(false);

// 表单数据
const subsetTask = ref('SubsetRaster');
const subsetInputRaster = ref('http://localhost:9191/ese/data/LC81290442018060LGN00/LC08_L1TP_129044_20180301_20180308_01_T1_MTL.txt');
const subsetInputParameters = ref(`{
  "INPUT_RASTER": {
    "FACTORY": "URLRaster",
    "URL":"%INPUT_RASTER%",
    "DATASET_INDEX": 0
  },
  "BANDS": [1,2,3]
}`);

const spectralTask = ref('SpectralIndex');
const spectralInputRaster = ref('http://localhost:9191/ese/data/qb_boulder_msi');
const spectralInputParameters = ref(`{
  "INPUT_RASTER": {
    "FACTORY": "URLRaster",
    "URL":"%INPUT_RASTER%"
  },
  "INDEX": "Normalized Difference Vegetation Index"
}`);

// 文件上传相关
const uploadRef = ref(null);
const uploadProgress = ref(0);
const uploadedFiles = ref([]);
const selectedFile = ref('');
const processTask = ref('SubsetRaster');
const fileUrl = ref('');
const jsonPreview = ref('');
const fileList = ref([]);

// 地图和GSF相关变量
let map = null;
let server = null;
let service = null;
let exportRasterTask = null;
let boundingBoxTask = null;

// 方法
const closeDialog = () => {
  emit('update:modelValue', false);
};

const progressFormat = (percentage) => {
  return `${percentage}%`;
};

const progressHandler = (task) => {
  return function(data) {
    processingProgress.value = data.progress;
    processingMessage.value = `${task} ${data.progress}% ${data.message}`;
  };
};

// 文件上传相关方法
const handleExceed = (files) => {
  ElMessage.warning(`最多同时上传10个文件，本次选择了 ${files.length} 个文件`);
};

const handleFileChange = (file) => {
  fileList.value.push(file.raw);
};

const uploadFiles = async () => {
  if (fileList.value.length === 0) {
    ElMessage.warning('请先选择要上传的文件');
    return;
  }

  uploadProgress.value = 0;
  processingError.value = false;
  processingMessage.value = '准备上传文件...';

  const formData = new FormData();
  fileList.value.forEach(file => {
    formData.append('uploadFiles', file);
  });

  try {
    // 显示上传进度
    const config = {
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        uploadProgress.value = percentCompleted;
      }
    };

    // 发送请求
    const response = await axios.post('http://localhost:9191/upload/multiple', formData, config);
    
    ElMessage.success(`成功上传 ${response.data.files.length} 个文件`);
    
    // 重置文件列表
    fileList.value = [];
    if (uploadRef.value) {
      uploadRef.value.clearFiles();
    }
    
    // 重新加载文件列表
    loadUploadedFilesList();
    
  } catch (error) {
    console.error('文件上传失败:', error);
    processingError.value = true;
    processingMessage.value = `上传失败: ${error.response?.data?.error || error.message || '未知错误'}`;
    ElMessage.error('文件上传失败');
  }
};

// 加载已上传文件列表
const loadUploadedFilesList = async () => {
  try {
    processingMessage.value = '加载文件列表...';
    const response = await axios.get('http://localhost:9191/upload/list');
    uploadedFiles.value = response.data.files || [];
    processingMessage.value = '';
  } catch (error) {
    console.error('加载文件列表失败:', error);
    processingError.value = true;
    processingMessage.value = `加载文件列表失败: ${error.response?.data?.error || error.message || '未知错误'}`;
    ElMessage.error('加载文件列表失败');
  }
};

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + " B";
  else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
  else if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + " MB";
  else return (bytes / 1073741824).toFixed(1) + " GB";
};

// 监听选中的文件变化，更新JSON配置和文件URL
watch(selectedFile, (newValue) => {
  if (!newValue) {
    fileUrl.value = '请先选择文件';
    jsonPreview.value = '请先选择文件';
    return;
  }

  // 获取当前站点的基础URL
  const baseUrl = window.location.protocol + '//' + window.location.host;

  // 拼接完整URL
  const fullUrl = newValue.startsWith('http') ? newValue : `${baseUrl}${newValue}`;
  fileUrl.value = fullUrl;

  // 更新JSON预览
  updateJsonPreview();
});

// 监听处理任务变化
watch(processTask, () => {
  updateJsonPreview();
});

// 更新JSON配置预览
const updateJsonPreview = () => {
  if (!selectedFile.value) {
    jsonPreview.value = '请先选择文件';
    return;
  }

  if (processTask.value === 'SubsetRaster') {
    jsonPreview.value = JSON.stringify({
      INPUT_RASTER: {
        FACTORY: 'URLRaster',
        URL: selectedFile.value,
        DATASET_INDEX: 0
      },
      BANDS: [1, 2, 3]
    }, null, 2);
  } else if (processTask.value === 'SpectralIndex') {
    jsonPreview.value = JSON.stringify({
      INPUT_RASTER: {
        FACTORY: 'URLRaster',
        URL: selectedFile.value
      },
      INDEX: 'Normalized Difference Vegetation Index'
    }, null, 2);
  }
};

// 处理选中的文件
const processSelectedFile = () => {
  if (!selectedFile.value) {
    ElMessage.warning('请先选择一个文件');
    return;
  }
  
  const selectedFileName = uploadedFiles.value.find(file => file.url === selectedFile.value)?.originalName || '选中文件';
  processingMessage.value = `正在处理文件: ${selectedFileName}...`;
  submitTask('upload');
};

// 删除文件
const deleteFile = async (fileName) => {
  try {
    await ElMessageBox.confirm(`确定要删除文件 ${fileName} 吗？`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });
    
    await axios.delete(`http://localhost:9191/upload/${fileName}`);
    ElMessage.success('文件删除成功');
    
    // 重新加载文件列表
    loadUploadedFilesList();
    
    // 如果删除的是当前选中的文件，清空选择
    const deletedFileUrl = uploadedFiles.value.find(file => file.name === fileName)?.url;
    if (deletedFileUrl === selectedFile.value) {
      selectedFile.value = '';
    }
    
  } catch (error) {
    if (error === 'cancel') return;
    
    console.error('文件删除失败:', error);
    processingError.value = true;
    processingMessage.value = `删除失败: ${error.response?.data?.error || error.message || '未知错误'}`;
    ElMessage.error('文件删除失败');
  }
};

// 添加处理结果到主地图
const addResultToMainMap = (imageUrl, boundingBox) => {
  // 确保URL是可访问的，并将主机名替换为localhost
  let fullUrl = imageUrl.startsWith('http') ? imageUrl : `http://localhost:9191${imageUrl}`;
  
  // 替换主机名
  fullUrl = fullUrl.replace('laptop-9sa3drlj', 'localhost');
  
  console.log('处理结果URL:', fullUrl);
  console.log('边界框:', boundingBox);
  
  // 转换边界框格式：确保坐标正确
  console.log('原始边界框:', boundingBox);
  // 确保边界框数据正确 [north, west], [south, east]
  const bounds = {
    xmin: boundingBox[0][1], // west
    ymin: boundingBox[1][0], // south
    xmax: boundingBox[1][1], // east
    ymax: boundingBox[0][0], // north
    spatialReference: { wkid: 4326 }
  };
  console.log('转换后边界框:', bounds);
  
  const layerInfo = {
    url: fullUrl,
    name: activeTask.value === 'subset' ? '栅格子集结果' : 
         activeTask.value === 'spectral' ? '光谱指数结果' : '文件处理结果',
    id: Date.now(),
    bounds: bounds,
    type: 'imagery'
  };
  
  console.log('发送图层到主地图:', layerInfo);
  emit('addLayer', layerInfo);
  ElMessage.success('已添加处理结果到主地图');
};

// 添加图像到地图 - 参考combinedMap.js实现
const addImageToMap = (imageUrl, boundingBox) => {
  console.log('addImageToMap被调用:', imageUrl, boundingBox);
  
  // 检查边界框格式是否正确
  if (!boundingBox || !Array.isArray(boundingBox) || boundingBox.length !== 2) {
    console.error('边界框格式错误:', boundingBox);
    ElMessage.error('边界框格式错误，无法添加到地图');
    return;
  }
  
  // 确保图像URL正确
  const finalUrl = imageUrl.startsWith('http') ? 
    imageUrl : 
    `http://localhost:9191${imageUrl}`;
  
  // 直接调用添加结果函数
  addResultToMainMap(finalUrl, boundingBox);
  
  // 发送事件通知主应用
  emit('addLayer', {
    url: finalUrl,
    name: activeTask.value === 'subset' ? '栅格子集结果' : 
         activeTask.value === 'spectral' ? '光谱指数结果' : '文件处理结果',
    id: Date.now(),
    bounds: {
      xmin: boundingBox[0][1], // west
      ymin: boundingBox[1][0], // south
      xmax: boundingBox[1][1], // east
      ymax: boundingBox[0][0], // north
      spatialReference: { wkid: 4326 }
    },
    type: 'imagery'
  });
};

// 生命周期钩子
onMounted(() => {
  // 当组件可见时初始化GSF
  watch(props.modelValue, (newVal) => {
    if (newVal) {
      setTimeout(() => {
        // 动态加载GSF SDK
        loadGSFSDK();
        // 加载已上传文件列表
        loadUploadedFilesList();
      }, 300);
    }
  });
});

// 动态加载GSF SDK
const loadGSFSDK = () => {
  // 如果已经加载过SDK，直接初始化
  if (window.GSF) {
    initGSF();
    return;
  }

  // 创建script标签加载SDK
  const script = document.createElement('script');
  script.src = 'http://localhost:9191/sdk/js/GSF.min.js';
  script.async = true;
  
  script.onload = () => {
    console.log('GSF SDK 加载成功');
    initGSF();
  };
  
  script.onerror = (error) => {
    console.error('GSF SDK 加载失败:', error);
    processingError.value = true;
    processingMessage.value = 'GSF SDK加载失败，请检查GSF服务是否正在运行';
  };

  document.head.appendChild(script);
};

const initGSF = () => {
  try {
    if (!window.GSF) {
      processingError.value = true;
      processingMessage.value = 'GSF SDK未加载，请确保GSF服务器已启动';
      return;
    }

    console.log('开始初始化GSF服务...');

    // 使用GSF服务器
    const protocol = 'http';
    const hostname = 'localhost';
    const port = 9191;

    // 创建服务器对象
    server = window.GSF.server({
      protocol: protocol,
      address: hostname,
      port: port
    });

    // 创建ENVI服务对象
    service = server.service('ENVI');

    // 创建任务对象
    const exportRasterTaskName = 'ExportRasterToPNG';
    exportRasterTask = service.task(exportRasterTaskName);

    const boundingBoxTaskName = 'BoundingBox';
    boundingBoxTask = service.task(boundingBoxTaskName);

    // 测试服务器连接
    testGSFConnection().then(isConnected => {
      if (isConnected) {
        console.log('GSF服务器连接成功');
        processingMessage.value = 'GSF服务已连接';
        processingError.value = false;
      } else {
        throw new Error('无法连接到GSF服务器');
      }
    }).catch(error => {
      console.error('GSF服务器连接失败:', error);
      processingError.value = true;
      processingMessage.value = `GSF服务器连接失败: ${error.message || error}`;
    });

  } catch (error) {
    console.error('GSF初始化失败:', error);
    processingError.value = true;
    processingMessage.value = `GSF初始化失败: ${error.message || error}`;
  }
};

// 修改测试连接方法
const testGSFConnection = async () => {
  try {
    // 使用service.list()来测试连接
    const tasks = await service.list();
    console.log('可用的GSF任务:', tasks);
    return true;
  } catch (error) {
    console.error('GSF服务测试失败:', error);
    return false;
  }
};

const submitTask = async (taskType) => {
  try {
    if (!server || !service) {
      console.log('GSF服务未初始化，尝试初始化...');
      // 尝试重新初始化GSF
      await loadGSFSDK();
      
      // 等待一段时间确保初始化完成
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (!server || !service) {
        processingError.value = true;
        processingMessage.value = 'GSF服务初始化失败';
        return;
      }
    }

    processingProgress.value = 0;
    processingError.value = false;
    processingMessage.value = "正在运行工作流...";

    // 准备参数
    let rasterURL, processingTaskName, inputParams, processingTask;

    if (taskType === 'subset') {
      rasterURL = subsetInputRaster.value;
      processingTaskName = subsetTask.value;
      inputParams = subsetInputParameters.value;
    } else if (taskType === 'spectral') {
      rasterURL = spectralInputRaster.value;
      processingTaskName = spectralTask.value;
      inputParams = spectralInputParameters.value;
    } else if (taskType === 'upload') {
      rasterURL = selectedFile.value;
      processingTaskName = processTask.value;
      inputParams = jsonPreview.value;
    }

    console.log('处理任务:', {
      taskType,
      processingTaskName,
      rasterURL,
      inputParams
    });

    // 替换输入参数中的占位符
    let processingTaskInput;
    try {
      if (typeof inputParams === 'string') {
        const paramStr = inputParams.replace('%INPUT_RASTER%', rasterURL);
        console.log('解析参数字符串:', paramStr);
        processingTaskInput = JSON.parse(paramStr);
      } else {
        processingTaskInput = inputParams;
      }
      console.log('处理任务最终输入参数:', processingTaskInput);
    } catch (e) {
      console.error('参数解析错误:', e);
      throw new Error('参数格式错误: ' + e.message);
    }

    processingTask = service.task(processingTaskName);

    if (!processingTask) {
      throw new Error(`无法创建任务: ${processingTaskName}`);
    }

    // 坐标系统配置
    const coordSys = {
      FACTORY: "CoordSys",
      COORD_SYS_CODE: 3857  // 使用3857以便与Leaflet兼容
    };

    console.log('提交处理任务...');
    // 运行处理任务
    const processing = processingTask.submitAndWait(
      { parameters: processingTaskInput }, 
      progressHandler(processingTaskName)
    ).then((results) => {
      console.log('处理任务完成，准备重投影...', results);
      const reprojectParams = {
        INPUT_RASTER: {
          FACTORY: 'ReprojectRaster',
          INPUT_RASTER: {
            FACTORY: 'LinearPercentStretchRaster',
            INPUT_RASTER: results.OUTPUT_RASTER,
            PERCENT: 2
          },
          COORD_SYS: coordSys
        }
      };

      return exportRasterTask.submitAndWait(
        { parameters: reprojectParams }, 
        progressHandler('ExportRasterToPNG')
      );
    }).then((results) => {
      console.log('导出PNG完成:', results);
      return results.OUTPUT_RASTER.url;
    }).catch((err) => {
      console.error('处理任务失败:', err);
      processingError.value = true;
      processingMessage.value = `${processingTaskName} 任务失败: ${err}`;
      throw err;
    });

    console.log('准备边界框任务...');
    // 准备边界框任务的输入
    const reprojectedRasterInput = {
      INPUT_RASTER: {
        FACTORY: 'ReprojectRaster',
        INPUT_RASTER: {
          FACTORY: 'URLRaster',
          URL: rasterURL,
          DATASET_INDEX: 0  // 添加DATASET_INDEX参数
        },
        COORD_SYS: coordSys
      }
    };

    console.log('获取边界框的输入参数:', reprojectedRasterInput);

    // 运行边界框任务
    const boundingBox = boundingBoxTask.submitAndWait(
      { parameters: reprojectedRasterInput }, 
      progressHandler('BoundingBox')
    ).then((results) => {
      console.log('边界框计算原始结果:', results);
      // 确保坐标数据正确
      if (!results.NORTH || !results.SOUTH || !results.EAST || !results.WEST) {
        console.warn('边界框数据不完整，使用默认边界');
        // 使用默认边界 - 云南省大致范围
        return [[30.2, 97.5], [21.1, 106.2]]; // 默认边界 [[北,西], [南,东]]
      }
      
      // 确保结果符合格式：[[北纬,西经], [南纬,东经]]
      const boundingBoxResult = [
        [results.NORTH, results.WEST], 
        [results.SOUTH, results.EAST]
      ];
      console.log('边界框格式化结果:', boundingBoxResult);
      
      // 检查数据合理性
      if (Math.abs(results.NORTH) > 90 || Math.abs(results.SOUTH) > 90 ||
          Math.abs(results.EAST) > 180 || Math.abs(results.WEST) > 180) {
        console.warn('边界框数据超出合理范围，使用默认边界');
        return [[30.2, 97.5], [21.1, 106.2]]; // 默认云南省范围
      }
      
      return boundingBoxResult;
    }).catch((err) => {
      console.error('边界框任务失败:', err);
      processingError.value = true;
      processingMessage.value = `BoundingBox 任务失败: ${err}`;
      throw err;
    });

    // 等待两个任务完成并显示结果
    console.log('等待所有任务完成...');
    const [imageUrl, bbox] = await Promise.all([processing, boundingBox]);
    console.log('所有任务完成，准备添加图层到主地图:', { imageUrl, bbox });
    
    // 确保处理完成后立即显示结果
    try {
      console.log('调用addResultToMainMap添加结果到地图');
      addResultToMainMap(imageUrl, bbox);
      
      // 额外使用emit确保结果被添加
      const layerInfo = {
        url: imageUrl,
        name: activeTask.value === 'subset' ? '栅格子集结果' : 
             activeTask.value === 'spectral' ? '光谱指数结果' : '文件处理结果',
        id: Date.now(),
        bounds: {
          xmin: bbox[0][1], // west
          ymin: bbox[1][0], // south
          xmax: bbox[1][1], // east
          ymax: bbox[0][0], // north
          spatialReference: { wkid: 4326 }
        },
        type: 'imagery'
      };
      
      console.log('发送图层事件到父组件:', layerInfo);
      emit('addLayer', layerInfo);
    } catch (error) {
      console.error('添加结果到地图失败:', error);
      ElMessage.error('添加结果到地图失败，请重试');
    }
    
    processingMessage.value = "处理完成";
    processingProgress.value = 100;
    ElMessage.success('任务处理成功');
  } catch (error) {
    console.error('任务处理失败:', error);
    processingError.value = true;
    processingMessage.value = `任务处理失败: ${error.message || error}`;
    ElMessage.error('任务处理失败');
  }
};
</script>

<style scoped>
.gsf-service-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 10px;
  overflow-y: auto;
}

.task-buttons {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}

.task-form {
  margin-bottom: 20px;
}

.progress-bar {
  margin: 10px 0;
}

.progress-message,
.result-message {
  margin-bottom: 10px;
}

.upload-section {
  margin-bottom: 20px;
  padding: 15px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  background-color: #f8f9fa;
}

.upload-section h3 {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 16px;
  font-weight: bold;
  color: #303133;
}

.file-selection {
  margin-bottom: 20px;
  padding: 15px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  background-color: #f0f5ff;
}

.file-selection h3 {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 16px;
  font-weight: bold;
  color: #303133;
}

.file-list-section {
  margin-top: 20px;
}

.file-list-section h3 {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 16px;
  font-weight: bold;
  color: #303133;
}

.no-files {
  text-align: center;
  padding: 20px;
  color: #909399;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style> 