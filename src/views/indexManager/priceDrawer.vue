<template>
    <el-drawer v-model="visible" title="全部报价单" size="90%" :close-on-click-modal="true" :show-close="true">
        <div class="quotes-table-container">
            <!-- 移除 show-summary 和 summary-method -->
            <el-table :data="tableDataWithSummary" style="width: 100%;" height="100%"
                :row-class-name="tableRowClassName">
                <!-- 固定设备信息表头 -->
                <el-table-column prop="equipment_name" fixed label="设备" align="center" min-width="120">
                    <template #default="{ row }">
                        <el-tag class="equipment-tag" type="primary" size="small">{{ row.equipment_name
                        }}</el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="quantity" fixed label="数量" align="center" width="80">
                    <template #default="{ row }">
                        <el-tag class="quantity-tag" type="success" size="small">{{ row.quantity }}</el-tag>
                    </template>
                </el-table-column>

                <!-- 动态供应商报价表头 -->
                <el-table-column v-for="(supplier, sIdx) in supplierList" :key="supplier.supplier_id"
                    :label="supplier.supplier_name" align="center" min-width="150">
                    <template #default="{ row }">
                        <!-- 如果是合计行，显示合计数据 -->
                        <div v-if="row.isSummaryRow" class="summary-cell" :class="row.summaryType">
                            {{ row[`supplier_${sIdx + 1}`] || '' }}
                        </div>
                        <!-- 普通数据行 -->
                        <div v-else class="quote-cell">
                            <div v-if="row.quotes.find(q => q.supplier_id === supplier.supplier_id)?.unit_price &&
                                row.quotes.find(q => q.supplier_id === supplier.supplier_id)?.unit_price !== 0" :class="{
                                    highlight: row.quotes.find(q => q.supplier_id === supplier.supplier_id)?.ifchoose == 1,
                                }">
                                <span class="quote-label">单价：</span>¥{{row.quotes.find(q => q.supplier_id ===
                                    supplier.supplier_id)?.unit_price ?? '-'}}
                            </div>
                            <div v-if="row.quotes.find(q => q.supplier_id === supplier.supplier_id)?.total_price &&
                                row.quotes.find(q => q.supplier_id === supplier.supplier_id)?.total_price !== 0"
                                :class="{
                                    highlight: row.quotes.find(q => q.supplier_id === supplier.supplier_id)?.ifchoose == 1,
                                }">
                                <span class="quote-label">总价：</span>¥{{row.quotes.find(q => q.supplier_id ===
                                    supplier.supplier_id)?.total_price ?? '-'}}
                            </div>
                        </div>
                    </template>
                </el-table-column>
            </el-table>
        </div>
    </el-drawer>
</template>

<script setup>
import api from '@/api'
import { ref, watch, computed, onMounted } from 'vue'
const props = defineProps({
    purchase_id: { type: String, required: true },
})
const visible = ref(props.modelValue)
watch(() => props.modelValue, val => visible.value = val)
const supplierList = ref([])
onMounted(() => {
    // 示例供应商列表
    EquipmentQuotes()
})

// 示例表格数据结构
const tableData = ref([
])
const EquipmentQuotes = () => {
    api.getEquipmentQuotes({
        purchase_id: props.purchase_id
    }).then(data => {
        tableData.value = data.equipment_quotes // 直接赋值
        // 提取所有供应商（去重）
        const allSuppliers = []
        data.equipment_quotes.forEach(row => {
            row.quotes.forEach(q => {
                if (!allSuppliers.find(s => s.supplier_id === q.supplier_id)) {
                    allSuppliers.push({ supplier_id: q.supplier_id, supplier_name: q.supplier_name })
                }
            })
        })
        supplierList.value = allSuppliers
    }).catch(err => {
        console.error('获取报价单失败', err)
    })
}

// 计算带合计行的表格数据
const tableDataWithSummary = computed(() => {
    if (!tableData.value.length || !supplierList.value.length) {
        return []
    }

    // 原始数据
    const data = [...tableData.value]
    // 第一行：总金额（仅统计 ifchoose == 1 的 total_price）
    const totalRow = {
        equipment_name: '合计',
        quantity: '',
        isSummaryRow: true,
        summaryType: 'total'
    }
    supplierList.value.forEach((supplier, idx) => {
        // 仅统计 ifchoose == 1 的 total_price
        const total = tableData.value.reduce((sum, row) => {
            const quote = row.quotes.find(q => q.supplier_id === supplier.supplier_id && q.ifchoose == 1)
            totalRow.quantity = row.quotes.find(q => q.supplier_id === supplier.supplier_id && q.ifchoose == 1)
            return sum + (quote?.total_price || 0)
        }, 0)
        // 计算所有行的 quantity 总和
        totalRow.quantity = tableData.value.reduce((sum, row) => {
            return sum + (row.quantity || 0)
        }, 0)
        console.log('tableDataWithSummary', totalRow)
        totalRow[`supplier_${idx + 1}`] = `¥${total}`
    })
    data.push(totalRow)
    return data
})
// 表格行类名
const tableRowClassName = ({ row, rowIndex }) => {
    if (row.isSummaryRow) {
        return `summary-row ${row.summaryType}-row`
    }
    return ''
}
</script>

<style scoped lang="scss">
.page-content {
    width: 100%;
    margin: 0 auto;
}

.form-container {
    background: #fff;
    border-radius: 16px;
    padding: 5px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.10);
    border: 1px solid #e2e8f0;
    margin: 0 auto;
}

.section-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 24px;
    padding-bottom: 12px;
    border-bottom: 2px solid #f1f5f9;

    h3 {
        margin: 0;
        color: #1e293b;
        font-size: 22px;
        font-weight: 600;
        letter-spacing: 1px;
    }
}

.el-drawer__body {
    height: 100%;
    display: flex;
    flex-direction: column;
}

.quotes-table-container {
    height: 100%;
    min-height: 0;
    /* 防止flex撑开 */
    padding: 0;

    .el-tag {
        min-width: 60% !important;
        min-height: 28px !important;
        padding: 6px 14px !important;
        font-size: 15px;
        font-weight: 600;
        border-radius: 8px !important;

        box-shadow: 0 2px 8px rgba(37, 99, 235, 0.08);
        letter-spacing: 1px;
        margin: 2px 0;
        display: inline-flex;
        align-items: center;
        justify-content: center;
    }
}

.custom-table {
    background: #f8fafc;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
    font-size: 15px;
    border: none !important;
}

.quote-cell {
    display: flex;
    flex-direction: column;
    gap: 4px;
    align-items: center;
    justify-content: center;
    font-weight: 500;

    .quote-label {
        font-size: 13px;
        color: #64748b;
        margin-right: 2px;
    }

    &.highlight {
        background: #e0f7fa;
        color: #059669;
        font-weight: bold;
        border-radius: 8px;
        padding: 2px 10px;
        box-shadow: 0 2px 8px rgba(5, 150, 105, 0.08);
    }
}

.highlight {
    background: #e0f7fa;
    color: #059669;
    font-weight: bold;
    border-radius: 8px;
    padding: 2px 10px;
    box-shadow: 0 2px 8px rgba(5, 150, 105, 0.08);
}

.danger {
    background: #fee2e2;
    color: #b91c1c;
    font-weight: bold;
    border-radius: 6px;
    padding: 2px 8px;
    box-shadow: 0 2px 8px rgba(185, 28, 28, 0.08);
}

.el-table {
    border-radius: 14px;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
    overflow: hidden;

    th {
        background: linear-gradient(90deg, #e0f7fa 0%, #f1f8e9 100%) !important;
        color: #2563eb;
        font-weight: 700;
        font-size: 16px;
        border-bottom: 2px solid #e2e8f0 !important;
        border-radius: 0 !important;
    }

    td {
        background: #fff;
        font-size: 15px;
        border-bottom: 1px solid #e2e8f0 !important;
        transition: background 0.2s;
    }

    &__body tr:hover td {
        background: #f0f9ff !important;
    }
}

.summary-cell {
    font-size: 16px;
    font-weight: bold;
    color: #059669;
    background: #e0f7fa;
    border-radius: 8px;
    padding: 4px 12px;
}

.el-table-column--center .el-table__cell {
    text-align: center;
}

.supplier-total-amount {
    &.highlight {
        background: #e0f7fa !important;
        color: #059669 !important;
        font-weight: bold !important;
        border-radius: 6px;
        padding: 2px 8px;
        box-shadow: 0 2px 8px rgba(5, 150, 105, 0.08);
    }

    &.danger {
        background: #fee2e2 !important;
        color: #b91c1c !important;
        font-weight: bold !important;
        border-radius: 6px;
        padding: 2px 8px;
        box-shadow: 0 2px 8px rgba(185, 28, 28, 0.08);
    }
}
</style>