<script setup>

import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useUserStore } from '@/stores/userStore';
import { computed } from 'vue';


const route = useRoute(); // 获取当前路由
const router = useRouter(); // 路由实例

const userStore = useUserStore(); // 用户状态管理
const menuItems = ref([]);
onMounted(() => {
  if (userStore.pageName == 3) {
    menuItems.value = [
      { name: 'equipmentComparison', label: '设备一览', icon: 'Money' },
      { name: 'priceComparison', label: '比价一览', icon: 'Money' },
      { name: 'PrepaymentOverview', label: '预付款一览', icon: 'CreditCard' },
      { name: 'ProgressOverview', label: '进度一览', icon: 'TrendCharts' },
    ];
  } else if (userStore.pageName == 1) {
    // 菜单项数据
    menuItems.value = [
      { name: 'BuyingSituation', label: '采购情况', icon: 'Cpu' },
      { name: 'Approval', label: '立项申请', icon: 'Document' },
    ];
  } else if (userStore.pageName == 2) {
    menuItems.value = [
      { name: 'BuyingSituation', label: '采购情况', icon: 'Cpu' },
      { name: 'Approval', label: '立项申请', icon: 'Document' },
      { name: 'Management', label: '管理', icon: 'Setting' },
      { name: 'EquipmentInfo', label: '设备概览', icon: 'Menu' },
      { name: 'SupplierManagement', label: '供应商管理', icon: 'OfficeBuilding' },
    ];
  }
});


const activeMenu = computed(() => {
  const matchedRoute = menuItems.value.find((item) =>
    route.matched.some((matched) => matched.name === item.name)
  );
  return matchedRoute ? matchedRoute.name : null;
});
const originalPush = router.push;
router.push = function push(location) {
  return originalPush.call(this, location).catch((err) => {
    if (err.name !== 'NavigationDuplicated') {
      throw err;
    }
  });
};
// 路由跳转逻辑
const navigateTo = (name) => {
  console.log('Navigating to:', name);
  router.push({ "name": name }).catch((err) => {
    if (err.name !== 'NavigationDuplicated') {
      console.error(err); // 打印其他错误
    }
  });
};

</script>

<template>
  <div class="greetings">
    <ul class="side-menu">
      <li v-for="item in menuItems" :key="item.name" :class="{ 'is-active': activeMenu === item.name }"
        @click="navigateTo(item.name)">
        <div class="menu-item">
          <el-icon :size="20">
            <component :is="item.icon" />
          </el-icon>
          <span>{{ item.label }}</span>
        </div>
      </li>
    </ul>
  </div>
</template>
<style scoped>
.side-menu {
  border-right: none;
  display: flex;
  flex-direction: column;

  .el-menu-item {
    height: 100px;
    line-height: 50px;
    margin-bottom: 5px;
    padding-left: 30px !important;

    span {
      font-size: 18px;
      font-weight: bold;
    }

    &.is-active {
      background-color: #c0ddeb !important;
    }
  }
}
</style>

<style scoped>
.side-menu {
  list-style: none;
  padding: 0;
  margin: 0;
  border-right: none;
  display: flex;
  flex-direction: column;
}

.side-menu li {
  cursor: pointer;
  height: 100px;
  line-height: 50px;
  margin-bottom: 5px;
  padding-left: 30px;
  display: flex;
  align-items: center;
  transition: background-color 0.3s ease;
}

.side-menu li .menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.side-menu li span {
  font-size: 18px;
  font-weight: bold;
}

.side-menu li.is-active {
  background-color: #c0ddeb !important;
}

.side-menu li:hover {
  background-color: #e6f7ff;
}
</style>
