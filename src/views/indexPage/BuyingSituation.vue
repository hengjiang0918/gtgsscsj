<template>
  <div class="container">
    <router-view v-slot="{ Component }">
      <transition name="fade-slide" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
const activeTab = ref('sbshop');
// 页面加载时，根据路由恢复 Tab 状态
// onMounted(async () => {
//   const currentPath = route.path.split('/').pop(); // 获取当前路由的最后一段
//   activeTab.value = Object.keys(tabs).find((key) => tabs[key].path === currentPath) || 'SbshopList';
// });
// // 监听路由变化，动态更新 Tab 状态
// watch(
//   () => route.path,
//   (newPath) => {
//     const currentPath = newPath.split('/').pop(); // 获取当前路由的最后一段
//     activeTab.value = Object.keys(tabs).find((key) => tabs[key].path === currentPath) || 'SbshopList';
//   }
// );
</script>
<style scoped lang="scss">
.container {
  width: 100%;
  display: flex;
  flex-direction: column;
  height: 100%;

  .tabs-wrapper {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
    justify-content: space-between;

    .tab_item {
      position: relative;
      padding: 1rem 2rem;
      cursor: pointer;
      border-radius: 8px;
      background: linear-gradient(135deg, #e0f7fa, #b2ebf2);
      transition: all 0.3s ease;
      color: #00796b;
      text-align: center;
      font-weight: bold;

      &:hover {
        background: linear-gradient(135deg, #b2ebf2, #80deea);
        transform: scale(1.05);
      }

      &.active {
        color: #004d40;
        background: linear-gradient(135deg, #80deea, #4dd0e1);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      }
    }
  }
}
</style>