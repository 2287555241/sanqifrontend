<template>
  <div class="app-container">
    <!-- 导航栏部分（固定位置，不受动画影响） -->
    <NavHeader />
    
    <!-- 主要内容区域（应用动画效果） -->
    <div class="main-content" :class="{'page-transition-active': isTransitioning}">
      <router-view v-slot="{ Component, route }">
        <transition
          :name="getTransitionName(route)"
          @before-enter="startTransition"
          @after-enter="endTransition"
          @after-leave="endTransition"
        >
          <component :is="Component" :key="route.path" />
        </transition>
      </router-view>
    </div>
  </div>
</template>

<script>
import HeaderNav from '@/views/navHeader.vue' // 导入你的导航栏组件

export default {
  components: {
    HeaderNav
  },
  data() {
    return {
      isTransitioning: false
    }
  },
  methods: {
    getTransitionName(route) {
      const animatedPages = ['home', 'service', 'help', 'about']
      if (animatedPages.includes(route.name)) {
        const effects = ['fade-scale']
        return effects[Math.floor(Math.random() * effects.length)]
      }
      return 'none'
    },
    startTransition() {
      this.isTransitioning = true
    },
    endTransition() {
      this.isTransitioning = false
    }
  }
}
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

/* 背景遮罩效果 */
.app-container::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #ffffff, #ffffff);
  z-index: -1;
  opacity: 0;
  transition: opacity 0.6s ease;
}

.page-transition-active::before {
  opacity: 0.15;
}

/* 淡入淡出增强版 */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.5s cubic-bezier(0.55, 0.085, 0.68, 0.53);
}

.fade-enter-from {
  opacity: 0;
  filter: blur(5px);
}

.fade-leave-to {
  opacity: 0;
  filter: blur(5px);
}

/* 组合淡入淡出与缩放 */
.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.fade-scale-enter-from {
  opacity: 0;
  transform: scale(0.95);
}

.fade-scale-leave-to {
  opacity: 0;
  transform: scale(1.05);
}

.main-content {
  padding-top: 64px; /* 为导航栏留出空间 */
  min-height: calc(100vh - 64px);
}

/* 调整背景遮罩位置 */
.main-content::before {
  content: '';
  position: fixed;
  top: 64px; /* 从导航栏下方开始 */
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #ffffff, #ffffff);
  z-index: -1;
  opacity: 0;
  transition: opacity 0.6s ease;
}

.page-transition-active::before {
  opacity: 0.15;
}

.app-container {
  padding-top: 64px; /* 匹配导航栏高度 */
}
</style>
