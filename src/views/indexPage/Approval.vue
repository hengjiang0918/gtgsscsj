<template>
  <router-view></router-view>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const router = useRouter();
const route = useRoute();

const activeTab = ref('');
const tabs = {
  Purchase: { label: '采购审批', path: 'Purchase' },
};

// Helper function to get the active tab based on the route
const getActiveTabFromRoute = (path) => {
  const currentPath = path.split('/').pop();
  return Object.keys(tabs).find((key) => tabs[key].path === currentPath) || 'Purchase';
};

// Initialize activeTab on component mount
onMounted(() => {
  activeTab.value = getActiveTabFromRoute(route.path);
});

// Switch tab and update the route
const switchTab = (tabId) => {
  activeTab.value = tabId;
  router.push({ name: tabId, query: { tab: tabId } });
};

// Watch for route changes and update activeTab
watch(
  () => route.path,
  (newPath) => {
    activeTab.value = getActiveTabFromRoute(newPath);
  }
);
</script>
<style scoped>
.tabs-wrapper {
  display: flex;
  justify-content: start;
  align-items: center;
  background: #f5f5f5;
  padding: 10px 20px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
}

.tab_item {
  position: relative;
  padding: 10px 20px;
  margin-right: 10px;
  font-size: 16px;
  font-weight: 500;
  color: #333;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tab_item:hover {
  background: rgba(64, 158, 255, 0.1);
  color: #409eff;
}

.tab_item.active {
  color: white;
  background: #409eff;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

.tab_item.active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 100%;
  height: 4px;
  background: #409eff;
  border-radius: 2px;
  animation: slide-in 0.3s ease;
}

@keyframes slide-in {
  from {
    width: 0;
  }

  to {
    width: 100%;
  }
}
</style>
