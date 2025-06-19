<template>
  <div class="app-container">
  <router-view/>
    <div v-if="shouldShowProjectName" class="project-name-footer">
      <span class="project-name-label">项目：</span>
      {{ currentProject.name }}
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useProjectStore } from './stores/project'
import { useRoute } from 'vue-router'

const projectStore = useProjectStore()
const currentProject = computed(() => projectStore.getCurrentProject())
const route = useRoute()

// 只有在有项目且是从创建项目后的情况下才显示项目名称
const shouldShowProjectName = computed(() => {
  // 当前有项目，并且满足以下条件之一：
  // 1. 路由参数中有projectId（从创建项目跳转）
  // 2. 路由参数中有onlyMap=false（点击数据搜索按钮）
  return currentProject.value && (route.query.projectId || route.query.onlyMap === 'false');
})
</script>

<style>
/* 基础样式保持不变 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
  background-color: #1a1a1a;
  /* 移除 overflow: hidden，允许页面滚动 */
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #e0e0e0;
  height: 100%;
  width: 100%;
  /* 移除overflow: hidden，允许滚动 */
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  font-size: 14px;
  line-height: 1.5;
  background-color: #1a1a1a;
  /* 默认允许滚动 */
  overflow-y: auto;
}

.app-container {
  position: relative;
  min-height: 100vh;
  background-color: #1a1a1a;
  /* 允许内容滚动 */
  overflow-y: auto;
}

.project-name-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 5px 16px;
  background-color: #1a1a1a;
  color: #e6e6e6;
  font-size: 14px;
  z-index: 1000;
  display: flex;
  align-items: center;
  border-top: none;
  box-shadow: none;
  height: 26px;
}

.project-name-label {
  margin-right: 8px;
  opacity: 0.8;
}
</style>
