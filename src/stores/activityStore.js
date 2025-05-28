import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useActivityStore = defineStore('activity', () => {
  // 活动列表数据
  const activityList = ref([
    {
      id: 1,
      title: '系统更新完成',
      type: 'system',
      time: '2024-05-28 10:30:45',
      timeAgo: '10分钟前',
      description: '系统已更新至最新版本 v2.0.1'
    },
    {
      id: 2,
      title: '新用户注册',
      type: 'user',
      time: '2024-05-28 10:00:12',
      timeAgo: '30分钟前',
      description: '用户 admin_test 已完成注册'
    },
    {
      id: 3,
      title: '数据导入成功',
      type: 'data',
      time: '2024-05-28 09:15:30',
      timeAgo: '2小时前',
      description: '成功导入云南文山三七种植数据'
    },
    {
      id: 4,
      title: '系统配置更新',
      type: 'system',
      time: '2024-05-28 08:30:00',
      timeAgo: '3小时前',
      description: '更新了数据处理参数配置'
    },
    {
      id: 5,
      title: '数据分析完成',
      type: 'analysis',
      time: '2024-05-27 17:45:22',
      timeAgo: '昨天',
      description: '完成三七种植区生长状况分析'
    },
    {
      id: 6,
      title: '监测任务创建',
      type: 'task',
      time: '2024-05-27 15:20:18',
      timeAgo: '昨天',
      description: '创建了文山地区三七监测任务'
    }
  ])

  // 添加活动
  const addActivity = (activity) => {
    // 为新活动生成ID
    const newId = activityList.value.length > 0 
      ? Math.max(...activityList.value.map(a => a.id)) + 1 
      : 1
    
    // 计算相对时间
    const now = new Date()
    const activityTime = new Date(activity.time)
    const diffMs = now - activityTime
    let timeAgo = ''
    
    if (diffMs < 60 * 1000) {
      timeAgo = '刚刚'
    } else if (diffMs < 60 * 60 * 1000) {
      timeAgo = Math.floor(diffMs / (60 * 1000)) + '分钟前'
    } else if (diffMs < 24 * 60 * 60 * 1000) {
      timeAgo = Math.floor(diffMs / (60 * 60 * 1000)) + '小时前'
    } else if (diffMs < 48 * 60 * 60 * 1000) {
      timeAgo = '昨天'
    } else {
      timeAgo = Math.floor(diffMs / (24 * 60 * 60 * 1000)) + '天前'
    }
    
    const newActivity = {
      id: newId,
      ...activity,
      timeAgo
    }
    
    // 添加到列表前端
    activityList.value.unshift(newActivity)
    
    // 保持列表在合理范围内（例如最多保留20条记录）
    if (activityList.value.length > 20) {
      activityList.value = activityList.value.slice(0, 20)
    }
  }
  
  // 更新所有活动的相对时间描述
  const updateTimeAgo = () => {
    const now = new Date()
    
    activityList.value.forEach(activity => {
      const activityTime = new Date(activity.time)
      const diffMs = now - activityTime
      
      if (diffMs < 60 * 1000) {
        activity.timeAgo = '刚刚'
      } else if (diffMs < 60 * 60 * 1000) {
        activity.timeAgo = Math.floor(diffMs / (60 * 1000)) + '分钟前'
      } else if (diffMs < 24 * 60 * 60 * 1000) {
        activity.timeAgo = Math.floor(diffMs / (60 * 60 * 1000)) + '小时前'
      } else if (diffMs < 48 * 60 * 60 * 1000) {
        activity.timeAgo = '昨天'
      } else {
        activity.timeAgo = Math.floor(diffMs / (24 * 60 * 60 * 1000)) + '天前'
      }
    })
  }
  
  // 删除活动
  const deleteActivity = (id) => {
    const index = activityList.value.findIndex(activity => activity.id === id)
    if (index !== -1) {
      activityList.value.splice(index, 1)
    }
  }
  
  // 清空所有活动
  const clearActivities = () => {
    activityList.value = []
  }
  
  return {
    activityList,
    addActivity,
    updateTimeAgo,
    deleteActivity,
    clearActivities
  }
}, {
  persist: true, // 启用持久化存储
}) 