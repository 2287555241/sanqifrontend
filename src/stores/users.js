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
    } else {
      // 如果没有token，确保清除可能存在的用户信息
      clearUserInfo()
      return false
    }
    
    if (storedUserInfo) {
      try {
        const parsedInfo = JSON.parse(storedUserInfo)
        // 验证用户信息的有效性
        if (parsedInfo && parsedInfo.id) {
          userInfo.value = parsedInfo
          return true
        } else {
          console.warn('存储的用户信息无效')
          clearUserInfo()
          return false
        }
      } catch (e) {
        console.error('解析用户信息失败:', e)
        clearUserInfo()
        return false
      }
    } else {
      // 如果有token但没有用户信息，也认为是无效的
      clearUserInfo()
      return false
    }
  }
  
  // 检查用户是否已认证
  const isAuthenticated = () => {
    return !!token.value && !!userInfo.value && !!userInfo.value.id
  }
  
  return {
    token,
    userInfo,
    setToken,
    setUserInfo,
    clearUserInfo,
    initUserInfo,
    isAuthenticated
  }
})