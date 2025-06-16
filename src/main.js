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
  app.component(`el-icon-${key}`, component)
}

app.use(pinia)
app.use(router)
app.use(ElementPlus, {
  size: 'default',
  zIndex: 3000
})

// 初始化用户状态
const userStore = useUserStore()
userStore.initUserInfo()

// 预加载AMap
const preloadAMap = () => {
  return new Promise((resolve, reject) => {
    if (window.AMap) {
      resolve();
      return;
    }

    // 添加安全配置
    window._AMapSecurityConfig = {
      securityJsCode: '您的安全密钥',
      serviceHost: 'https://a.amap.com'
    };

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.defer = true;
    
    script.src = `https://webapi.amap.com/maps?v=2.0&key=c4dd3bd3ae4716656ae2798daebe1339&plugin=AMap.Scale,AMap.ToolBar,AMap.DistrictSearch,AMap.PlaceSearch,AMap.DistrictLayer,AMap.Buildings`;
    
    script.onload = () => {
      console.log('AMap预加载完成');
      resolve();
    };
    
    script.onerror = (error) => {
      console.error('AMap预加载失败:', error);
      reject(error);
    };
    
    document.head.appendChild(script);
  });
};

// 预加载AMap
preloadAMap().then(() => {
  console.log('AMap预加载成功，挂载应用');
  app.mount('#app')
}).catch(error => {
  console.error('AMap预加载失败，但继续挂载应用:', error);
  app.mount('#app')
})
