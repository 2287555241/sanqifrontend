<template>
  <div class="nav-header">
    <div class="header-content">
      <!-- 左侧占位元素（用于平衡布局） -->
      <div class="header-left"></div>
      
      <!-- 居中标题 -->
      <div class="title">三七种植遥感监测系统</div>
      
      <!-- 右侧功能区 -->
      <div class="header-right">
        <el-dropdown v-if="isLoggedIn">
          <span class="el-dropdown-link">
            <el-avatar :size="36" src="el-icon-user" />
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="handleClick('profile')">个人信息</el-dropdown-item>
              <el-dropdown-item @click="handleClick('logout')">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        
        <div v-else class="auth-buttons">
          <el-button type="primary" size="small" @click="navigateTo('/login')">登录</el-button>
          <el-button size="small" @click="navigateTo('/login?register=true')">注册</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'

const router = useRouter()

// 判断是否已登录
const isLoggedIn = computed(() => {
  return window.sessionStorage.getItem('token') !== null
})

const handleClick = (action) => {
  if (action === 'profile') {
    router.push('/profile')
  } else if (action === 'logout') {
    ElMessageBox.confirm(
      '确定要退出登录吗？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    ).then(() => {
      // 清除登录信息
      window.sessionStorage.removeItem('token')
      // 跳转到主页
      router.push('/main')
      // 刷新页面
      window.location.reload()
    }).catch(() => {
      // 取消退出
    })
  }
}

const navigateTo = (path) => {
  router.push(path)
}
</script>

<style scoped>
.nav-header {
  width: 100%;
  height: 60px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.header-content {
  width: 100%;
  max-width: 1440px;
  height: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  position: relative; /* 为绝对定位标题提供参照 */
}

/* 左侧占位元素（宽度与右侧功能区一致） */
.header-left {
  width: 120px; /* 根据右侧内容实际宽度调整 */
}

/* 居中标题（绝对定位） */
.title {
  color: #4d87ca;
  font-size: 24px;
  font-weight: bold;
  letter-spacing: 5px;
  text-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

/* 右侧功能区 */
.header-right {
  width: 120px; /* 与左侧占位一致 */
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

/* 以下样式保持不变 */
.el-dropdown-link {
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: transform 0.3s ease;
}

.el-dropdown-link:hover {
  transform: scale(1.05);
}

.el-avatar {
  border: 2px solid #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
}

.el-avatar:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

:deep(.el-dropdown-menu) {
  padding: 8px;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.1);
}

:deep(.el-dropdown-menu__item) {
  padding: 10px 16px;
  border-radius: 6px;
  transition: all 0.3s ease;
}

:deep(.el-dropdown-menu__item:hover) {
  background-color: #f5f7fa;
  color: #409EFF;
}

.auth-buttons {
  display: flex;
  gap: 12px;
}

.auth-buttons .el-button {
  border-radius: 20px;
  transition: all 0.3s ease;
}

.auth-buttons .el-button--primary {
  background: #409EFF;
  border-color: #409EFF;
}

.auth-buttons .el-button--primary:hover {
  background: #5aabff;
  border-color: #5aabff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

.auth-buttons .el-button--default {
  border-color: #dcdfe6;
  background: white;
}

.auth-buttons .el-button--default:hover {
  border-color: #c6e2ff;
  color: #409EFF;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}
</style>
