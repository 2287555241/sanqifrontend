<template>
  <div class="common-layout indexVue-container">
    <navMain class="map-bg" />
    <indexHeader />
    <div class="content-container">
      <el-container style="background: transparent; box-shadow: none;">
        <el-aside width="200px" style="background: transparent; box-shadow: none; margin-top: 60px;">
          <navMenu 
            @openDataManagement="dataManagementDialogVisible = true" 
            :hasDialog="dataManagementDialogVisible"
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
        cursor: 'move'
      }"
      @mousedown="startDrag"
      @mousemove="onDrag"
      @mouseup="stopDrag"
      @mouseleave="stopDrag"
    >
      <DataManagement @close="dataManagementDialogVisible = false" />
    </div>
    <div 
      v-if="dataManagementDialogVisible"
      class="mask"
      @click="dataManagementDialogVisible = false"
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
const dialogPosition = ref({ 
  x: window.innerWidth / 2 - 350, 
  y: window.innerHeight / 2 - 450  // 从-300改为-500，使弹窗位置更靠上
});
const dragOffset = ref({ x: 0, y: 0 });

const startDrag = (e) => {
  if (e.target.closest('.el-table') || e.target.closest('.el-button')) return;
  isDragging.value = true;
  dragOffset.value = {
    x: e.clientX - dialogPosition.value.x,
    y: e.clientY - dialogPosition.value.y
  };
};

const onDrag = (e) => {
  if (!isDragging.value) return;
  dialogPosition.value = {
    x: e.clientX - dragOffset.value.x,
    y: e.clientY - dragOffset.value.y
  };
};

const stopDrag = () => {
  isDragging.value = false;
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