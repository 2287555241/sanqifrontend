import { defineStore } from 'pinia'

export const useProjectStore = defineStore('project', {
  state: () => ({
    currentProject: null
  }),
  
  actions: {
    setCurrentProject(project) {
      this.currentProject = project
    },
    
    getCurrentProject() {
      return this.currentProject
    }
  },
  
  persist: true // 持久化存储
}) 