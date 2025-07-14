// API配置文件
const BASE_URL = 'http://localhost:8200'; // 后端服务器基础URL

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
    importRasterAndMetadataV2: `${BASE_URL}/api/raster/importRasterAndMetadataV2`,
    importRasterWithMtlContent: `${BASE_URL}/api/raster/importRasterWithMtlContent`,
    importMetadata: `${BASE_URL}/api/raster/importMetadata`,
    getMetadata: (id) => `${BASE_URL}/api/raster/${id}/metadata`,
    getMtlContent: (id) => `${BASE_URL}/api/raster/${id}/mtlContent`,
    updateMtlContent: (id) => `${BASE_URL}/api/raster/${id}/mtlContent`,
    updateMtlContentFromText: (id) => `${BASE_URL}/api/raster/${id}/mtlContentFromText`,
    importMtlContentToRasterData: (id) => `${BASE_URL}/api/raster/${id}/importMtlContent`,
    testMtlContent: (id) => `${BASE_URL}/api/raster/${id}/testMtlContent`,
    checkAllMtlContent: `${BASE_URL}/api/raster/checkAllMtlContent`,
    mapData: `${BASE_URL}/api/raster/mapData`,
    thumbnail: (id) => `${BASE_URL}/api/raster/thumbnail/view/${id}`,
    search: {
      cloudCover: `${BASE_URL}/api/raster/search/cloud-cover`,
      date: `${BASE_URL}/api/raster/search/acquisition-date`,
      sunElevation: `${BASE_URL}/api/raster/search/sun-elevation`,
      combined: `${BASE_URL}/api/raster/search/combined`
    },
    delete: (id) => `${BASE_URL}/api/raster/${id}`,
    getById: (id) => `${BASE_URL}/api/raster/${id}`,
    getSize: (id) => `${BASE_URL}/api/raster/${id}/size`,
    updateDescription: (id) => `${BASE_URL}/api/raster/${id}/description`,
    getDescription: (id) => `${BASE_URL}/api/raster/${id}/description`
  },
  // 三七数据相关API
  sanqi: {
    regions: `${BASE_URL}/api/SanqiRegion`
  },
  // 可以添加其他模块的API配置
};

export default apiConfig; 