<template>
  <div class="page-container">
    <NavHeader />
    <div class="help-container">
      <!-- 帮助中心标题 -->
      <div class="help-header">
        <h1>帮助中心</h1>
        <p>为您提供全面的使用指南和技术支持</p>
      </div>

      <!-- 帮助内容区域 -->
      <div class="help-content">
        <div class="help-grid">
          <div v-for="item in helpItems" :key="item.title" class="help-card">
            <el-icon class="help-icon"><component :is="item.icon" /></el-icon>
            <h3>{{ item.title }}</h3>
            <p>{{ item.content }}</p>
            <el-button type="primary" text>查看详情</el-button>
          </div>
        </div>
      </div>

      <!-- 联系支持 -->
      <div class="support-section">
        <h2>需要更多帮助？</h2>
        <p>我们的技术支持团队随时为您服务</p>
        <el-button type="primary" size="large">联系客服</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import NavHeader from './navHeader.vue'

const helpItems = ref([
  {
    title: '快速入门',
    content: '了解平台的基本功能和使用方法，快速上手农业遥感分析平台。',
    icon: 'Guide'
  },
  {
    title: '影像处理指南',
    content: '学习如何导入、处理和分析遥感影像数据，掌握专业的影像处理技术。',
    icon: 'Picture'
  },
  {
    title: '种植区提取教程',
    content: '了解如何使用AI技术进行农作物种植区域的智能识别和提取。',
    icon: 'Crop'
  },
  {
    title: '产量估算方法',
    content: '掌握农作物产量估算的技术原理和操作方法，提高预测准确性。',
    icon: 'DataAnalysis'
  },
  {
    title: '数据叠加分析',
    content: '学习多源数据的叠加分析方法，为农业决策提供数据支持。',
    icon: 'Histogram'
  },
  {
    title: '常见问题',
    content: '查看用户常见问题解答，快速解决使用过程中遇到的问题。',
    icon: 'QuestionFilled'
  }
])
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.help-container {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
  margin-top: 64px;
}

.help-header {
  text-align: center;
  padding: 40px 0;
  background: linear-gradient(135deg, rgba(240, 249, 255, 0.8), rgba(255, 255, 255, 0.8));
  border-radius: 16px;
  margin-bottom: 40px;
}

.help-header h1 {
  font-size: 2.5em;
  color: #2c3e50;
  margin-bottom: 16px;
}

.help-header p {
  font-size: 1.2em;
  color: #5c6b7f;
}

.help-content {
  padding: 20px 0;
}

.help-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 24px;
  padding: 0 20px;
}

.help-card {
  background: rgba(255, 255, 255, 0.9);
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease;
}

.help-card:hover {
  transform: translateY(-5px);
}

.help-icon {
  font-size: 2.5em;
  color: #409EFF;
  margin-bottom: 16px;
}

.help-card h3 {
  font-size: 1.4em;
  color: #2c3e50;
  margin-bottom: 12px;
}

.help-card p {
  color: #5c6b7f;
  line-height: 1.6;
  margin-bottom: 20px;
}

.support-section {
  text-align: center;
  padding: 60px 0;
  margin-top: 40px;
  background: linear-gradient(135deg, rgba(240, 249, 255, 0.8), rgba(255, 255, 255, 0.8));
  border-radius: 16px;
}

.support-section h2 {
  font-size: 2em;
  color: #2c3e50;
  margin-bottom: 16px;
}

.support-section p {
  font-size: 1.2em;
  color: #5c6b7f;
  margin-bottom: 24px;
}
</style> 