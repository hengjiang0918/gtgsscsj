<template>
    <div class="shipping-step">
        <el-form ref="shippingFormRef" :model="shippingForm" :rules="shippingRules" label-width="100px">
            <!-- 发货状态表格 -->
            <div class="delivery-section">
                <div class="section-header">
                    <div class="stats-container">
                        <div class="stat-item total">
                            <div class="stat-icon">
                                <el-icon>
                                    <Box />
                                </el-icon>
                            </div>
                            <div class="stat-content">
                                <span class="stat-label">总计设备:</span>
                                <span class="stat-value">{{ deliveryStatusList.length }}</span>
                            </div>
                        </div>

                        <div class="stat-item completed">
                            <div class="stat-icon">
                                <el-icon>
                                    <CircleCheckFilled />
                                </el-icon>
                            </div>
                            <div class="stat-content">
                                <span class="stat-label">已完成:</span>
                                <span class="stat-value">{{ completedCount }}</span>
                            </div>

                        </div>
                    </div>
                </div>

                <!-- 数据表格 -->
                <div class="table-container">
                    <el-table :data="deliveryStatusList" stripe border size="small" :header-cell-style="{
                        backgroundColor: '#667eea',
                        color: 'white',
                        fontWeight: 'bold',
                        textAlign: 'center',
                        padding: '10px 2px'
                    }" :cell-style="{ textAlign: 'center', padding: '5px 2px' }" :row-class-name="getRowClassName">

                        <!-- 基本信息列 -->
                        <el-table-column prop="equipment_name" label="设备名称" width="140">
                            <template #default="{ row }">
                                <div class="equipment-cell" @click="editRemark(row, row.equipment_name)">
                                    <div class="equipment-name">{{ row.equipment_name }}</div>
                                    <div v-if="row.remark" class="remark-icon" @click.stop="showRemark(row.remark)">
                                        <el-icon>
                                            <InfoFilled />
                                        </el-icon>
                                    </div>

                                </div>
                            </template>
                        </el-table-column>
                        <!-- 数量列 - 修正prop属性 -->
                        <el-table-column prop="quantity" label="数量" width="70">
                            <template #default="{ row }">
                                <div class="equipment-cell">
                                    <span class="quantity">{{ row.quantity }}台</span>
                                </div>
                            </template>
                        </el-table-column>

                        <!-- 其他列保持不变，不会被合并 -->
                        <el-table-column label="物流跟踪" min-width="100">
                            <template #default="{ row }">
                                <div class="status-cell">
                                    <el-tag :type="getTagType(row.logistics_status)" size="small"
                                        :class="{ 'status-changing': row.isChanging?.logistics }">
                                        {{ getStatusText(row.logistics_status) }}
                                    </el-tag>
                                </div>
                            </template>
                        </el-table-column>

                        <el-table-column label="收货整理" min-width="100">
                            <template #default="{ row }">
                                <div class="status-cell">
                                    <el-tag :type="getTagType(row.receive_status)" size="small"
                                        :class="{ 'status-changing': row.isChanging?.receive }">
                                        {{ getStatusText(row.receive_status) }}
                                    </el-tag>
                                </div>
                            </template>
                        </el-table-column>

                        <el-table-column label="订舱计划" min-width="100">
                            <template #default="{ row }">
                                <div class="status-cell">
                                    <el-tag :type="getTagType(row.booking_status)" size="small"
                                        :class="{ 'status-changing': row.isChanging?.booking }">
                                        {{ getStatusText(row.booking_status) }}
                                    </el-tag>
                                </div>
                            </template>
                        </el-table-column>

                        <el-table-column label="报关清单" min-width="100">
                            <template #default="{ row }">
                                <div class="status-cell">
                                    <el-tag :type="getTagType(row.customs_status)" size="small"
                                        :class="{ 'status-changing': row.isChanging?.customs }">
                                        {{ getStatusText(row.customs_status) }}
                                    </el-tag>
                                </div>
                            </template>
                        </el-table-column>


                        <el-table-column label="预计时间" width="160">
                            <template #default="{ row }">
                                <div class="status-cell">
                                    <transition name="tag-slide" mode="out-in">
                                        <el-tag class="remark-tag">
                                            {{ row.estimated_time_remark ?
                                                formatDateDisplay(row.estimated_time_remark) : '- -' }}
                                        </el-tag>
                                    </transition>
                                </div>
                            </template>
                        </el-table-column>

                        <el-table-column label="海运出运" min-width="100">
                            <template #default="{ row }">
                                <div class="status-cell">
                                    <transition name="tag-slide" mode="out-in">
                                        <el-tag :type="getTagType(row.shipping_status)" size="small"
                                            :class="{ 'status-changing': row.isChanging?.shipping }">
                                            {{ getStatusText(row.shipping_status) }}
                                        </el-tag>
                                    </transition>
                                </div>
                            </template>
                        </el-table-column>

                        <el-table-column label="跟踪到厂" min-width="100">
                            <template #default="{ row }">
                                <div class="status-cell">
                                    <el-tag :type="getTagType(row.tracking_status)" size="small"
                                        :class="{ 'status-changing': row.isChanging?.tracking }">
                                        {{ getStatusText(row.tracking_status) }}
                                    </el-tag>
                                </div>
                            </template>
                        </el-table-column>

                        <el-table-column label="实地安装" min-width="80">
                            <template #default="{ row }">
                                <div class="status-cell">
                                    <el-tag :type="getTagType(row.installation_status)" size="small"
                                        :class="{ 'status-changing': row.isChanging?.installation }">
                                        {{ getStatusText(row.installation_status) }}
                                    </el-tag>
                                </div>
                            </template>
                        </el-table-column>
                    </el-table>
                </div>

                <!-- 统计信息 -->
                <div class="statistics-bar">

                </div>
            </div>
        </el-form>

        <div class="approval-actions">
            <el-button @click="handleBack">返回</el-button>
        </div>
    </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue';
import api from '@/api';
import { useUserStore } from '@/stores/userStore';

const props = defineProps({
    canEdit: Boolean,
    canSubmit: Boolean,
    canApprove: Boolean,
    status: Number,
    purchase_id: String
});

const emit = defineEmits(['update-step', 'handle-approve']);

// 原有的ref定义
const shippingFormRef = ref(null);
const shippingForm = ref([]);
const shippingRules = ref({});
const is_last_step = ref(false);
const can_approve = ref(false);
const userStore = useUserStore();

// 新增的发货状态列表
const deliveryStatusList = ref([]);

// 统计数据
const completedCount = computed(() => {
    return deliveryStatusList.value.filter(item => isAllCompleted(item)).length;
});


onMounted(() => {
    getPurchaseDetail();
});

const getPurchaseDetail = async () => {
    try {
        const data = await api.purchaseDetail({
            purchase_id: props.purchase_id,
            detail_type: 'arrival',
            step_order: 5,
            user_id: userStore.user_id
        });
        is_last_step.value = data.is_last_step == 1 ? true : false;
        can_approve.value = data.can_approve;
        deliveryStatusList.value = data.supplier_arrival_list || [];
    } catch (err) {
        console.error('获取发货详情失败', err);
    }
};


// 格式化日期显示
const formatDateDisplay = (dateStr) => {
    if (!dateStr) return '';
    try {
        const date = new Date(dateStr);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    } catch (error) {
        return dateStr;
    }
};
// 添加缺失的函数
const showEstimatedTime = (dateStr) => {
    ElMessageBox.alert(
        `预计时间：${dateStr}`,
        '时间信息',
        {
            confirmButtonText: '确定',
            type: 'info'
        }
    );
};
// 修改获取行样式类名的函数，添加单个完成动画类
const getRowClassName = ({ row, rowIndex }) => {
    const classes = [];

    // 单个完成动画
    if (row.singleCompletionAnimating) {
        classes.push('single-completion-flash');
    }

    // 全部完成状态
    if (isAllCompleted(row)) {
        classes.push('row-completed');
    } else {
        // 检查是否有进行中状态
        const statuses = [
            row.logistics_status, row.receive_status, row.booking_status,
            row.customs_status, row.shipping_status, row.tracking_status, row.installation_status
        ];

        if (statuses.some(status => status === 1)) {
            classes.push('row-processing');
        }
    }

    return classes.join(' ');
};
// 获取标签类型
const getTagType = (status) => {
    switch (status) {
        case 0: return 'info';
        case 1: return 'warning';
        case 2: return 'success';
        default: return 'info';
    }
};

// 获取状态文本
const getStatusText = (status) => {
    switch (status) {
        case 0: return '未开始';
        case 1: return '进行中';
        case 2: return '已完成';
        default: return '未知';
    }
};

// 判断是否全部完成
const isAllCompleted = (item) => {
    const statuses = [
        item.logistics_status, item.receive_status, item.booking_status,
        item.customs_status, item.shipping_status, item.tracking_status, item.installation_status
    ];
    return statuses.every(status => status === 2);
};
// 修改 toggleStatus 函数，添加单个完成动画
const toggleStatus = async (row, type) => {
    // 初始化 isChanging 对象
    if (!row.isChanging) {
        row.isChanging = {};
    }

    // 设置动画状态
    row.isChanging[type] = true;

    // 获取当前状态和新状态
    const currentStatus = row[`${type}_status`];
    const newStatus = currentStatus === 2 ? 0 : 2;

    try {
        // 延迟更新状态，让动画先播放
        await new Promise(resolve => setTimeout(resolve, 150));

        // 更新状态
        row[`${type}_status`] = newStatus;

        // 如果状态变为完成，播放单个完成动画
        if (newStatus === 2) {
            // 添加单个完成的行闪烁动画
            if (!row.singleCompletionAnimating) {
                row.singleCompletionAnimating = true;

                // 延迟一下让状态更新先完成
                setTimeout(() => {
                    // 移除动画类
                    setTimeout(() => {
                        row.singleCompletionAnimating = false;
                    }, 1000); // 动画持续时间
                }, 100);
            }
        }

        // 检查是否所有状态都完成了
        if (isAllCompleted(row)) {
            setTimeout(() => {
                ElNotification({
                    title: '恭喜！',
                    message: `设备 "${row.equipment_name}" 的所有流程已完成！`,
                    type: 'success',
                    duration: 3000,
                    position: 'top-right'
                });
            }, 400);
        }

    } catch (error) {
        console.error('更新状态失败:', error);
        // 错误时恢复状态
        row[`${type}_status`] = currentStatus;
    } finally {
        // 动画完成后移除动画类
        setTimeout(() => {
            if (row.isChanging) {
                row.isChanging[type] = false;
            }
        }, 100); // 与动画时长一致
    }
};

// 获取类型显示名称
const getTypeDisplayName = (type) => {
    const typeMap = {
        'booking': '物流跟踪',
        'shipping': '收货整理',
        'logistics': '订舱计划',
        'tracking': '报关清单',
        'customs': '海运出运',
        'receive': '跟踪到厂',
        'installation': '实地安装'
    };
    return typeMap[type] || type;
};
// 更新状态
const updateStatus = async (item, type, status) => {
    try {
        // 更新本地状态
        item[`${type}_status`] = status;

        ElMessage.success(`${type}状态已更新`);
    } catch (error) {
    }
};

// 显示备注
const showRemark = (remark) => {
    ElMessageBox.alert(remark, '备注信息', {
        confirmButtonText: '确定',
        type: 'info'
    });
};
// 编辑备注
const editRemark = async (item, type) => {
    try {
        const { value } = await ElMessageBox.prompt(
            `请输入${type}备注信息`,
            '编辑备注',
            {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                inputType: 'textarea',
                inputValue: item.remark || '',
                inputPlaceholder: '请输入备注信息'
            }
        );
        // 更新本地备注
        item.remark = value;
        ElMessage.success('备注已更新');
    } catch (error) {
        if (error !== 'cancel') {
            console.error('更新备注失败:', error);
            ElMessage.error('更新备注失败');
        }
    }
};

// 快速完成所有步骤
const quickComplete = async (row) => {
    try {
        await ElMessageBox.confirm('确认将所有步骤标记为已完成？', '快速完成', {
            confirmButtonText: '确认',
            cancelButtonText: '取消',
            type: 'warning'
        });

        const types = ['booking', 'shipping', 'logistics', 'tracking', 'customs', 'receive', 'installation'];

        for (const type of types) {
            await updateStatus(row, type, 2);
        }

        ElMessage.success('所有步骤已完成');
    } catch (error) {
        if (error !== 'cancel') {
            console.error('快速完成失败:', error);
            ElMessage.error('操作失败');
        }
    }
};
// 原有的函数保持不变
const handleSubmit = () => {

};
// 原有的函数保持不变
const handleSave = () => {
    api.saveEquipmentDelivery({
        purchase_id: props.purchase_id,
        delivery_status_list: deliveryStatusList.value
    }).then(() => {
        getPurchaseDetail();
        ElMessage.success('发货状态已保存');
        emit('update-step', 5); // 假设5是下一个步骤的标识
    }).catch(err => {
        console.error('保存发货状态失败:', err);
        ElMessage.error('保存失败，请稍后重试');
    });
};

const handleBack = () => {
    console.log('返回操作');
};
const handleApproveConfirm = (status) => {
    emit('handle-approve', type);
};
</script>

<style lang="scss" scoped>
@import '../style/indexPage.scss';

.shipping-step {
    min-height: calc(100vh - 200px);

    .delivery-section {
        .section-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 16px;
            color: white;
            box-shadow: 0 12px 35px rgba(102, 126, 234, 0.3);
            position: relative;
            overflow: hidden;

            // 背景装饰
            &::before {
                content: '';
                position: absolute;
                top: -50%;
                right: -20%;
                width: 200px;
                height: 200px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 50%;
                z-index: 0;
            }

            &::after {
                content: '';
                position: absolute;
                bottom: -30%;
                left: -10%;
                width: 150px;
                height: 150px;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 50%;
                z-index: 0;
            }

            .stats-container {
                width: 100%;
                display: flex;
                justify-content: space-between;

                .stat-item {
                    display: flex;
                    align-items: center;
                    width: 30%;
                    gap: 12px;
                    padding: 10px;
                    background: rgba(255, 255, 255, 0.15);
                    border-radius: 12px;
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative;

                    &:hover {
                        transform: translateY(-1px);
                        background: rgba(255, 255, 255, 0.2);
                        box-shadow: 0 3px 5px rgba(0, 0, 0, 0.2);
                    }

                    .stat-icon {
                        width: 36px;
                        height: 36px;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 18px;
                        flex-shrink: 0;
                        background: rgba(255, 255, 255, 0.2);
                        color: white;
                    }

                    .stat-content {
                        display: flex;
                        align-items: center;
                        gap: 2px;
                        flex: 1;

                        .stat-label {
                            font-size: 12px;
                            color: rgba(255, 255, 255, 0.8);
                            font-weight: 500;
                            line-height: 1;
                        }

                        .stat-value {
                            font-size: 20px;
                            font-weight: 700;
                            color: white;
                            line-height: 1.2;
                            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
                        }
                    }



                    // 不同状态的特殊样式
                    &.total {
                        .stat-icon {
                            background: linear-gradient(135deg, #3498db, #2980b9);
                        }
                    }

                    &.completed {
                        .stat-icon {
                            background: linear-gradient(135deg, #27ae60, #2ecc71);
                            animation: completedPulse 2s infinite;
                        }


                    }




                    &.amount {
                        .stat-icon {
                            background: linear-gradient(135deg, #e74c3c, #c0392b);
                        }

                        .stat-value {
                            color: #ffd700;
                            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
                            font-size: 18px;
                        }
                    }
                }
            }
        }

        .table-container {
            background: white;
            border-radius: 12px;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
            overflow: hidden;
            margin-bottom: 20px;

            .remark-icon {
                cursor: pointer;
                color: #409eff;
                font-size: 12px;
                opacity: 0.7;
                position: absolute;
                top: 10px;
                right: 10px;

                &:hover {
                    opacity: 1;
                    transform: scale(1.2);
                }
            }

            .edit-icon {
                cursor: pointer;
                color: #409eff;
                font-size: 12px;
                opacity: 0.7;
                position: absolute;
                top: 10px;

                left: 10px;

                &:hover {
                    opacity: 1;
                    transform: scale(1.2);
                }
            }


            .edit-icon {
                color: #67c23a;
            }

            // 单元格样式
            .equipment-cell {
                height: 100%;

                .equipment-name {
                    font-weight: 600;
                    color: #2c3e50;
                    margin-bottom: 2px;
                }

                .quantity {
                    color: #17a2b8;
                    font-weight: 600;
                }

                .price {
                    color: #28a745;
                    font-weight: 700;
                }


            }

            .supplier-cell {
                .supplier-name {
                    font-weight: 500;
                    color: #2c3e50;
                    margin-bottom: 4px;
                    font-size: 12px;
                }

                .supplier-meta {
                    display: flex;
                    justify-content: space-between;
                    gap: 8px;
                    font-size: 11px;


                }
            }

            ::deep(.cell) {
                height: 100% !important;
            }

            .status-cell {
                display: flex;
                flex-direction: column;
                align-items: center;
                position: relative;

                .tag-slide-enter-active,
                .tag-slide-leave-active {
                    transition: all 0.01s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .tag-slide-enter-from {
                    opacity: 0;
                    transform: translateX(-40px);
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 100%;
                }

                .tag-slide-enter-to {
                    opacity: 1;
                    transform: translateX(0);
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 100%;
                }

                .tag-slide-leave-from {
                    opacity: 1;
                    transform: translateX(0);
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 100%;
                }

                .tag-slide-leave-to {
                    opacity: 0;
                    transform: translateX(40px);
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 100%;
                }

                .remark-tag {
                    cursor: pointer;
                    transition: all 0.3s ease;
                    font-size: 14px !important;
                    padding: 12px;
                    border-radius: 12px;
                    width: 100px;
                    background: linear-gradient(135deg, #67c23a, #85ce61);
                    border: none;
                    color: white;
                    position: absolute;

                    &:hover {
                        transform: scale(1.01);
                        box-shadow: 0 2px 8px rgba(103, 194, 58, 0.3);
                    }
                }

                .el-tag {
                    cursor: pointer;
                    transition: all 0.3s ease;
                    font-size: .7rem;
                    font-weight: 600;
                    padding: 10px 20px;
                    width: 90%;
                    height: 50%;
                    position: relative;
                    overflow: hidden;
                    border-radius: 8px;

                    &:hover {
                        box-shadow: 0 2px 8px rgba(64, 158, 255, 0.25);
                        transform: translateY(-1px);
                    }

                    // 状态切换动画
                    &:active {
                        transform: scale(0.95);
                    }

                    // 状态切换时的动画效果
                    &.status-changing {
                        animation: statusChange 0.6s ease-in-out;
                        z-index: 10;

                        // 添加发光效果
                        &::after {
                            content: '';
                            position: absolute;
                            top: -2px;
                            left: -2px;
                            right: -2px;
                            bottom: -2px;
                            background: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4);
                            background-size: 400% 400%;
                            border-radius: 10px;
                            z-index: -1;
                            animation: glowing 0.6s ease-in-out;
                        }
                    }

                    // 背景渐变动画（悬停时的光效）
                    &::before {
                        content: '';
                        position: absolute;
                        top: 0;
                        left: -100%;
                        width: 100%;
                        height: 100%;
                        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
                        transition: left 0.5s ease;
                        z-index: 1;
                    }

                    &:hover::before {
                        left: 100%;
                    }

                    // // // 不同状态的样式和动画
                    &.el-tag--info {
                        background: linear-gradient(135deg, #909399, #a6a9ad);
                        border: none;
                        color: white;

                        &.status-changing {
                            animation: statusChange 0.6s ease-in-out, statusChangeInfo 0.6s ease-in-out;

                            &::after {
                                background: linear-gradient(45deg, #909399, #a6a9ad, #b3b6bb, #c0c4cc);
                            }
                        }
                    }

                    &.el-tag--warning {
                        background: linear-gradient(135deg, #e6a23c, #f0b90b);
                        border: none;
                        color: white;

                        &.status-changing {
                            animation: statusChange 0.6s ease-in-out, statusChangeWarning 0.6s ease-in-out;

                            &::after {
                                background: linear-gradient(45deg, #e6a23c, #f0b90b, #f39c12, #f1c40f);
                            }
                        }
                    }

                    &.el-tag--success {
                        background: linear-gradient(135deg, #67c23a, #85ce61);
                        border: none;
                        color: white;
                        position: relative;

                        &.status-changing {
                            animation: statusChange 0.6s ease-in-out, statusChangeSuccess 0.6s ease-in-out;

                            // 完成状态的特殊效果
                            &::after {
                                background: linear-gradient(45deg, #67c23a, #85ce61, #52c41a, #73d13d);
                            }
                        }

                        // 完成状态的额外勾选标记
                        &:not(.status-changing)::after {
                            content: '✓';
                            position: absolute;
                            top: 0px;
                            right: 0px;
                            width: 14px;
                            height: 14px;
                            background: #52c41a;
                            border-radius: 50%;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            font-size: 8px;
                            color: white;
                            font-weight: bold;
                            z-index: 2;
                            border: 2px solid white;
                            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                        }

                        // 完成时的光环效果
                        &::before {
                            content: '';
                            position: absolute;
                            top: -3px;
                            left: -3px;
                            right: -3px;
                            bottom: -3px;
                            background: linear-gradient(45deg, #52c41a, transparent, #52c41a);
                            border-radius: 12px;
                            z-index: -1;
                            opacity: 0;
                            animation: successGlow 2s infinite;
                        }
                    }
                }


                // 动画关键帧
                @keyframes statusChange {
                    0% {
                        transform: scale(1) rotate(0deg);
                    }

                    25% {
                        transform: scale(1.15) rotate(5deg);
                    }

                    50% {
                        transform: scale(0.95) rotate(-2deg);
                    }

                    75% {
                        transform: scale(1.05) rotate(1deg);
                    }

                    100% {
                        transform: scale(1) rotate(0deg);
                    }
                }

                // 发光动画
                @keyframes glowing {
                    0% {
                        background-position: 0% 50%;
                        opacity: 0.8;
                        transform: scale(1);
                    }

                    50% {
                        background-position: 100% 50%;
                        opacity: 1;
                        transform: scale(1.02);
                    }

                    100% {
                        background-position: 200% 50%;
                        opacity: 0.8;
                        transform: scale(1);
                    }
                }

                // 不同状态的颜色动画
                @keyframes statusChangeInfo {

                    0%,
                    100% {
                        background: linear-gradient(135deg, #909399, #a6a9ad);
                        box-shadow: 0 0 20px rgba(144, 147, 153, 0.5);
                    }

                    25% {
                        background: linear-gradient(135deg, #b3b6bb, #c0c4cc);
                        box-shadow: 0 0 30px rgba(144, 147, 153, 0.8);
                    }

                    50% {
                        background: linear-gradient(135deg, #a6a9ad, #909399);
                        box-shadow: 0 0 40px rgba(144, 147, 153, 1);
                    }

                    75% {
                        background: linear-gradient(135deg, #b3b6bb, #c0c4cc);
                        box-shadow: 0 0 30px rgba(144, 147, 153, 0.8);
                    }
                }

                @keyframes statusChangeWarning {

                    0%,
                    100% {
                        background: linear-gradient(135deg, #e6a23c, #f0b90b);
                        box-shadow: 0 0 20px rgba(230, 162, 60, 0.5);
                    }

                    25% {
                        background: linear-gradient(135deg, #eeb55c, #f3c547);
                        box-shadow: 0 0 30px rgba(230, 162, 60, 0.8);
                    }

                    50% {
                        background: linear-gradient(135deg, #f1c40f, #f39c12);
                        box-shadow: 0 0 40px rgba(241, 196, 15, 1);
                        transform: scale(1.05);
                    }

                    75% {
                        background: linear-gradient(135deg, #eeb55c, #f3c547);
                        box-shadow: 0 0 30px rgba(230, 162, 60, 0.8);
                    }
                }

                @keyframes statusChangeSuccess {

                    0%,
                    100% {
                        background: linear-gradient(135deg, #67c23a, #85ce61);
                        box-shadow: 0 0 20px rgba(103, 194, 58, 0.5);
                    }

                    25% {
                        background: linear-gradient(135deg, #7ed357, #9dd274);
                        box-shadow: 0 0 30px rgba(103, 194, 58, 0.8);
                    }

                    50% {
                        background: linear-gradient(135deg, #52c41a, #73d13d);
                        box-shadow: 0 0 40px rgba(82, 196, 26, 1);
                        transform: scale(1.1);
                    }

                    75% {
                        background: linear-gradient(135deg, #7ed357, #9dd274);
                        box-shadow: 0 0 30px rgba(103, 194, 58, 0.8);
                    }
                }

                // 单个完成时的行闪烁动画（原有的动画）
                @keyframes singleCompletionFlash {

                    0%,
                    100% {
                        background-color: rgba(103, 194, 58, 0.1);
                    }

                    25% {
                        background-color: rgba(103, 194, 58, 0.2);
                    }

                    50% {
                        background-color: rgba(103, 194, 58, 0.3);
                    }

                    75% {
                        background-color: rgba(103, 194, 58, 0.2);
                    }
                }

                // 全部完成时的行闪烁动画
                @keyframes rowCompletionFlash {

                    0%,
                    100% {
                        background-color: #f0f9ff;
                    }

                    25% {
                        background-color: #e0f2fe;
                    }

                    50% {
                        background-color: #bae6fd;
                    }

                    75% {
                        background-color: #e0f2fe;
                    }
                }

            }

            .progress-cell {
                display: flex;
                flex-direction: column;
                gap: 8px;

                .completion-badge {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 4px;
                    font-size: 11px;
                    font-weight: 600;
                    color: #e6a23c;

                    &.completed {
                        color: #67c23a;
                    }
                }
            }

            .action-cell {
                display: flex;
                flex-direction: column;
                gap: 4px;

                .el-button {
                    padding: 4px 8px;
                    font-size: 11px;
                }
            }
        }
    }

    .approval-actions {
        display: flex;
        justify-content: center;
        gap: 15px;
        margin-top: 20px;
        padding: 20px;
        background: rgba(255, 255, 255, 0.9);
        border-radius: 12px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    }
}

// 表格行样式
:deep(.el-table) {

    // 单个完成闪烁动画
    .single-completion-flash {
        animation: singleCompletionFlash 1s ease-in-out;

        .el-table__cell {
            animation: singleCompletionFlash 1s ease-in-out;
        }
    }

    // 全部完成时的特殊效果
    .row-completed {
        animation: rowCompletionFlash 1s ease-in-out;

        .el-table__cell {
            background-color: #f0f9ff !important;
        }

        // 供应商合并单元格的特殊样式
        .el-table__cell:nth-child(1) {
            background: linear-gradient(135deg, #e6f3ff 0%, #cce8ff 100%) !important;
            border-left: 4px solid #52c41a !important;
        }
    }


    .row-processing {
        background-color: #fffbf0 !important;

        .el-table__cell {
            background-color: #fffbf0 !important;
        }

        // 供应商合并单元格在有进行中状态时的样式
        .el-table__cell:nth-child(0) {
            background: linear-gradient(135deg, #fff7e6 0%, #ffe8cc 100%) !important;
            border-left: 4px solid #f0b90b !important;
            box-shadow: inset 0 0 10px rgba(240, 185, 11, 0.1) !important;
        }
    }

    .row-pending {
        background-color: #f8f9fa !important;

        .el-table__cell {
            background-color: #f8f9fa !important;
        }

        // 供应商合并单元格的待处理样式
        .el-table__cell:nth-child(0) {
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%) !important;
            border-left: 4px solid #909399 !important;
        }
    }

}


// 禁用动画的媒体查询
@media (prefers-reduced-motion: reduce) {
    .el-tag {
        &.status-changing {
            animation: none !important;
        }

        &::before,
        &::after {
            animation: none !important;
        }
    }

    :deep(.el-table) {
        .row-completed {
            animation: none !important;

            .el-table__cell {
                animation: none !important;
            }
        }
    }
}

// 响应式设计
@media (max-width: 1200px) {
    .shipping-step {
        .delivery-section {
            .table-container {
                overflow-x: auto;
            }

            .statistics-bar {
                flex-wrap: wrap;
                gap: 16px;

            }
        }
    }
}
</style>