const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true
})

module.exports = {
  lintOnSave: false, // 关闭 ESLint 检查
};

module.exports = {
  devServer: {
    proxy: {
      '/api': {
        target: 'http://localhost:8100',
        changeOrigin: true,
        pathRewrite: {
          '^/api': ''
        }
      }
    }
  }
}