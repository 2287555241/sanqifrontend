<template>
  <div class="home-container">
  <nav-header></nav-header>
  <div class="hero-section">
    <div class="hero-content">
      <h1 class="animate-title">三七种植遥感监测系统</h1>
      <p class="animate-subtitle">基于先进的遥感技术，为您的农业生产提供智能化解决方案</p>
      <div class="hero-features">
        <div class="hero-feature animate-feature">
          <svg width="40" height="40" viewBox="0 0 40 40" class="feature-icon">
            <circle cx="20" cy="20" r="18" fill="none" stroke="#409EFF" stroke-width="2" />
            <circle cx="20" cy="20" r="8" fill="none" stroke="#409EFF" stroke-width="2" />
            <path d="M20 12 L20 28" stroke="#409EFF" stroke-width="2" />
            <path d="M12 20 L28 20" stroke="#409EFF" stroke-width="2" />
          </svg>
          <span>智能监测</span>
          <div class="feature-desc">全天候监测农作物生长状况，及时发现异常</div>
        </div>
        <div class="hero-feature animate-feature">
          <svg width="40" height="40" viewBox="0 0 40 40" class="feature-icon">
            <rect x="8" y="20" width="6" height="12" fill="#409EFF" />
            <rect x="17" y="12" width="6" height="20" fill="#409EFF" />
            <rect x="26" y="16" width="6" height="16" fill="#409EFF" />
          </svg>
          <span>数据分析</span>
          <div class="feature-desc">智能分析农业数据，提供精准决策支持</div>
        </div>
        <div class="hero-feature animate-feature">
          <svg width="40" height="40" viewBox="0 0 40 40" class="feature-icon">
            <path d="M20 8 L20 32" stroke="#409EFF" stroke-width="2" />
            <path d="M12 24 L20 8 L28 24" stroke="#409EFF" stroke-width="2" fill="none" />
          </svg>
          <span>产量预测</span>
          <div class="feature-desc">基于历史数据和AI模型，准确预测作物产量</div>
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

  <div class="news-section">
    <h2 class="section-title animate-fade">最新动态</h2>
    <div class="news-container">
      <el-card v-for="(news, index) in newsItems" :key="index" class="news-card animate-card" :style="{ animationDelay: index * 0.2 + 's' }">
        <h3>{{ news.title }}</h3>
        <p>{{ news.content }}</p>
        <div class="news-date">{{ news.date }}</div>
      </el-card>
    </div>
  </div>

  <div class="feedback-section">
    <h2 class="section-title animate-fade">用户反馈</h2>
    <el-carousel :interval="4000" type="card" height="200px">
      <el-carousel-item v-for="(feedback, index) in feedbacks" :key="index">
        <div class="feedback-card">
          <p class="feedback-content">{{ feedback.content }}</p>
          <div class="feedback-author">{{ feedback.author }}</div>
        </div>
      </el-carousel-item>
    </el-carousel>
  </div>

  <footer class="footer">
    <div class="footer-content">
      <p>&copy; 2023 三七种植遥感监测系统. All rights reserved.</p>
      <div class="footer-links">
        <a href="#">关于我们</a>
        <a href="#">服务条款</a>
        <a href="#">隐私政策</a>
      </div>
    </div>
  </footer>
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
import { ElMessage } from 'element-plus'

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

const newsItems = ref([
{ title: '系统升级公告', content: '我们即将推出新版本，带来更多智能监测功能。', date: '2023-10-01' },
{ title: '用户培训通知', content: '下周三将举办线上培训，帮助用户更好地使用系统。', date: '2023-09-28' }
])

const feedbacks = ref([
{ content: '系统非常易用，监测数据准确，推荐给所有农户！', author: '张先生' },
{ content: '产量预测功能帮助我提前规划，效果显著。', author: '李女士' },
{ content: '客服响应迅速，问题解决及时。', author: '王先生' }
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
width: 40px;
height: 40px;
margin-bottom: 12px;
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

.news-section {
padding: 40px 20px;
max-width: 1200px;
margin: 0 auto;
}

.news-container {
display: grid;
grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
gap: 20px;
margin-top: 20px;
}

.news-card {
transition: transform 0.3s ease;
}

.news-card:hover {
transform: translateY(-5px);
}

.news-date {
color: #999;
font-size: 0.9em;
margin-top: 10px;
}

.feedback-section {
padding: 40px 20px;
max-width: 1200px;
margin: 0 auto;
}

.feedback-card {
background: rgba(255, 255, 255, 0.9);
padding: 20px;
border-radius: 8px;
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
height: 100%;
display: flex;
flex-direction: column;
justify-content: center;
}

.feedback-content {
font-size: 1.1em;
color: #333;
margin-bottom: 10px;
}

.feedback-author {
color: #666;
font-style: italic;
}

.footer {
background: #2c3e50;
color: #fff;
padding: 20px;
text-align: center;
margin-top: 40px;
}

.footer-content {
max-width: 1200px;
margin: 0 auto;
}

.footer-links {
margin-top: 10px;
}

.footer-links a {
color: #fff;
margin: 0 10px;
text-decoration: none;
}

.footer-links a:hover {
text-decoration: underline;
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

.feature-desc {
color: #5c6b7f;
font-size: 0.95em;
margin-top: 8px;
margin-bottom: 8px;
min-height: 32px;
}
</style> 
