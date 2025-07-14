<template>
  <div class="common-layout indexVue-container">
    <navMenu @openDataManagement="handleOpenDataManagement" @openRasterDataSearch="handleOpenRasterDataSearch" @openDataAnalysisPanel="handleOpenDataAnalysisPanel" />
    <navMain class="map-bg" />
    <indexHeader @showProjectManagement="handleShowProjectManagement" />
    <div class="content-container">
      <el-container style="background: transparent; box-shadow: none;">
        <!-- 移除左侧菜单栏 -->
      </el-container>
      <MapView :showRasterDataSearch="rasterDataSearchVisible" :dataAnalysisPanelVisible="dataAnalysisPanelVisible" @closeRasterDataSearch="closeRasterDataSearch" @closeDataAnalysisPanel="closeDataAnalysisPanel" />
    </div>
    <div 
      v-if="dataManagementDialogVisible || projectManagementDialogVisible"
      class="mask"
      @click="closeAllDialogs"
    ></div>
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
import { emitter, activeView, Events } from '../utils/eventBus';
import MapView from './MapView.vue';

const route = useRoute();

const dataManagementDialogVisible = ref(false);
const projectManagementDialogVisible = ref(false);
const dataAnalysisPanelVisible = ref(false);
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
const rasterDataSearchVisible = ref(false);

const handleOpenDataManagement = () => {
  console.log('handleOpenDataManagement 被调用');
  dataManagementDialogVisible.value = true;
  isDragDisabled.value = false;
  dialogPosition.value = {
    x: 250,
    y: 10
  };
  console.log('dataManagementDialogVisible:', dataManagementDialogVisible.value);
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

const closeProjectManagement = () => {
  projectManagementDialogVisible.value = false;
  isProjectDragDisabled.value = false;
};

const closeAllDialogs = () => {
  closeDataManagement();
  closeProjectManagement();
};

const setDragDisabled = (disabled) => {
  isDragDisabled.value = disabled;
};

const setProjectDragDisabled = (disabled) => {
  isProjectDragDisabled.value = disabled;
};

const handleOpenDataAnalysisPanel = () => {
  dataAnalysisPanelVisible.value = true;
  rasterDataSearchVisible.value = false;
};

const closeDataAnalysisPanel = () => {
  dataAnalysisPanelVisible.value = false;
};

const handleOpenRasterDataSearch = () => {
  console.log('handleOpenRasterDataSearch');
  rasterDataSearchVisible.value = true;
  dataAnalysisPanelVisible.value = false;
};

const closeRasterDataSearch = () => {
  rasterDataSearchVisible.value = false;
};

// 处理事件监听
onMounted(() => {
  // 设置活动视图为home，确保显示欢迎页面和新建项目按钮
  activeView.value = 'home';
  
  emitter.on('show-project-management', handleShowProjectManagement);
  emitter.on('openDataManagement', handleOpenDataManagement);
});

onBeforeUnmount(() => {
  emitter.off('show-project-management', handleShowProjectManagement);
  emitter.off('openDataManagement', handleOpenDataManagement);
});

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
</style>