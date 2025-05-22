import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  const token = ref('')
  const userInfo = ref({})
  
  // 设置token
  const setToken = (newToken) => {
    token.value = newToken
    window.sessionStorage.setItem('token', newToken)
  }
  
  // 设置用户信息
  const setUserInfo = (info) => {
    userInfo.value = info
    window.sessionStorage.setItem('userInfo', JSON.stringify(info))
  }
  
  // 清除用户信息
  const clearUserInfo = () => {
    token.value = ''
    userInfo.value = {}
    window.sessionStorage.removeItem('token')
    window.sessionStorage.removeItem('userInfo')
  }
  
  // 初始化用户信息
  const initUserInfo = () => {
    const storedToken = window.sessionStorage.getItem('token')
    const storedUserInfo = window.sessionStorage.getItem('userInfo')
    
    if (storedToken) {
      token.value = storedToken
    }
    
    if (storedUserInfo) {
      userInfo.value = JSON.parse(storedUserInfo)
    }
  }
  
  return {
    token,
    userInfo,
    setToken,
    setUserInfo,
    clearUserInfo,
    initUserInfo
  }
})