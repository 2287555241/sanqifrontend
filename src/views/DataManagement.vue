<template>
    <div class="data-management-container">
      <h2 class="page-title"></h2>
      
      <div class="data-content">
        <el-card class="data-card">
          <template #header>
            <div class="card-header">
              <span>数据列表</span>
              <el-button type="primary" size="small">新增数据</el-button>
            </div>
          </template>
          
          <el-table 
            :data="tableData" 
            style="width: 100%" 
            border: boolean
            :row-style="{ height: '120px' }"
          >
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="name" label="数据名称" />
            <el-table-column prop="type" label="数据类型" />
            <el-table-column prop="size" label="大小" />
            <el-table-column prop="createTime" label="创建时间" />
            <el-table-column label="操作" width="180">
              <template #default="scope">
                <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
                <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
          
          <div class="pagination-container">
            <el-pagination
              background
              layout="prev, pager, next"
              :total="100"
              :page-size="10"
              @current-change="handlePageChange"
            />
          </div>
        </el-card>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  
  // 模拟数据
  const tableData = ref([
    {
      id: 1,
      name: '2023年小麦产量数据集（包含全国各省详细数据）',
      type: 'CSV',
      size: '2.5MB',
      createTime: '2023-06-15 10:30:45',
      description: '包含播种面积、亩产、总产量等核心指标'
    },
    {
      id: 2,
      name: '玉米种植区分布图（2023年最新版）',
      type: 'GeoJSON',
      size: '5.2MB',
      createTime: '2023-06-18 14:15:30',
      description: '东北、华北、西南三大主产区矢量数据'
    },
    {
      id: 3,
      name: '土壤质量分析报告（2023年度）',
      type: 'PDF',
      size: '1.8MB',
      createTime: '2023-06-20 09:45:22',
      description: 'pH值、有机质含量、重金属含量等12项指标'
    },
    {
      id: 4,
      name: '气象数据集（2023年1-6月每日更新）',
      type: 'Excel',
      size: '3.7MB',
      createTime: '2023-06-22 16:20:18',
      description: '温度、降水、风速、日照时数等数据'
    },
    {
      id: 5,
      name: '水稻生长监测影像（多光谱遥感数据）',
      type: 'TIFF',
      size: '15.3MB',
      createTime: '2023-06-25 11:10:05',
      description: '包含NDVI、EVI等植被指数图层'
    }
  ])
  
  const handleEdit = (row) => {
    console.log('编辑', row)
  }
  
  const handleDelete = (row) => {
    console.log('删除', row)
  }
  
  const handlePageChange = (currentPage) => {
    console.log('页码变化', currentPage)
  }
  </script>
  
  <style scoped>
  /* 外层容器 */
  .data-management-container {
    padding: 0 20px 20px; /* 上边距设为0，通过margin控制 */
    height: 100vh;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
  }
  
  /* 页面标题 */
  .page-title {
    margin: 60px 0 0 20px; /* 顶部间距60px */
    padding: 0;
    font-size: 20px;
    font-weight: 600;
  }
  
  /* 内容区域 */
  .data-content {
    margin: 0 0 0 64px;
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
  }
  
  /* 卡片样式 */
  .data-card {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    margin-top: 20px; /* 与标题共同构成60px间距 */
  }
  
  /* 卡片头部样式 */
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 20px;
  }
  
  /* 表格容器 */
  .data-card :deep(.el-card__body) {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    padding: 0;
  }
  
  /* 表格样式 */
  .data-card :deep(.el-table) {
    flex: 1;
    overflow: auto;
  }
  
  /* 行高设置 */
  .data-card :deep(.el-table .el-table__row) {
    height: 120px;
  }
  .data-card :deep(.el-table td) {
    padding: 12px 0;
    vertical-align: top; /* 内容顶部对齐 */
  }
  
  /* 分页样式 */
  .pagination-container {
    margin-top: auto;
    padding: 16px 20px;
    background: #fff;
    border-top: 1px solid #ebeef5;
    display: flex;
    justify-content: center;
  }
  </style>