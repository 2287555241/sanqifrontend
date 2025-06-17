<template>
  <div class="project-dialog-overlay" @click="closeDialog">
    <div class="project-dialog" @click.stop>
      <div class="dialog-header">
        <h3>新建项目</h3>
        <el-button class="close-btn" @click="closeDialog" circle>
          <el-icon><Close /></el-icon>
        </el-button>
      </div>

      <div class="dialog-content">
        <div class="templates-section">
          <div class="section-header">
            <h4>项目模板</h4>
            <div class="template-actions">
              <el-tooltip content="导入模板" placement="top">
                <el-button size="small" circle @click="handleImportProject">
                  <el-icon><Upload /></el-icon>
                </el-button>
              </el-tooltip>
              <el-tooltip content="管理模板" placement="top">
                <el-button size="small" circle @click="showAdvancedOptions = true">
                  <el-icon><Setting /></el-icon>
                </el-button>
              </el-tooltip>
            </div>
          </div>
          
          <div class="template-grid">
            <div 
              v-for="template in templates" 
              :key="template.id"
              class="template-item"
              :class="{ active: selectedTemplate === template.id }"
              @click="selectTemplate(template)"
            >
              <el-icon><component :is="template.icon" /></el-icon>
              <span>{{ template.name }}</span>
              <span class="template-size">{{ template.width }} x {{ template.height }} px</span>
            </div>
          </div>
          
          <div v-if="recentProjects.length > 0" class="recent-projects">
            <h4>最近使用的项目</h4>
            <div class="recent-list">
              <div 
                v-for="project in recentProjects" 
                :key="project.id" 
                class="recent-item"
                @click="projectForm = { ...project }"
              >
                <div class="recent-info">
                  <span class="recent-name">{{ project.name }}</span>
                  <span class="recent-size">{{ project.width }} x {{ project.height }} px</span>
                </div>
                <el-button size="small" type="primary" @click.stop="handleLoadTemplate">
                  使用
                </el-button>
              </div>
            </div>
          </div>
        </div>

        <div class="settings-section">
          <div class="form-group">
            <label>项目名称</label>
            <el-input v-model="projectForm.name" placeholder="未命名项目-1" />
          </div>

          <div class="form-group">
            <div class="dimensions-header">
              <label>尺寸</label>
              <el-dropdown trigger="click">
                <span class="preset-dropdown">
                  常用尺寸
                  <el-icon><arrow-down /></el-icon>
                </span>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item 
                      v-for="size in commonSizes" 
                      :key="size.name"
                      @click="selectPresetSize(size)"
                    >
                      {{ size.name }}
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
            <div class="dimension-inputs">
              <div>
                <label>宽度</label>
                <el-input-number v-model="projectForm.width" :min="1" controls-position="right" />
              </div>
              <div>
                <label>高度</label>
                <el-input-number v-model="projectForm.height" :min="1" controls-position="right" />
              </div>
              <div>
                <label>单位</label>
                <el-select value="px" disabled>
                  <el-option label="px" value="px" />
                </el-select>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label>分辨率</label>
            <div class="resolution-input">
              <el-input-number v-model="projectForm.resolution" :min="1" controls-position="right" />
              <span>像素/英寸</span>
            </div>
          </div>

          <div class="form-group">
            <label>颜色模式</label>
            <el-select v-model="projectForm.colorMode">
              <el-option label="RGB 颜色" value="RGB 颜色" />
              <el-option label="CMYK 颜色" value="CMYK 颜色" />
              <el-option label="灰度" value="灰度" />
            </el-select>
          </div>

          <div class="form-group">
            <label>背景内容</label>
            <el-select v-model="projectForm.background">
              <el-option label="白色" value="白色" />
              <el-option label="黑色" value="黑色" />
              <el-option label="透明" value="透明" />
              <el-option label="自定义..." value="custom" />
            </el-select>
          </div>

          <div class="form-group advanced-section">
            <el-collapse v-model="showAdvancedOptions">
              <el-collapse-item name="advanced">
                <template #title>
                  <span class="advanced-title">高级选项</span>
                </template>
                
                <div class="advanced-options">
                  <div class="form-group">
                    <label>项目标签</label>
                    <el-select
                      v-model="projectForm.tags"
                      multiple
                      filterable
                      allow-create
                      default-first-option
                      placeholder="添加标签"
                    >
                      <el-option label="地图" value="地图" />
                      <el-option label="分析" value="分析" />
                      <el-option label="展示" value="展示" />
                    </el-select>
                  </div>
                  
                  <div class="form-group">
                    <el-checkbox v-model="projectForm.isTemplate">保存为模板</el-checkbox>
                  </div>
                </div>
              </el-collapse-item>
            </el-collapse>
          </div>
        </div>
      </div>

      <div class="dialog-footer">
        <div class="footer-actions">
          <el-button @click="handleImportProject" icon="Upload">导入项目</el-button>
        </div>
        <div class="footer-buttons">
          <el-button @click="closeDialog">取消</el-button>
          <el-button type="primary" @click="handleCreate">创建</el-button>
        </div>
      </div>
    </div>
  </div>

  <!-- 添加项目名称显示的样式 -->
  <div class="project-name-display">
    {{ projectForm.name }}
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, reactive } from 'vue'
import { Document, Close, Plus, Delete, Star, Download, Upload, Setting, Edit } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { useProjectStore } from '../stores/project'
import { ElMessage } from 'element-plus'

const router = useRouter()
const projectStore = useProjectStore()
const emit = defineEmits(['close'])

// 模板数据
const templates = reactive([
  { id: 'standard', name: '标准项目', width: 1920, height: 1080, icon: Document },
  { id: 'mobile', name: '移动端项目', width: 750, height: 1334, icon: Document },
  { id: 'tablet', name: '平板项目', width: 2048, height: 1536, icon: Document },
  { id: 'custom', name: '自定义', width: 1200, height: 800, icon: Edit }
])

// 常用项目尺寸
const commonSizes = reactive([
  { name: 'HD (1280×720)', width: 1280, height: 720 },
  { name: 'Full HD (1920×1080)', width: 1920, height: 1080 },
  { name: '4K UHD (3840×2160)', width: 3840, height: 2160 },
  { name: 'A4 (300dpi)', width: 2480, height: 3508 },
  { name: '微信公众号', width: 900, height: 500 }
])

// 项目表单
const projectForm = reactive({
  name: '未命名项目-1',
  width: 1920,
  height: 1080,
  resolution: 300,
  colorMode: 'RGB 颜色',
  background: '白色',
  isTemplate: false,
  tags: []
})

const selectedTemplate = ref('standard')
const showAdvancedOptions = ref(false)
const recentProjects = ref([])

// 加载最近项目
const loadRecentProjects = () => {
  const savedProjects = localStorage.getItem('recentProjects')
  if (savedProjects) {
    recentProjects.value = JSON.parse(savedProjects).slice(0, 5)
  }
}

// 选择模板
const selectTemplate = (template) => {
  selectedTemplate.value = template.id
  projectForm.width = template.width
  projectForm.height = template.height
}

// 选择预设尺寸
const selectPresetSize = (size) => {
  projectForm.width = size.width
  projectForm.height = size.height
}

// 关闭对话框
const closeDialog = () => {
  emit('close')
}

// 创建项目
const handleCreate = () => {
  if (!projectForm.name.trim()) {
    ElMessage.warning('请输入项目名称')
    return
  }

  // 保存项目信息到 store
  const projectInfo = {
    id: Date.now().toString(),
    name: projectForm.name,
    width: projectForm.width,
    height: projectForm.height,
    resolution: projectForm.resolution,
    colorMode: projectForm.colorMode,
    background: projectForm.background,
    template: selectedTemplate.value,
    createdAt: new Date().toISOString(),
    isTemplate: projectForm.isTemplate,
    tags: projectForm.tags,
    // 添加云南省的默认地图中心点和缩放级别
    mapCenter: [102.8, 25.04], // 云南省中心位置
    mapZoom: 8,
    mapPitch: 0, // 设置为0，确保地图不倾斜
    mapRotation: 0 // 设置为0，确保地图不旋转
  }
  
  projectStore.setCurrentProject(projectInfo)
  
  // 保存到最近项目列表
  const savedProjects = localStorage.getItem('recentProjects')
  let projects = savedProjects ? JSON.parse(savedProjects) : []
  projects.unshift(projectInfo)
  projects = projects.slice(0, 10) // 只保留最近10个项目
  localStorage.setItem('recentProjects', JSON.stringify(projects))
  
  // 关闭对话框
  closeDialog()
  
  console.log('跳转到地图页面，项目ID:', projectInfo.id)
  
  // 跳转到地图页面
  router.push({ 
    path: '/tianditu',
    query: { 
      projectId: projectInfo.id,
      onlyMap: 'true' // 设置为纯地图模式，不显示三七数据
    }
  }).catch(err => {
    console.error('导航错误:', err)
    ElMessage.error('导航到地图页面失败，请重试')
  })
  
  ElMessage.success('项目创建成功')
}

// 加载模板
const handleLoadTemplate = () => {
  // 模拟加载模板的功能
  ElMessage.success('模板加载成功')
}

// 导入项目
const handleImportProject = () => {
  // 模拟导入项目的功能
  ElMessage.info('项目导入功能即将上线')
}

// 创建时加载最近项目
loadRecentProjects()

// 拖动相关
const dialogRef = ref(null)
const isDragging = ref(false)
const dragOffset = reactive({ x: 0, y: 0 })
const position = reactive({ x: 0, y: 0 })

// 初始化位置到屏幕中心
onMounted(() => {
  const dialog = dialogRef.value
  if (dialog) {
    const rect = dialog.getBoundingClientRect()
    position.x = (window.innerWidth - rect.width) / 2
    position.y = (window.innerHeight - rect.height) / 2
  }
})

const startDrag = (e) => {
  // 如果点击的是关闭按钮，不启动拖动
  if (e.target.closest('.close-btn')) return
  
  isDragging.value = true
  const rect = dialogRef.value.getBoundingClientRect()
  
  // 计算鼠标在对话框内的相对位置
  dragOffset.x = e.clientX - rect.left
  dragOffset.y = e.clientY - rect.top
  
  // 添加全局事件监听
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
  
  // 改变鼠标样式
  document.body.style.cursor = 'move'
}

const onDrag = (e) => {
  if (!isDragging.value) return
  
  // 计算新位置
  position.x = e.clientX - dragOffset.x
  position.y = e.clientY - dragOffset.y
  
  // 防止对话框被拖出屏幕
  const dialog = dialogRef.value
  const rect = dialog.getBoundingClientRect()
  
  // 限制左右边界
  if (position.x < 0) position.x = 0
  if (position.x + rect.width > window.innerWidth) {
    position.x = window.innerWidth - rect.width
  }
  
  // 限制上下边界
  if (position.y < 0) position.y = 0
  if (position.y + rect.height > window.innerHeight) {
    position.y = window.innerHeight - rect.height
  }
}

const stopDrag = () => {
  if (!isDragging.value) return
  
  isDragging.value = false
  
  // 移除全局事件监听
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
  
  // 恢复鼠标样式
  document.body.style.cursor = 'default'
}

// 组件卸载时清理
onUnmounted(() => {
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
})
</script>

<style>
.project-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 2000;
  display: flex;
  justify-content: center;
  align-items: center;
}

.project-dialog {
  background-color: #2c2c2c;
  border-radius: 6px;
  width: 900px;
  display: flex;
  flex-direction: column;
  color: #e6e6e6;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
  position: relative;
  z-index: 2001;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #3c3c3c;
  background-color: #2c2c2c;
  border-radius: 6px 6px 0 0;
}

.dialog-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
}

.close-btn {
  padding: 8px !important;
}

.dialog-content {
  display: flex;
  padding: 20px;
  gap: 40px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-header h4 {
  margin: 0;
  font-size: 14px;
  color: #999;
}

.template-actions {
  display: flex;
  gap: 8px;
}

.templates-section {
  width: 360px;
  flex-shrink: 0;
}

.templates-section h4 {
  margin: 0 0 16px 0;
  font-size: 14px;
  color: #999;
}

.template-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.template-item {
  background-color: #363636;
  border-radius: 4px;
  padding: 16px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  border: 2px solid transparent;
  height: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.template-item:hover {
  background-color: #404040;
}

.template-item.active {
  border-color: #409eff;
  background-color: #404040;
}

.template-item .el-icon {
  font-size: 32px;
  margin-bottom: 12px;
}

.template-item span {
  display: block;
}

.template-size {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.recent-projects {
  margin-top: 24px;
}

.recent-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.recent-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #363636;
  padding: 12px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.recent-item:hover {
  background-color: #404040;
}

.recent-info {
  display: flex;
  flex-direction: column;
}

.recent-name {
  font-weight: 500;
}

.recent-size {
  font-size: 12px;
  color: #999;
}

.settings-section {
  flex: 1;
  min-width: 300px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #999;
}

.dimensions-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.preset-dropdown {
  color: #409eff;
  cursor: pointer;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.dimension-inputs {
  display: grid;
  grid-template-columns: 2fr 2fr 1fr;
  gap: 12px;
}

.dimension-inputs .el-input-number,
.dimension-inputs .el-select {
  width: 100%;
}

.resolution-input {
  display: flex;
  align-items: center;
  gap: 8px;
}

.resolution-input span {
  color: #999;
}

.advanced-section {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #3c3c3c;
}

.advanced-title {
  font-size: 14px;
  color: #999;
}

.advanced-options {
  padding-top: 16px;
}

.dialog-footer {
  padding: 16px 20px;
  border-top: 1px solid #3c3c3c;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.footer-buttons {
  display: flex;
  gap: 12px;
}

:deep(.el-input__wrapper) {
  background-color: #363636;
  box-shadow: none;
}

:deep(.el-input__wrapper:hover) {
  background-color: #404040;
}

:deep(.el-input__inner) {
  color: #e6e6e6;
}

:deep(.el-select) {
  width: 100%;
}

:deep(.el-input-number .el-input__wrapper) {
  padding: 0;
}

:deep(.el-input-number .el-input__inner) {
  text-align: center;
  padding: 0 8px;
  height: 32px;
}

:deep(.el-input-number__decrease),
:deep(.el-input-number__increase) {
  display: none !important;
}

:deep(.el-select .el-input__wrapper) {
  padding: 0 8px;
}

:deep(.el-select .el-input__inner) {
  height: 32px;
}

:deep(.el-button) {
  border-color: #4c4c4c;
  background-color: #363636;
  color: #e6e6e6;
}

:deep(.el-button:hover) {
  background-color: #404040;
  border-color: #4c4c4c;
}

:deep(.el-button--primary) {
  background-color: #409eff;
  border-color: #409eff;
}

:deep(.el-button--primary:hover) {
  background-color: #66b1ff;
  border-color: #66b1ff;
}

:deep(.el-collapse) {
  border: none;
  background-color: transparent;
}

:deep(.el-collapse-item__header) {
  background-color: transparent;
  border-bottom: none;
  color: #e6e6e6;
  height: 40px;
  line-height: 40px;
}

:deep(.el-collapse-item__content) {
  background-color: transparent;
  color: #e6e6e6;
  padding-bottom: 0;
}

:deep(.el-checkbox__label) {
  color: #e6e6e6;
}

/* 添加项目名称显示的样式 */
.project-name-display {
  position: fixed;
  bottom: 20px;
  left: 20px;
  background-color: rgba(44, 44, 44, 0.9);
  padding: 8px 16px;
  border-radius: 4px;
  color: #e6e6e6;
  font-size: 14px;
  z-index: 1000;
}
</style> 