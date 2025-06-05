<template>
  <div class="service-page">
    <nav-header></nav-header>
    <div class="service-container">
      <div class="service-header">
        <h1>系统功能介绍</h1>
        <p>基于遥感技术的三七种植监测系统，为您提供全方位的种植管理解决方案</p>
      </div>

      <div class="feature-sections">
        <!-- 数据管理模块 -->
        <div class="feature-section">
          <div class="section-content">
            <div class="section-text">
              <h2>数据管理</h2>
              <p class="section-description">
                提供完整的遥感数据管理功能，支持多种数据格式的导入、存储和管理。
              </p>
              <ul class="feature-list">
                <li>
                  <el-icon><Document /></el-icon>
                  <span>支持多种遥感数据格式导入</span>
                </li>
                <li>
                  <el-icon><Files /></el-icon>
                  <span>数据分类管理与检索</span>
                </li>
                <li>
                  <el-icon><View /></el-icon>
                  <span>数据可视化预览</span>
                </li>
              </ul>
            </div>
            <div class="section-image">
              <el-image 
                src="/images/data-management.png"
                fit="cover"
                :lazy="true"
              >
                <template #error>
                  <div class="image-slot">
                    <el-icon><Picture /></el-icon>
                  </div>
                </template>
              </el-image>
            </div>
          </div>
        </div>

        <!-- 遥感监测模块 -->
        <div class="feature-section reverse">
          <div class="section-content">
            <div class="section-text">
              <h2>遥感监测</h2>
              <p class="section-description">
                利用先进的遥感技术，实时监测三七种植区域的生长状况。
              </p>
              <ul class="feature-list">
                <li>
                  <el-icon><Monitor /></el-icon>
                  <span>实时生长状况监测</span>
                </li>
                <li>
                  <el-icon><Histogram /></el-icon>
                  <span>生长指标分析</span>
                </li>
                <li>
                  <el-icon><MapLocation /></el-icon>
                  <span>种植区域分布图</span>
                </li>
              </ul>
            </div>
            <div class="section-image">
              <el-image 
                src="/images/remote-sensing.png"
                fit="cover"
                :lazy="true"
              >
                <template #error>
                  <div class="image-slot">
                    <el-icon><Picture /></el-icon>
                  </div>
                </template>
              </el-image>
            </div>
          </div>
        </div>

        <!-- 数据分析模块 -->
        <div class="feature-section">
          <div class="section-content">
            <div class="section-text">
              <h2>数据分析</h2>
              <p class="section-description">
                强大的数据分析功能，为种植决策提供科学依据。
              </p>
              <ul class="feature-list">
                <li>
                  <el-icon><DataAnalysis /></el-icon>
                  <span>生长趋势分析</span>
                </li>
                <li>
                  <el-icon><TrendCharts /></el-icon>
                  <span>产量预测评估</span>
                </li>
                <li>
                  <el-icon><DocumentCopy /></el-icon>
                  <span>分析报告生成</span>
                </li>
              </ul>
            </div>
            <div class="section-image">
              <el-image 
                src="/images/data-analysis.png"
                fit="cover"
                :lazy="true"
              >
                <template #error>
                  <div class="image-slot">
                    <el-icon><Picture /></el-icon>
                  </div>
                </template>
              </el-image>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import NavHeader from '@/views/navHeader.vue'
import { 
  Document, 
  Files, 
  View, 
  Picture, 
  Monitor, 
  Histogram, 
  MapLocation,
  DataAnalysis,
  TrendCharts,
  DocumentCopy
} from '@element-plus/icons-vue'
</script>

<style scoped>
.service-page {
  min-height: 100vh;
  background-color: #f8fafc;
}

.service-container {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
  margin-top: 64px;
}

.service-header {
  text-align: center;
  padding: 60px 0;
  margin-bottom: 40px;
}

.service-header h1 {
  font-size: 2.8em;
  color: #1a1a1a;
  margin-bottom: 20px;
  font-weight: 600;
}

.service-header p {
  font-size: 1.3em;
  color: #666;
  max-width: 800px;
  margin: 0 auto;
  line-height: 1.6;
}

.feature-sections {
  display: flex;
  flex-direction: column;
  gap: 100px;
}

.feature-section {
  padding: 40px 20px;
  border-radius: 20px;
  background: linear-gradient(145deg, #ffffff, #f8fafc);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
}

.section-content {
  display: flex;
  align-items: center;
  gap: 60px;
  max-width: 1000px;
  margin: 0 auto;
}

.reverse .section-content {
  flex-direction: row-reverse;
}

.section-text {
  flex: 1;
}

.section-text h2 {
  font-size: 2em;
  color: #1a1a1a;
  margin-bottom: 20px;
  font-weight: 600;
}

.section-description {
  font-size: 1.1em;
  color: #666;
  line-height: 1.6;
  margin-bottom: 30px;
}

.feature-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.feature-list li {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  font-size: 1.1em;
  color: #4a4a4a;
}

.feature-list .el-icon {
  margin-right: 12px;
  font-size: 1.4em;
  color: #409EFF;
  background: rgba(64, 158, 255, 0.1);
  padding: 8px;
  border-radius: 8px;
}

.section-image {
  flex: 1;
  max-width: 500px;
}

.el-image {
  width: 100%;
  height: 300px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
}

.image-slot {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background: #f5f7fa;
  color: #909399;
}

.image-slot .el-icon {
  font-size: 3em;
}

@media (max-width: 768px) {
  .section-content {
    flex-direction: column;
    gap: 40px;
  }

  .reverse .section-content {
    flex-direction: column;
  }

  .section-image {
    max-width: 100%;
  }

  .service-header h1 {
    font-size: 2.2em;
  }

  .service-header p {
    font-size: 1.1em;
  }
}
</style>
