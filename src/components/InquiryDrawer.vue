<template>
    <el-drawer v-model="visible" title="全部报价单" size="90%" :close-on-click-modal="true" :show-close="true">
        <div class="page-content">
            <div class="form-container">
                <div class="quotes-table-container">
                    <!-- 移除 show-summary 和 summary-method -->
                    <el-table :data="tableDataWithSummary" style="width: 100%;" :row-class-name="tableRowClassName">
                        <!-- 固定设备信息表头 -->
                        <el-table-column prop="equipment_name" fixed label="设备" align="center" min-width="180" />
                        <el-table-column prop="quantity" fixed label="数量" align="center" width="80" />
                        <el-table-column prop="brand" label="品牌" align="center" width="100" />
                        <el-table-column prop="model" label="型号" align="center" min-width="200" />
                        <el-table-column prop="spec" label="规格" align="center" min-width="200" />
                        <!-- 动态供应商报价表头 -->
                        <el-table-column v-for="(supplier, sIdx) in supplierList" :key="supplier.supplier_id"
                            :label="supplier.supplier_name" align="center" width="150">
                            <template #default="{ row }">
                                <!-- 如果是合计行，显示合计数据 -->
                                <div v-if="row.isSummaryRow" class="summary-cell" :class="row.summaryType">
                                    {{ row[`supplier_${sIdx}`] || '' }}
                                </div>
                                <!-- 普通数据行 -->
                                <div v-else class="quote-cell">
                                    <div v-if="row.quotes.find(q => q.supplier_id === supplier.supplier_id)?.unit_price &&
                                        row.quotes.find(q => q.supplier_id === supplier.supplier_id)?.unit_price !== 0"
                                        :class="{
                                            highlight: isLowest(row, sIdx, 'unit_price'),
                                        }">
                                        <span class="quote-label">单价：</span>¥{{row.quotes.find(q => q.supplier_id ===
                                            supplier.supplier_id)?.unit_price ?? '-'}}
                                    </div>
                                    <div v-if="row.quotes.find(q => q.supplier_id === supplier.supplier_id)?.total_price &&
                                        row.quotes.find(q => q.supplier_id === supplier.supplier_id)?.total_price !== 0"
                                        :class="{
                                            highlight: isLowest(row, sIdx, 'total_price'),
                                        }">
                                        <span class="quote-label">总价：</span>¥{{row.quotes.find(q => q.supplier_id ===
                                            supplier.supplier_id)?.total_price ?? '-'}}
                                    </div>
                                </div>
                            </template>
                        </el-table-column>
                    </el-table>
                </div>
            </div>
        </div>
        <template #footer>
            <div style="flex: auto">
                <el-button type="primary" @click="exportToExcel">导出报价单</el-button>
            </div>
        </template>
    </el-drawer>
</template>

<script setup>
import api from '@/api'
import { ref, watch, computed, onMounted } from 'vue'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
const props = defineProps({
    purchase_id: { type: String, required: true },
})
const visible = ref(props.modelValue)
watch(() => props.modelValue, val => visible.value = val)
const supplierList = ref([])
const openQuoteUrl = (url) => {
    if (url) {
        window.open(url, '_blank')
    }
}
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

    // 计算各供应商总金额
    const supplierTotals = supplierList.value.map(supplier => {
        return tableData.value.reduce((sum, row) => {
            const quote = row.quotes.find(q => q.supplier_id === supplier.supplier_id)
            return sum + (quote?.total_price || 0)
        }, 0)
    })

    // 第一行：总金额
    const totalRow = {
        equipment_name: '总金额',
        quantity: '',
        brand: '',
        model: '',
        spec: '',
        isSummaryRow: true,
        summaryType: 'total'
    }
    supplierList.value.forEach((supplier, idx) => {
        totalRow[`supplier_${idx}`] = `¥${supplierTotals[idx]}`
    })
    data.push(totalRow)

    // 第二行：价格排名
    const participationRow = {
        equipment_name: '参与度',
        quantity: '',
        brand: '',
        model: '',
        spec: '',
        isSummaryRow: true,
        summaryType: 'participation'
    }
    supplierList.value.forEach((supplier, idx) => {
        // 统计该供应商报价单价或总价不为0的个数
        const count = tableData.value.reduce((sum, row) => {
            const quote = row.quotes.find(q => q.supplier_id === supplier.supplier_id)
            return sum + ((quote && (quote.unit_price > 0 || quote.total_price > 0)) ? 1 : 0)
        }, 0)
        participationRow[`supplier_${idx}`] = `${count}项`
    })
    data.push(participationRow)

    // 第三行：最优选择
    // 优势项：统计每个供应商在所有设备中最低价的数量
    const advantageRow = {
        equipment_name: '优势项',
        quantity: '',
        brand: '',
        model: '',
        spec: '',
        isSummaryRow: true,
        summaryType: 'advantage'
    }
    supplierList.value.forEach((supplier, idx) => {
        let count = 0
        tableData.value.forEach(row => {
            if (isLowest(row, idx, 'total_price')) {
                count++
            }
        })
        advantageRow[`supplier_${idx}`] = `${count}项`
    })
    data.push(advantageRow)
    return data
})
// 表格行类名
const tableRowClassName = ({ row, rowIndex }) => {
    if (row.isSummaryRow) {
        return `summary-row ${row.summaryType}-row`
    }
    return ''
}
const getMinMaxIndex = (row, key) => {
    const prices = supplierList.value.map(sup => {
        const quote = row.quotes.find(q => q.supplier_id === sup.supplier_id)
        return quote ? quote[key] : Infinity
    })
    const min = Math.min(...prices)
    const max = Math.max(...prices)
    // 找出所有最低价和最高价的索引
    let minIdxArr;
    if (min === 0) {
        // 剔除为0的项，重新找最小值（非0且非Infinity）
        const filteredPrices = prices.map(p => (p === 0 || p === Infinity) ? Infinity : p);
        const newMin = Math.min(...filteredPrices);
        minIdxArr = filteredPrices.map((p, i) => p === newMin ? i : -1).filter(i => i !== -1);
    } else {
        minIdxArr = prices.map((p, i) => p === min ? i : -1).filter(i => i !== -1);
    }
    const maxIdxArr = prices.map((p, i) => p === max ? i : -1).filter(i => i !== -1)
    return {
        minIdxArr,
        maxIdxArr
    }
}

// 判断是否为最低价
const isLowest = (row, idx, key) => {
    const { minIdxArr } = getMinMaxIndex(row, key)
    return minIdxArr.includes(idx)
}

// 判断是否为最高价
const isHighest = (row, idx, key) => {
    const { maxIdxArr } = getMinMaxIndex(row, key)
    return maxIdxArr.includes(idx)
}

const exportToExcel = () => {
    if (!tableData.value.length || !supplierList.value.length) {
        ElMessage.warning('暂无数据可导出')
        return
    }

    // 创建工作簿
    const wb = XLSX.utils.book_new()

    // 准备表头数据 - 三行表头
    const excelData = []

    // 第一行：主表头（供应商合并）
    const headerRow1 = ['设备名称', '数量', '品牌', '型号', '规格']
    supplierList.value.forEach(supplier => {
        headerRow1.push(supplier.supplier_name, '') // 供应商名称占两列，第二列为空
    })
    excelData.push(headerRow1)

    // 第二行：子表头（单价/总价）
    const headerRow2 = ['', '', '', '', ''] // 前5列为空
    supplierList.value.forEach(() => {
        headerRow2.push('单价', '总价')
    })
    excelData.push(headerRow2)

    // 添加数据行
    tableData.value.forEach(row => {
        const rowData = [
            row.equipment_name,
            row.quantity,
            row.brand,
            row.model,
            row.spec
        ]

        // 按供应商顺序添加单价和总价
        supplierList.value.forEach(supplier => {
            const quote = row.quotes.find(q => q.supplier_id === supplier.supplier_id)
            rowData.push(
                quote ? quote.unit_price : '-',
                quote ? quote.total_price : '-'
            )
        })

        excelData.push(rowData)
    })

    // 添加总金额行
    const totalRow = ['总金额', '', '', '', '']

    // 计算各供应商总金额
    const supplierTotals = []
    supplierList.value.forEach(supplier => {
        let total = 0
        tableData.value.forEach(row => {
            const quote = row.quotes.find(q => q.supplier_id === supplier.supplier_id)
            if (quote && quote.total_price !== '-') {
                total += parseFloat(quote.total_price)
            }
        })
        supplierTotals.push(total)
        totalRow.push('', total) // 单价列为空，总价列显示总金额
    })

    excelData.push(totalRow)

    // 创建工作表
    const ws = XLSX.utils.aoa_to_sheet(excelData)

    // 设置列宽
    const colWidths = [
        { wch: 18 }, // 设备名称
        { wch: 8 },  // 数量
        { wch: 12 }, // 品牌
        { wch: 18 }, // 型号
        { wch: 25 }, // 规格
        ...Array(supplierList.value.length * 2).fill({ wch: 12 }) // 每个供应商2列
    ]
    ws['!cols'] = colWidths

    // 设置合并单元格
    const merges = []

    // 合并第一行的供应商表头（每个供应商占2列）
    for (let i = 0; i < supplierList.value.length; i++) {
        const startCol = 5 + i * 2 // 从第6列开始，每个供应商占2列
        const endCol = startCol + 1
        merges.push({
            s: { r: 0, c: startCol }, // 起始位置
            e: { r: 0, c: endCol }    // 结束位置
        })
    }

    // 合并基础信息列的第一行和第二行
    for (let col = 0; col < 5; col++) {
        merges.push({
            s: { r: 0, c: col },
            e: { r: 1, c: col }
        })
    }

    ws['!merges'] = merges

    // 应用样式和高亮
    applyExcelStylesWithHighlight(ws, excelData, supplierTotals)

    // 添加工作表到工作簿
    XLSX.utils.book_append_sheet(wb, ws, '报价单')

    // 导出文件
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([wbout], { type: 'application/octet-stream' })
    saveAs(blob, `报价单_${new Date().toLocaleDateString()}.xlsx`)

    ElMessage.success('导出成功!')
}

// 应用Excel样式和高亮
const applyExcelStylesWithHighlight = (ws, excelData, supplierTotals) => {
    const range = XLSX.utils.decode_range(ws['!ref'])

    // 通用边框样式
    const borderStyle = {
        top: { style: "thin" },
        bottom: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" }
    }

    // 为所有单元格添加基础样式
    for (let row = range.s.r; row <= range.e.r; row++) {
        for (let col = range.s.c; col <= range.e.c; col++) {
            const cellAddress = XLSX.utils.encode_cell({ r: row, c: col })

            // 确保单元格存在
            if (!ws[cellAddress]) {
                ws[cellAddress] = { v: "" }
            }

            // 基础样式
            ws[cellAddress].s = {
                border: borderStyle,
                alignment: {
                    horizontal: "center",
                    vertical: "center",
                    wrapText: true
                },
                font: {
                    name: "微软雅黑",
                    bold: true,
                    size: 11
                }
            }

            // 表头样式（前两行）
            if (row <= 1) {
                ws[cellAddress].s.fill = { fgColor: { rgb: "E3F2FD" } }
                ws[cellAddress].s.font.color = { rgb: "1565C0" }
                ws[cellAddress].s.font.size = 12
            }
            // 总金额行样式
            else if (row === range.e.r) {
                ws[cellAddress].s.fill = { fgColor: { rgb: "F5F5F5" } }
                ws[cellAddress].s.font.color = { rgb: "D32F2F" }
                ws[cellAddress].s.font.size = 12
            }
            // 数据行样式
            else {
                ws[cellAddress].s.fill = { fgColor: { rgb: "FFFFFF" } }
                ws[cellAddress].s.font.color = { rgb: "424242" }
                ws[cellAddress].s.font.size = 10
            }
        }
    }

    // 应用高亮效果到数据行
    for (let row = 2; row < excelData.length - 1; row++) { // 从第3行开始（跳过表头），到倒数第2行（跳过总金额行）
        const dataRow = tableData.value[row - 2] // 对应的数据行

        // 单价高亮
        for (let i = 0; i < supplierList.value.length; i++) {
            const col = 5 + i * 2 // 单价列位置
            const cellAddress = XLSX.utils.encode_cell({ r: row, c: col })

            if (isLowest(dataRow, i, 'unit_price')) {
                ws[cellAddress].s.fill = { fgColor: { rgb: "E0F7FA" } }
                ws[cellAddress].s.font.color = { rgb: "059669" }
                ws[cellAddress].s.font.bold = true
            } else if (isHighest(dataRow, i, 'unit_price')) {
                ws[cellAddress].s.fill = { fgColor: { rgb: "FEE2E2" } }
                ws[cellAddress].s.font.color = { rgb: "B91C1C" }
                ws[cellAddress].s.font.bold = true
            }
        }

        // 总价高亮
        for (let i = 0; i < supplierList.value.length; i++) {
            const col = 6 + i * 2 // 总价列位置
            const cellAddress = XLSX.utils.encode_cell({ r: row, c: col })

            if (isLowest(dataRow, i, 'total_price')) {
                ws[cellAddress].s.fill = { fgColor: { rgb: "E0F7FA" } }
                ws[cellAddress].s.font.color = { rgb: "059669" }
                ws[cellAddress].s.font.bold = true
            } else if (isHighest(dataRow, i, 'total_price')) {
                ws[cellAddress].s.fill = { fgColor: { rgb: "FEE2E2" } }
                ws[cellAddress].s.font.color = { rgb: "B91C1C" }
                ws[cellAddress].s.font.bold = true
            }
        }
    }

    // 总金额行高亮
    const totalRowIndex = excelData.length - 1
    const minTotal = Math.min(...supplierTotals)
    const maxTotal = Math.max(...supplierTotals)

    for (let i = 0; i < supplierTotals.length; i++) {
        const col = 6 + i * 2 // 总价列位置
        const cellAddress = XLSX.utils.encode_cell({ r: totalRowIndex, c: col })

        if (supplierTotals[i] === minTotal) {
            ws[cellAddress].s.fill = { fgColor: { rgb: "E0F7FA" } }
            ws[cellAddress].s.font.color = { rgb: "059669" }
            ws[cellAddress].s.font.bold = true
        } else if (supplierTotals[i] === maxTotal) {
            ws[cellAddress].s.fill = { fgColor: { rgb: "FEE2E2" } }
            ws[cellAddress].s.font.color = { rgb: "B91C1C" }
            ws[cellAddress].s.font.bold = true
        }
    }

    // 设置行高
    ws['!rows'] = Array(excelData.length).fill(null).map((_, i) => {
        if (i <= 1) return { hpt: 25 } // 表头行高
        if (i === excelData.length - 1) return { hpt: 30 } // 总金额行高
        return { hpt: 20 } // 数据行高
    })
}
</script>

<style scoped>
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
}

.section-header h3 {
    margin: 0;
    color: #1e293b;
    font-size: 22px;
    font-weight: 600;
    letter-spacing: 1px;
}

.quotes-table-container {
    padding: 0;
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
}

.quote-label {
    font-size: 13px;
    color: #64748b;
    margin-right: 2px;
}

.highlight {
    background: #e0f7fa;
    color: #059669;
    font-weight: bold;
    border-radius: 6px;
    padding: 2px 8px;
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

.el-table td,
.el-table th,
.el-table__cell {
    border-right: none !important;
}

.el-table th {
    background: #e0f7fa !important;
    color: #2563eb;
    font-weight: 600;
    font-size: 15px;
    border-bottom: 1px solid #e2e8f0 !important;
}

.el-table td {
    background: #fff;
    font-size: 15px;
    border-bottom: 1px solid #e2e8f0 !important;
}

.supplier-total-amount.highlight {
    background: #e0f7fa !important;
    color: #059669 !important;
    font-weight: bold !important;
    border-radius: 6px;
    padding: 2px 8px;
    box-shadow: 0 2px 8px rgba(5, 150, 105, 0.08);
}

.supplier-total-amount.danger {
    background: #fee2e2 !important;
    color: #b91c1c !important;
    font-weight: bold !important;
    border-radius: 6px;
    padding: 2px 8px;
    box-shadow: 0 2px 8px rgba(185, 28, 28, 0.08);
}
</style>