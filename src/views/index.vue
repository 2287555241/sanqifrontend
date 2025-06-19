<template>
  <div class="common-layout indexVue-container">
    <navMain ref="navMainRef" class="map-bg" />
    <indexHeader @showProjectManagement="handleShowProjectManagement" />
    <div class="content-container">
      <el-container style="background: transparent; box-shadow: none;">
        <navMenu 
          @openDataManagement="handleOpenDataManagement" 
          @addLayer="handleAddLayer"
          @openRasterVectorManagement="handleOpenRasterVectorManagement"
        />
      </el-container>
    </div>
    <div 
      v-if="dataManagementDialogVisible || projectManagementDialogVisible || rasterVectorManagementVisible"
      class="mask"
      @click="closeAllDialogs"
    ></div>

    <!-- 数据管理对话框 -->
    <div 
      v-if="dataManagementDialogVisible"
      class="data-management-dialog"
      :style="{
        position: 'fixed',
        top: dialogPosition.y + 'px',
        left: dialogPosition.x + 'px',
        cursor: isDragDisabled ? 'default' : 'move'
      }"
      @mousedown="handleMouseDown"
      @mousemove="handleMouseMove"
      @mouseup="handleMouseUp"
      @mouseleave="handleMouseUp"
    >
      <DataManagement 
        @close="closeDataManagement" 
        @disableDrag="setDragDisabled(true)"
        @enableDrag="setDragDisabled(false)"
      />
    </div>

    <!-- 栅格矢量数据管理对话框 -->
    <div 
      v-if="rasterVectorManagementVisible"
      class="raster-vector-management-dialog"
      :style="{
        position: 'fixed',
        top: rasterVectorPosition.y + 'px',
        left: rasterVectorPosition.x + 'px',
        cursor: isRasterVectorDragDisabled ? 'default' : 'move'
      }"
      @mousedown="handleRasterVectorMouseDown"
      @mousemove="handleRasterVectorMouseMove"
      @mouseup="handleRasterVectorMouseUp"
      @mouseleave="handleRasterVectorMouseUp"
    >
      <el-card class="raster-vector-card">
        <template #header>
          <div class="card-header">
            <span>栅格矢量数据管理</span>
            <el-button type="danger" circle @click="closeRasterVectorManagement">
              <el-icon><Close /></el-icon>
            </el-button>
          </div>
        </template>
        <el-tabs v-model="rasterVectorActiveTab">
          <el-tab-pane label="矢量数据" name="vector">
            <VectorDataManager 
              @disableDrag="setRasterVectorDragDisabled(true)" 
              @enableDrag="setRasterVectorDragDisabled(false)"
            />
          </el-tab-pane>
          <el-tab-pane label="栅格数据" name="raster">
            <RasterDataManager 
              @disableDrag="setRasterVectorDragDisabled(true)" 
              @enableDrag="setRasterVectorDragDisabled(false)"
            />
          </el-tab-pane>
        </el-tabs>
      </el-card>
    </div>

    <div 
      v-if="projectManagementDialogVisible"
      class="dialog-overlay"
    >
      <ProjectManagement 
        @close="closeProjectManagement"
      />
    </div>
  </div>
</template>

<script setup>
import navMenu from './navMenu.vue';
import indexHeader from './indexHeader.vue';
import navMain from './navMain.vue';
import { ref, onMounted, watch, onBeforeUnmount } from 'vue';
import { useRoute } from 'vue-router';
import DataManagement from './DataManagement.vue';
import ProjectManagement from '../components/ProjectManagement.vue';
import VectorDataManager from './VectorDataManager.vue';
import RasterDataManager from './RasterDataManager.vue';
import { emitter, activeView, Events } from '../utils/eventBus';
import { Close } from '@element-plus/icons-vue';

const route = useRoute();

// 数据管理对话框状态
const dataManagementDialogVisible = ref(false);
const projectManagementDialogVisible = ref(false);
const isDragging = ref(false);
const isDragDisabled = ref(false);
const isProjectDragDisabled = ref(false);
const dialogPosition = ref({ 
  x: 250,
  y: 10
});
const projectDialogPosition = ref({
  x: 300,
  y: 50
});
const dragOffset = ref({ x: 0, y: 0 });
const projectDragOffset = ref({ x: 0, y: 0 });

// 栅格矢量数据管理对话框状态
const rasterVectorManagementVisible = ref(false);
const rasterVectorActiveTab = ref('vector');
const isRasterVectorDragging = ref(false);
const isRasterVectorDragDisabled = ref(false);
const rasterVectorPosition = ref({
  x: 300,
  y: 100
});
const rasterVectorDragOffset = ref({ x: 0, y: 0 });

// 用于访问navMain组件的引用
const navMainRef = ref(null);

const handleOpenDataManagement = () => {
  dataManagementDialogVisible.value = true;
  isDragDisabled.value = false;
  dialogPosition.value = {
    x: 250,
    y: 10
  };
};

const handleOpenRasterVectorManagement = () => {
  rasterVectorManagementVisible.value = true;
  isRasterVectorDragDisabled.value = false;
  rasterVectorPosition.value = {
    x: 300,
    y: 100
  };
};

const handleShowProjectManagement = () => {
  projectManagementDialogVisible.value = true;
  isProjectDragDisabled.value = false;
  projectDialogPosition.value = {
    x: 300,
    y: 50
  };
};

const closeDataManagement = () => {
  dataManagementDialogVisible.value = false;
  isDragDisabled.value = false;
};

const closeRasterVectorManagement = () => {
  rasterVectorManagementVisible.value = false;
  isRasterVectorDragDisabled.value = false;
};

const closeProjectManagement = () => {
  projectManagementDialogVisible.value = false;
  isProjectDragDisabled.value = false;
};

const closeAllDialogs = () => {
  closeDataManagement();
  closeProjectManagement();
  closeRasterVectorManagement();
};

const setDragDisabled = (disabled) => {
  isDragDisabled.value = disabled;
};

const setRasterVectorDragDisabled = (disabled) => {
  isRasterVectorDragDisabled.value = disabled;
};

const setProjectDragDisabled = (disabled) => {
  isProjectDragDisabled.value = disabled;
};

// 处理事件监听
onMounted(() => {
  // 设置活动视图为home，确保显示欢迎页面和新建项目按钮
  activeView.value = 'home';
  
  emitter.on('show-project-management', handleShowProjectManagement);
});

onBeforeUnmount(() => {
  emitter.off('show-project-management', handleShowProjectManagement);
});

// 数据管理对话框拖动
const handleMouseDown = (e) => {
  if (e.target.closest('.el-table') || e.target.closest('.el-button')) {
    return;
  }
  
  if (isDragDisabled.value) {
    return;
  }

  isDragging.value = true;
  dragOffset.value = {
    x: e.clientX - dialogPosition.value.x,
    y: e.clientY - dialogPosition.value.y
  };

  document.addEventListener('mousemove', handleGlobalMouseMove);
  document.addEventListener('mouseup', handleGlobalMouseUp);
};

const handleMouseMove = (e) => {
  if (!isDragging.value || isDragDisabled.value) return;
  
  dialogPosition.value = {
    x: e.clientX - dragOffset.value.x,
    y: e.clientY - dragOffset.value.y
  };
};

const handleMouseUp = () => {
  if (isDragging.value) {
    isDragging.value = false;
    document.removeEventListener('mousemove', handleGlobalMouseMove);
    document.removeEventListener('mouseup', handleGlobalMouseUp);
  }
};

const handleGlobalMouseMove = (e) => {
  if (!isDragging.value || isDragDisabled.value) return;
  
  dialogPosition.value = {
    x: e.clientX - dragOffset.value.x,
    y: e.clientY - dragOffset.value.y
  };
};

const handleGlobalMouseUp = () => {
  if (isDragging.value) {
    isDragging.value = false;
    document.removeEventListener('mousemove', handleGlobalMouseMove);
    document.removeEventListener('mouseup', handleGlobalMouseUp);
  }
};

// 栅格矢量数据管理对话框拖动
const handleRasterVectorMouseDown = (e) => {
  if (e.target.closest('.el-table') || e.target.closest('.el-button')) {
    return;
  }
  
  if (isRasterVectorDragDisabled.value) {
    return;
  }

  isRasterVectorDragging.value = true;
  rasterVectorDragOffset.value = {
    x: e.clientX - rasterVectorPosition.value.x,
    y: e.clientY - rasterVectorPosition.value.y
  };

  document.addEventListener('mousemove', handleRasterVectorGlobalMouseMove);
  document.addEventListener('mouseup', handleRasterVectorGlobalMouseUp);
};

const handleRasterVectorMouseMove = (e) => {
  if (!isRasterVectorDragging.value || isRasterVectorDragDisabled.value) return;
  
  rasterVectorPosition.value = {
    x: e.clientX - rasterVectorDragOffset.value.x,
    y: e.clientY - rasterVectorDragOffset.value.y
  };
};

const handleRasterVectorMouseUp = () => {
  if (isRasterVectorDragging.value) {
    isRasterVectorDragging.value = false;
    document.removeEventListener('mousemove', handleRasterVectorGlobalMouseMove);
    document.removeEventListener('mouseup', handleRasterVectorGlobalMouseUp);
  }
};

const handleRasterVectorGlobalMouseMove = (e) => {
  if (!isRasterVectorDragging.value || isRasterVectorDragDisabled.value) return;
  
  rasterVectorPosition.value = {
    x: e.clientX - rasterVectorDragOffset.value.x,
    y: e.clientY - rasterVectorDragOffset.value.y
  };
};

const handleRasterVectorGlobalMouseUp = () => {
  if (isRasterVectorDragging.value) {
    isRasterVectorDragging.value = false;
    document.removeEventListener('mousemove', handleRasterVectorGlobalMouseMove);
    document.removeEventListener('mouseup', handleRasterVectorGlobalMouseUp);
  }
};

// 处理添加图层
const handleAddLayer = (layerInfo) => {
  if (navMainRef.value) {
    navMainRef.value.addProcessedLayer(layerInfo);
  }
};
</script>

<style scoped>
.indexVue-container {
  width: 100%;
  height: 100vh;
  position: relative;
  overflow: hidden;
}

.map-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.content-container {
  position: relative;
  z-index: 2;
}

.dialog-overlay {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 3001;
}

.data-management-dialog {
  z-index: 3001;
  background: transparent;
}

.mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 3000;
}

.raster-vector-management-dialog {
  z-index: 2000;
  width: 1000px;
  max-width: 95vw;
}

.raster-vector-card {
  width: 100%;
  height: 700px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.raster-vector-card :deep(.el-card__body) {
  flex: 1;
  overflow: auto;
  padding: 10px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>