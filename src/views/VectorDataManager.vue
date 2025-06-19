<template>
  <div class="vector-manager-container">
    <!-- 数据表格 -->
    <el-card class="data-table-card">
      <template #header>
        <div class="card-header">
          <div class="header-title">
            <span>矢量数据列表</span>
          </div>
          <div class="header-actions">
            <el-input
              v-model="searchQuery"
              placeholder="搜索数据名称"
              style="width: 200px; margin-right: 10px;"
              clearable
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <el-button type="primary" size="small" @click="handleImport" :icon="Upload">导入</el-button>
            <el-button type="success" size="small" @click="handleExport" :icon="Download" :disabled="!hasSelectedData">导出</el-button>
            <el-button type="info" size="small" @click="refreshData" :icon="Refresh">刷新</el-button>
            <el-button type="danger" size="small" @click="handleBatchDelete" :icon="Delete" :disabled="!hasSelectedData">批量删除</el-button>
          </div>
        </div>
      </template>
      
      <el-table
        ref="vectorTableRef"
        v-loading="loading"
        :data="filteredVectorData"
        style="width: 100%"
        @selection-change="handleSelectionChange"
        @row-click="handleRowClick"
        height="500"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="名称" min-width="150" />
        <el-table-column prop="type" label="类型" width="100" />
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="scope">
            {{ formatDate(scope.row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column prop="size" label="大小" width="100">
          <template #default="scope">
            {{ formatSize(scope.row.size) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button size="small" @click.stop="handleView(scope.row)">查看</el-button>
            <el-button size="small" type="danger" @click.stop="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="totalVectorData"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
    
    <!-- 导入对话框 -->
    <ImportDialog
      v-model="importDialogVisible"
      dataType="vector"
      @success="handleImportSuccess"
    />
    
    <!-- 导出对话框 -->
    <ExportDialog
      v-model="exportDialogVisible"
      :selected-ids="selectedDataIds"
      dataType="vector"
      @success="handleExportSuccess"
    />
  </div>
</template>

<script setup>
import { ref, computed, defineEmits, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Upload, Download, Refresh, Delete, Search } from '@element-plus/icons-vue';
import ImportDialog from '../components/ImportDialog.vue';
import ExportDialog from '../components/ExportDialog.vue';
import { useDataStore } from '../stores/dataStore';

const emit = defineEmits(['disableDrag', 'enableDrag']);
const dataStore = useDataStore();

// 表格相关
const vectorTableRef = ref(null);
const loading = ref(false);
const searchQuery = ref('');
const selectedDataIds = ref([]);
const currentPage = ref(1);
const pageSize = ref(20);
const totalVectorData = ref(0);

// 对话框控制
const importDialogVisible = ref(false);
const exportDialogVisible = ref(false);

// 计算属性
const hasSelectedData = computed(() => selectedDataIds.value.length > 0);

// 过滤后的数据
const filteredVectorData = computed(() => {
  // 确保dataStore.vectorData存在
  if (!dataStore.vectorData) {
    return [];
  }
  
  const query = searchQuery.value.toLowerCase();
  if (!query) {
    // 使用vectorData而不是localDataList
    return dataStore.vectorData;
  }
  
  // 使用vectorData而不是localDataList
  return dataStore.vectorData.filter(item => 
    item.name.toLowerCase().includes(query)
  );
});

// 刷新数据
const refreshData = async () => {
  loading.value = true;
  try {
    console.log('正在刷新矢量数据...');
    
    // 调用数据存储的fetchVectorData方法获取数据
    const data = await dataStore.fetchVectorData();
    
    // 确保数据被正确赋值
    if (Array.isArray(data) && data.length > 0) {
      console.log(`获取到 ${data.length} 条矢量数据`);
      totalVectorData.value = data.length;
    } else {
      console.log('未获取到矢量数据或数据为空');
      
      // 尝试使用模拟数据（仅开发时使用）
      if (!dataStore.vectorData || dataStore.vectorData.length === 0) {
        console.log('生成测试数据...');
        // 生成一些测试数据
        for (let i = 1; i <= 5; i++) {
          dataStore.addLocalData({
            id: i,
            name: `矢量数据 ${i}`,
            type: 'vector',
            vectorType: i % 3 === 0 ? 'point' : i % 3 === 1 ? 'line' : 'polygon',
            createdAt: new Date(Date.now() - i * 86400000).toISOString(),
            size: Math.floor(Math.random() * 10000000) + 1000000
          });
        }
        
        // 尝试再次获取数据
        await dataStore.fetchVectorData();
        totalVectorData.value = dataStore.vectorData?.length || 0;
      }
    }
    
    ElMessage.success('数据刷新成功');
    
    // 重置分页到第一页
    currentPage.value = 1;
  } catch (error) {
    console.error('刷新数据失败:', error);
    ElMessage.error('刷新数据失败: ' + (error.message || '未知错误'));
  } finally {
    loading.value = false;
  }
};

// 处理选择变化
const handleSelectionChange = (selection) => {
  selectedDataIds.value = selection.map(item => item.id);
};

// 处理行点击
const handleRowClick = (row) => {
  vectorTableRef.value.toggleRowSelection(row);
};

// 处理查看
const handleView = (row) => {
  ElMessage.info(`查看数据: ${row.name}`);
  // 实现查看功能...
};

// 处理删除
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要删除数据 "${row.name}" 吗？`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });
    
    loading.value = true;
    try {
      // 使用实际的API删除
      const response = await dataStore.deleteVectorData(row.id);
      
      if (response.success) {
        ElMessage.success('删除成功');
        refreshData();
      } else {
        ElMessage.error(`删除失败: ${response.error || '未知错误'}`);
      }
    } catch (apiError) {
      console.error('删除矢量数据失败:', apiError);
      ElMessage.error(`删除失败: ${apiError.message || '未知错误'}`);
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除操作取消:', error);
    }
  } finally {
    loading.value = false;
  }
};

// 处理批量删除
const handleBatchDelete = async () => {
  if (selectedDataIds.value.length === 0) {
    ElMessage.warning('请先选择要删除的数据');
    return;
  }
  
  try {
    await ElMessageBox.confirm(`确定要删除选中的 ${selectedDataIds.value.length} 条数据吗？`, '批量删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });
    
    loading.value = true;
    
    // 批量删除数据
    try {
      // 使用实际的API批量删除
      const response = await dataStore.batchDeleteVectorData(selectedDataIds.value);
      
      if (response.success) {
        ElMessage.success(`成功删除 ${response.deleted || selectedDataIds.value.length} 条数据`);
        // 清空选中项
        selectedDataIds.value = [];
        // 刷新数据
        await refreshData();
      } else {
        throw new Error(response.error || '批量删除失败');
      }
    } catch (apiError) {
      throw new Error(apiError?.message || '删除失败，请重试');
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量删除失败:', error);
      ElMessage.error(`批量删除失败: ${error.message || '未知错误'}`);
    }
  } finally {
    loading.value = false;
  }
};

// 处理导入
const handleImport = () => {
  importDialogVisible.value = true;
  emit('disableDrag');
};

// 处理导入成功
const handleImportSuccess = (data) => {
  importDialogVisible.value = false;
  emit('enableDrag');
  
  // 确保数据刷新
  refreshData();
  
  // 显示成功消息
  const successCount = data?.successful || 1;
  ElMessage.success(`成功导入 ${successCount} 条矢量数据`);
};

// 处理导出
const handleExport = () => {
  if (selectedDataIds.value.length === 0) {
    ElMessage.warning('请先选择要导出的数据');
    return;
  }
  
  exportDialogVisible.value = true;
  emit('disableDrag');
};

// 处理导出成功
const handleExportSuccess = () => {
  exportDialogVisible.value = false;
  emit('enableDrag');
  ElMessage.success('矢量数据导出成功');
};

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString();
};

// 格式化大小
const formatSize = (bytes) => {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(2)} ${units[unitIndex]}`;
};

// 分页处理
const handleSizeChange = (newSize) => {
  pageSize.value = newSize;
  currentPage.value = 1;
};

const handleCurrentChange = (newPage) => {
  currentPage.value = newPage;
};

// 组件挂载时加载数据
onMounted(() => {
  refreshData();
});

// 暴露方法给父组件
defineExpose({
  refreshData
});
</script>

<style scoped>
.vector-manager-container {
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.data-table-card {
  margin-bottom: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

:deep(.el-card__body) {
  flex: 1;
  overflow: auto;
  padding: 10px;
  display: flex;
  flex-direction: column;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.header-title {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .card-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .header-actions {
    width: 100%;
    margin-top: 10px;
  }
}
</style> 