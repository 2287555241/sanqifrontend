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
            <el-avatar :size="36">
              <el-icon><User /></el-icon>
            </el-avatar>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="handleClick('profile')">个人信息</el-dropdown-item>
              <el-dropdown-item @click="handleClick('logout')">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        
        <div v-else class="auth-buttons">
          <el-button type="primary" size="small" @click="showLoginModal('login')">登录</el-button>
          <el-button size="small" @click="showLoginModal('register')">注册</el-button>
        </div>
      </div>
    </div>
    
    <!-- 登录/注册弹窗 -->
    <!-- <login-modal 
      v-model:visible="loginModalVisible" 
      :default-tab="loginModalTab"
      @login-success="handleLoginSuccess"
      @register-success="handleRegisterSuccess"
    /> -->
    
    <!-- 自定义下拉式登录弹窗 -->
    <div class="dropdown-auth-container" v-show="loginModalVisible">
      <div class="dropdown-auth-content" 
           :class="{ 'dropdown-auth-visible': loginModalVisible }"
           @click.stop>
        <div class="auth-container">
          <div class="auth-header">
            <div class="auth-header-top">
              <h2>{{ loginModalTab === 'login' ? '欢迎回来' : '创建账号' }}</h2>
              <el-button class="close-btn" @click="loginModalVisible = false" circle>
                <el-icon><Close /></el-icon>
              </el-button>
            </div>
            <p class="auth-subtitle">{{ loginModalTab === 'login' ? '很高兴再次见到您' : '加入我们，开启您的旅程' }}</p>
          </div>
          
          <div v-if="loginModalTab === 'login'">
            <el-form class="custom-form">
              <el-form-item>
                <el-input 
                  v-model="tempLoginForm.username" 
                  placeholder="请输入用户名"
                  class="custom-input"
                />
              </el-form-item>
              <el-form-item>
                <el-input 
                  v-model="tempLoginForm.password" 
                  type="password" 
                  placeholder="请输入密码"
                  class="custom-input"
                  :prefix-icon="Lock"
                  @keyup.enter="tempLogin"
                />
              </el-form-item>
            </el-form>
            <div class="auth-actions">
              <el-button type="primary" class="auth-submit" @click="tempLogin">登录</el-button>
              <div class="auth-divider">
                <span>还没有账号？</span>
              </div>
              <el-button class="auth-switch" @click="switchToRegister">注册新账号</el-button>
            </div>
          </div>

          <div v-else>
            <el-form class="custom-form">
              <el-form-item>
                <el-input 
                  v-model="tempRegisterForm.username" 
                  placeholder="请输入用户名"
                  class="custom-input"
                />
              </el-form-item>
              <el-form-item>
                <el-input 
                  v-model="tempRegisterForm.password" 
                  type="password" 
                  placeholder="请输入密码"
                  class="custom-input"
                  :prefix-icon="Lock"
                />
              </el-form-item>
              <el-form-item>
                <el-input 
                  v-model="tempRegisterForm.confirmPassword" 
                  type="password" 
                  placeholder="请确认密码"
                  class="custom-input"
                  :prefix-icon="Lock"
                  @keyup.enter="tempRegister"
                />
              </el-form-item>
            </el-form>
            <div class="auth-actions">
              <el-button type="primary" class="auth-submit" @click="tempRegister">注册</el-button>
              <div class="auth-divider">
                <span>已有账号？</span>
              </div>
              <el-button class="auth-switch" @click="switchToLogin">返回登录</el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, reactive } from 'vue'
import { Bell, QuestionFilled, CirclePlus, User, Setting, SwitchButton, Close } from '@element-plus/icons-vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
// import LoginModal from '@/components/LoginModal.vue'
// import mySwitch, { flag } from '@/utils/mySwitch' // 不再导入 mySwitch

const router = useRouter()
const route = useRoute()

// 登录弹窗控制
const loginModalVisible = ref(false)
const loginModalTab = ref('login')

// 监听自定义事件以显示登录弹窗
const handleShowLoginModal = (event) => {
  const tab = event.detail?.tab || 'login'
  showLoginModal(tab)
}

onMounted(() => {
  window.addEventListener('show-login-modal', handleShowLoginModal)
  
  // 检查URL参数是否需要显示登录弹窗
  if (route.query.showLogin === 'true') {
    showLoginModal('login')
    // 清除查询参数
    router.replace({
      path: route.path
    })
  }
})

onUnmounted(() => {
  window.removeEventListener('show-login-modal', handleShowLoginModal)
  document.removeEventListener('click', handleOutsideClick)
})

// 显示登录弹窗
const showLoginModal = (tab) => {
  console.log('点击了登录/注册按钮，tab:', tab)
  console.log('当前登录状态:', isLoggedIn.value)
  
  loginModalTab.value = tab
  loginModalVisible.value = true
  console.log('设置弹窗可见性为:', loginModalVisible.value)
  
  // 添加点击外部区域关闭弹窗的事件
  setTimeout(() => {
    document.addEventListener('click', handleOutsideClick)
  }, 0)
}

// 处理点击外部区域关闭弹窗
const handleOutsideClick = (event) => {
  const dropdown = document.querySelector('.dropdown-auth-content')
  const authButtons = document.querySelector('.auth-buttons')
  const switchButtons = document.querySelectorAll('.auth-switch')
  
  // 检查是否点击了切换按钮
  let clickedSwitchButton = false
  switchButtons.forEach(button => {
    if (button.contains(event.target)) {
      clickedSwitchButton = true
    }
  })
  
  // 如果点击了切换按钮，不关闭弹窗
  if (clickedSwitchButton) {
    return
  }
  
  if (dropdown && !dropdown.contains(event.target) && 
      authButtons && !authButtons.contains(event.target)) {
    loginModalVisible.value = false
    document.removeEventListener('click', handleOutsideClick)
  }
}

// 处理登录/注册切换
const switchToRegister = (event) => {
  console.log('切换到注册表单')
  loginModalTab.value = 'register'
  console.log('切换后 loginModalTab:', loginModalTab.value)
  
  // 可以在这里添加其他逻辑，如重置表单
  tempRegisterForm.username = tempLoginForm.username || ''
  tempRegisterForm.password = ''
  tempRegisterForm.confirmPassword = ''
  
  // 阻止事件冒泡，避免点击事件被外部点击处理器捕获
  if (event) event.stopPropagation()
}

const switchToLogin = (event) => {
  console.log('切换到登录表单')
  loginModalTab.value = 'login'
  console.log('切换后 loginModalTab:', loginModalTab.value)
  
  // 可以在这里添加其他逻辑，如重置表单
  tempLoginForm.username = tempRegisterForm.username || ''
  tempLoginForm.password = ''
  
  // 阻止事件冒泡，避免点击事件被外部点击处理器捕获
  if (event) event.stopPropagation()
}

// 处理登录成功
const handleLoginSuccess = (userData) => {
  loginModalVisible.value = false
  ElMessage.success('登录成功')
  // 刷新页面以更新状态
  setTimeout(() => {
    window.location.reload()
  }, 300)
}

// 处理注册成功
const handleRegisterSuccess = () => {
  loginModalTab.value = 'login' // 切换到登录标签
  ElMessage.success('注册成功，请登录')
}

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

// 临时表单数据
const tempLoginForm = reactive({
  username: '',
  password: ''
})

const tempRegisterForm = reactive({
  username: '',
  password: '',
  confirmPassword: ''
})

// 临时登录方法
const tempLogin = () => {
  if (!tempLoginForm.username || !tempLoginForm.password) {
    ElMessage.warning('请输入用户名和密码')
    return
  }
  
  // 模拟登录成功
  sessionStorage.setItem('token', 'user-authenticated')
  sessionStorage.setItem('userInfo', JSON.stringify({ username: tempLoginForm.username }))
  
  loginModalVisible.value = false
  ElMessage.success('登录成功')
  
  // 检查是否有重定向路径
  const redirectPath = sessionStorage.getItem('redirectPath')
  if (redirectPath) {
    sessionStorage.removeItem('redirectPath') // 清除重定向路径
    setTimeout(() => {
      router.push(redirectPath) // 重定向到目标页面
    }, 300)
  } else {
    // 没有重定向路径，刷新页面以更新状态
    setTimeout(() => {
      window.location.reload()
    }, 300)
  }
}

// 临时注册方法
const tempRegister = () => {
  if (!tempRegisterForm.username || !tempRegisterForm.password) {
    ElMessage.warning('请输入用户名和密码')
    return
  }
  
  if (tempRegisterForm.password !== tempRegisterForm.confirmPassword) {
    ElMessage.warning('两次输入的密码不一致')
    return
  }
  
  // 模拟注册成功
  ElMessage.success('注册成功')
  switchToLogin()
  tempLoginForm.username = tempRegisterForm.username
  tempLoginForm.password = ''
}
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

/* 动画效果 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 下拉式登录弹窗样式 */
.dropdown-auth-container {
  position: absolute;
  top: 64px;
  right: 40px;
  z-index: 2000;
}

.dropdown-auth-content {
  width: 380px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 6px 30px rgba(0, 0, 0, 0.12);
  overflow: hidden;
  transform: translateY(-20px);
  opacity: 0;
  transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
  pointer-events: none;
}

.dropdown-auth-visible {
  transform: translateY(0);
  opacity: 1;
  pointer-events: auto;
}

.auth-container {
  padding: 24px;
  background: white;
}

.auth-header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.close-btn {
  padding: 8px;
  font-size: 16px;
  color: #909399;
  border: none;
  background: transparent;
}

.close-btn:hover {
  color: #409eff;
  background: rgba(64, 158, 255, 0.1);
}

.auth-header {
  margin-bottom: 24px;
}

.auth-header h2 {
  font-size: 22px;
  color: #2c3e50;
  margin: 0;
  font-weight: 600;
}

.auth-subtitle {
  color: #606266;
  font-size: 14px;
  margin: 0;
}

.custom-form {
  margin-bottom: 24px;
}

/* 确保所有输入框样式一致 */
:deep(.custom-input .el-input__wrapper) {
  background-color: transparent;
  border-radius: 0;
  padding: 0;
  box-shadow: none !important;
  border: none;
}

.custom-input {
  background-color: #f5f7fa;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  padding: 0 12px;
  transition: all 0.3s ease;
  height: 48px; /* 增加高度 */
  display: flex;
  align-items: center;
}

.custom-input:hover {
  border-color: #409eff;
}

.custom-input:focus-within {
  border-color: #409eff;
  box-shadow: 0 0 0 1px rgba(64, 158, 255, 0.2);
}

:deep(.custom-input .el-input__inner) {
  height: 46px;
  line-height: 46px;
  color: #333;
  background-color: transparent !important;
  box-shadow: none !important;
  border: none !important;
  text-align: left;
  padding-left: 0;
}

/* 自定义图标样式 */
:deep(.custom-input .el-input__prefix) {
  margin-right: 8px;
}

:deep(.custom-input .el-input__prefix-inner) {
  display: flex;
  align-items: center;
}

:deep(.custom-input .el-input__icon) {
  color: #909399;
  font-size: 16px;
}

/* 确保输入内容左对齐 */
:deep(.el-input__wrapper) {
  justify-content: flex-start;
}

/* 移除分隔线 */
:deep(.custom-input .el-input__prefix) {
  border: none !important;
}

:deep(.custom-input .el-input__prefix)::after {
  display: none !important;
}

/* 重置Element Plus的默认样式 */
:deep(.el-input) {
  --el-input-bg-color: transparent;
  --el-input-border-color: transparent;
  --el-input-hover-border-color: transparent;
  --el-input-focus-border-color: transparent;
  --el-input-border: none;
}

:deep(.el-input__wrapper) {
  background-color: transparent !important;
  box-shadow: none !important;
}

/* 调整表单项间距 */
.custom-form .el-form-item {
  margin-bottom: 20px; /* 增加间距 */
}

.custom-form .el-form-item:last-child {
  margin-bottom: 0;
}

.auth-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.auth-submit {
  width: 100%;
  height: 44px;
  font-size: 16px;
  font-weight: 500;
  border-radius: 8px;
  background: linear-gradient(135deg, #409eff 0%, #36d1dc 100%);
  border: none;
  transition: all 0.3s ease;
}

.auth-submit:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

.auth-divider {
  width: 100%;
  text-align: center;
  margin: 8px 0;
  position: relative;
}

.auth-divider::before,
.auth-divider::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 35%;
  height: 1px;
  background-color: #e4e7ed;
}

.auth-divider::before {
  left: 0;
}

.auth-divider::after {
  right: 0;
}

.auth-divider span {
  background-color: #fff;
  padding: 0 12px;
  color: #909399;
  font-size: 14px;
}

.auth-switch {
  width: 100%;
  height: 44px;
  font-size: 16px;
  border-radius: 8px;
  border: 1px solid #dcdfe6;
  transition: all 0.3s ease;
}

.auth-switch:hover {
  border-color: #409eff;
  color: #409eff;
  background-color: rgba(64, 158, 255, 0.1);
}

/* 添加三角形指示器 */
.dropdown-auth-content::before {
  content: '';
  position: absolute;
  top: -8px;
  right: 20px;
  width: 16px;
  height: 16px;
  background: white;
  transform: rotate(45deg);
  box-shadow: -2px -2px 5px rgba(0, 0, 0, 0.04);
  z-index: 0;
}

/* 确保内容在三角形上方 */
.auth-container {
  position: relative;
  z-index: 1;
}

/* 优化按钮样式 */
.auth-buttons {
  display: flex;
  gap: 10px;
}
</style>
