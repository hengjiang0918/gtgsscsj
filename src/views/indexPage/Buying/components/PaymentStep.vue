<template>
    <div class="payment-step-list">
        <el-form :model="{ suppliers: payments_suppliers }" label-width="100px">
            <div v-for="(item, index) in payments_suppliers" :key="item.supplier_id" class="supplier-card">
                <div class="card-header">
                    <span class="supplier-name">{{ item.supplier_name || '未填写' }}</span>
                </div>
                <div>
                    <template v-if="getSupplierProgress(item.payment_list) < 100">
                        <el-progress :percentage="getSupplierProgress(item.payment_list)" status="success"
                            :stroke-width="18" />
                    </template>
                    <template v-else>
                        <div
                            style="margin: 16px 0; display: flex; align-items: center; justify-content: space-between; flex-direction: column;">
                            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                                <circle cx="24" cy="24" r="22" stroke="#67C23A" stroke-width="4" fill="#F6FFED" />
                                <path d="M16 24l6 6 10-12" stroke="#67C23A" stroke-width="4" fill="none"
                                    stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                            <div class="progress-success-text">全部分期已完成</div>
                        </div>
                        <!-- 进度满时展示SVG -->

                    </template>
                </div>
                <!-- 分期进度条 -->
                <el-steps align-center finish-status="success" process-status="process" class="custom-steps">
                    <el-step v-for="(step, stepindex) in item.payment_list" :key="`${item.supplier_id}-${stepindex}`"
                        :title="`第${step.payment_order || (stepindex + 1)}期`" :description="getStepDescription(step)"
                        :status="getStepStatus(step.status)">
                        <template #description>
                            <div class="step-detail">
                                <div class="step-description">
                                    <span class="paid-at" v-if="step.finish_at">
                                        <el-icon style="vertical-align: middle; color: #67C23A; margin-right: 4px;">
                                            <CircleCheckFilled />
                                        </el-icon>
                                        <span style="color: #67C23A;">已支付</span>
                                        <span style="margin-left: 8px; color: #909399;">{{ step.finish_at.slice(0, 10)
                                            }}</span>
                                    </span>
                                    <span v-else>
                                        <el-icon style="vertical-align: middle; color: #E6A23C; margin-right: 4px;">
                                            <Clock />
                                        </el-icon>
                                        <span style="color: #E6A23C;">待支付</span>
                                    </span>
                                </div>
                                <div class="status-badge" :class="getStatusType(step.status)" style="margin-top: 6px;">
                                    <el-icon v-if="getStatusType(step.status) === 'success'" style="margin-right: 4px;">
                                        <CircleCheckFilled />
                                    </el-icon>
                                    <el-icon v-else-if="getStatusType(step.status) === 'warning'"
                                        style="margin-right: 4px;">
                                        <Clock />
                                    </el-icon>
                                    <el-icon v-else-if="getStatusType(step.status) === 'info'"
                                        style="margin-right: 4px;">
                                        <Minus />
                                    </el-icon>
                                    <span class="status-text">{{ getStatusText(step.status) }}</span>
                                </div>
                                <el-button v-if="step.status === 1" type="primary" size="small"
                                    style="margin-top: 10px; border-radius: 16px; font-weight: 600; letter-spacing: 1px;"
                                    @click="handleStepFinish(item, step, stepindex)">
                                    <el-icon style="margin-right: 4px;">
                                        <CircleCheckFilled />
                                    </el-icon>
                                    完成
                                </el-button>
                            </div>
                        </template>
                    </el-step>
                </el-steps>
            </div>
        </el-form>
        <div class="approval-actions">
            <el-button @click="handleBack">返回</el-button>
        </div>
    </div>
</template>
<script setup>
import { ref, watch, computed, onMounted, nextTick } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useUserStore } from '@/stores/userStore';
import { useRouter } from 'vue-router';
import api from '@/api';

const userStore = useUserStore()
const router = useRouter()
const props = defineProps({
    canEdit: Boolean,
    canSubmit: Boolean,
    purchase_id: String,
    status: Number,
})
const is_last_step = ref(false);
const can_approve = ref(false);
const payments_suppliers = ref([]);
const emit = defineEmits(['update-step', 'handle-approve']);
const canApprove = computed(() => {
    if (userStore.role == 1) {
        return can_approve.value; // 工厂相关人员不允许审批
    } else {
        return true
    }

});
onMounted(() => {
    if (props.purchase_id) {
        getPurchaseDetail();
    }
});

const getPurchaseDetail = async () => {
    try {
        const data = await api.purchaseDetail({
            purchase_id: props.purchase_id,
            detail_type: 'prepay',
            step_order: 3,
            user_id: userStore.user_id
        });
        is_last_step.value = data.is_last_step
        can_approve.value = data.can_approve
        if (data && data.supplierPayList) {
            payments_suppliers.value = data.supplierPayList.map(supplier => ({
                ...supplier,
                payment_list: supplier.payment_list || []
            }));
        }
        await nextTick();
    } catch (err) {
        ElMessage.error('获取预付款详情失败');
    }
};

const STATUS_MAP = {
    0: { text: '未开始', type: 'info', step: 'wait' },
    1: { text: '进行中', type: 'warning', step: 'process' },
    2: { text: '已完成', type: 'success', step: 'finish' },
    3: { text: '审批中', type: 'primary', step: 'process' }
}
const getStatusText = status => STATUS_MAP[status]?.text || '未知状态';
const getStatusType = status => STATUS_MAP[status]?.type || 'info';
const getStepStatus = status => STATUS_MAP[status]?.step || 'wait';

const getStepDescription = (step) => {
    if (step.paid_at) {
        return `支付时间: ${step.paid_at}`;
    }
    return `支付金额: ¥${step.amount} (${step.percent}%)`;
};

const getSupplierProgress = (payment_list) => {
    if (!payment_list || payment_list.length === 0) return 0;
    const total = payment_list.reduce((sum, step) => sum + (step.percent || 0), 0);
    const finished = payment_list.filter(step => step.status === 2).reduce((sum, step) => sum + (step.percent || 0), 0);
    return Math.round((finished / total) * 100);
};

const handleBack = () => { router.go(-1); }
// 在 <script setup> 中添加
const handleStepFinish = async (supplier, item) => {
    // 修改完成付款函数
    const key = `${supplier.supplier_id}-${item.payment_order}`;
    // 只有状态为1（进行中）才能操作
    if (item.status !== 1) {
        if (item.status === 0) {
            ElMessage.warning('该期付款尚未开始');
        } else if (item.status === 2) {
            ElMessage.info('该期付款已完成');
        }
        return;
    }
    try {
        await ElMessageBox.confirm(
            `确认完成第${item.payment_order}期付款吗？\n金额：¥${item.amount}`,
            '确认付款完成',
            {
                confirmButtonText: '确认完成',
                cancelButtonText: '取消',
                type: 'warning',
                customClass: 'finish-payment-confirm'
            }
        );

        // 设置加载状态

        // 调用API完成付款
        const finishData = {
            supplier_id: supplier.supplier_id,
            purchase_id: props.purchase_id,
            payment_order: item.payment_order,
            status: 2,
            finish_at: item.finish_at || formatDateTime(new Date())
        };

        // 这里调用实际的API
        await api.updatePurchasepayment(finishData);
        emit('data-change')
        getPurchaseDetail()
        ElMessage.success(`第${item.payment_order}期付款已完成`);

    } catch (error) {
        if (error !== 'cancel') {
            console.error('完成付款失败:', error);
            ElMessage.error('操作失败，请稍后重试');
        }
    } finally {
        // 重置加载状态
    }
};
function formatDateTime(date) {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    const ss = String(d.getSeconds()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
}
</script>

<style scoped lang="scss">
.payment-step-list {
    padding: 24px;

    .supplier-card {
        background: #fff;
        border-radius: 12px;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
        margin-bottom: 24px;
        padding: 20px 28px;

        .card-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 8px;

            .supplier-name {
                font-weight: bold;
                font-size: 18px;
            }

            .prepay-tag {
                margin-left: 12px;
                font-weight: 500;
            }
        }

        .progress-success-text {
            color: #67C23A;
            font-weight: bold;
            font-size: 16px;
            margin-top: 8px;
            text-align: center;
        }

        .custom-steps {
            margin: 20px 0;

            .el-step__title {
                font-size: 16px;
                font-weight: bold;
                color: #2563eb;
            }

            .el-step__description {
                font-size: 13px;
                color: #666;
                margin-top: 2px;
            }

            .step-detail {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 6px;
                margin-top: 6px;

                .step-description {
                    text-align: center;
                    font-size: 13px;

                    .paid-at {
                        color: #67C23A;
                        font-weight: 500;
                    }
                }

                .el-tag {
                    border-radius: 8px;
                    padding: 0 10px;
                }

                .el-button {
                    min-width: 72px;
                    font-size: 13px;
                }
            }
        }
    }

    .approval-actions {
        margin-top: 32px;
        display: flex;
        gap: 18px;
        justify-content: flex-end;
    }
}

.status-badge {
    display: inline-flex;
    align-items: center;
    padding: 2px 14px 2px 8px;
    border-radius: 16px;
    font-size: 14px;
    font-weight: 600;
    letter-spacing: 1px;
    background: #f3f6fa;
    color: #909399;

    .status-text {
        font-size: 14px;
    }

    &.success {
        background: #e6f9ec;
        color: #52c41a;
    }

    &.warning {
        background: #fff7e6;
        color: #faad14;
    }

    &.info {
        background: #f4f4f5;
        color: #909399;
    }

    &.primary {
        background: #e8f3ff;
        color: #409eff;
    }
}
</style>