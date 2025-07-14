import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import ElementPlus from 'element-plus'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import 'element-plus/dist/index.css'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { useUserStore } from './stores/users'
import './style.css'
import directives from './directives' // 导入自定义指令
import draggableDialog from './directives/draggableDialog'
import 'leaflet/dist/leaflet.css'

// 配置NProgress
NProgress.configure({ 
  showSpinner: false,
  minimum: 0.1
})

// 路由切换时显示进度条
router.beforeEach((to, from, next) => {
  NProgress.start()
  next()
})

router.afterEach(() => {
  NProgress.done()
})

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

const app = createApp(App)

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(pinia)
app.use(router)
app.use(ElementPlus)
app.use(directives) // 注册自定义指令
app.directive('draggable-dialog', draggableDialog)

// 初始化用户状态
const userStore = useUserStore()
userStore.initUserInfo()

// 添加全局错误处理器来抑制ResizeObserver警告
const originalConsoleError = console.error;
console.error = (...args) => {
  // 过滤掉ResizeObserver循环警告
  if (args.length > 0 && typeof args[0] === 'string' && 
      args[0].includes('ResizeObserver loop')) {
    return;
  }
  originalConsoleError.apply(console, args);
};

// 只需在 app 挂载后加载插件
app.mount('#app');

// 设置全局滚轮事件处理
function setupWheelEventHandler() {
  // 获取当前路由路径
  const getCurrentPath = () => {
    const hash = window.location.hash;
    return hash.replace('#', '');
  };
  
  // 检查是否在地图页面
  const isMapPage = () => {
    const path = getCurrentPath();
    return path.includes('/tianditu');
  };
  
  // 处理滚轮事件
  window.addEventListener('wheel', (event) => {
    // 只在非地图页面处理
    if (!isMapPage()) {
      // 不阻止默认行为，让页面可以滚动
      event.stopPropagation();
    }
  }, { passive: false, capture: false });
  
  console.log('全局滚轮事件处理器已设置');
}
