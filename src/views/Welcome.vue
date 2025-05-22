<template>
  <div class="welcome-page" @wheel="handleWheel">
    <!-- 主内容区域 -->
    <div class="main-content">
      <!-- 欢迎区域 - 始终显示 -->
      <div class="welcome-section">
        <h1>欢迎使用三七遥感分析平台</h1>
        <p>专业的农业遥感分析工具，助力智慧农业发展</p>
      </div>

      <!-- 功能特点区域 - 滚动后隐藏 -->
      <div class="features-section" :class="{ 'scrolled-down': isScrolled }">
        <h2>核心功能</h2>
        <div class="features-grid">
          <div v-for="feature in features" :key="feature.title" class="feature-card">
            <el-icon class="feature-icon"><component :is="feature.icon" /></el-icon>
            <h3>{{ feature.title }}</h3>
            <p>{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 登录按钮 (滚动后显示) -->
    <transition name="fade-up">
      <div v-show="showLoginButton" class="login-actions">
        <el-button class="big-login-btn" @click="goToLogin">
          登录/注册
        </el-button>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const isScrolled = ref(false)
const showLoginButton = ref(false)
let lastScrollTime = 0
const SCROLL_COOLDOWN = 500 // 防抖时间

const features = ref([
  {
    title: '影像处理',
    description: '专业的遥感影像处理工具，支持多种格式影像的导入、处理和分析',
    icon: 'Picture'
  },
  {
    title: '种植区提取',
    description: '基于AI的智能识别技术，快速准确地提取农作物种植区域',
    icon: 'Crop'
  },
  {
    title: '产量估算',
    description: '结合多源数据，提供精准的农作物产量预测和分析',
    icon: 'DataAnalysis'
  },
  {
    title: '数据叠加分析',
    description: '支持多维度数据叠加分析，助力农业决策',
    icon: 'Histogram'
  }
])

const handleWheel = (e) => {
  const now = Date.now()
  if (now - lastScrollTime < SCROLL_COOLDOWN) return
  lastScrollTime = now

  // 向下滚动
  if (e.deltaY > 0) {
    isScrolled.value = true
    showLoginButton.value = true
  } 
  // 向上滚动
  else {
    isScrolled.value = false
    showLoginButton.value = false
  }
}

const goToLogin = () => {
  router.push('/login')
}
</script>

<style scoped>
.welcome-page {
  height: 100vh;
  overflow: hidden;
  position: relative;
  background-color: #f5f7fa;
}

.main-content {
  height: 100vh;
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

/* 欢迎区域样式 - 始终显示 */
.welcome-section {
  text-align: center;
  padding: 60px 0;
  background: linear-gradient(135deg, rgba(240, 249, 255, 0.8), rgba(255, 255, 255, 0.8));
  border-radius: 16px;
  margin-bottom: 40px;
}

.welcome-section h1 {
  font-size: 2.5em;
  color: #2c3e50;
  margin-bottom: 16px;
}

.welcome-section p {
  font-size: 1.2em;
  color: #5c6b7f;
}

/* 功能区域样式 - 滚动后隐藏 */
.features-section {
  padding: 40px 0;
  transition: all 0.5s ease;
}

.features-section.scrolled-down {
  opacity: 0;
  visibility: hidden;
  transform: translateY(20px);
}

.features-section h2 {
  text-align: center;
  font-size: 2em;
  color: #2c3e50;
  margin-bottom: 40px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  padding: 0 20px;
}

.feature-card {
  background: rgba(255, 255, 255, 0.9);
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.feature-icon {
  font-size: 2.5em;
  color: #409EFF;
  margin-bottom: 16px;
}

.feature-card h3 {
  font-size: 1.4em;
  color: #2c3e50;
  margin-bottom: 12px;
}

.feature-card p {
  color: #5c6b7f;
  line-height: 1.6;
}

/* 登录按钮样式 - 黑色字体和边框 */
.login-actions {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
}

.big-login-btn {
  width: 200px;
  height: 60px;
  font-size: 1.2rem;
  font-weight: bold;
  color: #000; /* 黑色字体 */
  background-color: white;
  border: 2px solid #000; /* 黑色边框 */
  border-radius: 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
}

.big-login-btn:hover {
  background-color: #f0f0f0;
  transform: scale(1.05);
}

/* 动画效果 */
.fade-up-enter-active,
.fade-up-leave-active {
  transition: all 0.5s ease;
}

.fade-up-enter-from,
.fade-up-leave-to {
  opacity: 0;
  transform: translateY(30px);
}
</style>
  