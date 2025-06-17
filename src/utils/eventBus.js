import { ref } from 'vue'
import mitt from 'mitt'

// 创建事件总线实例
const emitter = mitt()

// 创建当前活动视图的引用
const activeView = ref('home')

// 导出事件总线和活动视图
export { emitter, activeView }

// 导出常用的事件名称常量，方便使用
export const Events = {
  CHANGE_VIEW: 'change-view',
  CLEAR_MAP: 'clear-map',
  REFRESH_CONTENT: 'refresh-content'
} 