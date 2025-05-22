<template>
  <div class="common-layout indexVue-container">
    <navMain class="map-bg" />
    <indexHeader />
    <div class="content-container">
      <el-container style="background: transparent; box-shadow: none;">
        <el-aside width="200px" style="background: transparent; box-shadow: none; margin-top: 60px;">
          <navMenu />
        </el-aside>
        <el-container>
          <el-main style="background: transparent; padding: 0; margin-top: 60px;"></el-main>
        </el-container>
      </el-container>
    </div>
  </div>
</template>

<script setup>
import navMenu from './navMenu.vue';
import indexHeader from './indexHeader.vue';
import navMain from './navMain.vue';
</script>

<style scoped>
.indexVue-container {
  width: 100vw;
  height: 100vh;
  position: relative;
  overflow: hidden;
}
.map-bg {
  position: absolute;
  left: 0; top: 0; right: 0; bottom: 0;
  width: 100vw;
  height: 100vh;
  z-index: 0;
}
.content-container {
  position: absolute;
  left: 0; top: 0;
  z-index: 1;
  background: transparent;
  pointer-events: none;
  width: auto;
  height: auto;
}
.content-container * {
  pointer-events: auto;
}
</style>