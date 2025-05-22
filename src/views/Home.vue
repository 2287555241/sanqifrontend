<template>
  <div class="home-container">
    <nav-header></nav-header>
    <div class="hero-section">
      <div class="hero-content">
        <h1 class="animate-title">农业遥感智能分析平台</h1>
        <p class="animate-subtitle">基于先进的遥感技术，为您的农业生产提供智能化解决方案</p>
        <div class="hero-features">
          <div class="hero-feature animate-feature">
            <el-icon><Monitor /></el-icon>
            <span>智能监测</span>
          </div>
          <div class="hero-feature animate-feature">
            <el-icon><DataAnalysis /></el-icon>
            <span>数据分析</span>
          </div>
          <div class="hero-feature animate-feature">
            <el-icon><Crop /></el-icon>
            <span>产量预测</span>
          </div>
        </div>
        <el-button 
          type="primary" 
          size="large" 
          class="start-btn animate-btn"
          @click="startUsing"
        >
          开始使用
          <el-icon class="el-icon--right"><ArrowRight /></el-icon>
        </el-button>
      </div>
    </div>

    <div class="features-section">
      <h2 class="section-title animate-fade">核心功能</h2>
      <div class="features-grid">
        <div v-for="(feature, index) in features" 
             :key="feature.title" 
             class="feature-card animate-card"
             :style="{ animationDelay: index * 0.2 + 's' }"
        >
          <el-icon class="feature-icon"><component :is="feature.icon" /></el-icon>
          <h3>{{ feature.title }}</h3>
          <p>{{ feature.description }}</p>
        </div>
      </div>
    </div>

    <div class="stats-section">
      <div class="stats-container">
        <div v-for="(stat, index) in stats" 
             :key="stat.label" 
             class="stat-item animate-stat"
             :style="{ animationDelay: index * 0.3 + 's' }"
        >
          <div class="stat-number">{{ stat.value }}</div>
          <div class="stat-label">{{ stat.label }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { 
  Monitor, 
  DataAnalysis, 
  Crop, 
  Warning, 
  ArrowRight 
} from '@element-plus/icons-vue'
import NavHeader from './navHeader.vue'

const router = useRouter()

const startUsing = () => {
  router.push('/index')
}

const features = ref([
  {
    title: '实时监测',
    description: '全天候监测农作物生长状况，及时发现异常',
    icon: 'Monitor'
  },
  {
    title: '数据分析',
    description: '智能分析农业数据，提供精准决策支持',
    icon: 'DataAnalysis'
  },
  {
    title: '产量预测',
    description: '基于历史数据和AI模型，准确预测作物产量',
    icon: 'Crop'
  },
  {
    title: '灾害预警',
    description: '提前预警自然灾害，降低农业损失',
    icon: 'Warning'
  }
])

const stats = ref([
  {
    value: '98%',
    label: '监测准确率'
  },
  {
    value: '5000+',
    label: '服务农户'
  },
  {
    value: '100万+',
    label: '监测面积'
  },
  {
    value: '24h',
    label: '实时响应'
  }
])
</script>

<style scoped>
.home-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e7eb 100%);
  padding: 20px;
}

.hero-section {
  margin-top: 80px;  /* 为header留出空间 */
  display: flex;
  align-items: center;
  justify-content: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 60px 20px;
  min-height: 80vh;
}

.hero-content {
  text-align: center;
  max-width: 800px;
}

.hero-features {
  display: flex;
  justify-content: center;
  gap: 40px;
  margin: 40px 0;
}

.hero-feature {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  opacity: 0;
  animation: slideUp 0.8s ease forwards;
}

.hero-feature .el-icon {
  font-size: 2.5em;
  color: #409EFF;
  background: rgba(64, 158, 255, 0.1);
  padding: 20px;
  border-radius: 50%;
  transition: transform 0.3s ease;
}

.hero-feature:hover .el-icon {
  transform: scale(1.1);
}

.hero-feature span {
  font-size: 1.1em;
  color: #2c3e50;
  font-weight: 500;
}

.animate-title {
  font-size: 3.5em;
  color: #2c3e50;
  margin-bottom: 20px;
  opacity: 0;
  animation: slideUp 0.8s ease forwards;
}

.animate-subtitle {
  font-size: 1.2em;
  color: #5c6b7f;
  margin-bottom: 40px;
  opacity: 0;
  animation: slideUp 0.8s ease 0.2s forwards;
}

.start-btn {
  padding: 15px 40px;
  font-size: 1.2em;
  border-radius: 30px;
  opacity: 0;
  animation: slideUp 0.8s ease 0.4s forwards;
  transition: all 0.3s ease;
}

.start-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 20px rgba(64, 158, 255, 0.2);
}

.features-section {
  padding: 80px 20px;
  background: white;
  border-radius: 30px;
  margin: 40px auto;
  max-width: 1200px;
}

.section-title {
  text-align: center;
  font-size: 2.5em;
  color: #2c3e50;
  margin-bottom: 60px;
  opacity: 0;
  animation: fadeIn 0.8s ease forwards;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
  padding: 0 20px;
}

.feature-card {
  background: white;
  padding: 30px;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  text-align: center;
  transition: transform 0.3s ease;
  opacity: 0;
  animation: slideUp 0.8s ease forwards;
}

.feature-card:hover {
  transform: translateY(-10px);
}

.feature-icon {
  font-size: 2.5em;
  color: #409EFF;
  margin-bottom: 20px;
}

.feature-card h3 {
  font-size: 1.5em;
  color: #2c3e50;
  margin-bottom: 15px;
}

.feature-card p {
  color: #5c6b7f;
  line-height: 1.6;
}

.stats-section {
  padding: 80px 20px;
  background: linear-gradient(135deg, #409EFF 0%, #36D1DC 100%);
  border-radius: 30px;
  margin: 40px auto;
  max-width: 1200px;
}

.stats-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 40px;
  text-align: center;
}

.stat-item {
  opacity: 0;
  animation: fadeIn 0.8s ease forwards;
}

.stat-number {
  font-size: 3em;
  color: white;
  font-weight: bold;
  margin-bottom: 10px;
}

.stat-label {
  font-size: 1.2em;
  color: rgba(255, 255, 255, 0.9);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .hero-section {
    padding: 40px 20px;
  }

  .hero-features {
    flex-direction: column;
    gap: 20px;
  }

  .animate-title {
    font-size: 2.5em;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }
}
</style> 
