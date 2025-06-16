import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useDataStore = defineStore('data', () => {
  // 本地数据列表
  const localDataList = ref([])

  // 用户数据列表
  const userDataList = ref([])

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