<template>
    <div class="existing-project-import">
        <!-- 步骤条 -->
        <el-tabs v-model="currentStep" class="stage-tabs-steps" @tab-click="handleTabClick">
            <el-tab-pane label="立项阶段" :name="1"></el-tab-pane>
            <el-tab-pane label="询比价阶段" :name="2"></el-tab-pane>
            <el-tab-pane label="合同阶段" :name="3"></el-tab-pane>
            <el-tab-pane label="预付款阶段" :name="4"></el-tab-pane>
        </el-tabs>

        <!-- 立项阶段 -->
        <el-card v-if="currentStep === 1" class="stage-card" shadow="hover">
            <div class="stage-header">立项阶段</div>
            <el-form :model="purchaseForm">
                <el-form :model="purchaseForm">
                    <div class="form-flex">
                        <el-form-item label="所属工厂" prop="factory" class="form-item">
                            <el-select v-model="purchaseForm.factory" placeholder="请选择工厂" class="custom-select">
                                <el-option label="CBK" value="CBK"></el-option>
                                <el-option label="RG" value="RG"></el-option>
                                <el-option label="KH" value="KH"></el-option>
                                <el-option label="GS" value="GS"></el-option>
                                <el-option label="GW" value="GW"></el-option>
                                <el-option label="WINAS" value="WINAS"></el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item label="申购部门" prop="filiale" class="form-item">
                            <el-select v-model="purchaseForm.filiale" class="form-input" placeholder="请选择分公司">
                                <el-option label="服一分公司" value="服一分公司"></el-option>
                                <el-option label="服三分公司" value="服三分公司"></el-option>
                                <el-option label="服五分公司" value="服五分公司"></el-option>
                                <el-option label="服六分公司" value="服六分公司"></el-option>
                                <el-option label="服七分公司" value="服七分公司"></el-option>
                                <el-option label="服八分公司" value="服八分公司"></el-option>
                                <el-option label="服九分公司" value="服九分公司"></el-option>
                                <el-option label="服十二分公司" value="服十二分公司"></el-option>
                                <el-option label="服十五分公司" value="服十五分公司"></el-option>
                                <el-option label="服十六分公司" value="服十六分公司"></el-option>
                                <el-option label="服十七分公司" value="服十七分公司"></el-option>
                                <el-option label="服十九分公司" value="服十九分公司"></el-option>
                            </el-select> </el-form-item>
                        <el-form-item label="采购类型" prop="mold" class="form-item">
                            <el-select v-model="purchaseForm.mold" placeholder="请选择采购类型">
                                <el-option label="设备" value="0"></el-option>
                                <el-option label="机物料" value="1"></el-option>
                            </el-select>
                        </el-form-item>

                    </div>
                    <div class="form-flex">
                        <el-form-item label="采购描述" prop="description" class="form-item">
                            <el-input v-model="purchaseForm.description" placeholder="大致描述采购内容" class="custom-input" />
                        </el-form-item>
                        <el-form-item label="立项日期" prop="updated_at" class="form-item">
                            <el-date-picker v-model="purchaseForm.updated_at" type="date" style="width: 100%;"
                                placeholder="选择日期" value-format="YYYY-MM-DD" />
                        </el-form-item>

                        <el-form-item label="申请人员" prop="applicant" class="form-item">
                            <el-input v-model="purchaseForm.applicant" disabled class="custom-input disabled-input" />
                        </el-form-item>
                    </div>
                    <div class="form-flex">
                        <el-form-item label="项目选择" prop="project_name" class="form-item">
                            <el-select v-model="purchaseForm.project_name" placeholder="请选择项目" class="table-select"
                                @change="handleProjectChange">
                                <el-option v-for="project in projectList" :key="project.id"
                                    :label="project.project_name" :value="project.project_id"></el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item label="备注信息" prop="remark" class="form-item">
                            <el-input v-model="purchaseForm.remark" type="textarea" :rows="1" placeholder="请填写备注信息"
                                class="custom-textarea" />
                        </el-form-item>
                        <el-form-item label="申请理由" prop="reason" class="form-item">
                            <el-input v-model="purchaseForm.reason" type="textarea" :rows="1"
                                placeholder="请详细说明采购理由和设备用途" class="custom-textarea" />
                        </el-form-item>
                    </div>
                    <div class="equipment-list">
                        <div class="list-header">

                            <el-button type="primary" @click="addEquipment">
                                <template #icon>
                                    <Plus />
                                </template>
                                添加设备
                            </el-button>
                        </div>
                        <!-- 可编辑表格 -->
                        <el-table :data="purchaseForm.equipmentList" class="equipment-table" :header-cell-style="{
                            backgroundColor: '#f8fafc',
                            color: '#374151',
                            fontWeight: '600',
                            borderBottom: '2px solid #e5e7eb'
                        }" :cell-style="{ padding: '12px 8px' }">

                            <el-table-column label="设备名称" min-width="120" align="center">
                                <template #default="scope">
                                    <el-form-item :prop="`equipmentList.${scope.$index}.equipment_name`"
                                        style="margin-bottom:0">
                                        <el-cascader v-model="scope.row.equipment_id" :options="equipment_list"
                                            filterable clearable :show-all-levels="false"
                                            :props="{ label: 'label', value: 'value', children: 'children', emitPath: false }"
                                            @change="handleChange($event, scope.$index, scope.row)"
                                            :key="scope.row._cascaderKey || scope.row.equipment_id" />
                                    </el-form-item>
                                </template>
                            </el-table-column>
                            <el-table-column label="品牌" min-width="100" align="center">
                                <template #default="scope">
                                    <el-form-item :prop="`equipmentList.${scope.$index}.brand`" style="margin-bottom:0">
                                        <el-input v-model="scope.row.brand" placeholder="请输入品牌" class="table-input" />
                                    </el-form-item>
                                </template>
                            </el-table-column>

                            <el-table-column label="型号" min-width="120" align="center">
                                <template #default="scope">
                                    <el-form-item :prop="`equipmentList.${scope.$index}.model`" style="margin-bottom:0">
                                        <el-input v-model="scope.row.model" placeholder="请输入型号" class="table-input" />
                                    </el-form-item>
                                </template>
                            </el-table-column>

                            <el-table-column label="规格要求" min-width="150" align="center">
                                <template #default="scope">
                                    <el-form-item :prop="`equipmentList.${scope.$index}.spec`" style="margin-bottom:0">
                                        <el-input v-model="scope.row.spec" placeholder="请输入规格要求" class="table-input" />
                                    </el-form-item>
                                </template>
                            </el-table-column>

                            <el-table-column label="单位" min-width="80" align="center">
                                <template #default="scope">
                                    <el-form-item :prop="`equipmentList.${scope.$index}.unit`" style="margin-bottom:0">
                                        <el-select v-model="scope.row.unit" placeholder="单位" class="table-select">
                                            <el-option label="台" value="台"></el-option>
                                            <el-option label="套" value="套"></el-option>
                                            <el-option label="个" value="个"></el-option>
                                            <el-option label="件" value="件"></el-option>
                                        </el-select>
                                    </el-form-item>
                                </template>
                            </el-table-column>

                            <el-table-column label="数量" min-width="80" align="center">
                                <template #default="scope">
                                    <el-form-item :prop="`equipmentList.${scope.$index}.quantity`"
                                        style="margin-bottom:0">
                                        <el-input-number v-model="scope.row.quantity" :min="1" :max="1000"
                                            :controls="false" class="table-number" />
                                    </el-form-item>
                                </template>
                            </el-table-column>

                            <el-table-column label="预计单价" min-width="100" align="center">
                                <template #default="scope">
                                    <el-form-item :prop="`equipmentList.${scope.$index}.price`" style="margin-bottom:0">
                                        <el-input-number v-model="scope.row.price" :min="0" :max="100000000"
                                            :controls="false" class="table-number" />
                                    </el-form-item>
                                </template>
                            </el-table-column>

                            <el-table-column label="小计" width="120" align="center">
                                <template #default="scope">
                                    <div class="subtotal-cell">
                                        <span class="amount">¥{{ calculateSubtotal(scope.row) }}</span>
                                    </div>
                                </template>
                            </el-table-column>

                            <el-table-column label="操作" width="80" align="center"
                                v-if="purchaseForm.equipmentList.length > 1">
                                <template #default="scope">
                                    <el-button type="danger" size="small" circle
                                        @click="removeEquipment(scope.$index, scope.row.equipment_id)"
                                        class="delete-btn">
                                        <el-icon>
                                            <Delete />
                                        </el-icon>
                                    </el-button>
                                </template>
                            </el-table-column>
                        </el-table>

                    </div>
                </el-form>
            </el-form>
        </el-card>

        <!-- 询比价阶段 -->
        <el-card v-if="currentStep === 2" class="stage-card inquiry-card" shadow="hover">
            <div class="stage-header" style="display: flex; align-items: center; justify-content: space-between;">
                <span>询比价阶段</span>
                <el-button type="primary" @click="addSupplier" v-show="purchaseForm.equipmentList.length > 0">
                    <template #icon>
                        <Plus />
                    </template>
                    添加供货商
                </el-button>
            </div>
            <el-table :data="purchaseForm.equipmentList" style="width: 100%;" border>
                <!-- 固定设备信息表头 -->
                <el-table-column prop="equipment_name" label="设备" align="center" min-width="160" />
                <el-table-column prop="quantity" label="数量" align="center" width="80" />

                <!-- 动态供应商报价表头 -->
                <el-table-column v-for="supplier in supplierHeaders" :key="supplier.supplier_id"
                    :label="supplier.supplier_name" align="center" min-width="200">
                    <template #header>
                        <div style="display: flex; flex-direction: column; align-items: center;">
                            <span style="font-weight:600; font-size:15px;">{{ supplier.supplier_name }}</span>
                            <el-button icon="Delete" size="small" type="text"
                                @click.stop="removeSupplier(supplier.supplier_id)"
                                style="color: #f56c6c; margin-top: 4px;" />
                        </div>
                    </template>
                    <template #default="{ row }">
                        <div class="quote-cell">
                            <template v-if="row.supplierQuotes && row.supplierQuotes[supplier.supplier_id]">
                                <div class="quote-item">
                                    <span class="quote-label">单价：</span>
                                    <el-input-number v-model="row.supplierQuotes[supplier.supplier_id].unit_price"
                                        :min="0" :controls="false" placeholder="请输入单价" style="max-width: 120px;" />
                                </div>
                                <div class="quote-item">
                                    <span class="quote-label">总价：</span>
                                    <span style="width: 100px;">
                                        ¥{{ ((row.supplierQuotes[supplier.supplier_id].unit_price || 0) * (row.quantity
                                            || 0)).toFixed(2) }}
                                    </span>
                                </div>
                            </template>
                            <template v-else>
                                <span style="color:#bbb;">暂无报价</span>
                            </template>
                        </div>
                    </template>
                </el-table-column>
            </el-table>

        </el-card>

        <!-- 合同阶段 -->
        <el-card v-if="currentStep === 3" class="stage-card" shadow="hover">
            <div class="stage-header">合同阶段</div>
            <el-form :model="contractForm" label-width="100px">
                <!-- 可在此处添加合同编号、签订日期等表单项 -->
                <el-form-item label="合同编号" prop="contractNo">
                    <el-input v-model="contractForm.contractNo" placeholder="请输入合同编号" />
                </el-form-item>
                <el-form-item label="签订日期" prop="signDate">
                    <el-date-picker v-model="contractForm.signDate" type="date" placeholder="选择签订日期"
                        style="width: 100%;" />
                </el-form-item>
            </el-form>
            <el-table :data="purchaseForm.equipmentList" border style="width: 100%; margin-top: 16px;" show-summary
                :summary-method="getContractSummary">
                <el-table-column label="设备名称" prop="equipment_name" align="center" min-width="120" />
                <el-table-column label="品牌" prop="brand" align="center" min-width="100" />
                <el-table-column label="型号" prop="model" align="center" min-width="100" />
                <el-table-column label="规格要求" prop="spec" align="center" min-width="120" />
                <el-table-column label="单位" prop="unit" align="center" width="80" />
                <el-table-column label="数量" prop="quantity" align="center" width="80" />
                <el-table-column label="合同单价(元)" align="center" min-width="120">
                    <template #default="scope">
                        <el-input-number v-model="scope.row.contract_price" :min="0" :controls="false"
                            placeholder="请输入合同单价" style="width: 100px;" />
                    </template>
                </el-table-column>
                <el-table-column label="合同总价(元)" align="center" min-width="120">
                    <template #default="scope">
                        <span>
                            ¥{{ ((scope.row.contract_price || 0) * (scope.row.quantity || 0)).toFixed(2) }}
                        </span>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>

        <!-- 预付款阶段 -->
        <el-card v-if="currentStep === 4" class="stage-card" shadow="hover">
            <div class="stage-header">预付款阶段</div>
            <el-table :data="prepayList" border style="width: 100%">
                <!-- ...你的预付款表格内容... -->
            </el-table>
            <el-button type="primary" @click="submitAll">提交</el-button>
        </el-card>

        <!-- 添加供应商弹窗 -->
        <el-dialog v-model="addSupplierDialogVisible" title="添加供货商" width="600px" align-center>
            <el-select v-model="selectedSupplierId" placeholder="请选择供应商" style="width:100%;" filterable
                @change="handleSupplierChange">
                <el-option v-for="item in supplier_list" :key="item.supplier_id" :label="item.supplier_name"
                    :value="item.supplier_id">
                    <span class="option-content">
                        <el-icon>
                            <OfficeBuilding />
                        </el-icon>
                        {{ item.supplier_name }}
                    </span>
                </el-option>
            </el-select>
            <template #footer>
                <el-button @click="addSupplierDialogVisible = false;">取消</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import api from '@/api'
import { ref, reactive, watch } from 'vue'
import { useUserStore } from '@/stores/userStore'
const userStore = useUserStore()
const currentStep = ref(1)
const submitAll = async () => {
    // 这里可以调用你的API保存所有数据
    // await api.saveAll({ ...purchaseForm, tableDataWithSummary, contractForm, prepayList });
    ElMessage.success('所有数据已提交！')
}

const equipment_list = ref([])
const projectList = ref([])
onMounted(async () => {
    getProjectList()
    getSupplierList()
})
const handleTabClick = (tab) => {
    currentStep.value = Number(tab.paneName)
}
// ================================================  立项阶段 ================================================
const purchaseForm = reactive({
    project_name: '',
    project_id: '',
    factory: '',
    filiale: '',
    mold: '0',
    updated_at: '',
    description: '',
    remark: '',
    reason: '',
    applicant: userStore.user_name,
    applicant_id: userStore.user_id,
    equipmentList: []
})
const addEquipment = () => {
    purchaseForm.equipmentList.push({
        equipment_name: '',
        equipment_id: '',
        brand: '',
        model: '',
        spec: '',
        unit: '台',
        quantity: 1,
        price: 0
    })
}
const removeEquipment = (index, equipment_id) => {
    purchaseForm.equipmentList.splice(index, 1)
    ElMessage.success('设备已删除')
}
const handleChange = (equipmentValue, index, row) => {
    if (purchaseForm.equipmentList.some((e, i) => e.equipment_id === equipmentValue && i !== index)) {
        ElMessage.warning('该设备已存在，不能重复添加！');
        // 强制重置 el-cascader 的值
        row.equipment_id = '';
        row.equipment_name = '';
        // 关键：强制刷新 el-cascader
        // 方案1：如果用 key 绑定 el-cascader，变更 key 可强制刷新
        row._cascaderKey = Date.now(); // 新增一字段
        return;
    }
    const selectedEquipment = findEquipmentById(equipment_list.value, equipmentValue);
    if (selectedEquipment) {
        row.equipment_id = selectedEquipment.value;
        row.equipment_name = selectedEquipment.label;
    } else {
        row.equipment_id = '';
        row.equipment_name = '';
    }
};
const handleProjectChange = (projectId) => {
    const selectedProject = projectList.value.find(project => project.project_id === projectId)
    if (selectedProject) {
        purchaseForm.project_id = selectedProject.project_id
        purchaseForm.project_name = selectedProject.project_name
    } else {
        purchaseForm.project_id = ''
        purchaseForm.project_name = ''
    }
}
const findEquipmentById = (equipmentTree, targetId) => {
    for (const item of equipmentTree) {
        if (item.value === targetId) return item
        if (item.children && item.children.length > 0) {
            const found = findEquipmentById(item.children, targetId)
            if (found) return found
        }
    }
    return null
}
const getProjectList = async () => {
    api.projectList({}).then(data => {
        projectList.value = data.project_list
        api.equipmentCategory({
            action: 'tree',
        }).then((data) => {
            equipment_list.value = data.equipment_list
        }).catch(() => {
            ElMessage.error('大类创建失败')
        })
    })
}

// ================================================  询比价阶段 ================================================
// 初始化时
watch(
    () => purchaseForm.equipmentList,
    (newList) => {
        // 新增设备时自动补全所有已添加供应商的报价
        newList.forEach(row => {
            if (!row.supplierQuotes) row.supplierQuotes = {};
            supplierHeaders.value.forEach(supplier => {
                if (!row.supplierQuotes[supplier.supplier_id]) {
                    row.supplierQuotes[supplier.supplier_id] = {
                        unit_price: 0
                        // 可扩展其它报价字段
                    };
                }
            });
        });
    },
    { deep: true }
);
const supplierHeaders = ref([])
const supplier_list = ref([])
const addSupplierDialogVisible = ref(false)
const selectedSupplierId = ref('')
watch(addSupplierDialogVisible, (val) => {
    if (!val) selectedSupplierId.value = ''
})
// 添加供应商
const addSupplier = () => {
    addSupplierDialogVisible.value = true;
};
const confirmAddSupplier = (supplierId, supplierName) => {
    if (!supplierId || !supplierName) return;
    const exists = supplierHeaders.value.some(s => s.supplier_id === supplierId);
    if (exists) {
        ElMessage.warning('该供应商已存在，无需重复添加');
        return;
    }
    // 给所有设备补充该供应商报价
    purchaseForm.equipmentList.forEach(row => {
        if (!row.supplierQuotes) row.supplierQuotes = {};
        row.supplierQuotes[supplierId] = {
            unit_price: 0
            // 可扩展其它报价字段
        };
    });
    supplierHeaders.value.push({
        supplier_id: supplierId,
        supplier_name: supplierName
    });
    addSupplierDialogVisible.value = false;
    selectedSupplierId.value = '';
    ElMessage.success("所有设备已添加该供货商");
};

// 删除供应商
const removeSupplier = (supplierId) => {
    supplierHeaders.value = supplierHeaders.value.filter(s => s.supplier_id !== supplierId);
    purchaseForm.equipmentList.forEach(row => {
        if (row.supplierQuotes) delete row.supplierQuotes[supplierId];
    });
    ElMessage.success('已删除该供应商及其报价');
};

const handleSupplierChange = (supplierId) => {
    const selectedSupplier = supplier_list.value.find(item => item.supplier_id === supplierId);
    if (!selectedSupplier) return;
    confirmAddSupplier(selectedSupplier.supplier_id, selectedSupplier.supplier_name);
};

const getSupplierList = async () => {
    try {
        const data = await api.supplierList({});
        supplier_list.value = data.supplier_list;
    } catch (err) {
        console.error('获取供应商列表失败', err);
    }
};
// ================================================  合同阶段 ================================================
const contractForm = ref({
    contractNo: '',
    amount: '',
    signDate: '',
    equipment_supply: [
        { equipment_name: '设备A', brand: '品牌A', model: '型号A', quantity: 2, actual_price: 5000, spec: '规格A' },
        { equipment_name: '设备B', brand: '品牌B', model: '型号B', quantity: 1, actual_price: 12000, spec: '规格B' }
    ]
})
const calculateSubtotal = (item) => {
    return ((item.quantity || 0) * (item.price || 0)).toFixed(2)
}
// 合计行方法
const getContractSummary = ({ columns, data }) => {
    const sums = [];
    columns.forEach((column, index) => {
        if (index === 0) {
            sums[index] = '合计';
            return;
        }
        if (column.property === 'quantity') {
            sums[index] = data.reduce((total, row) => total + (Number(row.quantity) || 0), 0);
        } else if (column.label === '合同总价(元)') {
            const total = data.reduce(
                (sum, row) => sum + ((Number(row.contract_price) || 0) * (Number(row.quantity) || 0)),
                0
            );
            sums[index] = `¥${total.toFixed(2)}`;
        } else {
            sums[index] = '';
        }
    });
    return sums;
};
// ================================================  预付款阶段 ================================================
const prepayList = ref([
    { period: '第1期', percent: '40%', amount: 8000, paid_at: '2025-08-01', status: '已支付' },
    { period: '第2期', percent: '60%', amount: 12000, paid_at: '', status: '待支付' }
])
</script>

<style scoped lang="scss">
/* ...你的原有样式保持不变... */
</style>
<style scoped lang="scss">
.existing-project-import {
    display: flex;
    flex-direction: column;
    gap: 32px;

    .stage-card {
        margin-bottom: 0;
        border-radius: 14px;
        box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);

        .stage-header {
            font-size: 20px;
            font-weight: 700;
            margin-bottom: 18px;
            color: #374151;
            letter-spacing: 1px;
        }

        .form-flex {
            display: flex;
            gap: 24px;
            flex-wrap: wrap;
            margin-bottom: 18px;

            .form-item {
                flex: 1 1 220px;
                min-width: 30%;
            }


        }

        .equipment-list {
            margin-top: 10px;

            .list-header {
                display: flex;
                justify-content: flex-end;
                margin-bottom: 10px;

                .el-button {
                    border-radius: 8px;
                    font-weight: 500;
                }
            }
        }

        .equipment-table {
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
            margin-bottom: 24px;

            th {
                background: linear-gradient(90deg, #e3f0fc 0%, #f6f8fa 100%);
                color: #2563eb;
                font-weight: 700;
                font-size: 15px;
                border-bottom: 2px solid #e5e7eb;
                text-align: center;
                padding: 14px 8px;
            }

            td {
                background: #fff;
                font-size: 14px;
                text-align: center;
                border-bottom: 1px solid #f0f2f5;
                padding: 12px 8px;
                transition: background 0.2s;
            }

            tr:hover td {
                background: #f5faff;
            }

            .el-form-item {
                margin-bottom: 0;

                .el-input,
                .el-input-number,
                .el-select {
                    border-radius: 6px;
                    font-size: 14px;
                    background: #f9fafb;
                }
            }

            .subtotal-cell {
                font-weight: 600;
                color: #e6a23c;
                background: #fffbe6;
                border-radius: 6px;
                padding: 4px 0;
            }

            .delete-btn {
                background: #fef2f2;
                color: #ef4444;
                border-radius: 50%;
                transition: background 0.2s;

                &:hover {
                    background: #fee2e2;
                }
            }
        }

        .delete-btn {
            background: #fef2f2;
            color: #ef4444;
            border-radius: 50%;
            transition: background 0.2s;

            &:hover {
                background: #fee2e2;
            }
        }
    }

    .inquiry-card {
        .quote-cell {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;

            .quote-item {
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 4px 0;
                width: 100%;
            }

            .quote-label {
                color: #888;
                font-size: 13px;
                margin-right: 2px;
            }

            .highlight {
                color: #67c23a;
                font-weight: bold;
            }
        }

        .summary-cell {
            font-weight: bold;
            background: #f6f8fa;
            color: #2563eb;
            border-radius: 6px;
            padding: 4px 0;
            text-align: center;
        }
    }
}

.stage-tabs-steps {
    :deep(.el-tabs__nav) {
        display: flex;
        width: 100%;
        border: none;
        background: transparent;
        justify-content: space-between;
        padding: 0 8px;
    }

    :deep(.el-tabs__item) {
        flex: 1;
        text-align: center;
        font-size: 15px;
        font-weight: 600;
        border-radius: 12px 12px 0 0;
        margin: 0 4px;
        background: linear-gradient(90deg, #f0f4ff 0%, #f9fafc 100%);
        color: #4b5563;
        border: 1.5px solid #e0e7ef;
        border-bottom: none;
        transition: all 0.18s;
        height: 44px;
        line-height: 44px;
        position: relative;
        z-index: 1;
        box-shadow: 0 2px 6px rgba(37, 99, 235, 0.03);
    }

    :deep(.el-tabs__item.is-active) {
        background: linear-gradient(90deg, #2563eb 0%, #60a5fa 100%);
        color: #fff !important;
        border-color: #2563eb;
        font-weight: 600;
        z-index: 2;
        box-shadow: 0 4px 16px rgba(37, 99, 235, 0.10);
        transform: translateY(1px) scale(1.01);
    }
}


.el-input,
.el-input-number,
.el-select,
.el-date-picker {
    width: 100%;
    border-radius: 8px;
}

.el-form-item {
    margin-bottom: 18px;
}

.el-button {
    border-radius: 8px;
    font-weight: 500;
}

.el-table {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}
</style>