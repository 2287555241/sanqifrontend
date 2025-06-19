/**
 * 自定义指令，用于处理 ResizeObserver 警告
 * 通过延迟执行 ResizeObserver 回调来避免循环通知
 */
export const vResizeObserver = {
  beforeMount(el) {
    el._resizeObserverTimeoutId = null;
    
    // 创建一个 MutationObserver 来监听 DOM 变化
    el._mutationObserver = new MutationObserver(() => {
      // 当 DOM 变化时，清除之前的定时器并设置一个新的
      if (el._resizeObserverTimeoutId) {
        clearTimeout(el._resizeObserverTimeoutId);
      }
      
      // 延迟执行，让浏览器有时间处理布局
      el._resizeObserverTimeoutId = setTimeout(() => {
        // 触发一个自定义事件，通知组件重新计算布局
        el.dispatchEvent(new CustomEvent('resize-observer-update'));
      }, 16); // 大约一帧的时间
    });
    
    // 开始监听
    el._mutationObserver.observe(el, {
      childList: true,
      subtree: true,
      attributes: true
    });
  },
  
  unmounted(el) {
    // 清理资源
    if (el._mutationObserver) {
      el._mutationObserver.disconnect();
      el._mutationObserver = null;
    }
    
    if (el._resizeObserverTimeoutId) {
      clearTimeout(el._resizeObserverTimeoutId);
      el._resizeObserverTimeoutId = null;
    }
  }
}; 