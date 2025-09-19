<script setup>
</script>
<template>
  <div class="app-container">
    <router-view />
  </div>
</template>

<style scoped lang="scss">
.app-container {
  height: 100vh;
  width: 100vw;

  .el-header {
    background-color: #409EFF;
    color: white;
    padding: 0;
    height: 60px;
  }

  .main-container {
    display: flex;
    height: calc(100vh - 64px);
  }

  .el-aside {
    background-color: #fff;
    border-right: 1px solid #e6e6e6;
  }
}
</style>
