<template>
    <div class="equipment-overview">
        <el-button type="primary" @click="handleReset">重置</el-button>
        <el-table :data="equipmentPaymentList" border style="width: 100%" v-loading="loading" empty-text="暂无付款数据"
            height="100%" :row-style="rowStyle" :span-method="tableSpanMethod" class="custom-table"
            @sort-change="handleSortChange">
            <el-table-column prop="project_name" label="所属项目" min-width="120" align="center">
                <template #header>
                    <el-dropdown trigger="click" @command="item => handleHeaderSelect('project_name', item)">
                        <span class="el-dropdown-link" style="cursor: pointer">
                            所属项目
                            <el-icon class="el-icon--right"><arrow-down /></el-icon>
                        </span>
                        <template #dropdown>
                            <el-dropdown-menu>
                                <el-dropdown-item v-for="project in project_name_list" :key="project.id"
                                    :command="project">
                                    {{ project.name }}
                                </el-dropdown-item>
                            </el-dropdown-menu>
                        </template>
                    </el-dropdown>
                </template>
                <template #default="{ row }">
                    {{ row.project_name }}
                </template>
            </el-table-column>
            <el-table-column prop="description" label="采购描述" min-width="120" align="center">
                <template #header>
                    <el-dropdown trigger="click" @command="item => handleHeaderSelect('description', item)">
                        <span class="el-dropdown-link" style="cursor: pointer">
                            采购描述
                            <el-icon class="el-icon--right"><arrow-down /></el-icon>
                        </span>
                        <template #dropdown>
                            <el-dropdown-menu>
                                <el-dropdown-item v-for="project in description_list" :key="project.id"
                                    :command="project">
                                    {{ project.name }}
                                </el-dropdown-item>
                            </el-dropdown-menu>
                        </template>
                    </el-dropdown>
                </template>
                <template #default="{ row }">
                    {{ row.description }}
                </template>
            </el-table-column>
            <el-table-column prop="supplier_name" label="供应商" min-width="160" align="center">
                <template #header>
                    <el-dropdown trigger="click" @command="item => handleHeaderSelect('supplier_name', item)">
                        <span class="el-dropdown-link" style="cursor: pointer">
                            供应商
                            <el-icon class="el-icon--right"><arrow-down /></el-icon>
                        </span>
                        <template #dropdown>
                            <el-dropdown-menu>
                                <el-dropdown-item v-for="supplier in supplier_name_list" :key="supplier.id"
                                    :command="supplier">
                                    {{ supplier.name }}
                                </el-dropdown-item>
                            </el-dropdown-menu>
                        </template>
                    </el-dropdown>
                </template>
                <template #default="{ row }">
                    <div>
                        <span v-if="row.supplier_name">{{ row.supplier_name }}</span>
                        <el-tag v-else type="danger"> 未报价 </el-tag>
                    </div>
                </template>
            </el-table-column>
            <el-table-column prop="equipment_name" label="设备名称" min-width="180" align="center">
                <template #header>
                    <el-dropdown trigger="click" @command="item => handleHeaderSelect('equipment_name', item)">
                        <span class="el-dropdown-link" style="cursor: pointer">
                            设备名称
                            <el-icon class="el-icon--right"><arrow-down /></el-icon>
                        </span>
                        <template #dropdown>
                            <el-dropdown-menu>
                                <el-dropdown-item v-for="eq in equipment_name_list" :key="eq.id" :command="eq">
                                    {{ eq.name }}
                                </el-dropdown-item>
                            </el-dropdown-menu>
                        </template>
                    </el-dropdown>
                </template>
                <template #default="{ row }">
                    {{ row.equipment_name ? row.equipment_name : '- -' }}
                </template>
            </el-table-column>
            <el-table-column prop="prepayAmount" label="合同总金额" min-width="140" align="center">
                <template #default="{ row }">
                    <span v-if="row.prepayAmount"> ¥{{ row.prepayAmount }}</span>
                    <el-tag v-else type="danger"> 未报价 </el-tag>
                </template>
            </el-table-column>
            <el-table-column prop="prepay_amount" label="已付款金额" min-width="140" align="center">
                <template #default="{ row }">
                    <span>
                        <span v-if="row.prepay_amount"> ¥{{ row.prepay_amount }}</span>
                        <el-tag v-else type="danger"> 未报价 </el-tag>
                    </span>
                </template>
            </el-table-column>
            <el-table-column prop="installmentCount" label="分期期数" min-width="120" align="center">
                <template #default="{ row }">
                    {{ row.installmentCount ? row.installmentCount : '- -' }}
                </template>
            </el-table-column>
            <el-table-column prop="payment_order" label="当前阶段" min-width="120" align="center">
                <template #default="{ row }">
                    {{ row.payment_order ? row.payment_order : '- -' }}
                </template>
            </el-table-column>
            <el-table-column prop="prepay_status" label="付款状态" min-width="120" align="center">
                <template #default="{ row }">
                    <el-tag
                        :type="row.installmentCount == row.payment_order && row.installmentCount ? 'success' : (row.payment_order ? 'warning' : 'info')">
                        {{ row.installmentCount || row.payment_order ? (row.installmentCount == row.payment_order ?
                            '已完成' : '进行中') : '未开始' }}
                    </el-tag>
                </template>
            </el-table-column>
        </el-table>

    </div>
</template>

<script setup>
import api from '@/api'
import { ref, computed, onMounted } from 'vue'
const loading = ref(false)
const totalCount = ref(0)
const showDetailDialog = ref(false)
const selectedItem = ref(null)
const paymentData = ref([]) // 付款数据
const paymentDataOrigin = ref([]) // 原始顺序
const supplier_name_list = ref([]) // 供应商下拉
const equipment_name_list = ref([]) // 设备下拉
const description_list = ref([])
const project_name_list = ref([])
const searchForm = ref({
    project_name: '',
    description: '',
    supplier_name: '',
    equipment_name: ''
});
const handleReset = () => {
    searchForm.value = {
        project_name: '',
        description: '',
        supplier_name: '',
        equipment_name: ''
    }
    getEquipmentPaymentList();
};
const equipmentPaymentList = ref([]) // 设备付款列表
const equipmentPaymentListOrigin = ref([]) // 设备付款列表

function handleHeaderSelect(field, item) {
    // 更新对应字段的筛选条件
    searchForm.value[field] = item.name === '全部' ? '' : item.name;
    loading.value = true;
    // 组合所有条件查询
    api.equipmentPaymentList({ ...searchForm.value })
        .then(data => {
            loading.value = false;
            equipmentPaymentList.value = data.equipment_payment_list.map(item => ({
                ...item,
                color: getColorByPurchaseId(item.purchase_id)
            }));
            equipmentPaymentListOrigin.value = JSON.parse(JSON.stringify(equipmentPaymentList.value));
        })
        .catch(() => {
            loading.value = false;
        });
}

const handleSortChange = ({ prop, order }) => {
    if (!order) {
        paymentData.value = [...paymentDataOrigin.value];
        return;
    }
    const sorted = [...paymentData.value].sort((a, b) => {
        if (prop === 'total_amount' || prop === 'prepay_amount') {
            return order === 'ascending'
                ? Number(a[prop]) - Number(b[prop])
                : Number(b[prop]) - Number(a[prop]);
        } else if (prop === 'prepay_date') {
            const timeA = new Date(a[prop]).getTime();
            const timeB = new Date(b[prop]).getTime();
            return order === 'ascending' ? timeA - timeB : timeB - timeA;
        }
        return 0;
    });
    paymentData.value = sorted;
};

const rowStyle = ({ row }) => {
    return row.color ? { background: row.color } : {};
};

const getColorByPurchaseId = (id) => {
    if (!id) return '#f0f9ff';
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
        hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    // 色相间隔大一些
    const h = (Math.abs(hash) * 48) % 360;
    return `hsl(${h}, 80%, 85%)`;
};

function tableSpanMethod({ row, column, rowIndex }) {
    // 合并项目名称
    if (column.property === 'project_name') {
        const currentId = row.project_id;
        let prevIndex = rowIndex - 1;
        while (prevIndex >= 0 && equipmentPaymentList.value[prevIndex].project_id === currentId) {
            prevIndex--;
        }
        let nextIndex = rowIndex + 1;
        let count = 1;
        while (nextIndex < equipmentPaymentList.value.length && equipmentPaymentList.value[nextIndex].project_id === currentId) {
            count++;
            nextIndex++;
        }
        if (prevIndex === rowIndex - 1) {
            return [count, 1];
        } else {
            return [0, 0];
        }
    }

    // 需要合并的字段
    const supplierMergeFields = [
        'supplier_name',
        'prepayAmount',
        'prepay_amount',
        'installmentCount',
        'payment_order',
        'prepay_status'
    ];

    if (supplierMergeFields.includes(column.property)) {
        const { purchase_id, project_id, supplier_id } = row;
        let prevIndex = rowIndex - 1;
        while (
            prevIndex >= 0 &&
            equipmentPaymentList.value[prevIndex].purchase_id === purchase_id &&
            equipmentPaymentList.value[prevIndex].project_id === project_id &&
            equipmentPaymentList.value[prevIndex].supplier_id === supplier_id
        ) {
            prevIndex--;
        }
        let nextIndex = rowIndex + 1;
        let count = 1;
        while (
            nextIndex < equipmentPaymentList.value.length &&
            equipmentPaymentList.value[nextIndex].purchase_id === purchase_id &&
            equipmentPaymentList.value[nextIndex].project_id === project_id &&
            equipmentPaymentList.value[nextIndex].supplier_id === supplier_id
        ) {
            count++;
            nextIndex++;
        }
        if (prevIndex === rowIndex - 1) {
            return [count, 1];
        } else {
            return [0, 0];
        }
    }

    // 合并采购描述
    if (column.property === 'description') {
        const purchaseId = row.purchase_id;
        let prevIndex = rowIndex - 1;
        while (
            prevIndex >= 0 &&
            equipmentPaymentList.value[prevIndex].purchase_id === purchaseId
        ) {
            prevIndex--;
        }
        let nextIndex = rowIndex + 1;
        let count = 1;
        while (
            nextIndex < equipmentPaymentList.value.length &&
            equipmentPaymentList.value[nextIndex].purchase_id === purchaseId
        ) {
            count++;
            nextIndex++;
        }
        if (prevIndex === rowIndex - 1) {
            return [count, 1];
        } else {
            return [0, 0];
        }
    }

    return [1, 1];
}

const getEquipmentPaymentList = async () => {
    loading.value = true
    try {
        const data = await api.equipmentPaymentList({

        })
        equipmentPaymentList.value = data.equipment_payment_list.map(item => ({
            ...item,
            color: getColorByPurchaseId(item.purchase_id)
        }))
        description_list.value = data.description_list
        project_name_list.value = data.project_name_list
        supplier_name_list.value = data.supplier_name_list
        equipment_name_list.value = data.equipment_name_list
        equipmentPaymentListOrigin.value = JSON.parse(JSON.stringify(equipmentPaymentList.value)); // 深拷贝保存原始顺序
        loading.value = false
    } catch (error) {
        console.error('Failed to fetch equipment data:', error)
    }
}

onMounted(async () => {
    // 初始化数据
    await getEquipmentPaymentList()
})
</script>
<style scoped lang="scss">
.search-bar {
    background: #fff;
    border-radius: 10px;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.08);
    padding: 24px 32px 8px 32px;
    margin-bottom: 24px;

    .search-form {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 16px 32px;

        .el-form-item {
            margin-bottom: 12px;
        }
    }
}

.equipment-overview {
    height: 100%;
    padding: 20px;

    .stats-cards {
        margin-bottom: 20px;

        .stat-card {
            background: white;
            border-radius: 8px;
            padding: 20px;
            display: flex;
            align-items: center;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

            .stat-icon {
                width: 60px;
                height: 60px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-right: 15px;
                color: white;
            }

            .stat-content {
                flex: 1;

                .stat-value {
                    font-size: 24px;
                    font-weight: 600;
                    color: #333;
                    margin-bottom: 5px;
                }

                .stat-label {
                    font-size: 14px;
                    color: #666;
                }
            }

        }
    }


}

:deep(.el-table) {
    border-radius: 12px;
    overflow: hidden;
    --el-table-row-hover-bg-color: transparent;
    font-weight: 600;

    .el-dropdown {
        padding: 0 auto;
        width: 100% !important;
        height: 100% !important;
        font-size: 15px;
        color: #fff;
        vertical-align: middle;
        display: flex;
        align-items: center;
        justify-content: center;

        .el-dropdown-link {

            height: 100% !important;
            display: flex;
            align-items: center;
            justify-content: center;
        }
    }

    .el-table__header-wrapper {
        .el-table__cell {
            height: 50px !important;
            padding: 0 !important;

            .cell {
                display: flex !important;
                align-items: center;
                justify-content: center;
                padding: 0 !important;
                height: 100% !important;
            }

        }

        th {
            background-color: #667eea !important;
            color: #fff !important;
            font-weight: bold !important;
            text-align: center !important;
            padding: 12px 8px !important;
            border-right: 1px solid rgba(255, 255, 255, 0.15) !important;
            box-shadow: 0 2px 8px rgba(102, 126, 234, 0.08);

            font-size: 15px;
            letter-spacing: 1px;
            border-color: #010b16 !important; // 你想要的边框颜色
        }

    }



    .el-table__body .el-table__row {
        transition: background 0.2s;
        font-size: 14px;
        text-align: center;

        td {
            border-color: #010b16 !important; // 你想要的边框颜色
        }

        // 行高亮（可按 purchase_id 动态插入 style）
        &.row-purchase {
            background-color: #f0f9ff !important;
        }
    }
}
</style>