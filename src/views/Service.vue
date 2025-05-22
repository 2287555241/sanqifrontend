<template>
  <div class="service-page">
    <nav-header></nav-header>
    <div class="service-container">
      <div class="service-header">
        <h1>我们的服务</h1>
        <p>专业的农业遥感服务，为您的农业发展保驾护航</p>
      </div>

      <div class="service-cards">
        <div v-for="service in services" :key="service.title" class="service-card">
          <div class="service-content">
            <h2>{{ service.title }}</h2>
            <p class="description">{{ service.description }}</p>
            <div class="features">
              <div v-for="feature in service.features" :key="feature" class="feature">
                <el-icon><Check /></el-icon>
                <span>{{ feature }}</span>
              </div>
            </div>
            <div class="price">
              <span class="price-label">价格：</span>
              <span class="price-value">{{ service.price }}</span>
            </div>
            <el-button type="primary" class="contact-btn">联系我们</el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import NavHeader from '@/views/navHeader.vue'
import { Check } from '@element-plus/icons-vue'

const services = ref([
  {
    title: '遥感影像处理服务',
    description: '提供专业的遥感影像处理服务，包括影像校正、增强、分类等',
    price: '按需定制',
    features: ['影像校正', '影像增强', '影像分类', '专题制图']
  },
  {
    title: '农业监测服务',
    description: '基于遥感技术的农作物生长监测服务，提供精准的农业信息',
    price: '按年收费',
    features: ['作物长势监测', '病虫害预警', '产量预测', '灾害评估']
  },
  {
    title: '数据分析服务',
    description: '专业的农业数据分析服务，助力农业决策',
    price: '按项目收费',
    features: ['数据挖掘', '趋势分析', '决策支持', '报告生成']
  }
])
</script>

<style scoped>
.service-page {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.service-container {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
  margin-top: 64px; /* 为header留出空间 */
}

.service-header {
  text-align: center;
  padding: 40px 0;
  margin-bottom: 40px;
}

.service-header h1 {
  font-size: 2.5em;
  color: #2c3e50;
  margin-bottom: 16px;
}

.service-header p {
  font-size: 1.2em;
  color: #5c6b7f;
}

.service-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  padding: 0 20px;
}

.service-card {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease;
  overflow: hidden;
}

.service-card:hover {
  transform: translateY(-5px);
}

.service-content {
  padding: 30px;
}

.service-content h2 {
  font-size: 1.6em;
  color: #2c3e50;
  margin-bottom: 16px;
}

.description {
  color: #5c6b7f;
  margin-bottom: 24px;
  line-height: 1.6;
}

.features {
  margin-bottom: 24px;
}

.feature {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  color: #5c6b7f;
}

.feature .el-icon {
  color: #409EFF;
  margin-right: 8px;
}

.price {
  margin-bottom: 24px;
  font-size: 1.2em;
}

.price-label {
  color: #5c6b7f;
}

.price-value {
  color: #409EFF;
  font-weight: bold;
}

.contact-btn {
  width: 100%;
  padding: 12px;
  font-size: 1.1em;
}
</style> 