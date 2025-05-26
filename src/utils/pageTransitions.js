// src/utils/pageTransitions.js
import { ref, watch } from 'vue'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

// 配置NProgress
NProgress.configure({ 
  showSpinner: false,
  easing: 'ease',
  speed: 500
})

const SPECIAL_PAGES = ['/', '/about', '/help', '/service']
let isTransitionEnabled = ref(false)

function isSpecialPage(path) {
  return SPECIAL_PAGES.includes(path)
}

const pageTransitionDirective = {
  mounted(el, binding) {
    // 确保页面从顶部开始渲染
    window.scrollTo(0, 0)
    
    // 重置元素样式
    el.style.opacity = '1'
    el.style.transform = 'none'
    el.style.animation = 'none'
    
    // 强制重绘
    void el.offsetHeight
    
    // 应用动画
    if (binding.value) {
      el.style.opacity = '0'
      el.style.transform = 'translateY(20px)'
      el.style.animation = 'slideIn 0.5s ease forwards'
    } else {
      el.style.opacity = '0'
      el.style.animation = 'fadeIn 0.3s ease forwards'
    }
  },
  beforeUnmount(el, binding) {
    if (binding.value) {
      el.style.animation = 'slideOut 0.5s ease forwards'
    }
  }
}

function setupRouterHooks(router) {
  router.beforeEach((to, from) => {
    const isSpecialTransition = isSpecialPage(to.path) && isSpecialPage(from.path)
    isTransitionEnabled.value = isSpecialTransition
    
    if (isSpecialTransition) {
      NProgress.start()
      // 在跳转前保存滚动位置（如果需要）
      from.meta.savedPosition = window.scrollY
    }
    
    // 总是重置滚动位置
    if (to.hash) {
      return // 如果有hash，让路由自己处理
    }
    window.scrollTo(0, 0)
  })

  router.afterEach((to) => {
    if (isTransitionEnabled.value) {
      NProgress.done()
      
      // 微调滚动位置，确保没有空白
      setTimeout(() => {
        const el = document.querySelector('.page-container')
        if (el) {
          const rect = el.getBoundingClientRect()
          if (rect.top < 0 || rect.top > 50) {
            window.scrollTo(0, 0)
          }
        }
      }, 50)
    }
  })
}

export default {
  install(app, router) {
    app.directive('page-transition', pageTransitionDirective)
    setupRouterHooks(router)
    app.provide('isTransitionEnabled', isTransitionEnabled)
  }
}