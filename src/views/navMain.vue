<template>
  <div class="nav-main-container">
    <div class="workspace">
      <div class="workspace-content">
        <!-- 使用动态组件显示当前路由对应的组件 -->
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

// 监听路由变化
watch(() => route.path, (newPath) => {
  console.log('当前路由路径:', newPath);
});

onMounted(() => {
  console.log('navMain组件已挂载，当前路由:', route.path);
});
</script>

<style scoped>
.nav-main-container {
  width: 100%;
  height: 100vh;
  background-color: #1a1a1a;
  padding: 30px 64px 0 64px; /* 顶部30px(header高度)，左侧64px(收起的菜单宽度) */
  box-sizing: border-box;
}

.workspace {
  width: 100%;
  height: 100%;
  background-color: #1a1a1a;
  border-radius: 4px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.workspace-content {
  width: 100%;
  height: 100%;
  background-color: #2c2c2c; /* 调整为稍浅的深色 */
  border-radius: 4px;
  position: relative;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2); /* 添加轻微阴影以增加层次感 */
  overflow: hidden; /* 防止内容溢出 */
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
