import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useDataStore = defineStore('data', () => {
  // 本地数据列表
  const localDataList = ref([
    {
      id: 1,
      name: '2023年小麦产量数据集（包含全国各省详细数据）',
      type: 'CSV',
      size: '2.5MB',
      createTime: '2023-06-15 10:30:45',
      description: '包含播种面积、亩产、总产量等核心指标'
    },
    {
      id: 2,
      name: '玉米种植区分布图（2023年最新版）',
      type: 'GeoJSON',
      size: '5.2MB',
      createTime: '2023-06-18 14:15:30',
      description: '东北、华北、西南三大主产区矢量数据'
    },
    {
      id: 3,
      name: '土壤质量分析报告（2023年度）',
      type: 'PDF',
      size: '1.8MB',
      createTime: '2023-06-20 09:45:22',
      description: 'pH值、有机质含量、重金属含量等12项指标'
    },
    {
      id: 4,
      name: '气象数据集（2023年1-6月每日更新）',
      type: 'Excel',
      size: '3.7MB',
      createTime: '2023-06-22 16:20:18',
      description: '温度、降水、风速、日照时数等数据'
    },
    {
      id: 5,
      name: '水稻生长监测影像（多光谱遥感数据）',
      type: 'TIFF',
      size: '15.3MB',
      createTime: '2023-06-25 11:10:05',
      description: '包含NDVI、EVI等植被指数图层'
    }
  ])

  // 用户数据列表
  const userDataList = ref([
    {
      id: 1,
      name: '三七种植区域数据（云南文山）',
      type: 'GeoJSON',
      size: '4.8MB',
      createTime: '2023-07-12 09:10:33',
      description: '三七主产区地理边界数据'
    },
    {
      id: 2,
      name: '农田灌溉系统分布（自定义）',
      type: 'SHP',
      size: '3.1MB',
      createTime: '2023-08-05 15:22:41',
      description: '灌溉渠道和水源点位置数据'
    },
    {
      id: 3,
      name: '病虫害监测数据（2023上半年）',
      type: 'Excel',
      size: '1.2MB',
      createTime: '2023-09-18 11:05:27',
      description: '农作物病虫害发生情况统计'
    },
    {
      id: 4,
      name: '施肥记录及土壤改良数据',
      type: 'CSV',
      size: '0.9MB',
      createTime: '2023-10-01 16:40:12',
      description: '农田施肥类型、用量和频率记录'
    }
  ])

  // 添加本地数据
  const addLocalData = (data) => {
    localDataList.value.push(data)
  }

  // 添加用户数据
  const addUserData = (data) => {
    userDataList.value.push(data)
  }

  // 删除本地数据
  const deleteLocalData = (id) => {
    const index = localDataList.value.findIndex(item => item.id === id)
    if (index !== -1) {
      localDataList.value.splice(index, 1)
    }
  }

  // 删除用户数据
  const deleteUserData = (id) => {
    const index = userDataList.value.findIndex(item => item.id === id)
    if (index !== -1) {
      userDataList.value.splice(index, 1)
    }
  }

  return {
    localDataList,
    userDataList,
    addLocalData,
    addUserData,
    deleteLocalData,
    deleteUserData
  }
}) 