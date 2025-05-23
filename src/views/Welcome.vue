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
import '@/assets/css/Welcome.css'

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
  