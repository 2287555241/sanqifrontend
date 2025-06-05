<template>
  <div class="header">
    <div class="header-content">
      <div class="header-left">
        <div class="logo">
          <img src="../assets/logo.png" alt="Logo" />
        </div>
      </div>
      <div class="nav-buttons">
        <el-button class="nav-button" type="text" @click="navigateTo('/main')">首页</el-button>
        <el-button class="nav-button" type="text" @click="navigateTo('/service')">服务</el-button>
        <el-button class="nav-button" type="text" @click="navigateTo('/help')">帮助中心</el-button>
        <el-button class="nav-button" type="text" @click="navigateTo('/about')">关于我们</el-button>
      </div>
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
import { ref, computed } from 'vue'
import { Bell, QuestionFilled, CirclePlus, User, Setting, SwitchButton } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'

const router = useRouter()

const isLoggedIn = computed(() => {
  return window.sessionStorage.getItem('token') !== null
})

const handleClick = (action) => {
  console.log('点击了按钮:', action)
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
      window.sessionStorage.removeItem('userInfo')
      
      // 使用ElMessage显示退出成功提示
      ElMessage({
        message: '退出登录成功',
        type: 'success',
        duration: 2000
      })
      
      // 强制刷新当前页面以更新状态
      setTimeout(() => {
        window.location.href = '/'
      }, 300)
    }).catch(() => {
      // 取消退出
    })
  }
}

const navigateTo = (path) => {
  router.push(path)
}

const userMenuItems = [
  { icon: User, text: '个人信息', action: 'profile' },
  { icon: Setting, text: '设置', action: 'settings' },
  { icon: SwitchButton, text: '退出登录', action: 'logout' }
]
</script>

<style scoped>
.header {
  width: 100%;
  height: 64px;
  background: rgba(255, 255, 255, 0.95);
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
  box-shadow: 0 2px 10px rgba(0,0,0,0.08);
  border-bottom: 1px solid rgba(234, 234, 234, 0.8);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.header-content {
  max-width: 1440px;
  height: 100%;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 40px;
}

.header-left {
  display: flex;
  align-items: center;
}

.logo {
  height: 40px;
  display: flex;
  align-items: center;
}

.logo img {
  height: 100%;
  object-fit: contain;
}

.nav-buttons {
  display: flex;
  gap: 40px;
  margin: 0 auto;
}

.nav-button {
  font-size: 15px;
  font-weight: 500;
  color: #333;
  padding: 0 8px;
  height: 64px;
  line-height: 64px;
  position: relative;
  transition: all 0.3s ease;
  border: none;
  box-shadow: none;
  background: transparent;
  letter-spacing: 1px;
}

.nav-button:hover {
  color: #409EFF;
  border: none;
  background: transparent;
}

.nav-button::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 3px;
  background: #409EFF;
  transition: width 0.3s ease;
}

.nav-button:hover::after {
  width: 100%;
}

.header-right {
  display: flex;
  align-items: center;
}

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

/* 确保Element Plus按钮样式被完全覆盖 */
:deep(.nav-button.el-button) {
  border: none !important;
  background: transparent !important;
  box-shadow: none !important;
}

:deep(.nav-button.el-button:hover),
:deep(.nav-button.el-button:focus),
:deep(.nav-button.el-button:active) {
  border: none !important;
  background: transparent !important;
  box-shadow: none !important;
}

.auth-buttons {
  display: flex;
  gap: 12px;
}

.auth-buttons .el-button {
  border-radius: 20px;
  transition: all 0.3s ease;
  padding: 8px 20px;
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
</style>
