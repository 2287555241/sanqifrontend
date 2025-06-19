<template>
  <el-dialog
    v-model="dialogVisible"
    title="数据导出"
    width="600px"
    :close-on-click-modal="false"
    :before-close="handleClose"
    class="export-dialog"
  >
    <div class="export-container">
      <el-form ref="formRef" :model="form" label-position="top" class="export-form">
        <el-form-item label="导出格式" prop="format">
          <el-select v-model="form.format" placeholder="请选择导出格式" class="full-width">
            <template v-if="dataType === 'vector'">
              <el-option label="Shapefile (SHP)" value="shp" />
              <el-option label="GeoJSON" value="geojson" />
              <el-option label="KML" value="kml" />
              <el-option label="GeoPackage" value="gpkg" />
            </template>
            <template v-else>
              <el-option label="GeoTIFF" value="tif" />
              <el-option label="JPEG" value="jpg" />
              <el-option label="PNG" value="png" />
              <el-option label="NetCDF" value="nc" />
            </template>
          </el-select>
        </el-form-item>

        <template v-if="dataType === 'vector'">
          <el-form-item label="坐标系统" prop="srs">
            <el-select v-model="form.srs" placeholder="请选择坐标系统" class="full-width">
              <el-option label="WGS84 (EPSG:4326)" value="EPSG:4326" />
              <el-option label="Web Mercator (EPSG:3857)" value="EPSG:3857" />
              <el-option label="北京1954 (EPSG:4214)" value="EPSG:4214" />
              <el-option label="CGCS2000 (EPSG:4490)" value="EPSG:4490" />
            </el-select>
          </el-form-item>
        </template>

        <template v-else>
          <el-form-item label="输出分辨率" prop="resolution">
            <el-select v-model="form.resolution" placeholder="请选择输出分辨率" class="full-width">
              <el-option label="原始分辨率" value="original" />
              <el-option label="高分辨率" value="high" />
              <el-option label="中等分辨率" value="medium" />
              <el-option label="低分辨率" value="low" />
            </el-select>
          </el-form-item>
        </template>

        <el-form-item label="打包方式" prop="packageType">
          <el-radio-group v-model="form.packageType">
            <el-radio label="single">单文件</el-radio>
            <el-radio label="zip">ZIP压缩包</el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- 选中的数据信息 -->
        <el-form-item label="已选择数据">
          <div class="selected-info">
            <el-tag type="info">{{ selectedIds.length }} 个数据项</el-tag>
          </div>
        </el-form-item>
      </el-form>

      <div v-if="exporting" class="export-progress">
        <el-progress :percentage="exportProgress" :status="exportProgress === 100 ? 'success' : ''" />
        <div class="progress-text">{{ progressText }}</div>
      </div>
    </div>
    
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose" class="cancel-button" :disabled="exporting">取消</el-button>
        <el-button type="primary" @click="handleExport" :loading="exporting" class="confirm-button">
          <el-icon v-if="!exporting"><Download /></el-icon>
          <span>{{ exporting ? '导出中...' : '导出' }}</span>
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch, defineEmits, defineProps } from 'vue';
import { ElMessage } from 'element-plus';
import { Download } from '@element-plus/icons-vue';
import { useExportService } from '../services/exportService';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  selectedIds: {
    type: Array,
    default: () => []
  },
  dataType: {
    type: String,
    default: 'vector',
    validator: (value) => ['vector', 'raster'].includes(value)
  }
});

const emit = defineEmits(['update:modelValue', 'success']);
const exportService = useExportService();

// 对话框控制
const dialogVisible = ref(false);

// 表单数据
const formRef = ref(null);
const form = ref({
  format: props.dataType === 'vector' ? 'shp' : 'tif',
  resolution: 'original',
  srs: 'EPSG:4326',
  packageType: 'zip'
});

// 导出状态
const exporting = ref(false);
const exportProgress = ref(0);
const progressText = ref('');

// 处理导出
const handleExport = async () => {
  if (!formRef.value) return;
  
  try {
    if (props.selectedIds.length === 0) {
      ElMessage.warning('请先选择要导出的数据');
      return;
    }
    
    exporting.value = true;
    progressText.value = '准备导出...';
    
    // 模拟导出进度
    const progressInterval = setInterval(() => {
      if (exportProgress.value < 90) {
        exportProgress.value += 10;
        updateProgressText(exportProgress.value);
      }
    }, 300);
    
    try {
      // 构造导出参数
      const exportParams = {
        ids: props.selectedIds,
        format: form.value.format,
        packageType: form.value.packageType
      };
      
      // 根据数据类型添加特定参数
      if (props.dataType === 'vector') {
        exportParams.srs = form.value.srs;
      } else {
        exportParams.resolution = form.value.resolution;
      }
      
      // 根据HTML示例构建URL
      let url;
      if (props.dataType === 'vector') {
        url = `http://localhost:8888/api/vector-data/export/selected?ids=${props.selectedIds.join(',')}`;
      } else {
        url = `http://localhost:8888/api/raster/export?ids=${props.selectedIds.join(',')}`;
        
        // 添加分辨率参数
        if (exportParams.resolution) {
          url += `&resolution=${exportParams.resolution}`;
        }
      }
      
      clearInterval(progressInterval);
      exportProgress.value = 95;
      progressText.value = '正在下载...';
      
      // 执行下载
      try {
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`导出失败: ${response.status} ${response.statusText}`);
        }
        
        const blob = await response.blob();
        
        if (blob.size === 0) {
          throw new Error('导出文件为空');
        }
        
        const downloadUrl = URL.createObjectURL(blob);
        const fileName = props.dataType === 'vector' ? 'vector_data.zip' : 'raster_data.zip';
        
        // 创建下载链接
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(downloadUrl);
        
        exportProgress.value = 100;
        progressText.value = '导出完成';
        
        // 关闭对话框并触发成功事件
        setTimeout(() => {
          dialogVisible.value = false;
          emit('update:modelValue', false);
          emit('success');
        }, 1000);
      } catch (downloadError) {
        console.error('下载失败:', downloadError);
        throw new Error(`下载失败: ${downloadError.message}`);
      }
    } catch (error) {
      clearInterval(progressInterval);
      console.error('导出失败:', error);
      ElMessage.error(`导出失败: ${error.message || '未知错误'}`);
      progressText.value = '导出失败';
    } finally {
      exporting.value = false;
    }
  } catch (error) {
    console.error('表单验证失败:', error);
  }
};

// 更新进度文本
const updateProgressText = (progress) => {
  if (progress < 30) {
    progressText.value = '正在准备数据...';
  } else if (progress < 60) {
    progressText.value = '正在处理数据...';
  } else if (progress < 90) {
    progressText.value = '正在生成文件...';
  } else {
    progressText.value = '导出完成';
  }
};

// 关闭对话框
const handleClose = () => {
  if (exporting.value) {
    ElMessage.warning('正在导出中，请稍后再关闭');
    return;
  }
  
  dialogVisible.value = false;
  emit('update:modelValue', false);
};

// 监听modelValue的变化
watch(
  () => props.modelValue,
  (newVal) => {
    dialogVisible.value = newVal;
    if (newVal) {
      // 重置状态
      exportProgress.value = 0;
      progressText.value = '';
      // 根据数据类型设置默认格式
      form.value.format = props.dataType === 'vector' ? 'shp' : 'tif';
    }
  }
);
</script>

<style scoped>
.export-dialog :deep(.el-dialog__header) {
  padding: 20px 30px;
  margin-right: 0;
  border-bottom: 1px solid #f0f0f0;
}

.export-dialog :deep(.el-dialog__title) {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
}

.export-dialog :deep(.el-dialog__body) {
  padding: 24px 30px;
}

.export-dialog :deep(.el-dialog__footer) {
  padding: 20px 30px;
  border-top: 1px solid #f0f0f0;
}

.export-container {
  font-size: 14px;
}

.export-form {
  margin-bottom: 20px;
}

.full-width {
  width: 100%;
}

.selected-info {
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
  display: flex;
  align-items: center;
}

.export-progress {
  margin-top: 20px;
}

.progress-text {
  margin-top: 8px;
  color: #606266;
  text-align: center;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
}

.cancel-button {
  margin-right: 10px;
}

.confirm-button {
  display: flex;
  align-items: center;
}

.confirm-button .el-icon {
  margin-right: 5px;
}
</style> 