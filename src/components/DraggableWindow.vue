<template>
  <div 
    v-if="visible"
    class="draggable-window-container"
    @mousedown.self="onContainerClick"
  >
    <div 
      ref="windowRef"
      class="draggable-window"
      :style="{
        width: width + 'px',
        height: height + 'px',
        top: windowPosition.y + 'px',
        left: windowPosition.x + 'px',
        zIndex: zIndex
      }"
    >
      <div 
        class="window-header"
        @mousedown="startDrag"
      >
        <div class="window-title">{{ title }}</div>
        <div class="window-controls">
          <el-button
            type="text"
            class="close-button"
            @click="close"
          >
            <el-icon><Close /></el-icon>
          </el-button>
        </div>
      </div>
      
      <div class="window-content">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue';
import { Close } from '@element-plus/icons-vue';

// Props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: 'Window'
  },
  initialPosition: {
    type: Object,
    default: () => ({ x: 100, y: 100 })
  },
  width: {
    type: Number,
    default: 600
  },
  height: {
    type: Number,
    default: 400
  },
  zIndex: {
    type: Number,
    default: 9999
  }
});

const emit = defineEmits(['update:visible', 'close']);

// Data
const windowRef = ref(null);
const isDragging = ref(false);
const dragOffset = ref({ x: 0, y: 0 });
const windowPosition = ref({ ...props.initialPosition });

// Methods
const startDrag = (e) => {
  // Prevent default behavior to avoid text selection
  e.preventDefault();
  
  // Start dragging
  isDragging.value = true;
  
  // Calculate the offset from the cursor to the window edge
  dragOffset.value.x = e.clientX - windowPosition.value.x;
  dragOffset.value.y = e.clientY - windowPosition.value.y;
  
  // Add global event listeners
  document.addEventListener('mousemove', onDrag);
  document.addEventListener('mouseup', stopDrag);
};

const onDrag = (e) => {
  if (!isDragging.value) return;
  
  // Calculate the new position
  windowPosition.value.x = e.clientX - dragOffset.value.x;
  windowPosition.value.y = e.clientY - dragOffset.value.y;
  
  // Apply constraints to keep the window within the viewport
  const windowWidth = props.width;
  const windowHeight = props.height;
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  
  // Constrain X position
  if (windowPosition.value.x < 0) {
    windowPosition.value.x = 0;
  } else if (windowPosition.value.x + windowWidth > screenWidth) {
    windowPosition.value.x = screenWidth - windowWidth;
  }
  
  // Constrain Y position
  if (windowPosition.value.y < 0) {
    windowPosition.value.y = 0;
  } else if (windowPosition.value.y + windowHeight > screenHeight) {
    windowPosition.value.y = screenHeight - windowHeight;
  }
};

const stopDrag = () => {
  isDragging.value = false;
  document.removeEventListener('mousemove', onDrag);
  document.removeEventListener('mouseup', stopDrag);
};

const close = () => {
  emit('update:visible', false);
  emit('close');
};

const onContainerClick = (e) => {
  // Close the window if the container is clicked
  close();
};

// Lifecycle hooks
onMounted(() => {
  // Ensure the window is positioned within view when it's mounted
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  
  // Ensure the window is not positioned off-screen
  if (windowPosition.value.x + props.width > screenWidth) {
    windowPosition.value.x = screenWidth - props.width - 20;
  }
  
  if (windowPosition.value.y + props.height > screenHeight) {
    windowPosition.value.y = screenHeight - props.height - 20;
  }
  
  // Ensure the window is not positioned at negative coordinates
  if (windowPosition.value.x < 0) {
    windowPosition.value.x = 20;
  }
  
  if (windowPosition.value.y < 0) {
    windowPosition.value.y = 20;
  }
});

onBeforeUnmount(() => {
  // Clean up any remaining event listeners
  document.removeEventListener('mousemove', onDrag);
  document.removeEventListener('mouseup', stopDrag);
});
</script>

<style scoped>
.draggable-window-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9000;
}

.draggable-window {
  position: absolute;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.window-header {
  padding: 15px;
  background-color: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: move;
  user-select: none;
}

.window-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.window-controls {
  display: flex;
  align-items: center;
}

.close-button {
  margin-left: 10px;
}

.window-content {
  flex: 1;
  padding: 15px;
  overflow-y: auto;
}
</style> 