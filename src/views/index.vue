<template>
  <div class="common-layout indexVue-container">
    <navMain class="map-bg" />
    <indexHeader @showProjectManagement="handleShowProjectManagement" />
    <div class="content-container">
      <el-container style="background: transparent; box-shadow: none;">
        <el-aside width="200px" style="background: transparent; box-shadow: none; margin-top: 30px;">
          <navMenu 
            @openDataManagement="handleOpenDataManagement" 
            :dataManagementVisible="dataManagementDialogVisible"
          />
        </el-aside>
        <el-container>
          <el-main style="background: transparent; padding: 0; margin-top: 30px;"></el-main>
        </el-container>
      </el-container>
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
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import DataManagement from './DataManagement.vue';
import ProjectManagement from '../components/ProjectManagement.vue';

const route = useRoute();

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

const handleOpenDataManagement = () => {
  dataManagementDialogVisible.value = true;
  isDragDisabled.value = false;
  dialogPosition.value = {
    x: 250,
    y: 10
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

const handleProjectMouseDown = (e) => {
  if (e.target.closest('.el-table') || e.target.closest('.el-button')) {
    return;
  }
  
  if (isProjectDragDisabled.value) {
    return;
  }

  isDragging.value = true;
  projectDragOffset.value = {
    x: e.clientX - projectDialogPosition.value.x,
    y: e.clientY - projectDialogPosition.value.y
  };

  document.addEventListener('mousemove', handleProjectGlobalMouseMove);
  document.addEventListener('mouseup', handleProjectGlobalMouseUp);
};

const handleMouseMove = (e) => {
  if (!isDragging.value || isDragDisabled.value) return;
  
  dialogPosition.value = {
    x: e.clientX - dragOffset.value.x,
    y: e.clientY - dragOffset.value.y
  };
};

const handleProjectMouseMove = (e) => {
  if (!isDragging.value || isProjectDragDisabled.value) return;
  
  projectDialogPosition.value = {
    x: e.clientX - projectDragOffset.value.x,
    y: e.clientY - projectDragOffset.value.y
  };
};

const handleMouseUp = () => {
  if (isDragging.value) {
    isDragging.value = false;
    document.removeEventListener('mousemove', handleGlobalMouseMove);
    document.removeEventListener('mouseup', handleGlobalMouseUp);
  }
};

const handleProjectMouseUp = () => {
  if (isDragging.value) {
    isDragging.value = false;
    document.removeEventListener('mousemove', handleProjectGlobalMouseMove);
    document.removeEventListener('mouseup', handleProjectGlobalMouseUp);
  }
};

const handleGlobalMouseMove = (e) => {
  if (!isDragging.value || isDragDisabled.value) return;
  
  dialogPosition.value = {
    x: e.clientX - dragOffset.value.x,
    y: e.clientY - dragOffset.value.y
  };
};

const handleProjectGlobalMouseMove = (e) => {
  if (!isDragging.value || isProjectDragDisabled.value) return;
  
  projectDialogPosition.value = {
    x: e.clientX - projectDragOffset.value.x,
    y: e.clientY - projectDragOffset.value.y
  };
};

const handleGlobalMouseUp = () => {
  if (isDragging.value) {
    isDragging.value = false;
    document.removeEventListener('mousemove', handleGlobalMouseMove);
    document.removeEventListener('mouseup', handleGlobalMouseUp);
  }
};

const handleProjectGlobalMouseUp = () => {
  if (isDragging.value) {
    isDragging.value = false;
    document.removeEventListener('mousemove', handleProjectGlobalMouseMove);
    document.removeEventListener('mouseup', handleProjectGlobalMouseUp);
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
</style>