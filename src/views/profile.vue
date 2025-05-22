<template>
  <div class="profile-container">
    <el-card class="profile-card">
      <template #header>
        <div class="card-header">
          <span>个人信息</span>
        </div>
      </template>
      <div class="profile-content">
        <div class="avatar-section">
          <el-avatar :size="100" src="https://i.pravatar.cc/40" />
          <h2>用户名</h2>
          <p class="user-role">管理员</p>
        </div>
        <el-divider />
        <div class="info-section">
          <el-form label-position="top">
            <el-form-item label="邮箱">
              <el-input v-model="userInfo.email" placeholder="请输入邮箱" />
            </el-form-item>
            <el-form-item label="手机号">
              <el-input v-model="userInfo.phone" placeholder="请输入手机号" />
            </el-form-item>
            <el-form-item label="个人简介">
              <el-input
                v-model="userInfo.bio"
                type="textarea"
                :rows="4"
                placeholder="请输入个人简介"
              />
            </el-form-item>
          </el-form>
          <div class="button-group">
            <el-button type="primary" @click="saveProfile">保存修改</el-button>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { ElMessage } from 'element-plus'

const userInfo = reactive({
  email: '',
  phone: '',
  bio: ''
})

const saveProfile = () => {
  // TODO: 实现保存个人信息的逻辑
  ElMessage.success('保存成功')
}
</script>

<style scoped>
.profile-container {
  padding: 20px;
  min-height: 100vh;
  background: #f5f7fa;
}

.profile-card {
  max-width: 800px;
  margin: 0 auto;
  border-radius: 8px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.profile-content {
  padding: 20px 0;
}

.avatar-section {
  text-align: center;
  margin-bottom: 20px;
}

.avatar-section h2 {
  margin: 10px 0 5px;
  color: #303133;
}

.user-role {
  color: #909399;
  margin: 0;
}

.info-section {
  max-width: 500px;
  margin: 0 auto;
}

.button-group {
  margin-top: 20px;
  text-align: center;
}
</style> 