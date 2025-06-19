import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios';
import { ElMessage } from 'element-plus';
import api from '../config/api';

export const useDataStore = defineStore('data', () => {
  // 本地数据列表
  const localDataList = ref([])

  // 用户数据列表
  const userDataList = ref([])

  // 矢量数据列表
  const vectorData = ref([])

  // 栅格数据列表
  const rasterData = ref([])

  // 加载状态
  const loading = ref(false)

  // 错误信息
  const error = ref(null)

  // 添加本地数据
  const addLocalData = (data) => {
    localDataList.value.push(data)

    // 根据数据类型添加到对应列表
    if (data.type === 'vector') {
      vectorData.value.push(data)
    } else if (data.type === 'raster') {
      rasterData.value.push(data)
    }

    return data;
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

      // 从对应列表中也删除
      const vectorIndex = vectorData.value.findIndex(item => item.id === id)
      if (vectorIndex !== -1) {
        vectorData.value.splice(vectorIndex, 1)
      }

      const rasterIndex = rasterData.value.findIndex(item => item.id === id)
      if (rasterIndex !== -1) {
        rasterData.value.splice(rasterIndex, 1)
      }

      return true;
    }
    return false;
  }

  // 删除用户数据
  const deleteUserData = (id) => {
    const index = userDataList.value.findIndex(item => item.id === id)
    if (index !== -1) {
      userDataList.value.splice(index, 1)
    }
  }

  // 获取矢量数据
  const fetchVectorData = async () => {
    loading.value = true;
    try {
      // 使用与HTML示例一致的API路径
      const response = await axios.get('http://localhost:8888/api/vector-data/list');
      vectorData.value = response.data.data || [];
      return vectorData.value;
    } catch (error) {
      console.error('获取矢量数据失败:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  // 获取栅格数据
  const fetchRasterData = async () => {
    loading.value = true;
    try {
      // 使用与HTML示例一致的API路径
      const response = await axios.get('http://localhost:8888/api/raster/list');
      rasterData.value = response.data.data || [];
      return rasterData.value;
    } catch (error) {
      console.error('获取栅格数据失败:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  // 导入矢量数据
  const importVectorData = async (formData) => {
    loading.value = true;
    try {
      // 使用与HTML示例一致的API路径
      const response = await axios.post('http://localhost:8888/api/vector-data/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        // 上传进度回调
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log('上传进度:', percentCompleted);
        }
      });

      // 处理响应数据
      if (response.data && response.data.success) {
        if (response.data.data) {
          // 如果返回了数据，添加到向量数据数组
          if (Array.isArray(response.data.data)) {
            // 如果是数组，添加多条数据
            response.data.data.forEach(item => {
              // 确保不重复添加
              if (!vectorData.value.find(d => d.id === item.id)) {
                vectorData.value.push(item);
              }
            });
          } else {
            // 如果是单个对象，添加一条数据
            if (!vectorData.value.find(d => d.id === response.data.data.id)) {
              vectorData.value.push(response.data.data);
            }
          }
        }

        // 导入成功后刷新矢量数据列表，确保数据是最新的
        await fetchVectorData();
      }

      // 返回API响应
      return response.data;
    } catch (error) {
      console.error('导入矢量数据失败:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  // 导入栅格数据
  const importRasterData = async (formData) => {
    loading.value = true;
    try {
      // 使用与HTML示例一致的API路径
      const response = await axios.post('http://localhost:8888/api/raster/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        // 上传进度回调
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log('上传进度:', percentCompleted);
        }
      });

      // 处理响应数据
      if (response.data && response.data.success) {
        if (response.data.data) {
          // 如果返回了数据，添加到栅格数据数组
          if (Array.isArray(response.data.data)) {
            // 如果是数组，添加多条数据
            response.data.data.forEach(item => {
              // 确保不重复添加
              if (!rasterData.value.find(d => d.id === item.id)) {
                rasterData.value.push(item);
              }
            });
          } else {
            // 如果是单个对象，添加一条数据
            if (!rasterData.value.find(d => d.id === response.data.data.id)) {
              rasterData.value.push(response.data.data);
            }
          }
        }

        // 导入成功后刷新栅格数据列表，确保数据是最新的
        await fetchRasterData();
      }

      // 返回API响应
      return response.data;
    } catch (error) {
      console.error('导入栅格数据失败:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  // 删除矢量数据
  const deleteVectorData = async (id) => {
    loading.value = true;
    try {
      // 使用与HTML示例一致的API路径
      const response = await axios.delete(`http://localhost:8888/api/vector-data/delete/${id}`);

      // 删除成功后刷新矢量数据列表
      if (response.data.success) {
        await fetchVectorData();
      }

      return response.data;
    } catch (error) {
      console.error('删除矢量数据失败:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  // 删除栅格数据
  const deleteRasterData = async (id) => {
    loading.value = true;
    try {
      // 使用与HTML示例一致的API路径
      const response = await axios.delete(`http://localhost:8888/api/raster/${id}`);

      // 删除成功后刷新栅格数据列表
      if (response.data.success) {
        await fetchRasterData();
      }

      return response.data;
    } catch (error) {
      console.error('删除栅格数据失败:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  // 批量删除矢量数据
  const batchDeleteVectorData = async (ids) => {
    loading.value = true;
    try {
      // 使用与HTML示例一致的API路径
      const response = await axios.delete('http://localhost:8888/api/vector-data/delete', {
        data: ids
      });

      // 删除成功后刷新矢量数据列表
      if (response.data.success) {
        await fetchVectorData();
      }

      return response.data;
    } catch (error) {
      console.error('批量删除矢量数据失败:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  // 批量删除栅格数据
  const batchDeleteRasterData = async (ids) => {
    loading.value = true;
    try {
      // 目前栅格数据没有批量删除API，只能逐个删除
      const results = [];

      for (const id of ids) {
        try {
          const response = await deleteRasterData(id);
          results.push({
            id,
            success: response.success,
            message: response.message || response.error
          });
        } catch (error) {
          results.push({
            id,
            success: false,
            message: error.message
          });
        }
      }

      const successCount = results.filter(r => r.success).length;
      return {
        success: successCount > 0,
        deleted: successCount,
        total: ids.length,
        results
      };
    } catch (error) {
      console.error('批量删除栅格数据失败:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  return {
    localDataList,
    userDataList,
    vectorData,
    rasterData,
    loading,
    error,
    addLocalData,
    addUserData,
    deleteLocalData,
    deleteUserData,
    fetchVectorData,
    fetchRasterData,
    importVectorData,
    importRasterData,
    deleteVectorData,
    deleteRasterData,
    batchDeleteVectorData,
    batchDeleteRasterData
  }
}) 