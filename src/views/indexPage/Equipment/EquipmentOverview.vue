<template>
    <div class="equipment-overview-container">
        <div class="overview-header">
            <h2>设备概览</h2>
            <p>查看设备的整体情况和流程进度</p>
        </div>
        <div class="overview-content">
            <!-- 卡片区域 -->
            <el-row :gutter="20" class="mb-20">
                <el-col v-for="(card, index) in summaryCards" :key="index" :xs="24" :sm="12" :md="8">
                    <summary-card :title="card.title" :value="card.value" :icon="card.icon" :color="card.color"
                        :is-active="activeIndex === index" @click="cardClick(index, card.title)" />
                </el-col>
            </el-row>

            <!-- 图表区域 -->
            <el-row :gutter="20">
                <el-col :span="24">
                    <!-- <chart-card title="设备类型分布">
                    </chart-card> -->
                    <bar-chart :data="statusData" :colors="chartColors" />
                </el-col>
            </el-row>

            <!-- 多条流程步骤区域 -->
            <div class="steps-container">
                <div v-for="(process, index) in stepsData[activeTab]" :key="index" class="process-container">
                    <h3>{{ process.title }}</h3>
                    <el-steps :space="200" :active="process.currentStep" finish-status="success" align-center>
                        <el-popover v-for="(step, stepIndex) in process.steps" :key="stepIndex" placement="top-start"
                            :title="step.title" :width="500" trigger="hover" :content="step.content">
                            <template #reference>
                                <el-step :title="step.title" />
                            </template>
                        </el-popover>
                    </el-steps>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup>
import { ref, onMounted } from 'vue';
import SummaryCard from '@/components/SummaryCard.vue';
import BarChart from '@/components/charts/BarChart.vue';
import axios from 'axios'
const equipmentStore = useEquipmentStore();

const summaryCards = ref([
    { title: '总设备数', value: '156', icon: 'Cpu', color: '#409eff' },
    { title: '申购中', value: '128', icon: 'CircleCheck', color: '#67c23a' },
    { title: '报废申报', value: '18', icon: 'Warning', color: '#e6a23c' }
]);

const statusData = ref([]);
const chartColors = ref([]);
const backendData = ref([]);
const activeIndex = ref(0); // 当前高亮的卡片索引
const activeTab = ref('总设备数'); // 当前激活的 Tab
const name = ref('1'); // 当前激活的 Tab
const email = ref(''); // 当前激活的 Tab
const phone = ref('7'); // 当前激活的 Tab
const created_at = ref(''); // 当前激活的 Tab

// 流程步骤数据
const stepsData = ref({
    总设备数: [
        {
            title: '设备生命周期',
            currentStep: 1,
            steps: [
                { title: '设备登记', content: '登记设备的基本信息，包括型号、规格、用途等。' },
                { title: '设备入库', content: '设备入库记录' },
                { title: '设备报废', content: '设备达到使用年限后，进行报废处理。' }
            ]
        },
    ],
    申购中: [
        {
            title: '申购流程',
            currentStep: 2,
            steps: [
                { title: '需求确认', content: '确认设备需求，包括数量、规格和预算。' },
                { title: '审批流程', content: '提交申购申请，等待审批通过。' },
                { title: '采购执行', content: '根据审批结果，执行采购流程。' }
            ]
        }
    ],
    报废申报: [
        {
            title: '报废流程',
            currentStep: 0,
            steps: [
                { title: '报废申请', content: '提交设备报废申请，说明报废原因。' },
                { title: '审批流程', content: '等待相关部门审批报废申请。' },
                { title: '报废处理', content: '审批通过后，进行设备报废处理。' }
            ]
        }
    ]
});
const fetchcreateUpdate = async () => {

}

// 点击卡片切换图表和流程步骤
const cardClick = (index, title) => {


    activeIndex.value = index;
    activeTab.value = title;

    // 切换图表数据和颜色
    switch (title) {
        case '总设备数':
            statusData.value = equipmentStore.statusDistribution;
            chartColors.value = ['#409eff', '#67c23a', '#e6a23c'];
            break;
        case '申购中':
            statusData.value = equipmentStore.efficiencyTrend;
            chartColors.value = ['#67c23a', '#f56c6c', '#909399'];
            break;
        case '报废申报':
            statusData.value = equipmentStore.typeDistribution;
            chartColors.value = ['#e6a23c', '#f56c6c', '#409eff'];
            break;
    }
};

onMounted(async () => {
    fetchcreateUpdate()
    await equipmentStore.fetchSummary();
    statusData.value = equipmentStore.statusDistribution;
});
</script>

<style lang="scss" scoped>
/* 根容器设置为 flex 布局 */
.equipment-overview-container {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    /* 内容上下对齐 */
    min-height: calc(100% - 60px);
    /* 减去 header 的高度 */
    max-width: 1200px;
    /* 限制页面最大宽度 */
    margin: 0 auto;
    /* 居中对齐 */
    padding: 20px;
    background: #f9f9f9;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

    .overview-header {
        text-align: center;
        margin-bottom: 20px;

        h2 {
            font-size: 24px;
            color: #333;
            margin-bottom: 10px;
        }

        p {
            font-size: 14px;
            color: #666;
        }
    }

    .overview-content {
        flex-grow: 1;
        /* 让内容区域自动填充剩余空间 */
        display: flex;
        flex-direction: column;

        .steps-container {
            margin-top: 30px;
            padding: 20px;
            background: #fff;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

            .process-container {
                margin-bottom: 30px;

                h3 {
                    margin-bottom: 10px;
                    font-size: 18px;
                    color: #333;
                }
            }
        }
    }
}

/* 响应式设计 */
@media (max-width: 1200px) {
    .equipment-overview-container {
        padding: 15px;
    }

    .overview-header h2 {
        font-size: 22px;
    }

    .overview-header p {
        font-size: 13px;
    }
}

@media (max-width: 768px) {
    .equipment-overview-container {
        padding: 10px;
    }

    .overview-header h2 {
        font-size: 20px;
    }

    .overview-header p {
        font-size: 12px;
    }

    .steps-container {
        padding: 15px;
    }

    .process-container h3 {
        font-size: 16px;
    }
}

@media (max-width: 480px) {
    .overview-header h2 {
        font-size: 18px;
    }

    .overview-header p {
        font-size: 11px;
    }

    .steps-container {
        padding: 10px;
    }

    .process-container h3 {
        font-size: 14px;
    }
}

/* 针对超宽屏的优化 */
@media (min-width: 1600px) {
    .equipment-overview-container {
        max-width: 1400px;
        padding: 30px;
    }

    .overview-header h2 {
        font-size: 28px;
    }

    .overview-header p {
        font-size: 16px;
    }

    .steps-container {
        padding: 30px;
    }

    .process-container h3 {
        font-size: 20px;
    }
}
</style>