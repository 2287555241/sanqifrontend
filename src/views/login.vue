<template>
  <!-- 最外层的大盒子 -->
  <div class="login-bigBox">
    <div class="login-box" ref="box">
      <!-- 滑动盒子 -->
      <div class="login-pre-box">
        <h1>WELCOME</h1>
        <p>JOIN US!</p>
        <div class="login-img-box">
          <img src="../assets/img/waoku.png" alt="" id="avatar" />
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
        type="password"
        placeholder="密码"
        :suffix-icon="Lock"
        v-model="registerForm.password"
        class="login-input"
        :disabled="loading"
      />
    </el-form-item>
    <el-form-item prop="confirmPassword" label=" " class="login-el-form-item">
      <el-input
        type="password"
        placeholder="确认密码"
        :suffix-icon="Lock"
        v-model="registerForm.confirmPassword"
        class="login-input"
        :disabled="loading"
      />
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
                <el-icon 
                  class="el-input__icon cursor-pointer" 
                  @click="showPassword = !showPassword"
                >
                  <component :is="showPassword ? View : Hide" />
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
  </div>
</template>

<script setup>
import { Lock, User, View, Hide } from '@element-plus/icons-vue'
import mySwitch from '@/utils/mySwitch'
import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import '@/assets/css/login.css'
import apiConfig from '@/config/api'

const router = useRouter()

// 控制密码显示/隐藏
const showPassword = ref(false)

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
      
      // 跳转到首页
      router.push('/main');
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
      // 注册成功后自动切换到登录界面
      mySwitch();
      // 清空注册表单
      registerForm.username = '';
      registerForm.password = '';
      registerForm.confirmPassword = '';
    } else {
      ElMessage.error(data.msg || '用户名格式不正确或已存在');
    }
  } catch (error) {
    console.error('注册错误:', error);
    ElMessage.error(error.message || '注册失败，请检查网络或联系管理员');
  } finally {
    loading.value = false;
  }
}
</script>
