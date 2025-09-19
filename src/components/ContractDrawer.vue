<template>
    <el-drawer v-model="drawerVisible" title="合同详情" direction="btt" size="70%" :before-close="handleDrawerClose"
        :close-on-click-modal="true" :show-close="true">
        <div class="drawer-content">
            <el-table ref="tableRef" :data="equipment_supply" stripe height="400"
                @selection-change="handleSelectionChange" @row-click="handleRowClick" style="width: 100%"
                :show-summary="true" :summary-method="getSummaries" sum-text="合计" :row-key="getRowKey"
                :reserve-selection="true" :row-class-name="getRowClassName">
                <!-- 多选框列 -->
                <el-table-column type="selection" width="55" align="center" :reserve-selection="true"
                    :selectable="checkSelectable" />
                <!-- 产品名称 -->
                <el-table-column prop="equipment_name" label="产品名称" min-width="150" align="center">
                    <template #default="{ row }">
                        <div class="product-info">
                            <span>{{ row.equipment_name || '-' }}</span>
                            <!-- 显示选中状态指示器 -->
                            <el-tag v-if="row.ifchoose === 1" type="success" size="small" class="status-tag">
                                已选择
                            </el-tag>
                        </div>
                    </template>
                </el-table-column>
                <!-- 品牌 -->
                <el-table-column prop="brand" label="品牌" min-width="120" align="center">
                    <template #default="{ row }">
                        <span>{{ row.brand || '-' }}</span>
                    </template>
                </el-table-column>
                <!-- 型号 -->
                <el-table-column prop="model" label="型号" min-width="120" align="center">
                    <template #default="{ row }">
                        <span>{{ row.model || '-' }}</span>
                    </template>
                </el-table-column>
                <!-- 规格 -->
                <el-table-column prop="spec" label="规格" min-width="120" align="center">
                    <template #default="{ row }">
                        <span>{{ row.spec || '-' }}</span>
                    </template>
                </el-table-column>
                <!-- 数量 -->
                <el-table-column prop="quantity" label="数量" width="100" align="center">
                    <template #default="{ row }">
                        <el-input v-model="row.quantity" type="number" :min="0" :disabled="!canEdit" size="small"
                            @change="row.quantity = Number(row.quantity)" @click.stop style="width: 100%" />
                    </template>
                </el-table-column>
                <!-- 单价 -->
                <el-table-column prop="actual_price" label="单价(元)" width="120" align="center">
                    <template #default="{ row }">
                        <span>¥{{ (row.actual_price || 0).toFixed(2) }}</span>
                    </template>
                </el-table-column>
                <!-- 总价 -->
                <el-table-column prop="total_price" label="总价(元)" width="120" align="center">
                    <template #default="{ row }">
                        <span class="total-price">
                            ¥{{ ((row.quantity || 0) * (row.actual_price || 0)).toFixed(2) }}
                        </span>
                    </template>
                </el-table-column>
            </el-table>
        </div>

        <template #footer>
            <div class="drawer-footer">
                <el-button @click="lookContract" type="success" style="margin-right: auto;" :disabled="!showContract"
                    :loading="saving">查看合同</el-button>
                <el-button @click="handleDrawerClose">取消</el-button>
                <el-button type="primary" @click="handleSave">
                    保存
                </el-button>
            </div>
        </template>
    </el-drawer>
</template>

<script setup>
import { ref, computed, watch, nextTick, defineProps, defineEmits } from 'vue'

// 定义 props
const props = defineProps({
    visible: {
        type: Boolean,
        default: false
    },
    showContract: {
        type: Boolean,
        default: false
    },
    contractUrl: {
        type: String,
        default: ''
    },
    supplierData: {
        type: Object,
        default: () => ({})
    },
    canEdit: {
        type: Boolean,
        default: false
    }
})

// 定义 emits
const emit = defineEmits(['update:visible', 'save', 'close'])

// 响应式数据
const tableRef = ref()
const equipment_supply = ref([])
const selectedTableRows = ref([])
const isInitializing = ref(false)
const saving = ref(false)
// const showContract = ref(false)
// 计算属性
const drawerVisible = computed({
    get() {
        return props.visible
    },
    set(value) {
        emit('update:visible', value)
    }
})

// 监听器
/**
 * 监听供应商数据的变化
 * 当供应商数据发生变化且包含设备供应信息时，加载合同详情
 * 使用深度监听和立即执行，确保组件初始化时也能触发
 */

/**
 * 监听抽屉显示状态的变化
 * 当抽屉打开且存在供应商数据时，重新加载合同详情
 * 确保每次打开抽屉时都能获取最新的合同信息
 */
watch(() => props.supplierData, (newData) => {
    if (newData && newData.equipment_supply) {
        loadContractDetail(newData)
    }
}, { deep: true, immediate: true })

watch(() => props.visible, (newValue) => {
    if (newValue && props.supplierData) {
        loadContractDetail(props.supplierData)
    }
})

// 方法定义
const getRowKey = (row) => {
    return row.id || row.equipment_id || row.supply_id || `${row.equipment_name}_${row.supplier_id}_${Math.random()}`
}

const checkSelectable = (row, index) => {
    // 移除最后一步限制，只有单价大于0的行才可选中
    return (row.actual_price || 0) > 0
}

const getRowClassName = ({ row, rowIndex }) => {
    let className = ''

    // 单价为0或空的行添加禁用样式
    if ((row.actual_price || 0) <= 0) {
        className += 'disabled-row '
    }

    return className.trim()
}

const handleRowClick = (row, column, event) => {
    // 如果点击的是复选框列，不处理（让默认行为生效）
    if (column && column.type === 'selection') {
        return
    }

    // 检查单价是否为0，如果是则不响应点击
    if ((row.actual_price || 0) <= 0) {
        console.log('该行单价为0，不可选中')
        return
    }

    // 查找当前行在数据中的索引
    const rowIndex = equipment_supply.value.findIndex(item =>
        getRowKey(item) === getRowKey(row)
    )

    if (rowIndex !== -1) {
        // 切换 ifchoose 状态
        const currentValue = equipment_supply.value[rowIndex].ifchoose
        equipment_supply.value[rowIndex].ifchoose = (currentValue === 1) ? 0 : 1

        // 切换表格选中状态
        tableRef.value.toggleRowSelection(row, equipment_supply.value[rowIndex].ifchoose === 1)
    }
}

const lookContract = () => {
    if (props.contractUrl) {
        window.open(props.contractUrl, '_blank');
    } else {
        ElMessage.warning('报价链接无效');
    }
    console.log('查看合同:', props.contractUrl);
}

const handleSelectionChange = (selection) => {

    // 如果正在初始化，只更新 selectedTableRows，不修改 ifchoose
    if (isInitializing.value) {
        selectedTableRows.value = selection
        return
    }

    // 过滤掉单价为0的行（安全检查）
    const validSelection = selection.filter(row => (row.actual_price || 0) > 0)
    selectedTableRows.value = validSelection

    // 同步更新 ifchoose 字段，但只处理有效价格的行
    equipment_supply.value.forEach(row => {
        // 只处理单价大于0的行
        if ((row.actual_price || 0) > 0) {
            const isSelected = validSelection.some(selectedRow =>
                getRowKey(selectedRow) === getRowKey(row)
            )
            row.ifchoose = isSelected ? 1 : 0
        }
        // 单价为0的行不修改其 ifchoose 值，保持原状态
    })

    console.log('更新后的选中状态:', equipment_supply.value.map(item => ({
        equipment_name: item.equipment_name,
        ifchoose: item.ifchoose
    })))
}

const getSummaries = (param) => {
    const { columns } = param
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
        if (index <= 5) {
            sums[index] = ''
            return
        }

        // 只统计有效价格的选中行
        const validSelectedRows = selectedTableRows.value.filter(row => (row.actual_price || 0) > 0)

        if (column.property === 'quantity') {
            const sum = validSelectedRows.reduce((prev, curr) => prev + (Number(curr.quantity) || 0), 0)
            sums[index] = sum
        } else if (column.property === 'actual_price') {
            sums[index] = ''
        } else if (column.property === 'total_price') {
            const sum = validSelectedRows.reduce((prev, curr) =>
                prev + ((Number(curr.quantity) || 0) * (Number(curr.actual_price) || 0)), 0)
            sums[index] = `¥${sum.toFixed(2)}`
        } else {
            sums[index] = ''
        }
    })

    return sums
}

const loadContractDetail = async (item) => {
    console.log('加载合同详情', props.contractUrl)
    try {
        // 加载数据
        equipment_supply.value = item.equipment_supply || []
        console.log('加载的设备数据:', equipment_supply.value.map(row => ({
            equipment_name: row.equipment_name,
            ifchoose: row.ifchoose,
            actual_price: row.actual_price
        })))
        console.log('表格引用:', props.showContract)
        // 等待表格渲染完成后设置选中状态
        await nextTick()

        // 延迟初始化，确保表格完全准备好
        setTimeout(() => {
            if (tableRef.value) {
                initializeTableSelection()
            } else {
                console.warn('表格引用仍然为空，跳过初始化')
            }
        }, 50)
    } catch (err) {
        console.error('加载合同详情失败', err)
    }
}

const initializeTableSelection = () => {
    if (!tableRef.value || !equipment_supply.value.length) {
        return
    }
    // 设置初始化标志，防止触发 handleSelectionChange
    isInitializing.value = true
    // 清除当前选中状态
    tableRef.value.clearSelection()

    // 找出所有 ifchoose === 1 且价格大于0的行
    const preSelectedRows = equipment_supply.value.filter(row => {
        return row.ifchoose === 1 && (row.actual_price || 0) > 0
    })
    // 批量设置选中状态
    preSelectedRows.forEach(row => {
        tableRef.value.toggleRowSelection(row, true)
    })
    // 手动更新 selectedTableRows，不触发 handleSelectionChange
    selectedTableRows.value = preSelectedRows
    // 重置初始化标志
    isInitializing.value = false
}

const handleDrawerClose = () => {
    // 清空表格选中状态和相关数据
    selectedTableRows.value = []
    equipment_supply.value = []

    // 如果表格存在，也清除其选中状态
    if (tableRef.value) {
        tableRef.value.clearSelection()
    }

    console.log('抽屉关闭，已清空相关数据')
    emit('close')
    emit('update:visible', false)
}

const handleSave = async () => {
    try {
        saving.value = true
        console.log('保存表格数据', equipment_supply.value)

        // 发送保存事件，将数据传递给父组件处理
        emit('save', equipment_supply.value)

    } catch (err) {
        console.error('保存失败', err)
    } finally {
        saving.value = false
    }
}

// 暴露方法给父组件
defineExpose({
    initializeTableSelection,
    equipment_supply
})
</script>

<style scoped>
.drawer-content {
    padding: 0;
}

.drawer-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding: 16px 0;
}

.product-info {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    flex-wrap: wrap;
    gap: 4px;
}

.status-tag {
    flex-shrink: 0;
}

/* 表格样式 */
:deep(.el-table) {
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

.total-price {
    font-weight: 600;
    color: #E6A23C;
}

/* 行选中动画效果 */
:deep(.el-table__row.selected) {
    background-color: #ecf5ff;
    animation: row-select 0.3s ease;
}

@keyframes row-select {
    0% {
        background-color: #409eff;
        transform: scale(1.02);
    }

    100% {
        background-color: #ecf5ff;
        transform: scale(1);
    }
}
</style>