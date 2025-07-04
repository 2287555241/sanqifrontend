import { createRouter, createWebHashHistory } from 'vue-router'
import Index from '@/views/index.vue' // 主布局框架
import Home from '@/views/Home.vue'
import HelpCenter from '@/views/HelpCenter.vue'
import AboutUs from '@/views/AboutUs.vue'
import Service from '@/views/Service.vue'
import MapView from '@/views/MapView.vue'
import RasterDataImport from '@/views/RasterDataImport.vue' // 导入栅格数据导入页面

const routes = [
  {
    path: '/',
    redirect: '/main' // 默认重定向到 main 页面
  },
  // 登录页面已移除，使用主页面的登录弹窗替代
  {
    path: '/index',
    name: 'index',
    component: Index,
    meta: {
      requiresAuth: true // 需要登录验证
    }
  },
  {
    path: '/home',
    name: 'home',
    component: Index, // 使用 Index 组件作为布局框架
    meta: {
      requiresAuth: true // 需要登录验证
    },
    children: [
      {
        path: '', // 默认子路由，指向 Home 组件
        component: Home
      }
    ]
  },
  // 以下是独立的路由，不在 home 下
  {
    path: '/main',
    name: 'main',
    component: Home,
    meta: {
      requiresAuth: false // 不需要登录验证，允许所有用户访问主页
    }
  },
  {
    path: '/help',
    name: 'help',
    component: HelpCenter,
    meta: {
      requiresAuth: false // 不需要登录验证
    }
  },
  {
    path: '/about',
    name: 'about',
    component: AboutUs,
    meta: {
      requiresAuth: false // 不需要登录验证
    }
  },
  {
    path: '/service',
    name: 'service',
    component: Service,
    meta: {
      requiresAuth: false // 不需要登录验证
    }
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import(/* webpackChunkName: "profile" */ '@/views/profile.vue'),
    meta: {
      requiresAuth: true
    }
  },
  // 新增数据管理路由
  {
    path: '/data-management',
    name: 'DataManagement',
    component: () => import('../views/DataManagement.vue'),
    meta: {
      requiresAuth: true // 需要登录验证
    }
  },
  // 添加栅格数据导入路由
  {
    path: '/raster-import',
    name: 'raster-import',
    component: RasterDataImport,
    meta: {
      requiresAuth: true // 需要登录验证
    }
  },
  // 添加栅格数据管理路由
  {
    path: '/raster-management',
    name: 'raster-management',
    component: () => import(/* webpackChunkName: "raster-management" */ '@/views/RasterDataManagement.vue'),
    meta: {
      requiresAuth: true // 需要登录验证
    }
  },
  // 添加地图查看路由
  {
    path: '/tianditu',
    name: 'tianditu',
    component: MapView, // 直接使用MapView作为组件，不再嵌套在Index中
    meta: {
      requiresAuth: false // 不需要登录验证
    }
  },
  {
    path: '/project-management',
    name: 'project-management',
    component: () => import(/* webpackChunkName: "project-management" */ '@/components/ProjectManagement.vue'),
    meta: {
      requiresAuth: true
    }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // 在路由切换时处理滚动行为
    if (to.name === 'tianditu') {
      // 地图页面禁用滚动
      document.body.style.overflow = 'hidden';
    } else {
      // 其他页面启用滚动
      document.body.style.overflow = 'auto';
    }

    // 页面切换时滚动到顶部
    return { top: 0 }
  }
})

// 路由守卫（使用登录弹窗替代登录页面）
router.beforeEach((to, from, next) => {
  const token = window.sessionStorage.getItem('token')
  const userInfo = window.sessionStorage.getItem('userInfo')

  // 需要认证但无 token，跳转到主页并显示登录弹窗
  if (to.meta.requiresAuth && (!token || !userInfo)) {
    console.log('需要认证但无token，跳转到主页并显示登录弹窗')
    // 将目标路径保存在会话存储中，以便登录后重定向
    window.sessionStorage.setItem('redirectPath', to.fullPath)

    // 跳转到主页，并通过查询参数触发登录弹窗
    next({ path: '/main', query: { showLogin: 'true' } })
  }
  // 其他情况正常放行
  else {
    next()
  }
})

export default router
