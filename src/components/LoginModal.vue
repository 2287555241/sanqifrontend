<template>
  <el-dialog
    :model-value="visible"
    @update:model-value="(val) => emit('update:visible', val)"
    :title="isRegister ? '注册' : '登录'"
    width="1050px"
    :close-on-click-modal="false"
    :show-close="true"
    custom-class="login-modal"
    @close="handleClose"
    append-to-body
    destroy-on-close
    center
  >
    <!-- 登录盒子 -->
    <div class="login-box" ref="box">
      <!-- 滑动盒子 -->
      <div class="login-pre-box">
        <h1>WELCOME</h1>
        <p>JOIN US!</p>
        <div class="login-img-box">
          <!-- <img src="../assets/img/waoku.png" alt="" id="avatar" /> -->
        </div>
      </div>
      <!-- 注册盒子 -->
      <div class="register-form">
        <!-- 标题盒子 -->
        <div class="login-title-box">
          <h1>注册</h1>
        </div>
        <!-- 输入框盒子 -->
        <el-form
          ref="registerFormRef"
          :model="registerForm"
          :rules="rules"
          label-width="5px"
          class="login-el-form"
        >
          <el-form-item prop="username" label=" " class="login-el-form-item">
            <el-input
              type="text"
              placeholder="用户名"
              :suffix-icon="User"
              v-model="registerForm.username"
              class="login-input"
              :disabled="loading"
            />
          </el-form-item>
          <el-form-item prop="password" label=" " class="login-el-form-item">
            <el-input
              :type="showRegisterPassword ? 'text' : 'password'"
              placeholder="密码"
              v-model="registerForm.password"
              class="login-input"
              :disabled="loading"
            >
              <template #suffix>
                <el-icon class="cursor-pointer" @click="showRegisterPassword = !showRegisterPassword">
                  <Hide v-if="!showRegisterPassword" />
                  <View v-else />
                </el-icon>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item prop="confirmPassword" label=" " class="login-el-form-item">
            <el-input
              :type="showConfirmPassword ? 'text' : 'password'"
              placeholder="确认密码"
              v-model="registerForm.confirmPassword"
              class="login-input"
              :disabled="loading"
            >
              <template #suffix>
                <el-icon class="cursor-pointer" @click="showConfirmPassword = !showConfirmPassword">
                  <Hide v-if="!showConfirmPassword" />
                  <View v-else />
                </el-icon>
              </template>
            </el-input>
          </el-form-item>
        </el-form>
        <!-- 按钮盒子 -->
        <div class="login-btn-box">
          <button 
            @click="register" 
            class="register-btn"
            :disabled="loading"
          >
            <span v-if="!loading">注册</span>
            <span v-else class="loading-text">注册中...</span>
          </button>
          <p @click="!loading && mySwitch()">已有账号?去登录</p>
        </div>
      </div>
      <!-- 登录盒子 -->
      <div class="login-form">
        <!-- 标题盒子 -->
        <div class="login-title-box">
          <h1>登录</h1>
        </div>
        <!-- 输入框盒子 -->
        <el-form
          ref="loginFormRef"
          :model="loginForm"
          :rules="rules"
          label-width="5px"
          class="login-el-form"
        >
          <el-form-item prop="username" label=" " class="login-el-form-item">
            <el-input
              type="text"
              placeholder="用户名"
              :suffix-icon="User"
              v-model="loginForm.username"
              class="login-input"
              :disabled="loading"
            />
          </el-form-item>
          <el-form-item prop="password" label=" " class="login-el-form-item">
            <el-input
              :type="showPassword ? 'text' : 'password'"
              placeholder="密码"
              v-model="loginForm.password"
              class="login-input"
              :disabled="loading"
              @keyup.enter="login"
            >
              <template #suffix>
                <el-icon class="cursor-pointer" @click="showPassword = !showPassword">
                  <Hide v-if="!showPassword" />
                  <View v-else />
                </el-icon>
              </template>
            </el-input>
          </el-form-item>
        </el-form>
        <!-- 按钮盒子 -->
        <div class="login-btn-box">
          <button 
            @click="login" 
            class="login-btn"
            :disabled="loading"
          >
            <span v-if="!loading">登录</span>
            <span v-else class="loading-text">登录中...</span>
          </button>
          <p @click="!loading && mySwitch()">没有账号?去注册</p>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
import { Lock, User, View, Hide } from '@element-plus/icons-vue'
import mySwitch, { flag } from '@/utils/mySwitch'
import { reactive, ref, defineProps, defineEmits, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import apiConfig from '@/config/api'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  defaultTab: {
    type: String,
    default: 'login' // 'login' 或 'register'
  }
})

const emit = defineEmits(['update:visible', 'login-success', 'register-success', 'close'])

// 调试输出
watch(() => props.visible, (newVal) => {
  console.log('LoginModal visible 变化:', newVal)
}, { immediate: true })

// 监听defaultTab变化，切换登录/注册
watch(() => props.defaultTab, (newValue) => {
  console.log('LoginModal defaultTab 变化:', newValue, '当前 flag:', flag.value)
  if (newValue === 'register' && flag.value) {
    mySwitch()
  } else if (newValue === 'login' && !flag.value) {
    mySwitch()
  }
}, { immediate: true })

onMounted(() => {
  console.log('LoginModal 组件已挂载')
})

// 控制密码显示/隐藏
const showPassword = ref(false)
const showRegisterPassword = ref(false)
const showConfirmPassword = ref(false)

// 表单数据
const loginForm = reactive({
  username: '',
  password: ''
})

const registerForm = reactive({
  username: '',
  password: '',
  confirmPassword: ''
})

// 表单引用
const loginFormRef = ref(null)
const registerFormRef = ref(null)

// 加载状态
const loading = ref(false)

// 是否为注册状态
const isRegister = ref(props.defaultTab === 'register')

// 验证规则
const rules = reactive({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { 
      pattern: /^[a-zA-Z0-9]+$/, 
      message: '用户名必须为字母和数字的组合', 
      trigger: 'blur' 
    }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请输入确认密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== registerForm.password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
})

// 登录方法
const login = async () => {
  try {
    await loginFormRef.value.validate();
    loading.value = true;
    
    const response = await fetch(apiConfig.user.login, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: loginForm.username,
        password: loginForm.password
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.msg || '登录失败');
    }
    
    if (data.code === "0") {
      ElMessage.success(data.msg || '登录成功');
      // 存储token和用户信息
      sessionStorage.setItem('token', 'user-authenticated'); // 存储token
      sessionStorage.setItem('userInfo', JSON.stringify(data.data));
      
      // 发送登录成功事件
      emit('login-success', data.data);
      handleClose();
      
      // 检查是否有重定向路径
      const redirectPath = sessionStorage.getItem('redirectPath');
      if (redirectPath) {
        sessionStorage.removeItem('redirectPath'); // 清除重定向路径
        window.location.href = redirectPath; // 重定向到目标页面
      } else {
        // 刷新页面以更新状态
        window.location.reload();
      }
    } else {
      ElMessage.error(data.msg || '账号或密码错误');
    }
  } catch (error) {
    console.error('登录错误:', error);
    ElMessage.error(error.message || '登录失败，请检查网络或联系管理员');
  } finally {
    loading.value = false;
  }
}

// 注册方法
const register = async () => {
  try {
    await registerFormRef.value.validate();
    loading.value = true;
    
    const response = await fetch(apiConfig.user.register, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: registerForm.username,
        password: registerForm.password
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.msg || '注册失败');
    }
    
    if (data.code === "0") {
      ElMessage.success(data.msg || '注册成功');
      // 发送注册成功事件
      emit('register-success');
      // 切换到登录页
      mySwitch();
    } else {
      ElMessage.error(data.msg || '注册失败');
    }
  } catch (error) {
    console.error('注册错误:', error);
    ElMessage.error(error.message || '注册失败，请检查网络或联系管理员');
  } finally {
    loading.value = false;
  }
}

// 关闭弹窗
const handleClose = () => {
  emit('update:visible', false);
  emit('close');
}
</script>

<style>
@import '../assets/css/login.css';

/* 弹窗样式覆盖 */
.login-modal .el-dialog__header {
  display: none;
}

.login-modal .el-dialog__body {
  padding: 0;
}

.login-modal .el-dialog {
  border-radius: 8px;
  overflow: hidden;
  background: transparent;
  box-shadow: 0 5px 25px rgba(0, 0, 0, 0.2);
  margin-top: 15vh !important; /* 确保弹窗垂直居中 */
}

/* 调整登录盒子样式以适应弹窗 */
.login-box {
  margin: 0;
  border: none;
  border-radius: 0;
  box-shadow: none;
  height: 600px;
  background: linear-gradient(to right, rgb(190, 239, 194), rgb(191, 227, 241));
}

.login-bigBox {
  height: auto;
  background: none;
}

.cursor-pointer {
  cursor: pointer;
  padding: 0 8px;
  font-size: 16px;
  color: #909399;
}

.cursor-pointer:hover {
  color: #409EFF;
}

.el-input__wrapper {
  padding-right: 0 !important;
}

.el-input__icon {
  height: 32px;
  line-height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style> 