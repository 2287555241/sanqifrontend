<template>
  <el-aside :width="isCollapse ? '64px' : '200px'" class="aside">
    <div class="menu-header">
      <el-button 
        type="text" 
        class="toggle-button"
        @click="toggleMenu"
      >
        <el-icon :size="20">
          <component :is="isCollapse ? Expand : Fold" />
        </el-icon>
      </el-button>
    </div>
    <el-menu
      class="el-menu-vertical-demo custom-menu full-height-menu"
      :default-active="activeIndex"
      background-color="rgba(255,255,255,0.7)"
      text-color="#333"
      active-text-color="#409EFF"
      style="height: 100%; border-right: none;"
      :collapse="isCollapse"
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
        <h3>影像处理功能</h3>
        <p>影像处理功能包括：</p>
        <ul>
          <li>影像校正</li>
          <li>影像增强</li>
          <li>影像分类</li>
        </ul>
      </div>
    </DraggableDialog>

    <!-- 种植区提取对话框 -->
    <DraggableDialog
      :visible="dialogStates[2].visible"
      :title="dialogStates[2].title"
      :initial-position="{ x: 150, y: 150 }"
      @close="closeDialog(2)"
    >
      <div>
        <h3>种植区提取功能</h3>
        <p>种植区提取功能包括：</p>
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
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import DraggableDialog from '../components/DraggableDialog.vue'
import {
  Picture,
  Crop,
  DataAnalysis,
  Histogram,
  Download,
  Fold,
  Expand,
  DataBoard
} from '@element-plus/icons-vue'

const router = useRouter()
const isCollapse = ref(true)
const dialogStates = ref({
  1: { visible: false, title: '影像处理' },
  2: { visible: false, title: '种植区提取' },
  3: { visible: false, title: '产量估算' },
  4: { visible: false, title: '耕地数据叠加与分析' },
  5: { visible: false, title: '数据导出' }
})

let asidelist = ref([
   {id:1, title:'影像处理', icon:Picture},
   {id:2, title:'种植区提取', icon:Crop},
   {id:3, title:'产量估算', icon:DataAnalysis},
   {id:4, title:'耕地数据叠加与分析', icon:Histogram},
   {id:5, title:'数据导出', icon:Download},
   {id:6, title:'数据管理', icon:DataBoard, route: '/data-management'} // 新增数据管理菜单项
])

const toggleMenu = () => {
  isCollapse.value = !isCollapse.value
}

const handleMenuItemClick = (item) => {
  if (item.route) {
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
</script>

<!-- 样式保持不变 -->
<style scoped>
.aside {
  height: calc(100vh - 64px);
  min-height: calc(100vh - 64px);
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  background: transparent;
  padding: 0;
  margin-top: 64px;
  position: fixed;
  left: 0;
  top: 0;
  transition: width 0.3s ease;
}

.menu-header {
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255,255,255,0.7);
  border-bottom: 1px solid rgba(0,0,0,0.1);
}

.toggle-button {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #409EFF;
  transition: all 0.3s ease;
}

.toggle-button:hover {
  background: rgba(64,158,255,0.1);
}

.full-height-menu {
  height: calc(100% - 50px);
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  background: rgba(255,255,255,0.7) !important;
  border-right: none !important;
  box-shadow: none;
}

.menu-items-wrapper {
  flex: 0;
  display: flex;
  flex-direction: column;
  padding-top: 20px;
}

.el-menu-vertical-demo {
  height: 100%;
  border-right: none;
  background: transparent;
}

.el-menu-item {
  height: 60px !important;
  line-height: 60px !important;
  margin-bottom: 8px !important;
}
</style>
