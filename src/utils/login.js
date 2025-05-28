import request from '@/api/request'

export default {
  // 登录接口
  loginApi(data) {
    return request({
      url: '/user/login',
      method: 'post',
      data
    })
  },
  // 注册接口
  registerApi(data) {
    return request({
      url: '/user/register',
      method: 'post',
      data
    })
  }
}