<template>
  <div class="home-container">
    <nav-header></nav-header>
    <div class="hero-section" :class="{ 'hero-minimized': scrolled }">
      <div class="map-background">
        <!-- 动态地图背景 -->
        <div id="mapBackground" class="map-container"></div>
        <div class="overlay"></div>
      </div>
      <div class="hero-content">
        <h1 class="animate-title">三七种植遥感监测系统</h1>
        <p class="animate-subtitle">基于先进的遥感技术，为您的农业生产提供智能化解决方案</p>
        <el-button class="start-button" type="primary" size="large" @click="handleStart">
          <span>开始使用</span>
          <el-icon class="el-icon--right"><ArrowRight /></el-icon>
        </el-button>
      </div>
    </div>

    <!-- 下方的内容区域 -->
    <div class="content-section">
      <div class="features-section">
        <h2 class="section-title animate-fade">核心功能</h2>
        <div class="features-grid">
          <div v-for="(feature, index) in features" 
               :key="feature.title" 
               class="feature-card"
               :style="{ animationDelay: index * 0.2 + 's' }"
          >
            <el-icon class="feature-icon"><component :is="feature.icon" /></el-icon>
            <h3>{{ feature.title }}</h3>
            <p>{{ feature.description }}</p>
          </div>
        </div>
      </div>

      <div class="news-section">
        <h2 class="section-title animate-fade">最新动态</h2>
        <div class="news-container">
          <el-card v-for="(news, index) in newsItems" :key="index" class="news-card" :style="{ animationDelay: index * 0.2 + 's' }">
            <h3>{{ news.title }}</h3>
            <p>{{ news.content }}</p>
            <div class="news-date">{{ news.date }}</div>
          </el-card>
        </div>
      </div>

      <div class="feedback-section">
        <h2 class="section-title animate-fade">用户反馈</h2>
        <el-carousel :interval="4000" type="card" height="240px">
          <el-carousel-item v-for="(feedback, index) in feedbacks" :key="index">
            <div class="feedback-card">
              <div class="feedback-quote-icon">❝</div>
              <p class="feedback-content">{{ feedback.content }}</p>
              <div class="feedback-author">— {{ feedback.author }}</div>
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
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import NavHeader from './navHeader.vue'
import { loadModules } from 'esri-loader'
import { 
  Monitor, 
  DataAnalysis, 
  Crop, 
  ArrowRight
} from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 滚动状态
const scrolled = ref(false)

// 滚动处理函数
const handleScroll = () => {
  // 当滚动超过100px时，设置scrolled为true
  scrolled.value = window.scrollY > 100
}

onMounted(() => {
  initMap()
  // 添加滚动事件监听
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  // 移除滚动事件监听
  window.removeEventListener('scroll', handleScroll)
})

// 初始化地图
const initMap = () => {
  loadModules([
    'esri/Map',
    'esri/views/MapView',
    'esri/layers/WebTileLayer',
    'esri/Basemap'
  ]).then(([Map, MapView, WebTileLayer, Basemap]) => {
    // 天地图密钥
    const tk = "cbd48f39fb1e392a76ab69f7090b93c4"
    
    // 创建天地图图层
    const baseLayers = [
      new WebTileLayer({ 
        urlTemplate: `http://t0.tianditu.gov.cn/DataServer?T=img_w&x={x}&y={y}&l={z}&tk=${tk}`,
        copyright: "天地图"
      }),
      new WebTileLayer({ 
        urlTemplate: `http://t0.tianditu.gov.cn/DataServer?T=cia_w&x={x}&y={y}&l={z}&tk=${tk}`,
        copyright: "天地图"
      })
    ]

    // 创建自定义底图
    const customBasemap = new Basemap({
      baseLayers: baseLayers,
      title: "天地图卫星影像",
      id: "tiandiSatellite"
    });

    const map = new Map({
      basemap: customBasemap
    })

    const view = new MapView({
      map: map,
      center: [102.7064, 25.0431], // 云南昆明坐标
      zoom: 7, // 调整缩放级别以显示更大范围的云南
      container: 'mapBackground',
      ui: {
        components: [] // 移除所有UI组件
      },
      constraints: {
        minZoom: 6,
        maxZoom: 10,
        rotationEnabled: false // 禁用旋转
      },
      navigation: {
        mouseWheelZoomEnabled: false, // 禁用鼠标滚轮缩放
        browserTouchPanEnabled: false // 禁用触摸平移
      }
    })

    // 添加缓慢自动平移效果
    let direction = 1;
    let counter = 0;
    
    const animateMap = () => {
      if (!view || !view.ready) return;
      
      counter += 0.1;
      const offset = Math.sin(counter) * 0.0005;
      
      const currentCenter = view.center.clone();
      currentCenter.longitude += offset * direction;
      
      view.goTo({
        center: currentCenter
      }, {
        duration: 1000,
        easing: 'ease-out'
      });
      
      if (counter > 10) {
        direction *= -1;
        counter = 0;
      }
    };
    
    view.when(() => {
      setInterval(animateMap, 5000);
    });

  }).catch(err => {
    console.error('加载地图失败:', err)
  })
}

// 功能数据
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
  }
])

// 新闻数据
const newsItems = ref([
  { title: '系统升级公告', content: '我们即将推出新版本，带来更多智能监测功能。', date: '2023-10-01' },
  { title: '用户培训通知', content: '下周三将举办线上培训，帮助用户更好地使用系统。', date: '2023-09-28' }
])

// 用户反馈数据
const feedbacks = ref([
  { content: '系统非常易用，监测数据准确，推荐给所有农户！', author: '张先生' },
  { content: '产量预测功能帮助我提前规划，效果显著。', author: '李女士' },
  { content: '客服响应迅速，问题解决及时。', author: '王先生' }
])

const handleStart = () => {
  router.push('/index')
}
</script>

<style scoped>
.home-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e7eb 100%);
  padding: 0;
  overflow-x: hidden;
}

.hero-section {
  margin-top: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: calc(100vh - 64px);
  position: relative;
  overflow: hidden;
  transition: height 0.5s ease-in-out;
}

/* 滚动后的英雄区域样式 */
.hero-section.hero-minimized {
  height: 300px; /* 滚动后缩小到300px高度 */
}

.hero-section.hero-minimized .hero-content {
  transform: scale(0.8);
}

.map-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.map-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.5));
}

.hero-content {
  text-align: center;
  max-width: 900px;
  position: relative;
  z-index: 2;
  padding: 0 20px;
  transition: transform 0.5s ease;
}

.animate-title {
  font-size: 3.5em;
  color: #ffffff;
  margin-bottom: 25px;
  opacity: 0;
  animation: slideUp 0.8s ease forwards;
  text-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
  font-weight: 600;
  letter-spacing: 2px;
}

.animate-subtitle {
  font-size: 1.5em;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 40px;
  opacity: 0;
  animation: slideUp 0.8s 0.2s ease forwards;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;
}

/* 内容区域样式 */
.content-section {
  position: relative;
  z-index: 3;
  background: white;
  padding-top: 40px;
}

/* 功能部分 */
.features-section {
  padding: 60px 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.section-title {
  text-align: center;
  font-size: 2.5em;
  color: #2c3e50;
  margin-bottom: 60px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 30px;
  padding: 0 20px;
}

.feature-card {
  background: #f9fafb;
  padding: 35px;
  border-radius: 16px;
  text-align: left;
  transition: all 0.3s ease;
  animation: fadeIn 0.8s ease forwards;
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.03);
}

.feature-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  transition: all 0.3s ease;
  z-index: 0;
}

.feature-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.08);
}

.feature-icon {
  font-size: 32px;
  margin-bottom: 25px;
  position: relative;
  z-index: 1;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  color: #1890ff;
}

.feature-card:hover .feature-icon {
  transform: scale(1.1);
}

.feature-card h3 {
  font-size: 1.6em;
  color: #1a1a1a;
  margin-bottom: 15px;
  position: relative;
  z-index: 1;
  font-weight: 600;
}

.feature-card p {
  color: #666;
  line-height: 1.7;
  position: relative;
  z-index: 1;
  font-size: 1.1em;
  margin: 0;
}

/* 新闻部分 */
.news-section {
  padding: 80px 20px;
  max-width: 1200px;
  margin: 0 auto;
  background: #fff;
}

.section-title {
  text-align: center;
  font-size: 2.2em;
  color: #333;
  margin-bottom: 50px;
  font-weight: 600;
}

.news-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  margin-top: 20px;
}

.news-card {
  transition: all 0.3s ease;
  animation: fadeIn 0.8s ease forwards;
  background: #fff;
  border: none;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  border: 1px solid #f0f0f0;
}

.news-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.06);
}

:deep(.el-card__body) {
  padding: 25px;
}

.news-card h3 {
  font-size: 1.25em;
  color: #333;
  margin-bottom: 12px;
  font-weight: 600;
}

.news-card p {
  color: #666;
  line-height: 1.6;
  margin-bottom: 15px;
  font-size: 1em;
}

.news-date {
  color: #1890ff;
  font-size: 0.9em;
  margin-top: 15px;
}

/* 反馈部分 */
.feedback-section {
  padding: 80px 20px;
  max-width: 1200px;
  margin: 0 auto;
  background: #fff;
}

:deep(.el-carousel__item) {
  padding: 10px;
}

.feedback-card {
  background: #fff;
  padding: 35px;
  border-radius: 12px;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  border: 1px solid #f0f0f0;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.feedback-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.06);
}

.feedback-quote-icon {
  font-size: 48px;
  color: #f0f0f0;
  position: absolute;
  top: 20px;
  left: 20px;
  line-height: 1;
}

.feedback-content {
  font-size: 1.1em;
  color: #333;
  margin-bottom: 20px;
  line-height: 1.6;
  position: relative;
  z-index: 1;
}

.feedback-author {
  color: #1890ff;
  font-weight: 500;
  text-align: right;
  font-size: 1em;
}

/* 页脚 */
.footer {
  background: #f8f9fa;
  color: #666;
  padding: 30px 20px;
  text-align: center;
  margin-top: 0;
  border-top: 1px solid #eee;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
}

.footer-links {
  margin-top: 15px;
}

.footer-links a {
  color: #666;
  margin: 0 15px;
  text-decoration: none;
  font-size: 0.9em;
}

.footer-links a:hover {
  color: #1890ff;
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

@keyframes shimmer {
  100% {
    left: 100%;
  }
}

@media (max-width: 768px) {
  .hero-section {
    padding: 40px 20px;
  }

  .hero-section.hero-minimized {
    height: 200px;
  }

  .animate-title {
    font-size: 2.5em;
  }

  .animate-subtitle {
    font-size: 1.2em;
  }
}

.start-button {
  margin-top: 60px;
  padding: 15px 35px;
  font-size: 1.1em;
  border-radius: 30px;
  background: linear-gradient(135deg, #409EFF 0%, #36D1DC 100%);
  border: none;
  color: white;
  font-weight: 500;
  letter-spacing: 1px;
  box-shadow: 0 5px 20px rgba(64, 158, 255, 0.4);
  transition: all 0.3s ease;
  opacity: 0;
  animation: fadeIn 0.8s 0.4s forwards;
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
  z-index: 10;
  margin-left: auto;
  margin-right: auto;
}

.start-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(64, 158, 255, 0.6);
  background: linear-gradient(135deg, #5aabff 0%, #45e6eb 100%);
}

.start-button:active {
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(64, 158, 255, 0.4);
}

.start-button .el-icon {
  font-size: 1.2em;
  transition: transform 0.3s ease;
}

.start-button:hover .el-icon {
  transform: translateX(5px);
}
</style> 
