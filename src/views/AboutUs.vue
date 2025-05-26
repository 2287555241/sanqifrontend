<template>
  <div class="page-container">
    <NavHeader />
    <div class="about-container">
      <!-- 公司简介 -->
      <div class="company-section">
        <h1>{{ companyInfo.name }}</h1>
        <p class="description">{{ companyInfo.description }}</p>
        <div class="mission-vision">
          <div class="mission">
            <h3>使命</h3>
            <p>{{ companyInfo.mission }}</p>
          </div>
          <div class="vision">
            <h3>愿景</h3>
            <p>{{ companyInfo.vision }}</p>
          </div>
        </div>
      </div>

      <!-- 核心优势 -->
      <div class="advantages-section">
        <h2>核心优势</h2>
        <div class="advantages-grid">
          <div class="advantage-card">
            <el-icon class="advantage-icon"><Monitor /></el-icon>
            <h3>先进技术</h3>
            <p>采用最新的遥感技术和AI算法，提供精准的分析结果</p>
          </div>
          <div class="advantage-card">
            <el-icon class="advantage-icon"><DataLine /></el-icon>
            <h3>数据驱动</h3>
            <p>基于多源数据融合，为农业决策提供科学依据</p>
          </div>
          <div class="advantage-card">
            <el-icon class="advantage-icon"><Service /></el-icon>
            <h3>专业服务</h3>
            <p>提供全方位的技术支持和解决方案</p>
          </div>
        </div>
      </div>

      <!-- 团队介绍 -->
      <div class="team-section">
        <h2>核心团队</h2>
        <div class="team-grid">
          <div v-for="member in teamMembers" :key="member.name" class="team-card">
            <el-avatar :size="100" :src="member.avatar" />
            <h3>{{ member.name }}</h3>
            <p class="position">{{ member.position }}</p>
            <p class="description">{{ member.description }}</p>
          </div>
        </div>
      </div>

      <!-- 联系我们 -->
      <div class="contact-section">
        <h2>联系我们</h2>
        <div class="contact-info">
          <p><el-icon><Location /></el-icon> 地址：北京市海淀区科技园区</p>
          <p><el-icon><Phone /></el-icon> 电话：010-12345678</p>
          <p><el-icon><Message /></el-icon> 邮箱：contact@example.com</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import NavHeader from './navHeader.vue'

const teamMembers = ref([
  {
    name: '张三',
    position: '技术总监',
    description: '拥有10年遥感技术研发经验，专注于农业遥感应用研究。',
    avatar: ''
  },
  {
    name: '李四',
    position: '产品经理',
    description: '深耕农业信息化领域，致力于推动智慧农业发展。',
    avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
  },
  {
    name: '王五',
    position: '算法专家',
    description: '专注于AI算法研发，在农作物识别领域有深入研究。',
    avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
  }
])

const companyInfo = ref({
  name: '农业遥感分析平台',
  description: '我们致力于为农业领域提供专业的遥感分析解决方案，通过先进的技术手段，助力智慧农业发展。',
  mission: '让农业更智能，让生产更高效',
  vision: '成为农业遥感分析领域的领导者'
})
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.about-container {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
  margin-top: 64px;
}

.company-section {
  text-align: center;
  padding: 60px 0;
  background: linear-gradient(135deg, rgba(240, 249, 255, 0.8), rgba(255, 255, 255, 0.8));
  border-radius: 16px;
  margin-bottom: 40px;
}

.company-section h1 {
  font-size: 2.5em;
  color: #2c3e50;
  margin-bottom: 20px;
}

.description {
  font-size: 1.2em;
  color: #5c6b7f;
  max-width: 800px;
  margin: 0 auto 40px;
  line-height: 1.6;
}

.mission-vision {
  display: flex;
  justify-content: center;
  gap: 40px;
  margin-top: 40px;
}

.mission, .vision {
  background: rgba(255, 255, 255, 0.9);
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  flex: 1;
  max-width: 300px;
}

.mission h3, .vision h3 {
  color: #409EFF;
  margin-bottom: 12px;
}

.advantages-section {
  padding: 40px 0;
}

.advantages-section h2 {
  text-align: center;
  font-size: 2em;
  color: #2c3e50;
  margin-bottom: 40px;
}

.advantages-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  padding: 0 20px;
}

.advantage-card {
  background: rgba(255, 255, 255, 0.9);
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  text-align: center;
  transition: transform 0.3s ease;
}

.advantage-card:hover {
  transform: translateY(-5px);
}

.advantage-icon {
  font-size: 2.5em;
  color: #409EFF;
  margin-bottom: 16px;
}

.team-section {
  padding: 40px 0;
}

.team-section h2 {
  text-align: center;
  font-size: 2em;
  color: #2c3e50;
  margin-bottom: 40px;
}

.team-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  padding: 0 20px;
}

.team-card {
  background: rgba(255, 255, 255, 0.9);
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  text-align: center;
  transition: transform 0.3s ease;
}

.team-card:hover {
  transform: translateY(-5px);
}

.team-card h3 {
  margin: 16px 0 8px;
  color: #2c3e50;
}

.position {
  color: #409EFF;
  font-weight: 500;
  margin-bottom: 12px;
}

.contact-section {
  text-align: center;
  padding: 60px 0;
  margin-top: 40px;
  background: linear-gradient(135deg, rgba(240, 249, 255, 0.8), rgba(255, 255, 255, 0.8));
  border-radius: 16px;
}

.contact-section h2 {
  font-size: 2em;
  color: #2c3e50;
  margin-bottom: 24px;
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
}

.contact-info p {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #5c6b7f;
  font-size: 1.1em;
}
</style> 