// API配置文件
const BASE_URL = 'http://localhost:8200'; // 后端服务器基础URL

// API接口配置
const apiConfig = {
  user: {
    login: `${BASE_URL}/user/login`,
    register: `${BASE_URL}/user/register`
  },
  // 可以添加其他模块的API配置
};

export default apiConfig; 