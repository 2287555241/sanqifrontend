<template>
  <div
    v-if="visible"
    class="custom-dialog"
    :style="{ left: position.x + 'px', top: position.y + 'px' }"
  >
    <el-card shadow="always" class="dialog-card">
      <div class="dialog-header" @mousedown="startDrag">
        <span>用户信息</span>
        <span class="dialog-close" @click="$emit('close')">×</span>
      </div>
      <div style="text-align:center; padding: 16px 0;">
        <el-avatar size="large" icon="el-icon-user" />
        <div style="margin-top:10px;">用户名：张三</div>
        <div>邮箱：zhangsan@example.com</div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const props = defineProps({
  visible: Boolean,
  position: Object
})
const emit = defineEmits(['close', 'update:position'])

const dragging = ref(false)
const offset = ref({ x: 0, y: 0 })

function startDrag(e) {
  dragging.value = true
  offset.value = {
    x: e.clientX - props.position.x,
    y: e.clientY - props.position.y
  }
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
}
function onDrag(e) {
  if (dragging.value) {
    emit('update:position', {
      x: e.clientX - offset.value.x,
      y: e.clientY - offset.value.y
    })
  }
}
function stopDrag() {
  dragging.value = false
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
}
</script>

<style scoped>
.custom-dialog {
  position: fixed;
  z-index: 9999;
  min-width: 300px;
  min-height: 120px;
  pointer-events: auto;
  user-select: none;
}
.dialog-card {
  padding: 0;
}
.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: move;
  font-weight: bold;
  padding: 10px 16px 0 16px;
  user-select: none;
}
.dialog-close {
  cursor: pointer;
  font-size: 20px;
  margin-left: 12px;
}
</style> 