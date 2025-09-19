<template>
  <div class="dashboard-container">
    <router-view></router-view>
  </div>
</template>
<script setup>
import { ref, watch, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const router = useRouter();
const route = useRoute();

const activeTab = ref(''); // 初始化为空，稍后从路由恢复状态
// const tabs = {
//   // EquipmentOverview: { label: '设备概览', path: 'EquipmentOverview' },
//   EquipmentList: { label: '设备列表', path: 'EquipmentList' }
// };

// 页面加载时，根据路由恢复 Tab 状态
onMounted(() => {
  const currentTab = route.query.tab; // 从 query 中获取当前 Tab
  // activeTab.value = Object.keys(tabs).find((key) => key === currentTab) || 'EquipmentList';
});

// 切换 Tab
const switchTab = (tabId) => {
  activeTab.value = tabId;
  router.push({
    name: tabId,
    query: { tab: tabId } // 使用 query 传递参数
  });
};

// 监听路由变化，动态更新 Tab 状态
// watch(
//   () => route.query.tab,
//   (newTab) => {
//     activeTab.value = Object.keys(tabs).find((key) => key === newTab) || 'EquipmentList';
//   }
// );

// 判断是否在 SupplierDetail 页面
const isDetailPage = computed(() => {
  console.log(route.name);
  route.name === 'SupplierDetail'
});

// 返回上一页
const goBack = () => {
  router.back();
};
</script>

<style lang="scss" scoped>
.dashboard-container {
  height: 100%;

  .header-wrapper {
    display: flex;
    align-items: center;
    margin-bottom: 1rem;

    .back-button {
      margin-right: auto;
    }
  }

  .tabs-wrapper {
    display: flex;
    gap: 1rem;

    .tab_item {
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