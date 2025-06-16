<template>
  <div class="nav-header">
    <div class="header-content">
      <!-- 左侧Logo和按钮组 -->
      <div class="header-left">
        <!-- Logo -->
        <div class="logo-container">
          <img src="../assets/logo.png" alt="三七种植遥感监测系统" class="logo-image" />
        </div>
        <div class="button-group">
          <el-dropdown trigger="click" @command="handleFileCommand">
            <el-button type="primary">
              文件
            </el-button>
            <template #dropdown>
              <el-dropdown-menu class="file-dropdown">
                <el-dropdown-item command="new">新建项目</el-dropdown-item>
                <el-dropdown-item command="open">打开项目</el-dropdown-item>
                <el-dropdown-item command="save">保存</el-dropdown-item>
                <el-dropdown-item divided command="export">导出</el-dropdown-item>
                <el-dropdown-item command="import">导入</el-dropdown-item>
                <el-dropdown-item divided command="settings">设置</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <el-dropdown trigger="click" @command="handleEditCommand">
            <el-button type="primary">编辑</el-button>
            <template #dropdown>
              <el-dropdown-menu class="file-dropdown">
                <el-dropdown-item command="undo">撤销</el-dropdown-item>
                <el-dropdown-item command="redo">重做</el-dropdown-item>
                <el-dropdown-item divided command="cut">剪切</el-dropdown-item>
                <el-dropdown-item command="copy">复制</el-dropdown-item>
                <el-dropdown-item command="paste">粘贴</el-dropdown-item>
                <el-dropdown-item divided command="selectAll">全选</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <el-dropdown trigger="click" @command="handleHelpCommand">
            <el-button type="primary">帮助</el-button>
            <template #dropdown>
              <el-dropdown-menu class="file-dropdown">
                <el-dropdown-item command="guide">使用说明</el-dropdown-item>
                <el-dropdown-item command="shortcuts">快捷键</el-dropdown-item>
                <el-dropdown-item divided command="about">关于</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
      
      <!-- 右侧功能区 -->
      <div class="header-right">
        <el-dropdown v-if="isLoggedIn">
          <span class="el-dropdown-link">
            <el-avatar :size="24">
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
          <el-button type="primary" @click="navigateTo('/login')">登录</el-button>
          <el-button @click="navigateTo('/login?register=true')">注册</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import { Edit, User } from '@element-plus/icons-vue'

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
    }).catch(() => {
      // 取消退出
    })
  }
}

const emit = defineEmits(['showProjectManagement'])

const handleFileCommand = (command) => {
  switch (command) {
    case 'new':
      // 检查用户是否已登录
      if (!isLoggedIn.value) {
        ElMessageBox.confirm(
          '需要登录后才能创建项目，是否立即登录？',
          '提示',
          {
            confirmButtonText: '去登录',
            cancelButtonText: '取消',
            type: 'warning'
          }
        ).then(() => {
          // 保存当前路径，登录后跳转回来
          sessionStorage.setItem('redirectPath', '/index')
          router.push('/login')
        }).catch(() => {})
        return
      }
      // 已登录，触发显示项目管理弹窗事件
      emit('showProjectManagement')
      break
    case 'open':
      // 处理打开项目
      break
    case 'save':
      // 处理保存
      break
    case 'export':
      // 处理导出
      break
    case 'import':
      // 处理导入
      break
    case 'settings':
      // 处理设置
      break
  }
}

const handleEditCommand = (command) => {
  switch (command) {
    case 'undo':
      ElMessage.info('撤销操作')
      break
    case 'redo':
      ElMessage.info('重做操作')
      break
    case 'cut':
      ElMessage.info('剪切操作')
      break
    case 'copy':
      ElMessage.info('复制操作')
      break
    case 'paste':
      ElMessage.info('粘贴操作')
      break
    case 'selectAll':
      ElMessage.info('全选操作')
      break
  }
}

const handleHelpCommand = (command) => {
  switch (command) {
    case 'guide':
      ElMessage.info('这里是使用说明')
      break
    case 'shortcuts':
      ElMessage.info('这里是快捷键列表')
      break
    case 'about':
      ElMessage.info('三七种植遥感监测系统 v1.0')
      break
  }
}

const handleButtonClick = (buttonId) => {
  console.log(`点击了${buttonId}`)
  // 这里添加按钮点击后的具体逻辑
  switch (buttonId) {
    case 'button3':
      // 按钮3的逻辑
      break
    case 'button4':
      // 按钮4的逻辑
      break
  }
}

const navigateTo = (path) => {
  router.push(path)
}

// 添加一个钩子来确保样式应用
onMounted(() => {
  // 添加全局样式以覆盖 Element Plus 默认样式
  const style = document.createElement('style')
  style.innerHTML = `
    .el-dropdown-menu {
      background-color: #1a1a1a !important;
      border-color: #2c2c2c !important;
    }
    .el-dropdown-menu__item {
      color: #e0e0e0 !important;
    }
    .el-dropdown-menu__item:hover:not(.is-disabled) {
      background-color: #2c2c2c !important;
      color: #409EFF !important;
    }
    .el-popper.is-light {
      background-color: #1a1a1a !important;
      border-color: #2c2c2c !important;
    }
    .el-popper__arrow {
      display: none !important;
    }
  `
  document.head.appendChild(style)
})
</script>

<style scoped>
.nav-header {
  width: 100%;
  height: 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #1a1a1a;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
}

.header-content {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
}

/* 左侧按钮组样式 */
.header-left {
  display: flex;
  align-items: center;
  height: 100%;
}

/* Logo样式 */
.logo-container {
  height: 100%;
  display: flex;
  align-items: center;
  margin-right: 16px;
}

.logo-image {
  height: 24px;
  width: auto;
  object-fit: contain;
}

.button-group {
  display: flex;
  height: 100%;
}

.button-group .el-button {
  height: 30px;
  padding: 0 16px;
  border: none;
  border-radius: 0;
  background: transparent;
  color: #b8b8b8;
  font-size: 14px;
  transition: all 0.3s ease;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.button-group .el-button--primary:hover,
.button-group .el-button--primary:focus {
  background: #2c2c2c;
  transform: none;
  box-shadow: none;
  color: #e6e6e6;
}

/* 文件下拉菜单样式 - 提高优先级 */
:deep(.file-dropdown.el-dropdown-menu) {
  background-color: #1a1a1a !important;
  border: 1px solid #2c2c2c !important;
  min-width: 150px;
  padding: 4px 0;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.3) !important;
}

:deep(.file-dropdown .el-dropdown-menu__item) {
  color: #e0e0e0 !important;
  padding: 8px 16px;
  font-size: 14px;
  background-color: #1a1a1a !important;
  line-height: 1.5;
}

:deep(.file-dropdown .el-dropdown-menu__item:hover) {
  background-color: #2c2c2c !important;
  color: #409EFF !important;
}

:deep(.file-dropdown .el-dropdown-menu__item.is-disabled) {
  color: #606266 !important;
}

:deep(.el-dropdown-menu__item.divided) {
  border-top: 1px solid #2c2c2c !important;
  margin: 4px 0;
}

/* 全局覆盖弹出菜单样式 */
:global(.el-popper.is-pure) {
  background-color: #1a1a1a !important;
  border-color: #2c2c2c !important;
  color: #e0e0e0 !important;
}

:global(.el-popper.is-pure .el-popper__arrow::before) {
  background-color: #1a1a1a !important;
  border-color: #2c2c2c !important;
}

:global(.el-dropdown__popper) {
  background-color: #1a1a1a !important;
}

:global(.el-dropdown-menu) {
  background-color: #1a1a1a !important;
}

:global(.el-dropdown-menu__item) {
  color: #e0e0e0 !important;
}

:global(.el-dropdown-menu__item:hover) {
  background-color: #2c2c2c !important;
}

:global(.el-popper__arrow) {
  display: none !important;
}

/* 右侧功能区 */
.header-right {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  height: 100%;
}

.auth-buttons {
  display: flex;
  height: 100%;
}

.auth-buttons .el-button {
  height: 30px;
  padding: 0 16px;
  border: none;
  border-radius: 0;
  background: transparent;
  color: #ffffff;
  font-size: 14px;
  transition: all 0.3s ease;
}

.auth-buttons .el-button:hover {
  background: #2c2c2c;
}

.el-dropdown-link {
  height: 100%;
  padding: 0 16px;
  display: flex;
  align-items: center;
  color: #ffffff;
}

.el-dropdown-link:hover {
  background: #2c2c2c;
  transform: none;
}

.el-avatar {
  border: none;
  box-shadow: none;
  background: transparent;
}

:deep(.el-dropdown-menu) {
  background: #1a1a1a;
  border: 1px solid #2c2c2c;
  padding: 4px;
}

:deep(.el-dropdown-menu__item) {
  color: #ffffff;
  padding: 8px 16px;
}

:deep(.el-dropdown-menu__item:hover) {
  background-color: #2c2c2c;
  color: #ffffff;
}

/* 确保下拉菜单位置正确 */
:deep(.el-dropdown) {
  height: 100%;
}

:deep(.el-popper.is-light) {
  background: #1a1a1a !important;
  border-color: #2c2c2c !important;
}

:deep(.el-popper__arrow) {
  display: none !important;
}
</style>
