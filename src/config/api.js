// API配置文件
const BASE_URL = 'http://localhost:8888'; // 后端服务器基础URL

// API接口配置
const apiConfig = {
  BASE_URL,
  user: {
    login: `${BASE_URL}/user/login`,
    register: `${BASE_URL}/user/register`
  },
  // 栅格数据相关API
  raster: {
    list: `${BASE_URL}/api/raster/list`,
    userData: `${BASE_URL}/api/raster/user-data`,
    importWithMetadata: `${BASE_URL}/api/raster/import-with-metadata`,
    search: {
      cloudCover: `${BASE_URL}/api/raster/search/cloud-cover`,
      date: `${BASE_URL}/api/raster/search/acquisition-date`,
      sunElevation: `${BASE_URL}/api/raster/search/sun-elevation`,
      combined: `${BASE_URL}/api/raster/search/combined`
    },
    delete: (id) => `${BASE_URL}/api/raster/${id}`
  },
  // 三七数据相关API
  sanqi: {
    regions: `${BASE_URL}/api/sanqi`,
    test: `${BASE_URL}/api/sanqi/test` // 测试数据API
  },
  // 可以添加其他模块的API配置
};

export default apiConfig; 