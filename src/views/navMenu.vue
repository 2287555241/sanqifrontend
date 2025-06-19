<template>
  <el-aside 
    width="64px" 
    class="aside"
  >
    <el-menu
      class="el-menu-vertical-demo custom-menu full-height-menu"
      :default-active="activeIndex"
      background-color="#1a1a1a"
      text-color="#b8b8b8"
      active-text-color="#e6e6e6"
      style="height: 100%; border-right: none;"
      collapse
    >
      <div class="menu-items-wrapper">
        <el-menu-item
          v-for="item in asidelist"
          :key="item.id"
          :index="item.id.toString()"
          @click="handleMenuItemClick(item)"
        >
          <el-icon><component :is="item.icon" /></el-icon>
          <template #title>{{item.title}}</template>
        </el-menu-item>
      </div>
    </el-menu>

    <!-- 影像处理对话框 -->
    <DraggableDialog
      :visible="dialogStates[1].visible"
      :title="dialogStates[1].title"
      :initial-position="{ x: 100, y: 100 }"
      @close="closeDialog(1)"
    >
      <div>
        <h3>数据查询功能</h3>
        <p>数据查询功能包括：</p>
        <ul>
          <li>区域查询</li>
          <li>时间查询</li>
          <li>条件筛选</li>
        </ul>
      </div>
    </DraggableDialog>

    <!-- 对话框已删除 -->

    <!-- 数据管理对话框 -->
    <DataManagementDialog
      :visible="dataManagementVisible"
      @close="closeDataManagement"
    />

    <!-- 遥感处理对话框 -->
    <RemoteSensingProcessor
      v-model="showRemoteSensingDialog"
      @addLayer="handleAddLayer"
    />

    <!-- GSF服务对话框 -->
    <GSFService
      v-model="showGSFServiceDialog"
      @addLayer="handleAddLayer"
    />
  </el-aside>
</template>

<script setup>
import { ref, defineEmits, defineProps, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import DraggableDialog from '../components/DraggableDialog.vue'
import DataManagementDialog from '../components/DataManagementDialog.vue'
import RemoteSensingProcessor from '../components/RemoteSensingProcessor.vue'
import GSFService from './GSFService.vue'
import {
  Picture,
  Crop,
  DataAnalysis,
  Histogram,
  Download,
  DataBoard,
  Upload,
  Management,
  PieChart,
  Monitor,
  Connection,
  Share
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { emitter, activeView, Events } from '../utils/eventBus'

const props = defineProps({
  dataManagementVisible: {
    type: Boolean,
    default: false
  }
})

const router = useRouter()
const route = useRoute()
const activeIndex = ref('') // 初始不选中任何项
const dialogStates = ref({
  1: { visible: false, title: '数据查询' }
})

let asidelist = ref([
   {id:0, title:'遥感处理', icon:Monitor},
   {id:1, title:'数据查询', icon:Picture, route: '/tianditu', view: 'map'},
   {id:2, title:'种植区提取', icon:Crop},
   {id:3, title:'产量估算', icon:DataAnalysis},
   {id:4, title:'耕地数据叠加与分析', icon:Histogram},
   {id:5, title:'数据导出', icon:Download},
   {id:6, title:'数据管理', icon:DataBoard},
   {id:7, title:'地图测试', icon:Connection, externalLink: 'http://localhost:9191/webapp/CombinedMap.html'},
   {id:8, title:'GSF服务', icon:Share}
])

// 在组件挂载时根据当前路由和视图状态设置选中项
onMounted(() => {
  updateActiveIndex()
  
  // 监听路由变化
  watch(() => route.path, () => {
    updateActiveIndex()
  })
  
  // 监听activeView变化
  watch(() => activeView.value, () => {
    updateActiveIndex()
  })
})

// 更新选中的菜单项
const updateActiveIndex = () => {
  // 如果是地图页面，检查是否有projectId
  if (route.path === '/tianditu') {
    // 如果从项目创建页面跳转过来，不选中任何菜单项
    if (route.query.projectId) {
      activeIndex.value = ''
    } else {
      // 否则选中数据查询
      activeIndex.value = '1'
    }
  } else {
    // 根据当前activeView设置选中项
    const activeItem = asidelist.value.find(item => item.view === activeView.value)
    if (activeItem) {
      activeIndex.value = activeItem.id.toString()
    }
  }
}

// 对话框状态
const dataManagementVisible = ref(false)
const showRemoteSensingDialog = ref(false)
const showGSFServiceDialog = ref(false)

const handleMenuItemClick = (item) => {
  // 更新当前活动视图
  activeView.value = item.view
  activeIndex.value = item.id.toString()
  
  // 发送事件通知内容区域刷新
  emitter.emit(Events.REFRESH_CONTENT, { view: item.view, id: item.id })
  
  // 如果是地图相关视图，发送清除地图事件
  if (item.view !== 'map' && activeView.value === 'map') {
    emitter.emit(Events.CLEAR_MAP)
  }
  
  if (item.id === 0) {
    // 遥感处理按钮
    showRemoteSensingDialog.value = true
  } else if (item.id === 6) {
    // 数据管理按钮，触发事件给父组件
    emit('openDataManagement')
  } else if (item.id === 8) {
    // GSF服务按钮
    showGSFServiceDialog.value = true
  } else if (item.route) {
    // 如果有route属性，则进行路由跳转
    if (item.id === 1) { // 数据查询按钮
      // 构建查询参数对象
      const query = { onlyMap: 'false' }
      
      // 如果有projectId参数，保留它
      if (route.query.projectId) {
        query.projectId = route.query.projectId
      }
      
      router.push({
        path: item.route,
        query: query
      })
    } else {
    router.push(item.route)
    }
  } else if (dialogStates.value[item.id]) {
    // 否则打开对应的对话框
    dialogStates.value[item.id].visible = true
  }
}

const closeDialog = (id) => {
  dialogStates.value[id].visible = false
}

const closeDataManagement = () => {
  // 关闭数据管理对话框
  dataManagementVisible.value = false
}

// 处理添加图层
const handleAddLayer = (layerInfo) => {
  emit('addLayer', layerInfo)
}

const emit = defineEmits(['openDataManagement', 'addLayer', 'openRasterVectorManagement'])
</script>

<style scoped>
.aside {
  height: calc(100vh - 30px);
  min-height: calc(100vh - 30px);
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  background: transparent;
  padding: 0;
  margin-top: 30px;
  position: fixed;
  left: 0;
  top: 0;
  transition: width 0.3s ease;
  z-index: 99;
  overflow-x: hidden; /* 禁止横向滚动条 */
}

.full-height-menu {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  background: #1a1a1a !important;
  border-right: none !important;
  box-shadow: none;
  overflow-x: hidden; /* 禁止横向滚动条 */
}

.menu-items-wrapper {
  flex: 0;
  display: flex;
  flex-direction: column;
  padding-top: 0;
}

.el-menu-vertical-demo {
  height: 100%;
  border-right: none;
  background: transparent;
  overflow-x: hidden; /* 禁止横向滚动条 */
}

.el-menu-item {
  height: 40px !important;
  line-height: 40px !important;
  margin-bottom: 0 !important;
  padding: 0 20px !important;
}

:deep(.el-menu-item) {
  &:hover {
    background-color: #2c2c2c !important;
  }
  
  &.is-active {
    background-color: #2c2c2c !important;
    color: #e6e6e6 !important;
  }
}

:deep(.el-menu--collapse) {
  width: 64px !important;
}

:deep(.el-menu-item .el-icon) {
  color: #b8b8b8 !important;
}

:deep(.el-menu-item.is-active .el-icon) {
  color: #e6e6e6 !important;
}

:deep(.el-menu-item:hover .el-icon) {
  color: #e6e6e6 !important;
}
</style>
