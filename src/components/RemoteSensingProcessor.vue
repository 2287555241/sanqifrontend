<template>
  <DraggableDialog
    :visible="modelValue"
    @update:visible="$emit('update:modelValue', $event)"
    title="遥感处理器"
    :initial-position="{ x: 100, y: 100 }"
    :width="800"
    :height="500"
    @close="closeDialog"
  >
    <div class="processor-container">
      <div class="processor-content">
        <h3>栅格图像处理</h3>
        <p>选择处理选项:</p>
        
        <div class="processor-options">
          <el-radio-group v-model="processingType">
            <el-radio label="enhancement">图像增强</el-radio>
            <el-radio label="classification">影像分类</el-radio>
            <el-radio label="transformation">数据变换</el-radio>
          </el-radio-group>
        </div>
        
        <div class="file-upload">
          <p>选择栅格数据文件:</p>
          <input 
            type="file"
            @change="handleFileChange" 
            accept=".tif,.tiff,.img,.jp2" 
          />
        </div>
        
        <div class="divider"></div>
        
        <!-- 图像增强选项 -->
        <div v-if="processingType === 'enhancement'" class="processing-options">
          <h4>图像增强</h4>
          
          <div class="option-group">
            <label>增强方法:</label>
            <el-select v-model="enhancementMethod">
              <el-option label="线性拉伸" value="linear" />
              <el-option label="直方图均衡化" value="equalize" />
              <el-option label="高斯滤波" value="gaussian" />
            </el-select>
          </div>
          
          <div class="option-group" v-if="enhancementMethod === 'linear'">
            <label>范围:</label>
            <div class="range-inputs">
              <el-input-number v-model="linearMin" :min="0" :max="255" size="small" />
              <span>-</span>
              <el-input-number v-model="linearMax" :min="0" :max="255" size="small" />
            </div>
          </div>
          
          <div class="option-group" v-if="enhancementMethod === 'gaussian'">
            <label>sigma值:</label>
            <el-input-number v-model="gaussianSigma" :min="0.1" :max="10" :precision="1" :step="0.1" size="small" />
          </div>
        </div>
        
        <!-- 影像分类选项 -->
        <div v-if="processingType === 'classification'" class="processing-options">
          <h4>影像分类</h4>
          
          <div class="option-group">
            <label>分类方法:</label>
            <el-select v-model="classificationMethod">
              <el-option label="无监督分类" value="unsupervised" />
              <el-option label="有监督分类" value="supervised" />
            </el-select>
          </div>
          
          <div class="option-group" v-if="classificationMethod === 'unsupervised'">
            <label>类别数:</label>
            <el-input-number v-model="classCount" :min="2" :max="20" size="small" />
          </div>
          
          <div class="option-group" v-if="classificationMethod === 'supervised'">
            <label>训练样本:</label>
            <input type="file" accept=".shp,.json" />
          </div>
        </div>
        
        <!-- 数据变换选项 -->
        <div v-if="processingType === 'transformation'" class="processing-options">
          <h4>数据变换</h4>
          
          <div class="option-group">
            <label>变换类型:</label>
            <el-select v-model="transformationType">
              <el-option label="主成分分析(PCA)" value="pca" />
              <el-option label="Tasseled Cap" value="tasseled" />
              <el-option label="光谱指数" value="index" />
            </el-select>
          </div>
          
          <div class="option-group" v-if="transformationType === 'pca'">
            <label>主成分数:</label>
            <el-input-number v-model="pcaComponents" :min="1" :max="10" size="small" />
          </div>
          
          <div class="option-group" v-if="transformationType === 'index'">
            <label>指数类型:</label>
            <el-select v-model="indexType">
              <el-option label="NDVI" value="ndvi" />
              <el-option label="EVI" value="evi" />
              <el-option label="NDWI" value="ndwi" />
              <el-option label="NDBI" value="ndbi" />
            </el-select>
          </div>
        </div>
        
        <div class="actions">
          <el-button type="primary" @click="processImage" :disabled="!selectedFile">处理</el-button>
          <el-button @click="resetForm">重置</el-button>
        </div>
        
        <div class="processing-status" v-if="isProcessing">
          <el-progress :percentage="processingProgress" :indeterminate="processingProgress === 0" />
          <p>{{ processingMessage }}</p>
        </div>
        
        <div class="result-info" v-if="processingResult">
          <h4>处理结果</h4>
          <p>{{ processingResult.message }}</p>
          
          <div class="result-actions">
            <el-button type="success" size="small" @click="addToMap">添加到地图</el-button>
            <el-button type="info" size="small" @click="downloadResult">下载结果</el-button>
          </div>
        </div>
      </div>
    </div>
  </DraggableDialog>
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue';
import { ElMessage } from 'element-plus';
import DraggableDialog from './DraggableDialog.vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue', 'addLayer']);

const processingType = ref('enhancement');
const selectedFile = ref(null);
const enhancementMethod = ref('linear');
const linearMin = ref(0);
const linearMax = ref(255);
const gaussianSigma = ref(1.0);
const classificationMethod = ref('unsupervised');
const classCount = ref(5);
const transformationType = ref('pca');
const pcaComponents = ref(3);
const indexType = ref('ndvi');
const isProcessing = ref(false);
const processingProgress = ref(0);
const processingMessage = ref('');
const processingResult = ref(null);

// 处理文件选择
const handleFileChange = (event) => {
  if (event.target.files && event.target.files.length > 0) {
    selectedFile.value = event.target.files[0];
    ElMessage.info(`已选择文件: ${selectedFile.value.name}`);
  }
};

// 处理图像
const processImage = async () => {
  if (!selectedFile.value) {
    ElMessage.warning('请选择栅格数据文件');
    return;
  }
  
  isProcessing.value = true;
  processingProgress.value = 0;
  processingMessage.value = '准备处理数据...';
  processingResult.value = null;
  
  // 模拟处理进度
  const progressInterval = setInterval(() => {
    processingProgress.value += 10;
    
    if (processingProgress.value >= 100) {
      clearInterval(progressInterval);
      completeProcessing();
    } else if (processingProgress.value === 30) {
      processingMessage.value = '正在分析数据...';
    } else if (processingProgress.value === 60) {
      processingMessage.value = '应用处理算法...';
    } else if (processingProgress.value === 90) {
      processingMessage.value = '生成结果...';
    }
  }, 400);
};

// 完成处理
const completeProcessing = () => {
  isProcessing.value = false;
  processingMessage.value = '';
  
  let resultMessage = '';
  let bounds = null;
  
  switch (processingType.value) {
    case 'enhancement':
      resultMessage = `完成图像增强处理，使用${enhancementMethod.value === 'linear' ? '线性拉伸' : 
                        enhancementMethod.value === 'equalize' ? '直方图均衡化' : '高斯滤波'}方法`;
      break;
    case 'classification':
      resultMessage = `完成影像分类处理，使用${classificationMethod.value === 'unsupervised' ? 
                        '无监督分类' : '有监督分类'}方法`;
      break;
    case 'transformation':
      resultMessage = `完成数据变换处理，使用${transformationType.value === 'pca' ? '主成分分析' : 
                        transformationType.value === 'tasseled' ? 'Tasseled Cap' : 
                        '光谱指数 (' + indexType.value + ')'}方法`;
      break;
  }
  
  // 假设处理后的图像在服务器上的URL
  const resultUrl = `/data/results/processed_${Date.now()}.tif`;
  
  // 假设的边界框
  bounds = {
    xmin: 103.5,
    ymin: 30.2,
    xmax: 103.8,
    ymax: 30.5
  };
  
  processingResult.value = {
    message: resultMessage,
    url: resultUrl,
    bounds: bounds
  };
  
  ElMessage.success('处理完成');
};

// 添加到地图
const addToMap = () => {
  if (!processingResult.value) return;
  
  const layerInfo = {
    url: processingResult.value.url,
    name: `遥感处理结果_${Date.now()}`,
    id: Date.now(),
    bounds: processingResult.value.bounds,
    type: 'imagery'
  };
  
  emit('addLayer', layerInfo);
  ElMessage.success('已添加处理结果到地图');
};

// 下载结果
const downloadResult = () => {
  if (!processingResult.value) return;
  
  ElMessage.info('开始下载处理结果');
  // 实际应用中这里应该创建一个下载链接
};

// 重置表单
const resetForm = () => {
  processingType.value = 'enhancement';
  selectedFile.value = null;
  enhancementMethod.value = 'linear';
  linearMin.value = 0;
  linearMax.value = 255;
  gaussianSigma.value = 1.0;
  classificationMethod.value = 'unsupervised';
  classCount.value = 5;
  transformationType.value = 'pca';
  pcaComponents.value = 3;
  indexType.value = 'ndvi';
  processingResult.value = null;
  
  // 重置文件输入
  const fileInputs = document.querySelectorAll('input[type="file"]');
  fileInputs.forEach(input => {
    input.value = '';
  });
};

// 关闭对话框
const closeDialog = () => {
  emit('update:modelValue', false);
  resetForm();
};
</script>

<style scoped>
.processor-container {
  height: 100%;
  padding: 15px;
  overflow-y: auto;
  background-color: #1a1a1a;
  color: #e6e6e6;
}

.processor-content {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.processor-content h3 {
  color: #ffffff;
  margin-bottom: 10px;
}

.processor-content h4 {
  color: #ffffff;
  margin-bottom: 8px;
}

.processor-content p {
  color: #b8b8b8;
  margin-bottom: 8px;
}

.processor-options {
  margin-bottom: 15px;
}

.divider {
  border-top: 1px solid #333333;
  margin: 15px 0;
}

.file-upload {
  margin-bottom: 10px;
}

.file-upload input[type="file"] {
  background-color: #232323;
  color: #e6e6e6;
  border: 1px solid #444444;
  padding: 5px;
  border-radius: 4px;
}

.option-group {
  margin-bottom: 15px;
}

.option-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #b8b8b8;
}

.range-inputs {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #e6e6e6;
}

.actions {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 20px;
}

.processing-status {
  margin-top: 20px;
  padding: 10px;
  border-radius: 4px;
  background-color: #232323;
  border: 1px solid #333333;
  color: #e6e6e6;
}

.result-info {
  margin-top: 20px;
  padding: 15px;
  border-radius: 4px;
  background-color: #232323;
  border: 1px solid #333333;
  color: #e6e6e6;
}

.result-info h4 {
  color: #ffffff;
  margin-bottom: 10px;
}

.result-info p {
  color: #b8b8b8;
}

.result-actions {
  margin-top: 15px;
  display: flex;
  gap: 10px;
}

.processing-options {
  padding: 15px;
  border-radius: 4px;
  background-color: #232323;
  border: 1px solid #333333;
  color: #e6e6e6;
}

:deep(.el-radio) {
  color: #b8b8b8;
  margin-right: 20px;
}

:deep(.el-radio__input.is-checked + .el-radio__label) {
  color: #409EFF;
}

:deep(.el-select .el-input__wrapper) {
  background-color: #2c2c2c;
  box-shadow: 0 0 0 1px #444444 inset;
}

:deep(.el-select .el-input__inner) {
  color: #e6e6e6;
}

:deep(.el-input-number .el-input__wrapper) {
  background-color: #2c2c2c;
  box-shadow: 0 0 0 1px #444444 inset;
}

:deep(.el-input-number .el-input__inner) {
  color: #e6e6e6;
}

:deep(.el-button) {
  border-radius: 4px;
}

:deep(.el-progress-bar__outer) {
  background-color: #333333;
}

:deep(.el-progress-bar__inner) {
  background-color: #409EFF;
}
</style> 