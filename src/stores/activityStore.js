import { defineStore } from 'pinia'

export const useActivityStore = defineStore('activity', {
  state: () => ({
    activities: []
  }),

  actions: {
    // 添加新活动
    addActivity(activity) {
      this.activities.unshift({
        ...activity,
        id: Date.now(),
        time: new Date().toISOString()
      })
      // 只保留最近的10条活动
      if (this.activities.length > 10) {
        this.activities.pop()
      }
    },

    // 记录数据管理相关活动
    recordDataActivity(action, dataName) {
      const activityMap = {
        delete: {
          icon: 'Delete',
          title: `删除了数据：${dataName}`
        },
        import: {
          icon: 'Upload',
          title: `导入了新数据：${dataName}`
        },
        export: {
          icon: 'Download',
          title: `导出了数据：${dataName}`
        }
      }

      if (activityMap[action]) {
        this.addActivity(activityMap[action])
      }
    },

    // 记录系统相关活动
    recordSystemActivity(action, details = '') {
      const activityMap = {
        login: {
          icon: 'User',
          title: '用户登录'
        },
        logout: {
          icon: 'SwitchButton',
          title: '用户退出'
        },
        update: {
          icon: 'Setting',
          title: `系统更新：${details}`
        }
      }

      if (activityMap[action]) {
        this.addActivity(activityMap[action])
      }
    }
  },

  getters: {
    // 获取最近的活动
    recentActivities: (state) => {
      return state.activities.map(activity => ({
        ...activity,
        timeAgo: getTimeAgo(new Date(activity.time))
      }))
    }
  }
})

// 计算时间差的辅助函数
function getTimeAgo(date) {
  const now = new Date()
  const diffInSeconds = Math.floor((now - date) / 1000)

  if (diffInSeconds < 60) {
    return '刚刚'
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `${minutes}分钟前`
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `${hours}小时前`
  } else {
    const days = Math.floor(diffInSeconds / 86400)
    return `${days}天前`
  }
} 