<template>
    <div class="supplier-detail">
        <el-page-header @click="goBack" :content="supplier.name || '供应商详情'" />
        <div class="supplier-info">
            <!-- 标签页 -->
            <el-tabs v-model="activeTab" class="mt-20">
                <!-- 产品报价 -->
                <el-tab-pane label="产品报价" name="quotes">
                    <el-table :data="quotes" v-loading="loading.quotes" empty-text="暂无报价数据">
                        <el-table-column prop="product" label="产品名称" />
                        <el-table-column label="型号">
                            <template #default="{ row }">
                                <el-cascader v-model="row.selectedModel" :options="getModelOptions(row)" clearable
                                    placeholder="请选择型号" @change="handleModelChange(row)"
                                    :props="{ label: 'name', value: 'name', children: 'children', emitPath: false }" />
                            </template>
                        </el-table-column>
                        <el-table-column prop="price" label="报价">
                            <template #default="{ row }">
                                {{ formatCurrency(row) || '暂无报价' }}
                            </template>
                        </el-table-column>
                        <el-table-column label="操作" width="120">
                            <template #default="{ row }">
                                <el-button type="primary" size="small" @click="handleQuoteDetail(row)">详情</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>
                <!-- 历史合作 -->

                <el-tab-pane label="交易记录" name="transactions">
                    <el-table :data="history" row-key="id" :expand-row-keys="expandedRows" @row-click="toggleRowExpand"
                        v-loading="loading.transactions" style="width: 100%">
                        <!-- 展开箭头 -->
                        <el-table-column type="expand">
                            <template #default="{ row }">
                                <div class="process-steps">
                                    <el-steps :active="getActiveStep(row.steps)" align-center class="custom-steps">
                                        <el-step v-for="(step, index) in row.steps" :key="index" :title="step.name"
                                            :icon="getStepIcon(step.status)">
                                            <template #description>
                                                <div class="step-detail">
                                                    <div v-if="step.time" class="step-time">{{ step.time }}</div>
                                                    <el-tag :type="getStatusType(step.status)" size="small"
                                                        effect="plain">
                                                        {{ getStatusText(step.status) }}
                                                    </el-tag>
                                                </div>
                                            </template>
                                        </el-step>
                                    </el-steps>
                                </div>
                            </template>
                        </el-table-column>

                        <!-- 基础信息列 -->
                        <!-- 交易时间 -->
                        <el-table-column prop="date" label="交易时间" width="180" sortable />
                        <!-- 订单号 -->
                        <el-table-column prop="orderId" label="订单号" width="200">
                            <template #default="{ row }">
                                <el-link type="primary" @click="viewOrderDetail(row.orderId)">
                                    {{ row.orderId }}
                                </el-link>
                            </template>
                        </el-table-column>

                        <!-- 客户名称 -->
                        <el-table-column prop="customerName" label="客户名称" width="180" />

                        <!-- 订单类型 -->
                        <el-table-column prop="orderType" label="订单类型" width="180">
                            <template #default="{ row }">
                                <el-tag :type="row.orderType === '采购' ? 'success' : 'info'">
                                    {{ row.orderType }}
                                </el-tag>
                            </template>
                        </el-table-column>

                        <!-- 金额 -->
                        <el-table-column prop="amount" label="金额" width="180">
                            <template #default="{ row }">
                                <span class="amount">¥{{ formatNumber(row.amount) }}</span>
                            </template>
                        </el-table-column>

                        <!-- 付款方式 -->
                        <el-table-column prop="paymentMethod" label="付款方式" width="180" />

                        <!-- 备注 -->
                        <el-table-column prop="remarks" label="备注" width="260" />
                    </el-table>
                </el-tab-pane>

            </el-tabs>
        </div>

        <!-- 报价详情对话框 -->
        <el-dialog v-model="quoteDialogVisible" title="报价详情" width="60%">
            <div style="margin-bottom: 12px;">
                <el-button type="primary" size="small" @click="handleAddQuote">新增报价</el-button>
            </div>
            <el-table :data="currentQuoteDetails" border>
                <el-table-column prop="name" label="型号" />
                <el-table-column prop="price" label="报价">
                    <template #default="{ row }">
                        {{ formatCurrencyList(row.price) }}
                    </template>
                </el-table-column>
                <el-table-column prop="validDate" label="有效期" />
                <el-table-column prop="minOrder" label="最小起订量" />
                <el-table-column prop="deliveryTime" label="交货周期" />
                <el-table-column label="操作" width="160">
                    <template #default="{ row, $index }">
                        <el-button type="primary" size="small" @click="handleEditQuote(row, $index)">编辑</el-button>
                        <el-button type="danger" size="small" @click="handleDeleteQuote(row, $index)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <template #footer>
                <el-button @click="quoteDialogVisible = false">关闭</el-button>
            </template>
        </el-dialog>
        <!-- 编辑/新增报价对话框 -->
        <el-dialog v-model="editQuoteDialogVisible" :title="editQuoteIndex === -1 ? '新增报价' : '编辑报价'" width="40%">
            <el-form :model="editQuoteForm" label-width="90px">
                <el-form-item label="型号">
                    <el-input v-model="editQuoteForm.name" />
                </el-form-item>
                <el-form-item label="报价">
                    <el-input v-model="editQuoteForm.price" />
                </el-form-item>
                <el-form-item label="有效期">
                    <el-input v-model="editQuoteForm.validDate" />
                </el-form-item>
                <el-form-item label="最小起订量">
                    <el-input v-model="editQuoteForm.minOrder" />
                </el-form-item>
                <el-form-item label="交货周期">
                    <el-input v-model="editQuoteForm.deliveryTime" />
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="editQuoteDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="submitQuote">保存</el-button>
            </template>
        </el-dialog>
    </div>
</template>
<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router';
// 初始化图表
const route = useRoute()
const router = useRouter()

const history = ref([]) // Initialize history as an empty array
const quoteDialogVisible = ref(false)
const currentQuoteDetails = ref([])



const activeTab = ref('quotes')

const supplier = ref({})
const quotes = ref([])
const stats = ref({
    cooperationYears: 0,
    totalPurchase: 0,
    orderCount: 0,
    averageRating: 0
})
const loading = ref({
    quotes: false,
    history: false, // Add loading state for history
    // stats: false
})
// 状态映射配置
const statusConfig = {
    pending: { icon: 'Clock', type: 'info', text: '待处理' },
    processing: { icon: 'Loading', type: 'warning', text: '进行中' },
    completed: { icon: 'CircleCheck', type: 'success', text: '已完成' },
    canceled: { icon: 'CircleClose', type: 'danger', text: '已取消' }
}
// 在<script setup>中添加
const editQuoteDialogVisible = ref(false)
const editQuoteForm = ref({
    name: '',
    price: '',
    validDate: '',
    minOrder: '',
    deliveryTime: ''
})
const editQuoteIndex = ref(-1)

const handleAddQuote = () => {
    editQuoteForm.value = { name: '', price: '', validDate: '', minOrder: '', deliveryTime: '' }
    editQuoteIndex.value = -1
    editQuoteDialogVisible.value = true
}
const handleEditQuote = (row, index) => {
    editQuoteForm.value = { ...row }
    editQuoteIndex.value = index
    editQuoteDialogVisible.value = true
}
const handleDeleteQuote = (row, index) => {
    currentQuoteDetails.value.splice(index, 1)
}

const submitQuote = () => {
    if (editQuoteIndex.value === -1) {
        currentQuoteDetails.value.push({ ...editQuoteForm.value })
    } else {
        currentQuoteDetails.value[editQuoteIndex.value] = { ...editQuoteForm.value }
    }
    editQuoteDialogVisible.value = false
}
// 获取当前激活步骤
const getActiveStep = (steps) => {
    return steps.findIndex((step) => step.status === 'processing') + 1;
};

// 获取步骤图标
const getStepIcon = (status) => {
    return statusConfig[status]?.icon || 'QuestionFilled';
};

// 获取状态类型
const getStatusType = (status) => statusConfig[status]?.type || 'info';

// 获取状态文本
const getStatusText = (status) => statusConfig[status]?.text || '未知状态';
// 行展开控制
const expandedRows = ref([])
const toggleRowExpand = (row) => {
    const index = expandedRows.value.indexOf(row.id)
    index > -1
        ? expandedRows.value.splice(index, 1)
        : expandedRows.value.push(row.id)
}
const formatNumber = (number) => {
    if (typeof number !== "number") return "0";
    return number.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};
const handleQuoteDetail = (row) => {
    currentQuoteDetails.value = row.models || []
    quoteDialogVisible.value = true
}
// 返回上一页
const goBack = () => {
    router.back();
};


// 格式化货币
const formatCurrency = (row) => {
    const selectedModel = row.models.find((model) => model.name === row.selectedModel)
    if (selectedModel) {
        console.log('选中的型号:', selectedModel)
        return `¥${parseFloat(selectedModel.price).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`
    }
    return '¥0.00'
}
// 格式化列表货币
const formatCurrencyList = (value) => {
    return `¥${parseFloat(value).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`
}

// 获取型号选项
const getModelOptions = (row) => {
    return row.models || []
}

// 处理型号选择变化
const handleModelChange = (row) => {
    // 根据 selectedModel 的值从 models 中找到对应的型号对象
    const selectedModel = row.models.find((model) => model.name === row.selectedModel)
    if (selectedModel) {
        row.selectedModel = selectedModel.name // 更新 selectedModel 为完整的对象
    } else {
        console.warn('未找到对应的型号:', row.selectedModel)
    }
}



onMounted(async () => {

})
</script>
<style lang="scss" scoped>
$supplier-bg-start: #e0f7fa;
$supplier-bg-end: #b2ebf2;
$supplier-hover-bg-start: #b2ebf2;
$supplier-hover-bg-end: #80deea;
$supplier-text-color: #00796b;
$supplier-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
$supplier-border-radius: 8px;



.supplier-detail {
    height: 100%;
    padding: 20px;

    .el-page-header {
        display: flex;
        gap: 1rem;
        margin-bottom: 1rem;
        padding: 1rem 2rem;
        cursor: pointer;
        border-radius: $supplier-border-radius;
        background: linear-gradient(135deg, $supplier-bg-start, $supplier-bg-end);
        transition: all 0.3s ease;
        color: $supplier-text-color;
        text-align: center;
        font-weight: bold;

        &:hover {
            background: linear-gradient(135deg, $supplier-hover-bg-start, $supplier-hover-bg-end);
            transform: scale(1.05);
        }
    }

    .supplier-info {
        padding: 20px;
        border-radius: 12px;
        box-shadow: $supplier-shadow;
        overflow: hidden;
        height: calc(100% - 56px);

        .mt-20 {
            margin-top: 0;
        }

        .mr-5 {
            margin-right: 5px;
        }

        .chart-item {
            background: #fff;
            padding: 15px;
            border-radius: $supplier-border-radius;
            box-shadow: $supplier-shadow;
        }

        .timeline-content {
            background: #f5f7fa;
            padding: 10px 15px;
            border-radius: 4px;
        }

        .empty-timeline {
            text-align: center;
            padding: 20px;
            color: #909399;
        }



        .process-steps {
            padding: 20px 10%;
            background: #f8f9fa;
            margin: 12px 0;
            border-radius: $supplier-border-radius;

            .custom-steps {
                .el-step__head {
                    .el-step__icon {
                        font-size: 24px;

                        &[status='completed'] {
                            background-color: #e8f4ff;
                        }
                    }
                }

                .el-step__title {
                    font-weight: 500;
                    font-size: 14px;
                }

                .step-detail {
                    margin-top: 8px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;

                    .step-time {
                        font-size: 12px;
                        color: #909399;
                        margin-bottom: 4px;
                    }
                }
            }
        }

        .amount {
            font-weight: 600;
            color: #409eff;
        }
    }
}
</style>