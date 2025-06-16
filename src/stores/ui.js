import { defineStore } from 'pinia'

export const useUIStore = defineStore('ui', {
  state: () => ({
    // 控制面板显示状态
    controlPanelVisible: true,
    // 上次的UI状态
    previousState: null
  }),
  
  actions: {
    // 切换控制面板显示状态
    toggleControlPanelVisible() {
      this.controlPanelVisible = !this.controlPanelVisible
    },
    
    // 设置控制面板显示状态
    setControlPanelVisible(visible) {
      this.controlPanelVisible = visible
    },
    
    // 保存当前状态
    saveCurrentState() {
      this.previousState = {
        controlPanelVisible: this.controlPanelVisible
      }
    },
    
    // 恢复上一个状态
    restorePreviousState() {
      if (this.previousState) {
        this.controlPanelVisible = this.previousState.controlPanelVisible
        this.previousState = null
      }
    },
    
    // 隐藏所有面板（仅显示地图）
    showMapOnly() {
      this.saveCurrentState()
      this.controlPanelVisible = false
    },
    
    // 重置为默认状态
    resetToDefault() {
      this.controlPanelVisible = true
      this.previousState = null
    }
  },
  
  persist: true // 持久化存储
}) 