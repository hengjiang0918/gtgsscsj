<template>
    <div class="progress-overview">
        <el-button type="primary" @click="handleReset">重置</el-button>
        <el-table :data="equipmentProgressList" border style="width: 100%" v-loading="loading" empty-text="暂无付款数据"
            :row-style="rowStyle" :span-method="tableSpanMethod" class="custom-table" @sort-change="handleSortChange">
            <el-table-column prop="project_name" label="所属项目" min-width="120" align="center" height="100%">
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
            <el-table-column prop="supplier_name" label="供应商" min-width="200" align="center">
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
                    <span v-if="row.supplier_name">{{ row.supplier_name }}</span>
                    <el-tag v-else type="danger"> 未报价 </el-tag>
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
                                <el-dropdown-item v-for="eq in progress_name_list" :key="eq.id" :command="eq">
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
            <el-table-column prop="installmentCount" label="付款状态" min-width="120" align="center">
                <template #default="{ row }">
                    <el-tag
                        :type="row.prepay_status === 1 ? 'success' : (row.prepay_status === 0 ? 'warning' : 'info')">
                        {{ row.prepay_status === null ? '未开始' : (row.prepay_status === 1 ? '已完成' : '进行中') }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column prop="payment_order" label="预计发货" min-width="120" align="center">
                <template #default="{ row }">
                    {{ formatDateTime(row.estimated_time_remark).slice(0, 10) || '--' }}
                </template>
            </el-table-column>
            <el-table-column prop="shipping_status" label="发货状态" min-width="120" align="center">
                <template #default="{ row }">
                    <el-tag
                        :type="row.shipping_status === 2 ? 'success' : (row.shipping_status === 0 ? 'warning' : 'info')">
                        {{ row.shipping_status === null ? '未开始' : (row.shipping_status === 2 ? '已发货' : '进行中') }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column prop="last_finish_at" label="是否到厂" min-width="160" align="center">
                <template #default="{ row }">
                    <el-tag :type="row.tracking_status === 2 ? 'success' : 'info'">
                        {{ row.tracking_status === 2 ? '已到厂' : '未到厂' }}
                    </el-tag>
                </template>
            </el-table-column>
        </el-table>
    </div>
</template>

<script setup>
import api from '@/api'
import { ref, onMounted } from 'vue'
const equipmentProgressList = ref([]) // 设备进度列表
const equipmentProgressOrigin = ref([]) // 设备进度列表
const loading = ref(false)
const progressList = ref([]) // 进度数据
const supplier_name_list = ref([])
const progress_name_list = ref([])
const equipment_name_list = ref([]) // 设备下拉
const description_list = ref([])
const project_name_list = ref([])

const searchForm = ref({
    project_name: '',
    description: '',
    supplier_name: '',
    equipment_name: ''
})
const handleReset = () => {
    searchForm.value = {
        project_name: '',
        description: '',
        supplier_name: '',
        equipment_name: ''
    }
    getequipmentProgressList();
};
const getequipmentProgressList = async () => {
    loading.value = true
    try {
        const data = await api.equipmentProgressList({
        })
        equipmentProgressList.value = data.equipment_progress_list.map(item => ({
            ...item,
            color: getColorByPurchaseId(item.purchase_id)
        }))
        description_list.value = data.description_list
        project_name_list.value = data.project_name_list
        supplier_name_list.value = data.supplier_name_list
        equipment_name_list.value = data.equipment_name_list
        equipmentProgressOrigin.value = JSON.parse(JSON.stringify(equipmentProgressList.value)); // 深拷贝保存原始顺序
        loading.value = false
    } catch (error) {
        console.error('Failed to fetch equipment data:', error)
    }
}
function handleHeaderSelect(field, item) {
    // 更新对应字段的筛选条件
    searchForm.value[field] = item.name === '全部' ? '' : item.name;
    loading.value = true;
    // 组合所有条件查询
    api.equipmentProgressList({ ...searchForm.value })
        .then(data => {
            loading.value = false;
            equipmentProgressList.value = data.equipment_progress_list.map(item => ({
                ...item,
                color: getColorByPurchaseId(item.purchase_id)
            }));
            equipmentProgressListOrigin.value = JSON.parse(JSON.stringify(equipmentProgressList.value));
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
    const h = (Math.abs(hash) * 45) % 360;
    return `hsl(${h}, 80%, 85%)`;
};




function formatInstallment(count) {
    return count ? `${count}期` : '';
}

function getProgressPercent(order, total) {
    if (!total) return 0;
    return Math.round((order / total) * 100);
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

function tableSpanMethod({ row, column, rowIndex }) {
    // 合并项目名称
    if (column.property === 'project_name') {
        const currentId = row.project_id;
        let prevIndex = rowIndex - 1;
        while (prevIndex >= 0 && equipmentProgressList.value[prevIndex].project_id === currentId) {
            prevIndex--;
        }
        let nextIndex = rowIndex + 1;
        let count = 1;
        while (nextIndex < equipmentProgressList.value.length && equipmentProgressList.value[nextIndex].project_id === currentId) {
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
        'prepay_status'
    ];

    if (supplierMergeFields.includes(column.property)) {
        const { purchase_id, project_id, supplier_id } = row;
        let prevIndex = rowIndex - 1;
        while (
            prevIndex >= 0 &&
            equipmentProgressList.value[prevIndex].purchase_id === purchase_id &&
            equipmentProgressList.value[prevIndex].project_id === project_id &&
            equipmentProgressList.value[prevIndex].supplier_id === supplier_id
        ) {
            prevIndex--;
        }
        let nextIndex = rowIndex + 1;
        let count = 1;
        while (
            nextIndex < equipmentProgressList.value.length &&
            equipmentProgressList.value[nextIndex].purchase_id === purchase_id &&
            equipmentProgressList.value[nextIndex].project_id === project_id &&
            equipmentProgressList.value[nextIndex].supplier_id === supplier_id
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
            equipmentProgressList.value[prevIndex].purchase_id === purchaseId
        ) {
            prevIndex--;
        }
        let nextIndex = rowIndex + 1;
        let count = 1;
        while (
            nextIndex < equipmentProgressList.value.length &&
            equipmentProgressList.value[nextIndex].purchase_id === purchaseId
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



onMounted(() => {
    getequipmentProgressList()
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

.progress-overview {
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