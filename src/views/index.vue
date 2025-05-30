<template>
  <div class="common-layout indexVue-container">
    <navMain class="map-bg" />
    <indexHeader />
    <div class="content-container">
      <el-container style="background: transparent; box-shadow: none;">
        <el-aside width="200px" style="background: transparent; box-shadow: none; margin-top: 60px;">
          <navMenu 
            @openDataManagement="handleOpenDataManagement" 
            :dataManagementVisible="dataManagementDialogVisible"
          />
        </el-aside>
        <el-container>
          <el-main style="background: transparent; padding: 0; margin-top: 60px;"></el-main>
        </el-container>
      </el-container>
    </div>
    <div 
      v-if="dataManagementDialogVisible"
      :style="{
        position: 'fixed',
        top: dialogPosition.y + 'px',
        left: dialogPosition.x + 'px',
        zIndex: '2000',
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
      v-if="dataManagementDialogVisible"
      class="mask"
      @click="closeDataManagement"
    ></div>
  </div>
</template>

<script setup>
import navMenu from './navMenu.vue';
import indexHeader from './indexHeader.vue';
import navMain from './navMain.vue';
import { ref } from 'vue';
import DataManagement from './DataManagement.vue';

const dataManagementDialogVisible = ref(false);
const isDragging = ref(false);
const isDragDisabled = ref(false);
const dialogPosition = ref({ 
  x: window.innerWidth / 2 - 350, 
  y: window.innerHeight / 2 - 450
});
const dragOffset = ref({ x: 0, y: 0 });

const handleOpenDataManagement = () => {
  dataManagementDialogVisible.value = true;
  isDragDisabled.value = false; // 确保打开时可以拖动
};

const closeDataManagement = () => {
  dataManagementDialogVisible.value = false;
  isDragDisabled.value = false; // 重置拖动状态
};

const setDragDisabled = (disabled) => {
  isDragDisabled.value = disabled;
};

const handleMouseDown = (e) => {
  // 如果点击的是表格或按钮，不启动拖动
  if (e.target.closest('.el-table') || e.target.closest('.el-button')) {
    return;
  }
  
  // 如果拖动被禁用，不启动拖动
  if (isDragDisabled.value) {
    return;
  }

  isDragging.value = true;
  dragOffset.value = {
    x: e.clientX - dialogPosition.value.x,
    y: e.clientY - dialogPosition.value.y
  };

  // 添加全局鼠标事件监听
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
    // 移除全局鼠标事件监听
    document.removeEventListener('mousemove', handleGlobalMouseMove);
    document.removeEventListener('mouseup', handleGlobalMouseUp);
  }
};

// 全局鼠标移动处理
const handleGlobalMouseMove = (e) => {
  if (!isDragging.value || isDragDisabled.value) return;
  
  dialogPosition.value = {
    x: e.clientX - dragOffset.value.x,
    y: e.clientY - dragOffset.value.y
  };
};

// 全局鼠标松开处理
const handleGlobalMouseUp = () => {
  handleMouseUp();
};
</script>

<style scoped>
.indexVue-container {
  width: 100vw;
  height: 100vh;
  position: relative;
  overflow: hidden;
}
.map-bg {
  position: absolute;
  left: 0; top: 0; right: 0; bottom: 0;
  width: 100vw;
  height: 100vh;
  z-index: 0;
}
.content-container {
  position: absolute;
  left: 0; top: 0;
  z-index: 1;
  background: transparent;
  pointer-events: none;
  width: auto;
  height: auto;
}
.content-container * {
  pointer-events: auto;
}
.custom-dialog :deep(.el-dialog__header) {
  text-align: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.custom-dialog :deep(.el-dialog__title) {
  font-weight: bold;
  color: #409EFF;
}

.custom-dialog :deep(.el-dialog__body) {
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 0 0 8px 8px;
}

.custom-dialog :deep(.el-dialog__footer) {
  padding: 10px 20px;
  border-top: 1px solid #eee;
  text-align: right;
}

.custom-dialog :deep(.el-dialog__close) {
  color: #909399;
  font-size: 18px;
  transition: color 0.3s;
}

.custom-dialog :deep(.el-dialog__close:hover) {
  color: #409EFF;
}

.custom-dialog :deep(.el-dialog__body::-webkit-scrollbar) {
  width: 6px;
}

.custom-dialog :deep(.el-dialog__body::-webkit-scrollbar-thumb) {
  background-color: #c0c4cc;
  border-radius: 3px;
}

.custom-dialog :deep(.el-dialog__body::-webkit-scrollbar-track) {
  background-color: #f5f7fa;
}

.dialog-content {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
  background-color: #fff;
}

.dialog-content:hover {
  box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.2);
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #ebeef5;
}

.dialog-header h3 {
  margin: 0;
  font-size: 18px;
  color: #303133;
}

.close-button {
  font-size: 18px;
  color: #909399;
  transition: color 0.3s;
}

.close-button:hover {
  color: #409EFF;
}

.dialog-body {
  padding: 20px;
  max-height: calc(75vh - 60px);
  overflow-y: auto;
}

.dialog-body::-webkit-scrollbar {
  width: 6px;
}

.dialog-body::-webkit-scrollbar-thumb {
  background-color: #c0c4cc;
  border-radius: 3px;
}

.dialog-body::-webkit-scrollbar-track {
  background-color: #f5f7fa;
}

.mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1999;
  pointer-events: none;
}

.mask:hover {
  pointer-events: auto;
}
</style>