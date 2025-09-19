<template>
    <div class="prepay-step" v-if="canApprove">
        <el-form label-width="100px">
            <!-- 供应商卡片 -->
            <transition-group name="supplier-card" tag="div" class="supplier-list" @before-enter="beforeEnter"
                @enter="enter" @leave="leave">
                <div v-for="(supplier, index) in supplierPayList" :key="supplier.supplier_id" :data-index="index"
                    class="supplier-card" :style="getCardStyle(index)">
                    <div class="installment-section">
                        <div class="table-container">
                            <transition name="table-expand" mode="out-in">
                                <el-table :key="`table-${supplier.supplier_id}`" :data="supplier.payment_list" stripe
                                    border size="small" :header-cell-style="{
                                        backgroundColor: '#667eea',
                                        color: 'white',
                                        fontWeight: 'bold',
                                        textAlign: 'center',
                                        padding: '12px 8px'
                                    }" :cell-style="{ textAlign: 'center', padding: '8px 4px' }"
                                    :row-class-name="getPaymentRowClassName"
                                    :span-method="createSupplierSpanMethod(supplier)">

                                    <el-table-column label="供应商" min-width="150" fixed="left" prop="supplier_name">
                                        <template #default="{ row, $index }">
                                            <div class="period-cell"
                                                style="display: flex; align-items: center;flex-direction: column;">
                                                <div class="period-badge">{{ supplier.supplier_name }}</div>
                                                <span class="total-amount">¥{{
                                                    supplier.prepayAmount?.toLocaleString() || 0 }}</span>
                                            </div>
                                        </template>
                                    </el-table-column>
                                    <el-table-column label="付款类型" min-width="100" fixed="left" prop="payment_type">
                                        <template #default="{ row, $index }">
                                            <div class="period-cell">
                                                <div class="period-badge">{{ supplier.paymentType == 1 ? '预付款' :
                                                    '余额付款'
                                                }}</div>
                                            </div>
                                        </template>
                                    </el-table-column>

                                    <el-table-column label="期数" min-width="100" fixed="left">
                                        <template #default="{ row, $index }">
                                            <div class="period-cell">
                                                <div class="period-badge">第{{ $index + 1 }}期</div>
                                            </div>
                                        </template>
                                    </el-table-column>

                                    <el-table-column label="比例" min-width="100">
                                        <template #default="{ row }">
                                            <div class="percent-cell">
                                                <div class="percent-badge">{{ row.percent }}%</div>
                                            </div>
                                        </template>
                                    </el-table-column>

                                    <el-table-column label="金额" min-width="100">
                                        <template #default="{ row }">
                                            <div class="amount-cell">
                                                <span class="amount-value">¥{{ row.amount?.toLocaleString()
                                                }}</span>
                                            </div>
                                        </template>
                                    </el-table-column>

                                    <el-table-column label="付款时间" width="180">
                                        <template #default="{ row }">
                                            <div class="time-cell">
                                                <el-date-picker v-if="props.canEdit" v-model="row.paid_at" type="date"
                                                    placeholder="选择付款时间" size="small" :disabled="!props.canEdit"
                                                    class="time-picker" format="YYYY-MM-DD" value-format="YYYY-MM-DD"
                                                    style="width: 100%" @change="handleDateChange(supplier, row)" />
                                                <span v-else class="time-readonly">
                                                    {{ row.paid_at ? new
                                                        Date(row.paid_at).toLocaleDateString('zh-CN', {
                                                            year: 'numeric', month: '2-digit', day: '2-digit'
                                                        }).replace(/\//g,
                                                            '-') : '未设置' }}
                                                </span>
                                            </div>
                                        </template>
                                    </el-table-column>

                                    <el-table-column label="状态" min-width="120">
                                        <template #default="{ row }">
                                            <div class="status-cell">
                                                <el-tag :type="getPaymentStatusType(row.status)" size="small"
                                                    class="status-tag">
                                                    {{ getPaymentStatusText(row.status) }}
                                                </el-tag>
                                            </div>
                                        </template>
                                    </el-table-column>

                                    <el-table-column label="操作" min-width="280" fixed="right">
                                        <template #default="{ row, $index }">
                                            <div class="action-cell">
                                                <el-button @click="exportPaymentRequest(supplier, row)"
                                                    class="export-payment-btn" type="primary" size="small"
                                                    :disabled="!supplier.payment_list || supplier.payment_list.length === 0"
                                                    :loading="exportLoading[`${supplier.supplier_id}-${row.payment_order}`]">
                                                    <el-icon>
                                                        <Download />
                                                    </el-icon>
                                                    {{
                                                        exportLoading[`${supplier.supplier_id}-${row.payment_order}`]
                                                            ?
                                                            '导出中' : '导出申请' }}
                                                </el-button>
                                                <el-button @click="finishPayment(supplier, row)"
                                                    class="finish-payment-btn" :class="{
                                                        'payment-not-started': row.status === 0,
                                                        'payment-in-progress': row.status === 1,
                                                        'payment-finished': row.status === 2
                                                    }" size="small" :disabled="$index !== 0"
                                                    :loading="finishLoading[`${supplier.supplier_id}-${row.payment_order}`]">
                                                    <el-icon>
                                                        <CircleClose v-if="row.status == 0" />
                                                        <Clock v-else-if="row.status == 1" />
                                                        <CircleCheckFilled v-else-if="row.status == 2" />
                                                    </el-icon>
                                                    <div class="icon_flex"
                                                        style="display: flex; align-items: center; flex-direction: column;">
                                                        <div>
                                                            {{ getFinishButtonText(row,
                                                                `${supplier.supplier_id}-${row.payment_order}`, $index) }}
                                                        </div>
                                                        <div v-if="row.finish_at" class="finish-time">
                                                            {{ row.finish_at ? new
                                                                Date(row.finish_at).toLocaleDateString('zh-CN') : '' }}
                                                        </div>
                                                    </div>
                                                </el-button>
                                            </div>
                                        </template>
                                    </el-table-column>
                                </el-table>
                            </transition>
                        </div>
                    </div>
                </div>
            </transition-group>
        </el-form>

        <!-- 操作按钮 -->
        <transition name="fade-up" appear>
            <div class="approval-actions">

                <el-button v-if="can_approve && status == 2" type="danger" @click="handleReject">退回</el-button>
                <el-button v-if="canSubmit && status == 1" type="success"
                    @click="handleApproveConfirm(2)">通过</el-button>
                <el-button @click="handleBack">返回</el-button>
            </div>
        </transition>
    </div>
</template>
<script setup>
import { ref, watch, computed, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { useUserStore } from '@/stores/userStore';
import api from '@/api';
const can_approve = ref(false)
const is_last_step = ref(false)
const userStore = useUserStore()
const props = defineProps({
    canEdit: Boolean,
    canSubmit: Boolean,
    purchase_id: String,
    status: Number,
})
// 动画相关方法

const canApprove = computed(() => {
    if (userStore.role == 1) {
        return can_approve.value; // 工厂相关人员不允许审批
    } else {
        return true
    }

});
const beforeEnter = (el) => {
    el.style.opacity = '0';
    el.style.height = '0';
    el.style.transform = 'translateY(-20px) scale(0.95)';
    el.style.overflow = 'hidden';
};
const enter = (el) => {
    const index = el.dataset.index;
    el.offsetHeight;
    el.style.transition = `all 0.1s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.1}s`;
    el.style.opacity = '1';
    el.style.height = 'auto';
    el.style.transform = 'translateY(0) scale(1)';
    el.style.overflow = 'visible';
};
const leave = (el) => {
    el.style.transition = 'all 0.2s ease-in-out';
    el.style.opacity = '0';
    el.style.height = '0';
    el.style.transform = 'translateY(-20px) scale(0.95)';
    el.style.overflow = 'hidden';
};

// 计算卡片样式
const getCardStyle = (index) => {
    return {
        '--animation-delay': `${index * 0.1}s`
    };
};
// 导出付款申请
const exportPaymentRequest = async (supplier, item) => {
    const key = `${supplier.supplier_id}-${item.payment_order || 'single'}`;

    if (!supplier.payment_list || supplier.payment_list.length === 0) {
        ElMessage.warning('该供应商暂无付款明细');
        return;
    }

    try {
        // 设置加载状态
        exportLoading.value[key] = true;

        // 准备付款申请数据
        const paymentData = preparePaymentApplicationData(supplier, item);

        console.log('发送付款申请数据:', paymentData);

        // 调用后端API
        const data = await api.exportPayment({
            paymentData: paymentData
        });

        // 处理文件下载
        if (data && data.file_url) {
            // 直接打开文件URL进行下载
            window.open(data.file_url, '_blank');
            let periodText = item && item.payment_order ? `（第${item.payment_order}期）` : '';
            ElMessage.success(`${supplier.supplier_name}${periodText} 的付款申请已导出成功`);
        } else {
            ElMessage.error('文件地址获取失败');
        }


    } catch (error) {
        console.error('导出付款申请失败:', error);
        ElMessage.error('导出失败，请稍后重试');
    } finally {
        exportLoading.value[key] = false;
    }
};
const handleDateChange = (supplier, item) => {
    // 处理日期变化
    console.log('日期变化:', item);
    const date = new Date(item.paid_at);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const paid_at = `${yyyy}-${mm}-${dd}`;
    api.updateTimePayment({
        purchase_id: props.purchase_id,
        payment_order: item.payment_order,
        supplier_id: supplier.supplier_id,
        paid_at: paid_at,
    }).then(res => {

    }).catch(err => {
        console.error('更新付款时间失败:', err);
        ElMessage.error('网络错误，付款时间更新失败');
    })
};
// 准备付款申请数据
const preparePaymentApplicationData = (supplier, item) => {
    const totalAmount = supplier.prepayAmount || 0;
    const paymentType = supplier.paymentType === 1 ? '预付款' : '全额付款';

    // 计算当期付款金额和百分比
    let paymentAmount = 0;
    let currentPeriod = 1;

    if (supplier.paymentType === 1 && item) {
        // 预付款模式，使用当期的金额和百分比
        paymentAmount = parseFloat(item.amount) || 0;
        currentPeriod = item.payment_order || 1;
    } else {
        // 全额付款模式
        paymentAmount = totalAmount;
    }

    // 生成付款申请描述
    const generateMainContent = () => {
        let content = `国盛实业从${supplier.supplier_name}采购设备，合同总金额${totalAmount.toFixed(2)}元。按照合同约定:`;


        // 添加备注信息
        if (supplier.payment_list && supplier.payment_list.length > 0) {
            const allRemarks = supplier.payment_list
                .map((payItem, idx) => payItem.remark ? `  ${idx + 1}、${Array.isArray(payItem.remark) ? payItem.remark.join('\n  ') : payItem.remark}` : '')
                .filter(Boolean)
                .join('\n  ');
            if (allRemarks) {
                content += `\n  ${allRemarks}`;
            }
        }

        return content;
    };

    // 准备商品明细 - 简化版本，实际应该从采购详情获取
    const prepareItems = () => {
        return supplier.contract_list
    };

    // 返回符合后端预期的数据格式
    return {
        // 基本信息
        purpose: `${supplier.supplier_name}采购设备付款申请`,
        mainContent: generateMainContent(),
        contractTotalAmount: totalAmount.toString(),
        paymentType: paymentType,
        filiale: supplier.filiale,
        projectNumber: props.purchase_id || '',
        paymentAmount: paymentAmount.toString(),
        paymentAmountChinese: convertToChinese(paymentAmount),
        recipient: supplier.supplier_name,
        accountNo: supplier.accountNo || '', // 从供应商信息获取
        bankAccount: supplier.bankAccount || '', // 从供应商信息获取
        attachments: '合同一份',

        // 商品明细 - 需要序列化为JSON字符串
        items: JSON.stringify(prepareItems()),

        // 额外的标识信息
        supplier_id: supplier.supplier_id.toString(),
        purchase_id: props.purchase_id.toString(),
        payment_order: currentPeriod.toString(),
        current_period: supplier.paymentType === 1 ? `第${currentPeriod}期` : '全额付款'
    };
};
// 修复供应商列合并方法 - 传入 supplier 参数
// 或者更简洁的方法 - 使用闭包
const createSupplierSpanMethod = (currentSupplier) => {
    return ({ row, column, rowIndex, columnIndex }) => {
        // 只对供应商列（prop="supplier_name"）进行合并
        if (column.property === 'supplier_name') {
            if (rowIndex === 0) {
                // 第一行显示，合并所有行
                const rowCount = currentSupplier?.payment_list?.length || 1;
                console.log('供应商列合并行数:', rowCount);
                return [rowCount, 1];
            } else {
                // 其他行隐藏
                return [0, 0];
            }
        }

        // 其他所有列都返回正常的1行1列，不进行合并
        return [1, 1];
    };
};

// 数字转中文大写
const convertToChinese = (amount) => {

    const cnNums = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖']
    const cnIntRadice = ['', '拾', '佰', '仟']
    const cnIntUnits = ['', '万', '亿', '兆']
    const cnDecUnits = ['角', '分', '毫', '厘']
    const cnInteger = '整'
    const cnIntLast = '元'

    // 简化版转换函数，实际项目中建议使用专门的库
    if (amount == 0) return '零元整'

    let integerNum = Math.floor(amount)
    let decimalNum = Math.round((amount - integerNum) * 100)


    if (integerNum === 0) {
        return decimalNum > 0 ? `${cnNums[Math.floor(decimalNum / 10)]}角${cnNums[decimalNum % 10]}分` : '零元整'
    }

    // 简化处理，这里只处理基本情况
    // 将整数部分转换为中文大写
    let result = ''
    let intStr = integerNum.toString()
    let len = intStr.length
    let zeroCount = 0
    for (let i = 0; i < len; i++) {
        let n = parseInt(intStr.charAt(i))
        let p = len - i - 1
        let q = Math.floor(p / 4)
        let m = p % 4
        if (n === 0) {
            zeroCount++
        } else {
            if (zeroCount > 0) {
                result += cnNums[0]
            }
            zeroCount = 0
            result += cnNums[n] + cnIntRadice[m]
        }
        if (m === 0 && zeroCount < 4) {
            result += cnIntUnits[q]
        }
    }
    result += cnIntLast
    if (decimalNum > 0) {
        if (Math.floor(decimalNum / 10) > 0) {
            result += `${cnNums[Math.floor(decimalNum / 10)]}角`
        }
        if (decimalNum % 10 > 0) {
            result += `${cnNums[decimalNum % 10]}分`
        }
    } else {
        result += cnInteger
    }

    return result
}

const finishLoading = ref({}); // 记录每个供应商的付款完成加载状态

const supplierPayList = ref(
    []
)
const emit = defineEmits(['data-change', 'handle-approve']);
// 表单校验规则
onMounted(() => {
    nextTick(() => {
        if (!canApprove.value) return;
        getPurchaseDetail();
    });
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

        // 处理数据
        const processedData = data.supplierPayList?.map(supplier => ({
            ...supplier,
            prepayAmount: Number(supplier.prepayAmount) || 0,
            installmentCount: supplier.installmentCount || 0,
            installmentCount: supplier.installmentCount || 0,
            installments: supplier.installments?.map(installment => ({
                ...installment,
                percent: Number(installment.percent) || 0,
                amount: Number(installment.amount) || 0
            })) || []
        })) || [];
        supplierPayList.value = processedData;

        await nextTick();
    } catch (err) {
        console.error('获取询价比价详情失败', err);
    }
};
const getFinishButtonText = (item, key, index = 0) => {
    // 加载中状态
    if (finishLoading.value[key]) return '处理中...';
    // 只有第一个分期显示真实状态，其余始终显示“未开始”
    switch (item.status) {
        case 0:
            return '未开始';
        case 1:
            return '进行中';
        case 2:
            return '已完成';
        default:
            return '未知状态';
    }
};
// 审批通过
const handleApproveConfirm = async (type) => {
    try {
        await api.approveStepPass({
            purchase_id: props.purchase_id,
            flow_type: 3,
            operator_id: userStore.user_id,
            operator: userStore.user_name,
            is_last_step: is_last_step.value,
        })

        emit('data-change')
        ElMessage.success(type === 2 ? '审批通过成功' : '审批驳回成功')
    } catch (err) {
        console.error('审批操作失败', err)
        ElMessage.error('审批操作失败，请稍后重试')
    }
}
const handleReject = async () => {
    try {
        await api.approveStepReject({
            purchase_id: props.purchase_id,
            step_order: 3,
            operator_id: userStore.user_id,
            operator: userStore.user_name,
        })

        emit('data-change')
        ElMessage.success('审批驳回成功')
    } catch (err) {
        console.error('审批操作失败', err)
        ElMessage.error('审批操作失败，请稍后重试')
    }
}
// 修改完成付款函数
const finishPayment = async (supplier, item) => {
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

    if (!item.paid_at) {
        ElMessage.warning('请先设置付款时间');
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
        finishLoading.value[key] = true;

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
        finishLoading.value[key] = false;
    }
};
const handleBack = () => {
    router.go(-1)
}
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
// 导出状态管理
const exportLoading = ref({});
// 新增表格相关方法
const getPaymentRowClassName = ({ row, rowIndex }) => {
    switch (row.status) {
        case 0: return 'row-pending';
        case 1: return 'row-processing';
        case 2: return 'row-completed';
        default: return '';
    }
};

const getPaymentStatusType = (status) => {
    switch (status) {
        case 0: return 'info';
        case 1: return 'warning';
        case 2: return 'success';
        default: return 'info';
    }
};

const getPaymentStatusText = (status) => {
    switch (status) {
        case 0: return '未开始';
        case 1: return '进行中';
        case 2: return '已完成';
        default: return '未知';
    }
};


</script>
<style lang="scss" scoped>
// 变量定义
$primary-gradient: linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%);
$card-shadow: 0 10px 30px rgba(53, 134, 248, 0.2);
$card-shadow-hover: 0 20px 40px rgba(102, 166, 255, 0.15);
$border-radius-lg: 20px;
$border-radius-md: 15px;
$transition-default: all 0.3s ease;

// 主容器
.prepay-step {
    min-height: calc(100vh - 200px);

    // 供应商列表容器
    .supplier-list {
        position: relative;
    }

    // 供应商卡片
    .supplier-card {
        background: #fff;
        border-radius: $border-radius-lg;
        box-shadow: $card-shadow;
        margin-bottom: 30px;
        overflow: hidden;
        border: 1px solid rgba(255, 255, 255, 0.2);
        transform-origin: center top;

        // 进入动画
        &.supplier-card-enter-active {
            transition: all 0.1s cubic-bezier(0.4, 0, 0.2, 1);
            transition-delay: var(--animation-delay);
        }

        &.supplier-card-enter-from {
            opacity: 0;
            transform: translateY(-10px) scale(0.9);
            max-height: 0;
        }

        &.supplier-card-enter-to {
            opacity: 1;
            transform: translateY(0) scale(1);
            max-height: 1000px;
        }

        // 离开动画
        &.supplier-card-leave-active {
            transition: all 0.4s ease-in-out;
        }

        &.supplier-card-leave-from {
            opacity: 1;
            transform: translateY(0) scale(1);
            max-height: 1000px;
        }

        &.supplier-card-leave-to {
            opacity: 0;
            transform: translateY(-30px) scale(0.9);
            max-height: 0;
            margin-bottom: 0;
        }

        // 悬停效果
        &:hover {
            transform: translateY(-5px) scale(1.02);
            box-shadow: $card-shadow-hover;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }




        // 分期明细区域
        .installment-section {
            padding: 0 30px 30px;

            // 表格容器样式
            .table-container {
                background: white;
                border-radius: 12px;
                box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
                overflow: hidden;
                margin-bottom: 20px;

                // 表格头部样式
                :deep(.el-table) {
                    border-radius: 12px;
                    overflow: hidden;

                    .el-table__header-wrapper {
                        th {
                            background-color: rgb(102, 126, 234);
                            color: white !important;
                            font-weight: bold !important;
                            text-align: center !important;
                            padding: 12px 8px !important;
                            border-right: 1px solid rgba(255, 255, 255, 0.2) !important;
                        }
                    }

                    // 表格行样式
                    .el-table__body {
                        .el-table__row {
                            transition: all 0.3s ease;

                            &.row-pending {
                                background-color: #f8f9fa !important;

                                .el-table__cell {
                                    background-color: #f8f9fa !important;
                                }
                            }

                            &.row-processing {
                                background-color: #fffbf0 !important;

                                .el-table__cell {
                                    background-color: #fffbf0 !important;
                                }
                            }

                            &.row-completed {
                                background-color: #f0f9ff !important;

                                .el-table__cell {
                                    background-color: #f0f9ff !important;
                                }
                            }
                        }
                    }


                }

                // 单元格样式
                .period-cell {
                    display: flex;
                    justify-content: center;
                    align-items: center;

                    .period-badge {
                        color: #667eea;
                        border-radius: 16px;
                        font-weight: 600;
                        font-size: 14px;
                        display: inline-block;
                    }

                    .total-amount {
                        font-size: 14px;
                        color: #27ae60;
                        font-weight: 700;
                        margin-top: 4px;
                    }
                }

                .percent-cell {
                    display: flex;
                    justify-content: center;
                    align-items: center;

                    .percent-badge {
                        color: #667eea;
                        border-radius: 16px;
                        font-weight: 700;
                        font-size: 14px;
                        display: inline-block;
                    }
                }

                .amount-cell {
                    display: flex;
                    justify-content: center;
                    align-items: center;

                    .amount-value {
                        font-size: 15px;
                        font-weight: 700;
                        color: #27ae60;
                        text-shadow: 0 1px 2px rgba(39, 174, 96, 0.1);
                    }
                }

                .time-cell {
                    padding: 4px !important;



                    .time-readonly {
                        color: #2c3e50;
                        font-size: 13px;
                        font-weight: 500;
                        padding: 6px 12px;
                        background: linear-gradient(135deg, #ecf0f1, #bdc3c7);
                        border-radius: 8px;
                        border: 1px solid #d5dbdb;
                        display: inline-block;
                        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                    }
                }

                .status-cell {
                    display: flex;
                    justify-content: center;
                    align-items: center;

                    .status-tag {
                        font-size: 12px;
                        padding: 8px 15px;
                        border-radius: 12px;
                        font-weight: 600;
                        border: none !important;
                        width: 80% !important;

                        &.el-tag--info {
                            background: linear-gradient(135deg, #909399, #a6a9ad) !important;
                            color: white !important;
                        }

                        &.el-tag--warning {
                            background: linear-gradient(135deg, #e6a23c, #f56c6c) !important;
                            color: white !important;
                        }

                        &.el-tag--success {
                            background: linear-gradient(135deg, #67c23a, #85ce61) !important;
                            color: white !important;
                        }
                    }
                }

                .action-cell {
                    display: flex;
                    gap: 8px;
                    justify-content: space-around;
                    align-items: center;
                    flex-wrap: wrap;

                    .export-payment-btn {
                        height: 36px !important;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
                        border: none !important;
                        color: white !important;
                        border-radius: 8px !important;
                        transition: all 0.3s ease !important;
                        padding: 6px 12px !important;
                        font-size: 12px !important;
                        width: 30%;

                        &:hover:not(.is-disabled) {
                            transform: translateY(-1px) !important;
                            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3) !important;
                        }

                        .el-icon {
                            margin-right: 4px;
                        }
                    }

                    .finish-payment-btn {
                        height: 36px !important;
                        border-radius: 8px !important;
                        transition: all 0.3s ease !important;
                        padding: 6px 12px !important;
                        font-size: 12px !important;
                        width: 40%;

                        &.payment-not-started {
                            background: #f8f9fa !important;
                            color: #6c757d !important;
                            border-color: #dee2e6 !important;
                            cursor: not-allowed !important;

                            .el-icon {
                                color: #dc3545;
                            }
                        }

                        &.payment-in-progress {
                            background: linear-gradient(135deg, #36d1c4 0%, #5b86e5 100%) !important;
                            color: white !important;
                            border: none !important;

                            &:hover:not(.is-disabled) {
                                transform: translateY(-1px) !important;
                                box-shadow: 0 4px 12px rgba(91, 134, 229, 0.3) !important;
                            }

                            .el-icon {
                                color: #3498db;
                                animation: pulse 2s infinite;
                            }
                        }

                        &.payment-finished {
                            background: #6c757d !important;
                            color: white !important;
                            border: none !important;
                            cursor: default !important;

                            .el-icon {
                                color: #28a745;
                            }
                        }

                        .el-icon {
                            margin-right: 4px;
                        }
                    }
                }

                // 表格展开动画
                .table-expand-enter-active,
                .table-expand-leave-active {
                    transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .table-expand-enter-from {
                    opacity: 0;
                    transform: translateY(20px) scale(0.95);
                    max-height: 0;
                }

                .table-expand-enter-to {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                    max-height: 1000px;
                }

                .table-expand-leave-from {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                    max-height: 1000px;
                }

                .table-expand-leave-to {
                    opacity: 0;
                    transform: translateY(-20px) scale(0.95);
                    max-height: 0;
                }

                // 空状态
                .empty-state {
                    padding: 60px 20px;
                    text-align: center;
                    color: #909399;
                    animation: fadeIn 0.5s ease-out;
                }
            }
        }
    }
}

// 动画关键帧
@keyframes skeleton-loading {
    0% {
        opacity: 1;
    }

    100% {
        opacity: 0.7;
    }
}

@keyframes shimmer {
    0% {
        background-position: -200% 0;
    }

    100% {
        background-position: 200% 0;
    }
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes slideInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

// 表格行动画
:deep(.el-table__body) {
    .el-table__row {
        animation: slideInUp 0.4s ease-out;
        animation-fill-mode: both;

        @for $i from 1 through 10 {
            &:nth-child(#{$i}) {
                animation-delay: #{$i * 0.05}s;
            }
        }
    }
}

// 响应式设计
@media (max-width: 1400px) {
    .prepay-step {
        .supplier-card {
            .installment-section {
                .table-container {
                    overflow-x: auto;

                    .action-cell {
                        flex-direction: column;
                        gap: 4px;

                        .el-button {
                            width: 100%;
                            min-width: auto;
                        }
                    }
                }
            }
        }
    }
}

@media (max-width: 1200px) {
    .prepay-step {
        .supplier-card {
            .info-grid {
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 15px;
                padding: 20px;
            }

            .installment-section {
                padding: 0 20px 20px;

                .table-container {
                    .action-cell {
                        .el-button {
                            padding: 4px 8px;
                            font-size: 11px;
                        }
                    }
                }
            }
        }
    }
}

@media (max-width: 768px) {
    .prepay-step {
        padding: 10px;

        .supplier-card {
            margin-bottom: 20px;
            border-radius: 12px;



            .info-grid {
                grid-template-columns: 1fr;
                gap: 15px;
                padding: 20px;

                .info-item {
                    padding: 20px;

                    .info-value {

                        .amount-number,
                        .count-number {
                            font-size: 24px;
                        }
                    }
                }
            }

            .installment-section {
                padding: 0 15px 20px;

                .table-container {
                    font-size: 12px;

                    .action-cell {
                        flex-direction: column;
                        gap: 6px;

                        .el-button {
                            width: 100%;
                            padding: 6px 8px;
                            font-size: 10px;
                        }
                    }
                }
            }
        }

    }
}

// 加载状态
.is-loading {
    opacity: 0.6;
    pointer-events: none;
    position: relative;

    &::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(255, 255, 255, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: inherit;
    }
}

// 全局表格样式覆盖
:deep(.el-table) {
    --el-table-border-color: #ebeef5;
    --el-table-text-color: #606266;
    --el-table-header-text-color: #ffffff;
    --el-table-header-bg-color: #667eea;
    --el-table-row-hover-bg-color: #f5f7fa;

    .el-table__empty-block {
        background: #fafafa;
        border-radius: 8px;
        margin: 20px;
    }
}

// 滚动条样式
::-webkit-scrollbar {
    width: 6px;
    height: 6px;
}

::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
}

::-webkit-scrollbar-thumb {
    background: linear-gradient(135deg, #667eea, #764ba2);
    border-radius: 3px;

    &:hover {
        background: linear-gradient(135deg, #5a6fd8, #6a4190);
    }
}
</style>
