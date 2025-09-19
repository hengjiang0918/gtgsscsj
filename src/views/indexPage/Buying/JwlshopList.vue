<!-- filepath: d:\项目文件\设备管理系统2.0\system2.0\src\components\JwlshopList.vue -->
<template>
    <div class="supplier-container">
        <div class="list-wrapper">
            <!-- 刷新按钮 -->
            <div class="pagination">
                <button @click="refreshList">刷新</button>
            </div>
            <!-- 列表头部 -->
            <ul class="list-header">
                <li v-for="header in headers" :key="header" class="list-header-item">
                    {{ header }}
                </li>
            </ul>
            <!-- 列表内容 -->
            <ul class="list-body">
                <li v-for="item, index in JwlshopList" :key="item.id" class="list-row"
                    :class="{ 'active-row': activeItemId === item.id }" @click="toggleDrawer(item)">
                    <!-- 列表项 -->
                    <span class="list-cell index">{{ index + 1 }}</span>
                    <span class="list-cell factory">{{ item.factory }}</span>
                    <span class="list-cell purchaseStatus">{{ item.purchaseStatus === 0 ? "未采购" : "已采购" }}</span>
                    <span class="list-cell contractSigned">{{ item.contractSigned === 0 ? "未签订" : "已签订" }}</span>
                    <span class="list-cell shipped">{{ item.shipped === 0 ? "未发货" : "已发货" }}</span>
                    <span class="list-cell arrivalDate">{{ item.arrivalDate }}</span>
                    <span class="list-cell paymentStatus">{{ item.paymentStatus === 0 ? "未付款" : "已付款" }}</span>
                </li>
            </ul>
        </div>
        <!-- 抽屉 -->
        <el-drawer v-model="drawerVisible" title="总流程步骤" size="50%" direction="btt" :before-close="closeDrawer">
            <el-steps v-if="activeItem && activeItem.steps" :active="getStep(activeItem.steps)" align-center
                :finish-status="'success'" class="custom-steps">
                <el-step v-for="(step, index) in activeItem.steps" :key="index" :title="step.name"
                    :icon="getStepIcon(step.status)">
                    <template #description>
                        <div class="step-detail">
                            <div class="step-time">
                                {{ step.time || "未知时间" }}
                            </div>
                            <div class="step-description">
                                {{ step.description || '' }}
                            </div>
                            <el-tag :type="getStatusType(index)" size="small" effect="plain">
                                {{ getStatusText(index) }}
                            </el-tag>
                        </div>
                    </template>
                </el-step>
            </el-steps>
            <!-- 付款步骤条 -->
            <template v-if="activeItem && activeItem.paymentSteps">
                <div class="payment-steps-container">
                    <h3>付款情况</h3>
                    <el-steps :active="getsubStep(activeItem.paymentSteps)" :finish-status="'success'" align-center
                        class="payment-steps">
                        <el-step v-for="(step, index) in activeItem.paymentSteps" :key="index" :title="step.name"
                            :icon="getStepIcon(step.status)">
                            <template #description>
                                <div class="step-detail">
                                    <div v-if="step.time" class="step-time">
                                        {{ step.time }}
                                    </div>
                                    <el-tag :type="getSubStatusType(index)" size="small" effect="plain">
                                        {{ getSubStatusText(index) }}
                                    </el-tag>
                                </div>
                            </template>
                        </el-step>
                    </el-steps>
                </div>
            </template>
        </el-drawer>
    </div>

</template>

<script setup>
import { ref, onMounted } from 'vue';
const headers = ['序号', '工厂', '申购情况', '合同是否签订', '是否发货', '到厂时间', '付款情况'];
const JwlshopList = ref([]);
const activeItemId = ref(null); // 当前显示步骤条的项的 ID
const activeItem = ref(null); // 当前选中的项
const drawerVisible = ref(false); // 控制抽屉的显示状态

// 状态映射配置
const statusConfig = {
    1: { icon: 'Clock', type: 'info', text: '待处理' },
    3: { icon: 'CircleCheck', type: 'success', text: '已完成' },
    0: { icon: 'Loading', type: 'danger', text: '未开始' },
    default: { icon: 'QuestionFilled', type: 'warning', text: '未知状态' },
};
// 切换抽屉的显示状态
const toggleDrawer = (item) => {

    activeItemId.value = item.id; // 设置高亮的列表项 ID
    activeItem.value = item; // 设置当前选中的项
    drawerVisible.value = true; // 显示抽屉
};
// 关闭抽屉
const closeDrawer = () => {
    drawerVisible.value = false; // 隐藏抽屉
    activeItemId.value = null; // 取消高亮
    activeItem.value = null; // 清空当前选中的项
};
const getStatusType = (index) => {

    const status = activeItem.value.steps[index].status;
    return status == '3' ? 'success' : status == '1' ? 'warning' : 'info';
};
const getSubStatusType = (index) => {
    const status = activeItem.value.paymentSteps[index].status;
    return status == '3' ? 'success' : status == '1' ? 'warning' : 'info';
};
const getStepIcon = (status) => {
    return statusConfig[status]?.icon || 'QuestionFilled'; // 默认返回 'QuestionFilled'
};
const getStatusText = (index) => {
    if (!activeItem.value || !activeItem.value.steps || !activeItem.value.steps[index]) {
        return '未知状态';
    }
    const status = activeItem.value.steps[index].status;
    return status == '0' ? '未开始' : status == '1' ? '进行中' : '已完成';
};
const getSubStatusText = (index) => {
    const status = activeItem.value.paymentSteps[index].status;

    return status == '0' ? '未开始' : status == '1' ? '进行中' : '已完成';
};
// 获取当前项的流程步骤
const getStep = (steps) => {
    return steps.findIndex((step) => step.status == '0') - 1;
};
const getsubStep = (steps) => {
    return steps.findIndex((step) => step.status == '0') - 1;
};

const loadMore = async () => {
    JwlshopList.value = await BuyingStore.fetchJwlshopList();
};

const refreshList = () => {
    activeItemId.value = null;
    loadMore();
};

const showDetail = (item) => {
    emit('show-detail', item);
};
// 判断是否所有步骤完成
const isAllStepsCompleted = (steps) => {
    console.log(155, steps.every((step) => step.status == 3));
    return steps.every((step) => step.status == 3);
};
onMounted(() => {
    loadMore();
});
</script>
<style lang="scss" scoped>
/* 颜色变量 */
$primary-color: #26c6da;
$primary-hover: #00acc1;
$primary-active: #00838f;
$secondary-color: #4da6e1;
$background-color: #f5f5f5;
$text-color: #004d40;
$shadow-color: rgba(0, 0, 0, 0.1);
$border-radius: 8px;

.el-drawer__title {
    font-size: 20px !important;
    text-align: center !important;
}

.supplier-container {
    height: calc(100% - 100px);

    .list-wrapper {
        flex: 1;
        display: flex;
        flex-direction: column;
        border-radius: $border-radius;
        box-shadow: 0 4px 12px $shadow-color;
        overflow: hidden;
        height: 100%;

        .list-header {
            display: flex;
            padding: 0 1rem 1rem 1rem;
            font-weight: bold;
            color: $text-color;

            .list-header-item {
                flex: 1;
                text-align: center;
            }
        }

        .list-body {
            flex: 1;
            overflow-y: auto;
            overflow-x: hidden;

            /* 自定义滚动条样式 */
            &::-webkit-scrollbar {
                width: 8px;
            }

            &::-webkit-scrollbar-thumb {
                background: lighten($primary-color, 20%);
                border-radius: 4px;
            }

            &::-webkit-scrollbar-thumb:hover {
                background: $primary-hover;
            }

            &::-webkit-scrollbar-track {
                background: #e0e0e0;
            }

            .active-row {
                background-color: rgba(38, 198, 218, 0.1);
                /* 高亮背景色 */
                border-left: 4px solid #26c6da;
                /* 左侧高亮边框 */
                transition: background-color 0.3s ease, border-color 0.3s ease;
                /* 添加过渡效果 */
            }

            .list-row {
                display: flex;
                /* 确保步骤条在列表项下方 */
                padding: 0.5rem;
                border-bottom: 1px solid #eee;


                &:nth-child(odd) {
                    background: rgba(0, 0, 0, 0.02);
                }

                &:hover {
                    background: rgba(46, 231, 207, 0.05);
                    box-shadow: 0 2px 4px $shadow-color;
                }



                .list-cell {
                    flex: 1;
                    text-align: center;
                    color: $text-color;
                    height: 40px;
                    line-height: 40px;

                    .el_button {
                        background: linear-gradient(135deg, $secondary-color, $primary-color);
                        color: white;
                        cursor: pointer;
                        width: 120px !important;
                        height: 40px;
                        transition: background-color 0.3s ease, transform 0.2s ease;

                        &:hover {
                            background: linear-gradient(135deg, $primary-color, $primary-hover);
                            transform: scale(1.05);
                        }

                        &:active {
                            background: linear-gradient(135deg, $primary-active, darken($primary-active, 10%));
                            transform: scale(0.95);
                        }
                    }
                }

                .step-container {
                    margin-top: 10px;
                    padding: 0 100px;
                    // background: #f9f9f9;
                    // border: 1px solid #ddd;
                    border-radius: 8px;
                    animation: slideDown 0.3s ease;
                    /* 添加滑动动画 */
                }
            }
        }

        .pagination {
            margin-top: auto;
            text-align: center;
            padding: 0.9rem;

            .load-more,
            .loading,
            .no-more {
                font-size: 1rem;
                color: $primary-active;
            }

            button {
                min-width: 160px;
                padding: 0.5rem 1.5rem;
                font-size: 1rem;
                border: none;
                border-radius: $border-radius;
                background: linear-gradient(135deg, $secondary-color, $primary-color);
                color: white;
                cursor: pointer;
                transition: background-color 0.3s ease, transform 0.2s ease;

                &:hover {
                    background: linear-gradient(135deg, $primary-color, $primary-hover);
                    transform: scale(1.05);
                }

                &:active {
                    background: linear-gradient(135deg, $primary-active, darken($primary-active, 10%));
                    transform: scale(0.95);
                }
            }
        }
    }
}

/* 容器样式 */
</style>
