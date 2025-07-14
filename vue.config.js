const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  lintOnSave: false, // 关闭 ESLint 检查
  devServer: {
    host: 'localhost',
    port: 8080,
    proxy: {
      '/api': {
        target: 'http://localhost:8200',
        changeOrigin: true,
        ws: true,
        secure: false,
        logLevel: 'debug'
      }
    },
    client: {
      overlay: false
    }
  }
})