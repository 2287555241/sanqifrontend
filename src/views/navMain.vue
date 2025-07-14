<template>
  <div class="nav-main-container">
    <div class="workspace">
      <div class="workspace-content">
        <!-- 使用条件渲染显示不同的内容视图 -->
        <template v-if="activeView === 'home'">
          <div class="welcome-content">
            <div class="welcome-message">
              <h1>欢迎使用三七遥感监测系统</h1>
              <p>开始您的三七种植监测项目</p>
            </div>
            
            <div class="projects-section">
              <div 
                class="project-creator"
                @click="createNewProject"
              >
                <el-icon class="folder-icon"><Folder /></el-icon>
                <div class="project-button">
                  <div class="button-text">
                    <el-icon><Plus /></el-icon>
                    <span>新建项目</span>
                  </div>
                </div>
              </div>
              
              <div class="quick-actions">
                <div class="action-card" @click="handleActionClick('import')">
                  <el-icon><Document /></el-icon>
                  <span>导入数据</span>
                </div>
                <div class="action-card" @click="handleActionClick('templates')">
                  <el-icon><Collection /></el-icon>
                  <span>模板中心</span>
                </div>
                <div class="action-card" @click="handleActionClick('help')">
                  <el-icon><Help /></el-icon>
                  <span>使用帮助</span>
                </div>
              </div>
            </div>
          </div>
        </template>
        
        <!-- 地图视图 -->
        <MapView v-if="activeView === 'map'" />
        
        <!-- 其他视图占位符 -->
        <div v-if="activeView === 'analysis'" class="module-content">
          <h2>数据分析区</h2>
          <p>此处显示数据分析功能</p>
        </div>
        
        <div v-if="activeView === 'yield'" class="module-content">
          <h2>产量估算</h2>
          <p>此处显示产量估算功能</p>
        </div>
        
        <div v-if="activeView === 'overlay'" class="module-content">
          <h2>耕地数据叠加与分析</h2>
          <p>此处显示耕地数据叠加与分析功能</p>
        </div>
        
        <div v-if="activeView === 'export'" class="module-content">
          <h2>数据导出</h2>
          <p>此处显示数据导出功能</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import MapView from './MapView.vue';
import { emitter, activeView, Events } from '../utils/eventBus';
import { Plus, Folder, Document, Collection, Help } from '@element-plus/icons-vue';

const router = useRouter();
const currentView = ref(null);

// 创建新项目
const createNewProject = () => {
  emitter.emit('show-project-management');
};

// 处理快捷操作点击
const handleActionClick = (action) => {
  switch(action) {
    case 'import':
      // 处理导入数据
      emitter.emit('open-import-dialog');
      break;
    case 'templates':
      // 处理模板中心
      router.push('/templates');
      break;
    case 'help':
      // 处理使用帮助
      router.push('/help');
      break;
  }
};

// 监听内容刷新事件
const refreshContentHandler = (data) => {
  console.log('接收到内容刷新事件:', data);
};

// 监听地图清除事件
const clearMapHandler = () => {
  console.log('接收到地图清除事件');
  // 这里可以调用地图组件的清除方法
};

// 监听activeView变化
watch(() => activeView.value, (newView, oldView) => {
  console.log(`视图从 ${oldView} 切换到 ${newView}`);
  
  // 如果从地图视图切换出来，确保清理地图资源
  if (oldView === 'map' && newView !== 'map') {
    console.log('从地图视图切换出来，清理地图资源');
    emitter.emit(Events.CLEAR_MAP);
  }
});

onMounted(() => {
  // 注册事件监听
  emitter.on(Events.REFRESH_CONTENT, refreshContentHandler);
  emitter.on(Events.CLEAR_MAP, clearMapHandler);
  emitter.on('openDataManagement', () => {
    console.log('navMain 接收到 openDataManagement 事件，转发给 index.vue');
    // 转发事件给 index.vue
    emitter.emit('openDataManagement');
  });
});

onBeforeUnmount(() => {
  // 移除事件监听
  emitter.off(Events.REFRESH_CONTENT, refreshContentHandler);
  emitter.off(Events.CLEAR_MAP, clearMapHandler);
  emitter.off('openDataManagement');
});
</script>

<style scoped>
.nav-main-container {
  width: 100%;
  height: 100vh;
  background-color: #1a1a1a;
  padding: 30px 64px 0 64px; /* 顶部30px(header高度)，左侧64px(收起的菜单宽度) */
  box-sizing: border-box;
}

.workspace {
  width: 100%;
  height: 100%;
  background-color: #1a1a1a;
  border-radius: 4px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.workspace-content {
  width: 100%;
  height: 100%;
  background-color: #2c2c2c; /* 调整为稍浅的深色 */
  border-radius: 4px;
  position: relative;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2); /* 添加轻微阴影以增加层次感 */
  overflow: hidden; /* 防止内容溢出 */
}

/* 首页欢迎内容样式 */
.welcome-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.welcome-message {
  text-align: center;
  margin-bottom: 30px;
  color: rgba(255, 255, 255, 0.9);
}

.welcome-message h1 {
  font-size: 24px;
  font-weight: 500;
  margin-bottom: 10px;
  letter-spacing: 1px;
}

.welcome-message p {
  font-size: 16px;
  opacity: 0.8;
}

.projects-section {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.project-creator {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: transform 0.3s ease;
  margin-bottom: 30px;
}

.project-creator:hover {
  transform: scale(1.02);
}

.folder-icon {
  font-size: 100px;
  color: rgba(255, 255, 255, 0.9);
  transition: transform 0.3s ease;
  margin-bottom: 15px;
}

.project-creator:hover .folder-icon {
  transform: translateY(-8px);
}

.project-button {
  padding: 16px 30px;
  background: rgba(255, 255, 255, 0.08);
  border: 2px dashed rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  min-width: 120px;
  transition: all 0.3s ease;
}

.project-creator:hover .project-button {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.4);
}

.button-text {
  display: flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
}

.button-text .el-icon {
  font-size: 14px;
  margin-right: 4px;
}

.quick-actions {
  display: flex;
  gap: 20px;
  margin-top: 10px;
}

.action-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 15px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 80px;
}

.action-card:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-3px);
}

.action-card .el-icon {
  font-size: 24px;
  margin-bottom: 8px;
  color: rgba(255, 255, 255, 0.9);
}

.action-card span {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.9);
}

/* 模块内容样式 */
.module-content {
  padding: 30px;
  color: rgba(255, 255, 255, 0.9);
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.module-content h2 {
  font-size: 24px;
  margin-bottom: 20px;
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
