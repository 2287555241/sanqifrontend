const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  lintOnSave: false, // 关闭 ESLint 检查
  devServer: {
    proxy: {
      '/api': {
        target: 'http://localhost:8200',
        changeOrigin: true,
        // 移除 pathRewrite，保留 /api 前缀
        // pathRewrite: {
        //   '^/api': ''
        // }
      }
    }
  }
})