<template>
  <div class="app-container">
    <router-view/>
    <div v-if="currentProject" class="project-name-footer">
      <span class="project-name-label">项目：</span>
      {{ currentProject.name }}
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useProjectStore } from './stores/project'

const projectStore = useProjectStore()
const currentProject = computed(() => projectStore.getCurrentProject())
</script>

<style>
/* 基础样式保持不变 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  font-size: 14px;
  line-height: 1.5;
  background-color: #f5f7fa;
}

.app-container {
  position: relative;
  min-height: 100vh;
}

.project-name-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 5px 16px;
  background-color: rgba(26, 26, 26, 0.9);
  color: #e6e6e6;
  font-size: 14px;
  z-index: 1000;
  display: flex;
  align-items: center;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.project-name-label {
  margin-right: 8px;
  opacity: 0.8;
}
</style>
