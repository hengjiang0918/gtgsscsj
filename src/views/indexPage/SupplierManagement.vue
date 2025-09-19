<template>
    <div class="container">

        <!-- 子组件 -->
        <router-view v-slot="{ Component }">
            <transition name="fade-slide" mode="out-in">
                <component :is="Component" />
            </transition>
        </router-view>

    </div>
</template>
<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const router = useRouter();
const route = useRoute();

const activeTab = ref(''); // 初始化为空，稍后从路由恢复状态
const tabs = {
    SupplierList: { label: '供应商列表', path: 'SupplierList' },
    SupplierContract: { label: '供应商合同执行情况', path: 'SupplierContract' }
};
const isDetailPage = computed(() => {
    return route.name === 'SupplierDetail'; // 判断是否在 SupplierDetail 页面
});
// 页面加载时，根据路由恢复 Tab 状态
onMounted(async () => {
    const currentPath = route.path.split('/').pop(); // 获取当前路由的最后一段
    activeTab.value = Object.keys(tabs).find((key) => tabs[key].path === currentPath) || 'SupplierList';

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
watch(
    () => route.path,
    (newPath) => {
        const currentPath = newPath.split('/').pop(); // 获取当前路由的最后一段
        activeTab.value = Object.keys(tabs).find((key) => tabs[key].path === currentPath) || 'SupplierList';
    }
);
</script>
<style scoped lang="scss">
.container {
    width: 100%;
    display: flex;
    flex-direction: column;
    height: 100%;
}

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

/* 列表切换动画 */
.fade-slide-enter-active,
.fade-slide-leave-active {
    transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-slide-enter-from {
    opacity: 0;
    transform: translateY(15px);
}

.fade-slide-leave-to {
    opacity: 0;
    transform: translateY(-15px);
}
</style>