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

    <!-- 数据分析区对话框（原种植区提取） -->
    <DraggableDialog
      :visible="dialogStates[2].visible"
      :title="dialogStates[2].title"
      :initial-position="{ x: 150, y: 150 }"
      @close="closeDialog(2)"
    >
      <div>
        <h3>数据分析区功能</h3>
        <p>数据分析区功能包括：</p>
        <ul>
          <li>自动识别</li>
          <li>手动绘制</li>
          <li>区域统计</li>
        </ul>
      </div>
    </DraggableDialog>

    <!-- 产量估算对话框 -->
    <DraggableDialog
      :visible="dialogStates[3].visible"
      :title="dialogStates[3].title"
      :initial-position="{ x: 200, y: 200 }"
      @close="closeDialog(3)"
    >
      <div>
        <h3>产量估算功能</h3>
        <p>产量估算功能包括：</p>
        <ul>
          <li>数据采集</li>
          <li>模型分析</li>
          <li>预测报告</li>
        </ul>
      </div>
    </DraggableDialog>

    <!-- 耕地数据叠加与分析对话框 -->
    <DraggableDialog
      :visible="dialogStates[4].visible"
      :title="dialogStates[4].title"
      :initial-position="{ x: 250, y: 250 }"
      @close="closeDialog(4)"
    >
      <div>
        <h3>耕地数据叠加与分析功能</h3>
        <p>耕地数据叠加与分析功能包括：</p>
        <ul>
          <li>数据叠加</li>
          <li>空间分析</li>
          <li>专题制图</li>
        </ul>
      </div>
    </DraggableDialog>

    <!-- 数据导入对话框 -->
    <!-- 数据导出对话框 -->
    <DraggableDialog
      :visible="dialogStates[5].visible"
      :title="dialogStates[5].title"
      :initial-position="{ x: 300, y: 300 }"
      @close="closeDialog(5)"
    >
      <div>
        <h3>数据导出功能</h3>
        <p>数据导出功能包括：</p>
        <ul>
          <li>格式转换</li>
          <li>批量导出</li>
          <li>数据打包</li>
        </ul>
      </div>
    </DraggableDialog>
  </el-aside>
</template>

<script setup>
import { ref, defineEmits, defineProps } from 'vue'
import { useRouter } from 'vue-router'
import DraggableDialog from '../components/DraggableDialog.vue'
import {
  Picture,
  Crop,
  DataAnalysis,
  Histogram,
  Download,
  DataBoard,
  Upload
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  dataManagementVisible: {
    type: Boolean,
    default: false
  }
})

const router = useRouter()
const dialogStates = ref({
  1: { visible: false, title: '数据查询' },
  2: { visible: false, title: '数据分析区' },
  3: { visible: false, title: '产量估算' },
  4: { visible: false, title: '耕地数据叠加与分析' },
  5: { visible: false, title: '数据导出' }
})

let asidelist = ref([
   {id:1, title:'数据查询', icon:Picture, route: '/tianditu'},
   {id:2, title:'数据分析区', icon:Crop},
   {id:3, title:'产量估算', icon:DataAnalysis},
   {id:4, title:'耕地数据叠加与分析', icon:Histogram},
   {id:5, title:'数据导出', icon:Download},
   {id:6, title:'数据管理', icon:DataBoard, route: '/data-management'} // 数据管理菜单项
])

const handleMenuItemClick = (item) => {
  if (item.id === 6) {
    // 数据管理按钮，触发事件给父组件
    // emit 事件
    emit('openDataManagement')
  } else if (item.route) {
    // 如果有route属性，则进行路由跳转
    router.push(item.route)
  } else if (dialogStates.value[item.id]) {
    // 否则打开对应的对话框
    dialogStates.value[item.id].visible = true
  }
}

const closeDialog = (id) => {
  dialogStates.value[id].visible = false
}

const emit = defineEmits(['openDataManagement'])
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
