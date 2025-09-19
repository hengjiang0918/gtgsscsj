<template>
    <div class="equipment-overview">
        <el-button type="primary" @click="handleReset">重置</el-button>
        <el-table :data="equipment_list" border style="width: 100%" v-loading="loading" empty-text="暂无设备数据"
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
            <el-table-column prop="supplier_name" label="供应商" min-width="200" align="center">
                <template #header>
                    <el-dropdown trigger="click" @command="item => handleHeaderSelect('supplier_name', item)">
                        <span class="el-dropdown-link" style="cursor: pointer">
                            供应商
                            <el-icon class="el-icon--right"><arrow-down /></el-icon>
                        </span>
                        <template #dropdown>
                            <el-dropdown-menu>
                                <el-dropdown-item v-for="project in supplier_name_list" :key="project.id"
                                    :command="project">
                                    {{ project.name }}
                                </el-dropdown-item>
                            </el-dropdown-menu>
                        </template>
                    </el-dropdown>
                </template>
                <template #default="{ row }">
                    <div>
                        <div v-if="row.supplier_name">
                            {{ row.supplier_name }}
                            <div style="color: #409eff; margin-left: 8px;font-size: 16px; font-weight: 600;">
                                {{ getSupplierTotal(row.purchase_id, row.supplier_id) }}
                            </div>
                        </div>
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
                                <el-dropdown-item v-for="project in equipment_name_list" :key="project.id"
                                    :command="project">
                                    {{ project.name }}
                                </el-dropdown-item>
                            </el-dropdown-menu>
                        </template>
                    </el-dropdown>
                </template>
                <template #default="{ row }">
                    {{ row.equipment_name ? row.equipment_name : '- -' }}
                </template>
            </el-table-column>
            <el-table-column prop="quantity" label="数量" min-width="80" align="center">

                <template #default="{ row }">
                    <div>
                        {{ row.quantity ? row.quantity : '- -' }}
                    </div>
                </template>
            </el-table-column>
            <el-table-column prop="actual_price" label="单价(￥)" min-width="180" align="center" sortable="custom">
                <template #default="{ row }">
                    <div>
                        {{ row.actual_price ? row.actual_price : '- -' }}
                    </div>
                </template>
            </el-table-column>
            <el-table-column prop="total_price" label="总价(￥)" min-width="120" align="center" sortable="custom">
                <template #default="{ row }">
                    <div>
                        {{ row.total_price ? row.total_price : '- -' }}
                    </div>
                </template>
            </el-table-column>
            <el-table-column prop="updated_at" label="购置日期" min-width="120" align="center" sortable="custom">
                <template #default="{ row }">
                    <div>
                        {{ row.updated_at ? row.updated_at : '- -' }}
                    </div>
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
const equipment_list = ref([])
const equipment_list_origin = ref([]); // 保存原始顺序
const description_list = ref([])
const project_name_list = ref([])
const supplier_name_list = ref([])
const equipment_name_list = ref([])
function handleHeaderSelect(field, item) {
    // 更新对应字段的筛选条件
    searchForm.value[field] = item.name === '全部' ? '' : item.name;
    loading.value = true;
    // 组合所有条件查询
    api.equipmentList({ ...searchForm.value })
        .then(data => {
            loading.value = false;
            equipment_list.value = data.equipment_list.map(item => ({
                ...item,
                color: getColorByPurchaseId(item.purchase_id)
            }));
            equipment_list_origin.value = JSON.parse(JSON.stringify(equipment_list.value));
        })
        .catch(() => {
            loading.value = false;
        });
}
function getSupplierTotal(purchase_id, supplier_id) {
    return (equipment_list.value || [])
        .filter(item => item.purchase_id === purchase_id && item.supplier_id === supplier_id)
        .reduce((sum, item) => sum + (Number(item.quantity) * Number(item.actual_price)), 0);
}
const handleSortChange = ({ prop, order }) => {
    if (!order) {
        // 恢复为原始顺序
        equipment_list.value = [...equipment_list_origin.value];
        return;
    }
    const sorted = [...equipment_list.value].sort((a, b) => {
        if (prop === 'updated_at') {
            const timeA = new Date(a[prop]).getTime();
            const timeB = new Date(b[prop]).getTime();
            return order === 'ascending' ? timeA - timeB : timeB - timeA;
        } else if (prop === 'actual_price') {
            const numA = Number(a[prop]);
            const numB = Number(b[prop]);
            return order === 'ascending' ? numA - numB : numB - numA;
        } else if (prop === 'total_price') {
            const numA = Number(a[prop]);
            const numB = Number(b[prop]);
            return order === 'ascending' ? numA - numB : numB - numA;
        } else {
            const valA = a[prop];
            const valB = b[prop];
            if (order === 'ascending') {
                return valA > valB ? 1 : valA < valB ? -1 : 0;
            } else {
                return valA < valB ? 1 : valA > valB ? -1 : 0;
            }
        }
    });
    equipment_list.value = sorted;
};

function tableSpanMethod({ row, column, rowIndex }) {
    // 合并项目名称
    if (column.property === 'project_name') {
        // 只合并相邻的 project_id 相同的行
        const currentId = row.project_id;
        // 向上查找第一个不同的 project_id
        let prevIndex = rowIndex - 1;
        while (prevIndex >= 0 && equipment_list.value[prevIndex].project_id === currentId) {
            prevIndex--;
        }
        // 计算本组有多少行
        let nextIndex = rowIndex + 1;
        let count = 1;
        while (nextIndex < equipment_list.value.length && equipment_list.value[nextIndex].project_id === currentId) {
            count++;
            nextIndex++;
        }
        // 只在组的第一个位置合并
        if (prevIndex === rowIndex - 1) {
            return [count, 1];
        } else {
            return [0, 0];
        }
    }

    // 合并供应商
    if (column.property === 'supplier_name') {
        const { purchase_id, project_id, supplier_id } = row;
        let prevIndex = rowIndex - 1;
        while (
            prevIndex >= 0 &&
            equipment_list.value[prevIndex].purchase_id === purchase_id &&
            equipment_list.value[prevIndex].project_id === project_id &&
            equipment_list.value[prevIndex].supplier_id === supplier_id
        ) {
            prevIndex--;
        }
        let nextIndex = rowIndex + 1;
        let count = 1;
        while (
            nextIndex < equipment_list.value.length &&
            equipment_list.value[nextIndex].purchase_id === purchase_id &&
            equipment_list.value[nextIndex].project_id === project_id &&
            equipment_list.value[nextIndex].supplier_id === supplier_id
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
            equipment_list.value[prevIndex].purchase_id === purchaseId
        ) {
            prevIndex--;
        }
        let nextIndex = rowIndex + 1;
        let count = 1;
        while (
            nextIndex < equipment_list.value.length &&
            equipment_list.value[nextIndex].purchase_id === purchaseId
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

const searchForm = ref({
    project_name: '',
    description: '',
    supplier_name: '',
    equipment_name: ''
});


const handleReset = () => {
    searchForm.value = {
        project_name: '',
        supplier_name: '',
        equipment_name: ''
    };
    getEquipmentData();
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
    const h = (Math.abs(hash) * 47) % 360;
    return `hsl(${h}, 80%, 85%)`;
};

const getEquipmentData = async () => {
    loading.value = true
    try {
        const data = await api.equipmentList({

        })
        equipment_list.value = data.equipment_list.map(item => ({
            ...item,
            color: getColorByPurchaseId(item.purchase_id)
        }))
        description_list.value = data.description_list
        project_name_list.value = data.project_name_list
        supplier_name_list.value = data.supplier_name_list
        equipment_name_list.value = data.equipment_name_list
        equipment_list_origin.value = JSON.parse(JSON.stringify(equipment_list.value)); // 深拷贝保存原始顺序
        totalCount.value = data.total
        loading.value = false
    } catch (error) {
        console.error('Failed to fetch equipment data:', error)
    }
}
onMounted(() => {
    getEquipmentData()
});
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