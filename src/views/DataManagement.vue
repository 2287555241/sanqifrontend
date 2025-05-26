<template>
    <div class="data-management-container">
      <h2>数据管理</h2>
      
      <el-card class="data-card">
        <template #header>
          <div class="card-header">
            <span>数据列表</span>
            <el-button type="primary" size="small">新增数据</el-button>
          </div>
        </template>
        
        <el-table :data="tableData" style="width: 100%" border>
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
  </template>
  
  <script setup>
  import { ref } from 'vue'
  
  // 模拟数据
  const tableData = ref([
    {
      id: 1,
      name: '2023年小麦产量数据',
      type: 'CSV',
      size: '2.5MB',
      createTime: '2023-06-15 10:30'
    },
    {
      id: 2,
      name: '玉米种植区分布图',
      type: 'GeoJSON',
      size: '5.2MB',
      createTime: '2023-06-18 14:15'
    },
    {
      id: 3,
      name: '土壤质量分析报告',
      type: 'PDF',
      size: '1.8MB',
      createTime: '2023-06-20 09:45'
    },
    {
      id: 4,
      name: '气象数据2023',
      type: 'Excel',
      size: '3.7MB',
      createTime: '2023-06-22 16:20'
    },
    {
      id: 5,
      name: '水稻生长监测影像',
      type: 'TIFF',
      size: '15.3MB',
      createTime: '2023-06-25 11:10'
    }
  ])
  
  const handleEdit = (row) => {
    console.log('编辑', row)
    // 这里可以打开编辑对话框或跳转到编辑页面
  }
  
  const handleDelete = (row) => {
    console.log('删除', row)
    // 这里可以弹出确认对话框并执行删除操作
  }
  
  const handlePageChange = (currentPage) => {
    console.log('页码变化', currentPage)
    // 这里可以加载对应页码的数据
  }
  </script>
  
  <style scoped>
  .data-management-container {
    padding: 20px;
  }
  
  .data-card {
    margin-top: 20px;
  }
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
  </style>