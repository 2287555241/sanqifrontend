<template>
  <div
    v-if="visible"
    class="draggable-dialog"
    :style="{ left: position.x + 'px', top: position.y + 'px' }"
  >
    <el-card shadow="always" class="dialog-card">
      <div class="dialog-header" @mousedown="!disabled && startDrag" :class="{ 'disabled': disabled }">
        <span>{{ title }}</span>
        <span class="dialog-close" @click="$emit('close')">×</span>
      </div>
      <div class="dialog-content">
        <slot></slot>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  visible: Boolean,
  title: String,
  initialPosition: {
    type: Object,
    default: () => ({ x: 100, y: 100 })
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'update:position'])

const position = ref(props.initialPosition)
const dragging = ref(false)
const offset = ref({ x: 0, y: 0 })

function startDrag(e) {
  if (props.disabled) return;
  
  dragging.value = true
  offset.value = {
    x: e.clientX - position.value.x,
    y: e.clientY - position.value.y
  }
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
}

function onDrag(e) {
  if (dragging.value && !props.disabled) {
    position.value = {
      x: e.clientX - offset.value.x,
      y: e.clientY - offset.value.y
    }
  }
}

function stopDrag() {
  dragging.value = false
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
}
</script>

<style scoped>
.draggable-dialog {
  position: fixed;
  z-index: 9999;
  min-width: 300px;
  min-height: 200px;
  pointer-events: auto;
  user-select: none;
}

.dialog-card {
  padding: 0;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: move;
  font-weight: bold;
  padding: 10px 16px;
  background: rgba(64, 158, 255, 0.1);
  border-bottom: 1px solid rgba(64, 158, 255, 0.2);
}

.dialog-header.disabled {
  cursor: default;
}

.dialog-close {
  cursor: pointer;
  font-size: 20px;
  color: #909399;
  transition: color 0.3s;
}

.dialog-close:hover {
  color: #409EFF;
}

.dialog-content {
  padding: 16px;
}
</style> 