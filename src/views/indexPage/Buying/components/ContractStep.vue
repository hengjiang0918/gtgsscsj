<template>
    <div class="contract-step" v-if="canApprove">
        <!-- 供应商卡片列表 -->
        <transition-group name="supplier-card" tag="div" class="supplier-cards-container" @before-enter="beforeEnter"
            @enter="enter" @leave="leave">
            <div v-for="(item, index) in filteredSupplyList" :key="item.supplier_id" :data-index="index"
                class="supplier-card" :class="{
                    'eliminated': item.or_choose === 0,
                    'selected': item.or_choose === 1
                }" :style="getCardStyle(index)">

                <!-- 供应商头部信息 -->
                <div class="supplier-header">
                    <div class="supplier-name">
                        <el-icon>
                            <OfficeBuilding />
                        </el-icon>
                        {{ item.supplier_name }}
                    </div>
                    <div class="contract-link" @click="openContractUrl(item.contract_url)">
                        查看合同
                    </div>
                </div>

                <!-- 合同设备清单表格 -->
                <div class="contract-table-section" v-if="item.equipment_supply && item.equipment_supply.length > 0">
                    <div class="table-header">
                        <div class="table-title">
                            <el-icon>
                                <List />
                            </el-icon>
                            合同设备清单
                        </div>
                    </div>
                    <!-- 设备清单表格 -->
                    <el-table :ref="el => setTableRef(el, item.supplier_id)" :data="item.equipment_supply"
                        :key="`contract-table-${item.supplier_id}`" border size="small" :header-cell-style="{
                            backgroundColor: '#667eea',
                            color: 'white',
                            fontWeight: 'bold',
                            textAlign: 'center',
                            padding: '8px 4px'
                        }" :cell-style="{ textAlign: 'center', padding: '6px 4px' }"
                        :row-class-name="({ row }) => getEquipmentRowClassName(row, item)" :show-summary="true"
                        :summary-method="(param) => getSummaryMethod(param, item)" :row-key="getRowKey"
                        :reserve-selection="true"
                        @selection-change="(selection) => handleSelectionChange(selection, item.equipment_supply)"
                        @row-click="(row, column, event) => status != 2 && handleRowClick(row, column, event, item)"
                        class="contract-equipment-table">

                        <!-- 选择列 -->
                        <el-table-column type="selection" width="50" :selectable="(row) => isRowSelectable(row, item)">
                        </el-table-column>

                        <!-- 设备名称 -->
                        <el-table-column label="设备名称" min-width="150" align="center" prop="equipment_name">
                            <template #default="{ row }">
                                <div class="item-cell">{{ row.equipment_name }}</div>

                            </template>
                        </el-table-column>

                        <!-- 品牌 -->
                        <el-table-column label="品牌" width="100" prop="brand">
                            <template #default="{ row }">
                                <div class="item-cell">{{ row.brand || '-' }}</div>
                            </template>
                        </el-table-column>

                        <!-- 型号 -->
                        <el-table-column label="型号" width="120" prop="model">
                            <template #default="{ row }">
                                <div class="item-cell">{{ row.model || '-' }}</div>
                            </template>
                        </el-table-column>

                        <!-- 数量 -->
                        <el-table-column label="数量" min-width="80" prop="quantity">
                            <template #default="{ row }">
                                <div class="item-cell">
                                    <el-input type="number" v-if="canSubmit && can_approve && !is_last_step"
                                        v-model="row.quantity" :min="0" :precision="2" size="small" class="price-input"
                                        @click.stop />
                                    <div class="item-cell">{{ row.quantity || '-' }}</div>
                                </div>
                            </template>
                        </el-table-column>

                        <!-- 单价 -->
                        <el-table-column label="单价(元)" min-width="80" prop="actual_price">
                            <template #default="{ row }">
                                <div class="price-cell">
                                    <span style="color: #27ae60; font-weight: 600;">¥{{ row.actual_price }}</span>
                                </div>
                            </template>
                        </el-table-column>

                        <!-- 总价 -->
                        <el-table-column label="总价(元)" min-width="80">
                            <template #default="{ row }">
                                <div class="total-price-cell">
                                    <span style="color: #409eff; font-weight: 600;">
                                        ¥{{ ((row.quantity || 0) * (row.actual_price || 0)).toLocaleString() }}
                                    </span>
                                </div>
                            </template>
                        </el-table-column>

                        <!-- 规格要求 -->
                        <el-table-column label="规格要求" min-width="200" prop="spec">
                            <template #default="{ row }">
                                <div class="item-cell">
                                    {{ row.spec }}
                                </div>
                            </template>
                        </el-table-column>

                        <!-- 选择状态 -->
                        <el-table-column label="选择状态" width="100">
                            <template #default="{ row }">
                                <el-tag :type="row.ifchoose === 1 ? 'success' : 'info'" size="small" effect="dark">
                                    <el-icon>
                                        <component :is="row.ifchoose === 1 ? CircleCheckFilled : Minus" />
                                    </el-icon>
                                </el-tag>
                            </template>
                        </el-table-column>
                    </el-table>

                    <!-- 表格底部操作 -->
                    <div class="table-footer">
                        <!-- 选择统计 -->
                        <span class="selected-count">
                            已选择: {{ getSelectedCount(item) }} / {{ item.equipment_supply.length }} 台
                        </span>
                        <span class="selected-amount">
                            选择金额: ¥{{ getSelectedAmount(item).toLocaleString() }}
                        </span>
                        <el-button v-if="!is_last_step && localEdit" type="success" size="small" @click=""
                            @click.stop="saveContractDetail(item.equipment_supply)">
                            <el-icon>
                                <Document />
                            </el-icon>
                            保存合同
                        </el-button>
                    </div>
                </div>
            </div>
        </transition-group>

        <!-- 操作按钮区域 -->
        <div class="approval-actions">
            <el-button v-if="can_approve && status == 2 && finish_prepay != 1" type="danger"
                @click="handleReject">退回</el-button>
            <el-button v-if="can_approve && status == 1" type="success" @click="handleApproveConfirm(2)">通过</el-button>
            <el-button @click="handleBack">返回</el-button>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import {
    OfficeBuilding, CircleCheckFilled, Document, List, Minus
} from '@element-plus/icons-vue'
import api from '@/api'
import { useUserStore } from '@/stores/userStore'
import { useRouter } from 'vue-router'
const beforeEnter = (el) => {
    el.style.opacity = '0';
    el.style.height = '0';
    el.style.transform = 'translateY(-20px) scale(0.95)';
    el.style.overflow = 'hidden';
};
const enter = (el) => {
    const index = el.dataset.index;
    el.offsetHeight;
    el.style.transition = `all 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.1}s`;
    el.style.opacity = '1';
    el.style.height = 'auto';
    el.style.transform = 'translateY(0) scale(1)';
    el.style.overflow = 'visible';
};
const leave = (el) => {
    el.style.transition = 'all 0.4s ease-in-out';
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
const userStore = useUserStore()
const router = useRouter()

const props = defineProps({
    canEdit: Boolean,
    canSubmit: Boolean,
    status: Number,
    purchase_id: String
})
const canApprove = computed(() => {
    if (userStore.role == 1) {
        return can_approve.value; // 工厂相关人员不允许审批
    } else {
        return true
    }

});
const emit = defineEmits(['data-change', 'handle-approve'])

// 响应式数据
const is_last_step = ref(false)
const supply_list = ref([])
const can_approve = ref(false)
const finish_prepay = ref('')
const tableRefs = ref(new Map()) // 改为 Map 存储多个表格引用
const isInitializing = ref(false)
// 计算属性
const filteredSupplyList = computed(() => {
    return supply_list.value || []
})
// 设置表格引用
const setTableRef = (el, supplierId) => {
    if (el) {
        tableRefs.value.set(supplierId, el)
    }
}
// 获取表格引用
const getTableRef = (supplierId) => {
    return tableRefs.value.get(supplierId)
}
// 获取行唯一标识
const getRowKey = (row) => {
    return row.id || row.equipment_id || row.supply_id || `${row.equipment_name}_${row.supplier_id}_${Math.random()}`
}
const localEdit = computed(() => {
    if (is_last_step.value) {
        return false
    }
    return props.canEdit && userStore.role != 1 && can_approve.value
})

// 方法定义
const getPurchaseDetail = async () => {
    try {
        const data = await api.purchaseDetail({
            purchase_id: props.purchase_id,
            detail_type: 'contract',
            step_order: 2,
            user_id: userStore.user_id
        })

        supply_list.value = data.supply_list || []
        is_last_step.value = data.is_last_step == 1 ? true : false
        can_approve.value = data.can_approve
        finish_prepay.value = data.finish_prepay
        // 延迟初始化，确保表格完全准备好
        console.log('采购详情数据', is_last_step.value)
        await nextTick()
        setTimeout(() => {
            initializeAllTableSelections()
        }, 100)

    } catch (err) {
        console.error('获取采购详情失败', err)
        ElMessage.error('获取数据失败，请刷新重试')
    }
}
// 初始化所有表格的选择状态
const initializeAllTableSelections = () => {
    supply_list.value.forEach(supplier => {
        if (supplier.equipment_supply && supplier.equipment_supply.length > 0) {
            initializeTableSelection(supplier)
        }
    })
}
// 初始化单个表格的选择状态
const initializeTableSelection = (supplier) => {
    const tableRef = getTableRef(supplier.supplier_id)
    if (!tableRef || !supplier.equipment_supply.length) {
        console.warn(`表格引用不存在或数据为空: ${supplier.supplier_name}`)
        return
    }
    // 设置初始化标志
    isInitializing.value = true
    try {
        // 清除当前选中状态
        tableRef.clearSelection()
        // 找出所有 ifchoose === 1 且价格大于0的行
        console.log(`供应商 ${supplier.supplier_name} 设备列表:`, supplier.equipment_supply)
        const preSelectedRows = supplier.equipment_supply.filter(row => {
            return row.ifchoose === 1 && (row.actual_price || 0) > 0
        })
        // 批量设置选中状态
        preSelectedRows.forEach(row => {
            tableRef.toggleRowSelection(row, true)
        })
        console.log(`供应商 ${supplier.supplier_name} 初始化选择:`, preSelectedRows.length, '项')
    } catch (error) {
        console.error(`初始化表格选择失败 ${supplier.supplier_name}:`, error)
    } finally {
        // 重置初始化标志
        setTimeout(() => {
            isInitializing.value = false
        }, 50)
    }
}
// 点击行时也要禁止
const handleRowClick = (row, column, event, supplier) => {
    // 如果点击的是复选框列，不处理
    if (column && column.type === 'selection') {
        console.log('点击了复选框列，忽略行点击事件');
        return
    }

    // 检查单价是否为0
    if ((row.actual_price || 0) <= 0) {
        return
    }

    // 检查是否被其他供应商选中
    const equipmentId = row.equipment_id || row.id
    const otherChosen = supply_list.value.some(sup =>
        sup.supplier_id !== supplier.supplier_id &&
        sup.equipment_supply &&
        sup.equipment_supply.some(e =>
            (e.equipment_id || e.id) === equipmentId && e.ifchoose === 1
        )
    )
    if (otherChosen) {
        return
    }

    // 如果是最后一步或者供应商已淘汰，不允许操作
    if (supplier.or_choose === 0) {
        return
    }

    const tableRef = getTableRef(supplier.supplier_id)
    if (!tableRef) return

    // 切换 ifchoose 状态
    const currentValue = row.ifchoose
    row.ifchoose = (currentValue === 1) ? 0 : 1
    tableRef.toggleRowSelection(row, row.ifchoose === 1)
}
// 处理选择变化
const handleSelectionChange = (selection, equipmentList) => {
    // 如果正在初始化，跳过处理
    if (isInitializing.value) {
        return
    }

    console.log('选择变化:', selection.length, '项');

    const validSelection = selection.filter(row => (row.actual_price || 0) > 0)

    // 同步更新 ifchoose 字段
    equipmentList.forEach(row => {
        if ((row.actual_price || 0) > 0) {
            const isSelected = validSelection.some(selectedRow =>
                getRowKey(selectedRow) === getRowKey(row)
            )
            row.ifchoose = isSelected ? 1 : 0
        }
    })

    // 保存更改
    saveContractDetail(equipmentList)
}
// 获取已选择数量
const getSelectedCount = (supplier) => {
    if (!supplier.equipment_supply) return 0
    return supplier.equipment_supply.filter(item => item.ifchoose === 1).length
}

// 获取已选择金额
const getSelectedAmount = (supplier) => {
    if (!supplier.equipment_supply) return 0
    return supplier.equipment_supply
        .filter(item => item.ifchoose === 1)
        .reduce((total, item) => {
            return total + ((item.quantity || 0) * (item.actual_price || 0))
        }, 0)
}


// 行样式：被其他供应商选中的设备加禁用样式
const getEquipmentRowClassName = (row, supplier) => {
    const equipmentId = row.equipment_id || row.id
    const otherChosen = supply_list.value.some(sup =>
        sup.supplier_id !== supplier.supplier_id &&
        sup.equipment_supply &&
        sup.equipment_supply.some(e =>
            (e.equipment_id || e.id) === equipmentId && e.ifchoose === 1
        )
    )

    // 单价为0或负数的行
    if ((row.actual_price || 0) <= 0) {
        return 'disabled-row'
    }

    // 被其他供应商选中的设备
    if (otherChosen) {
        return 'disabled-row other-chosen'
    }

    // 当前供应商选中的设备
    if (row.ifchoose == 1) {
        return 'selected-row'
    }

    return ''
}

const isRowSelectable = (row, supplier) => {
    if (props.status == 2) return false
    if (supplier.or_choose === 0) return false
    if ((row.actual_price || 0) <= 0) return false

    // 新增：如果其他供应商已选择了该设备，则不可选
    const equipmentId = row.equipment_id || row.id
    const otherChosen = supply_list.value.some(sup =>
        sup.supplier_id !== supplier.supplier_id &&
        sup.equipment_supply &&
        sup.equipment_supply.some(e =>
            (e.equipment_id || e.id) === equipmentId && e.ifchoose === 1
        )
    )
    if (otherChosen) return false

    return true
}



// 保存合同详情
const saveContractDetail = async (supplier) => {
    try {
        await api.updateEquipmentSupply({
            equipment_supply: supplier
        })
        // getPurchaseDetail()
        ElMessage.success('合同详情保存成功')
    } catch (err) {
        console.error('保存合同详情失败', err)
        ElMessage.error('保存失败，请稍后重试')
    }
}



// 打开合同文件
const openContractUrl = (url) => {
    if (url) {
        window.open(url, '_blank')
    } else {
        ElMessage.warning('合同文件链接不存在')
    }
}
// 表格合计方法
const getSummaryMethod = (param, supplier) => {
    const { columns, data } = param
    const sums = []

    columns.forEach((column, index) => {
        if (index === 0) {
            sums[index] = ''
            return
        }
        if (index === 1) {
            sums[index] = '合计'
            return
        }

        const selectedRows = data.filter(row => row.ifchoose === 1)

        if (column.property === 'quantity') {
            const sum = selectedRows.reduce((prev, curr) =>
                prev + (Number(curr.quantity) || 0), 0)
            sums[index] = sum
        } else if (column.property === 'actual_price') {
            sums[index] = ''
        } else if (index === columns.length - 3) { // 总价列
            const sum = selectedRows.reduce((prev, curr) =>
                prev + ((Number(curr.quantity) || 0) * (Number(curr.actual_price) || 0)), 0)
            sums[index] = `¥${sum.toLocaleString()}`
        } else {
            sums[index] = ''
        }
    })

    return sums
}
// 审批通过
const handleApproveConfirm = async (type) => {
    try {
        await api.approveStepPass({
            purchase_id: props.purchase_id,
            flow_type: 2,
            operator_id: userStore.user_id,
            operator: userStore.user_name,
            is_last_step: is_last_step.value,
        })
        getPurchaseDetail()
        emit('data-change');
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
            step_order: 2,
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

// 返回
const handleBack = () => {
    router.go(-1)
}

// 监听器


// 生命周期
onMounted(() => {
    nextTick(() => {
        if (!canApprove.value) return;
        getPurchaseDetail();
    });
})
</script>

<style lang="scss" scoped>
// 变量定义
$primary-gradient: linear-gradient(135deg, #667eea, #764ba2);
$success-gradient: linear-gradient(135deg, #4facfe, #00f2fe);
$warning-gradient: linear-gradient(135deg, #fa709a, #fee140);
$danger-gradient: linear-gradient(135deg, #ff6b6b, #ffa500);
$card-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
$card-shadow-hover: 0 12px 40px rgba(0, 0, 0, 0.15);
$border-radius: 12px;
$transition: all 0.3s ease;

.contract-step {
    height: 100%;

    .supplier-card {
        background: white;
        border-radius: $border-radius;
        box-shadow: $card-shadow;
        margin-bottom: 30px;
        overflow: hidden !important;
        transition: $transition;

        &.supplier-card-enter-active {
            transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
            transition-delay: var(--animation-delay);
        }

        &.supplier-card-enter-from {
            opacity: 0;
            transform: translateY(-30px) scale(0.9);
            max-height: 0;
        }

        &.supplier-card-enter-to {
            opacity: 1;
            transform: translateY(0) scale(1);
            max-height: 1000px;
        }

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

        &:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 30px rgba(103, 194, 58, 0.5);
        }

        &.eliminated {
            opacity: 0.6;
            filter: grayscale(0.3);
            border-color: #f56c6c;
        }

        // 供应商头部
        .supplier-header {
            background: $primary-gradient;
            color: white;
            padding: 20px 25px;
            display: flex;
            justify-content: space-between;
            align-items: center;



            .supplier-name {
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 18px;
                font-weight: 700;
                margin-bottom: 8px;

                .el-icon {
                    font-size: 20px;
                }
            }

            .contract-link {
                background: rgba(255, 255, 255, 0.2);
                border: 2px solid rgba(255, 255, 255, 0.4);
                color: white;
                border-radius: 20px;
                padding: 8px 16px;
                font-size: 13px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.3s ease;
                backdrop-filter: blur(10px);

                &:hover {
                    background: rgba(255, 255, 255, 0.3);
                    border-color: rgba(255, 255, 255, 0.6);
                    transform: translateY(-1px);
                    box-shadow: 0 4px 15px rgba(255, 255, 255, 0.2);
                }
            }

            .supplier-actions {
                display: flex;
                gap: 10px;

                .el-button {
                    background: rgba(255, 255, 255, 0.2);
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    color: white;
                    transition: $transition;

                    &:hover {
                        background: rgba(255, 255, 255, 0.3);
                        transform: translateY(-1px);
                    }
                }
            }
        }

        // 合同表格区域
        .contract-table-section {
            padding: 25px;

            .table-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                padding-bottom: 15px;
                border-bottom: 2px solid #f0f0f0;

                .table-title {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 16px;
                    font-weight: 700;
                    color: #333;

                    .el-icon {
                        color: #667eea;
                        font-size: 18px;
                    }
                }

            }

            // 设备表格样式
            .contract-equipment-table {
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

                :deep(.el-table__header) {
                    .el-table__cell {
                        background-color: #667eea !important;
                        color: white !important;
                    }
                }

                :deep(.el-table__row) {
                    transition: $transition;

                    &:hover {
                        background-color: #f5f7fa;
                    }

                    &.selected-row {
                        background-color: #f0f9ff;

                        .el-table__cell {
                            background-color: #f0f9ff;
                        }
                    }

                    &.disabled-row {
                        background-color: #f5f5f5;
                        color: #c0c4cc;

                        .el-table__cell {
                            background-color: #f5f5f5;
                        }
                    }

                    &.readonly-row {
                        background-color: #fafafa;

                        .el-table__cell {
                            background-color: #fafafa;
                        }
                    }
                }



                .item-cell {
                    display: inline-block;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    color: #667eea;
                    font-weight: 600;
                }

                .choose-status-cell {
                    .el-tag {
                        font-weight: 600;

                        .el-icon {
                            margin-right: 4px;
                        }
                    }
                }
            }

            // 表格底部操作
            .table-footer {
                display: flex;
                justify-content: space-between;
                gap: 12px;
                margin-top: 15px;
                padding-top: 15px;
                border-top: 1px solid #f0f0f0;

                .selected-count {
                    font-size: 16px;
                    color: #667eea;
                    font-weight: 600;
                }

                .selected-amount {
                    font-size: 16px;
                    color: #27ae60;
                    font-weight: 700;
                }

                .el-button {
                    padding: 10px 16px;
                    font-size: 14px;
                    min-width: 120px;
                }
            }
        }

        // 空状态
        .empty-contract {
            padding: 50px 25px;
            text-align: center;
        }
    }
}

/* 表格样式 */
:deep(.el-table) {
    border-radius: 12px;
    overflow: hidden;

    .disabled-row {
        background-color: #f5f5f5 !important;
        color: #c0c4cc;
        cursor: not-allowed;

        &:hover {
            background-color: #f5f5f5 !important;
        }

        .el-checkbox {
            pointer-events: none;
            opacity: 0.5;
        }
    }


    .el-table__row {
        cursor: pointer;
        transition: background-color 0.2s ease;

        &:hover {
            background-color: #f5f7fa;
        }
    }

    .el-table__footer {
        background-color: #f8f9fa;
        font-weight: 600;

        .cell {
            color: #303133;
            text-align: center !important;

            &:nth-child(7) {
                color: #409eff;
                font-weight: 700;
            }

            &:last-child {
                color: #67c23a;
                font-weight: 700;
                font-size: 16px;
            }
        }
    }

    .el-table-column--selection .cell {
        cursor: default;
    }
}

// 响应式设计
@media (max-width: 1200px) {
    .contract-step {
        padding: 15px;

        .supplier-card {


            .contract-table-section {
                .table-header {
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 10px;
                }
            }
        }
    }
}

@media (max-width: 768px) {
    .contract-step {
        padding: 10px;

        .supplier-card {
            margin-bottom: 20px;

            .supplier-header {
                flex-direction: column;
                gap: 15px;
                text-align: center;
            }



            .contract-table-section {
                padding: 15px;

                .table-footer {
                    flex-direction: column;

                    .el-button {
                        width: 100%;
                    }
                }
            }
        }

        .approval-actions {
            flex-direction: column;

            .el-button {
                width: 100%;
            }
        }
    }
}
</style>