import { vResizeObserver } from './resizeObserver';

export default {
  install(app) {
    // 注册 ResizeObserver 指令
    app.directive('resize-observer', vResizeObserver);
    
    // 在这里可以注册更多的自定义指令
  }
}; 