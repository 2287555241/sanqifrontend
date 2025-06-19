<template>
  <div class="data-management-container">
    <div class="data-management-header">
      <div class="header-left">
        <el-button v-if="$route.path === '/data-management'" 
          type="primary" 
          icon="ArrowLeft" 
          @click="$router.back()" 
          class="back-button"
        >
          返回
        </el-button>
        <h2>栅格矢量数据管理</h2>
      </div>
      <el-button v-if="$route.path !== '/data-management'" type="danger" circle @click="$emit('close')" class="close-button">
        <el-icon><Close /></el-icon>
      </el-button>
    </div>
    
    <div class="data-management-content">
      <el-tabs v-model="activeTab" @tab-click="handleTabClick">
        <el-tab-pane label="矢量数据" name="vector">
          <VectorDataManager 
            ref="vectorManagerRef" 
            @disableDrag="$emit('disableDrag')" 
            @enableDrag="$emit('enableDrag')" 
          />
        </el-tab-pane>
        <el-tab-pane label="栅格数据" name="raster">
          <RasterDataManager 
            ref="rasterManagerRef" 
            @disableDrag="$emit('disableDrag')" 
            @enableDrag="$emit('enableDrag')" 
          />
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, defineEmits } from 'vue';
import { Close, ArrowLeft } from '@element-plus/icons-vue';
import VectorDataManager from './VectorDataManager.vue';
import RasterDataManager from './RasterDataManager.vue';
import { useRoute, useRouter } from 'vue-router';

const emit = defineEmits(['close', 'disableDrag', 'enableDrag']);
const activeTab = ref('vector');
const vectorManagerRef = ref(null);
const rasterManagerRef = ref(null);
const route = useRoute();
const router = useRouter();

const handleTabClick = (tab) => {
  // 切换标签页时刷新对应的数据
  if (tab.props.name === 'vector' && vectorManagerRef.value) {
    vectorManagerRef.value.refreshData();
  } else if (tab.props.name === 'raster' && rasterManagerRef.value) {
    rasterManagerRef.value.refreshData();
  }
};

onMounted(() => {
  // 初始加载矢量数据
  if (vectorManagerRef.value) {
    vectorManagerRef.value.refreshData();
  }
});
</script>

<style scoped>
.data-management-container {
  width: 1000px;
  max-width: 100%;
  height: 700px;
  max-height: 90vh;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  padding: 20px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  margin: 0 auto;
}

/* 当通过路由显示时占满整个页面 */
:deep([data-v-app]) .data-management-container {
  width: 100%;
  height: 100vh;
  max-height: 100vh;
  margin: 0;
  border-radius: 0;
  box-shadow: none;
}

.data-management-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 15px;
  border-bottom: 1px solid #e4e7ed;
  margin-bottom: 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.back-button {
  font-size: 14px;
}

.data-management-header h2 {
  margin: 0;
  font-size: 20px;
  color: #303133;
  font-weight: 600;
}

.close-button {
  font-size: 16px;
}

.data-management-content {
  flex: 1;
  overflow: auto;
}

:deep(.el-tabs__header) {
  margin-bottom: 20px;
}

:deep(.el-tabs__content) {
  height: calc(100% - 50px);
  overflow: auto;
}
</style>

