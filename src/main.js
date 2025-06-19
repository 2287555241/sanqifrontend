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

// 预加载AMap
const preloadAMap = () => {
  return new Promise((resolve, reject) => {
    if (window.AMap) {
      console.log('AMap已经加载，直接使用');
      resolve();
      return;
    }

    // 添加安全配置
    window._AMapSecurityConfig = {
      securityJsCode: '您的安全密钥',
      serviceHost: 'https://a.amap.com'
    };

    // 创建一个CSS加载器，优先加载样式
    const loadCSS = () => {
      return new Promise((resolveCSS) => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://a.amap.com/jsapi_demos/static/demo-center/css/demo-center.css';
        link.onload = resolveCSS;
        link.onerror = resolveCSS; // 即使CSS加载失败也继续
        document.head.appendChild(link);
      });
    };

    // 先加载CSS，再加载JS
    loadCSS().then(() => {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.async = true;
      script.crossOrigin = "anonymous"; // 允许跨域加载
      
      // 添加缓存控制参数
      const cacheBuster = new Date().getTime();
      script.src = `https://webapi.amap.com/maps?v=2.0&key=c4dd3bd3ae4716656ae2798daebe1339&plugin=AMap.Scale,AMap.ToolBar&callback=initAMapCallback&_=${cacheBuster}`;
      
      // 全局回调函数
      window.initAMapCallback = () => {
        console.log('AMap基础库加载完成');
        
        // 延迟加载插件，分批加载以提高初始化速度
        setTimeout(() => {
          loadAMapPlugins().then(() => {
            console.log('AMap插件加载完成');
            resolve();
          }).catch(err => {
            console.warn('AMap插件加载部分失败，但继续使用基础功能', err);
            resolve(); // 即使插件加载失败也继续
          });
        }, 100);
      };
      
      script.onerror = (error) => {
        console.error('AMap预加载失败:', error);
        reject(error);
      };
      
      document.head.appendChild(script);
    });
  });
};

// 分批加载插件
const loadAMapPlugins = () => {
  return new Promise((resolve, reject) => {
    try {
      AMap.plugin([
        'AMap.DistrictSearch',
        'AMap.PlaceSearch',
      ], () => {
        console.log('基础插件加载完成');
        
        // 延迟加载次要插件
        setTimeout(() => {
          AMap.plugin([
            'AMap.DistrictLayer',
            'AMap.Buildings'
          ], () => {
            console.log('次要插件加载完成');
            resolve();
          });
        }, 200);
      });
    } catch (error) {
      console.error('加载插件失败:', error);
      reject(error);
    }
  });
};

// 预加载AMap
preloadAMap().then(() => {
  console.log('AMap预加载成功，挂载应用');
  
  // 添加全局滚轮事件处理
  setupWheelEventHandler();
  
  app.mount('#app')
}).catch(error => {
  console.error('AMap预加载失败，但继续挂载应用:', error);
  
  // 即使AMap加载失败，也设置滚轮事件处理
  setupWheelEventHandler();
  
  app.mount('#app')
})

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
