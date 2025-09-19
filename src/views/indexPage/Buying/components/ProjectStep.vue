<template>
    <div class="step-content">
        <h3>{{ currentStepname }}</h3>
        <div class="container">
            <el-form :model="purchaseForm" :rules="rules" ref="formRef">
                <!-- 设备信息 -->
                <div class="form-flex">
                    <el-form-item label="工厂" prop="factory" class="form-item">
                        <el-select v-model="purchaseForm.factory" placeholder="请选择工厂" :disabled="!localEdit"
                            class="custom-select">
                            <el-option v-for="item in factoryOptions" :key="item.value" :label="item.label"
                                :value="item.value" />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="申购部门" prop="filiale" class="form-item">
                        <el-select v-model="purchaseForm.filiale" class="form-input" :disabled="!localEdit"
                            placeholder="请选择分公司">
                            <el-option v-for="item in departmentOptions" :key="item.value" :label="item.label"
                                :value="item.value" />

                        </el-select> </el-form-item>
                    <el-form-item label="采购类型" prop="mold" class="form-item">
                        <el-select v-model="purchaseForm.mold" :disabled="!localEdit" placeholder="请选择采购类型">
                            <el-option label="设备" value="0"></el-option>
                            <el-option label="机物料" value="1"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="日期" prop="updated_at">
                        <el-date-picker v-model="purchaseForm.updated_at" type="date" :disabled="!localEdit"
                            style="width: 100%;" placeholder="选择日期" value-format="YYYY-MM-DD" />
                    </el-form-item>
                </div>

                <!-- 设备清单 -->
                <div class="equipment-list">
                    <div class="list-header">
                        <h3>设备清单</h3>
                        <el-button v-if="localEdit" type="primary" @click="addEquipment">
                            <template #icon>
                                <Plus />
                            </template>
                            添加设备
                        </el-button>
                    </div>

                    <!-- 只读表格 -->
                    <el-table v-if="!localEdit" :data="purchaseForm.equipmentList" border
                        style="width: 100%; margin-bottom: 20px;">
                        <el-table-column label="名称" align="center">
                            <template #default="scope">
                                <span class="table-cell-center">{{ scope.row.equipment_name }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column label="品牌" align="center">
                            <template #default="scope">
                                <span class="table-cell-center">{{ scope.row.brand }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column label="型号" align="center">
                            <template #default="scope">
                                <span class="table-cell-center">{{ scope.row.model }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column label="规格/要求" align="center">
                            <template #default="scope">
                                <span class="table-cell-center">{{ scope.row.spec }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column label="单位" width="80" align="center">
                            <template #default="scope">
                                <span class="table-cell-center">{{ scope.row.unit }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column label="数量" width="100" align="center">
                            <template #default="scope">
                                <span class="table-cell-center">{{ scope.row.quantity }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column label="预计单价" width="120" align="center">
                            <template #default="scope">
                                <span class="table-cell-center">¥{{ scope.row.price }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column label="小计" width="120" align="center">
                            <template #default="scope">
                                <span class="table-cell-center">¥{{ calculateSubtotal(scope.row) }}</span>
                            </template>
                        </el-table-column>
                    </el-table>
                    <!-- 可编辑表格 -->
                    <el-table v-if="localEdit" :data="purchaseForm.equipmentList" class="equipment-table"
                        :header-cell-style="{
                            backgroundColor: '#f8fafc',
                            color: '#374151',
                            fontWeight: '600',
                            borderBottom: '2px solid #e5e7eb'
                        }" :cell-style="{ padding: '12px 8px' }">
                        <el-table-column label="设备名称" min-width="120" align="center">
                            <template #default="scope">
                                <el-form-item :prop="`equipmentList.${scope.$index}.equipment_name`"
                                    style="margin-bottom:0">
                                    <el-cascader v-model="scope.row.equipment_id" :options="equipment_list" filterable
                                        clearable :show-all-levels="false"
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
                                <el-form-item :prop="`equipmentList.${scope.$index}.quantity`" style="margin-bottom:0">
                                    <el-input-number v-model="scope.row.quantity" :min="1" :max="1000" :controls="false"
                                        class="table-number" />
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
                                    @click="removeEquipment(scope.$index, scope.row.equipment_id)" class="delete-btn">
                                    <el-icon>
                                        <Delete />
                                    </el-icon>
                                </el-button>
                            </template>
                        </el-table-column>
                    </el-table>

                    <!-- 总计显示 -->
                    <div class="total-summary">
                        <div class="total-info">
                            <span class="total-text">总数量：<strong>{{ calculateTotalQuantity() }} 个</strong></span>
                        </div>
                        <div class="total-info">
                            <span class="total-text">总计金额：<strong>¥{{ calculateTotal() }}</strong></span>
                        </div>
                    </div>
                </div>

                <!-- 申请详情 -->
                <div class="form-flex">
                    <el-form-item label="采购描述" prop="description" class="form-item">
                        <el-input v-model="purchaseForm.description" placeholder="大致描述采购内容" class="custom-input"
                            :disabled="!localEdit" />
                    </el-form-item>
                    <el-form-item label="项目选择" prop="project_name" class="form-item">
                        <el-select v-model="purchaseForm.project_name" placeholder="请选择项目" class="table-select"
                            :disabled="!localEdit" @change="handleProjectChange">
                            <el-option v-for="project in projectList" :key="project.id" :label="project.project_name"
                                :value="project.project_id"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="申请人" prop="applicant" class="form-item">
                        <el-input v-model="purchaseForm.applicant" disabled class="custom-input disabled-input" />
                    </el-form-item>
                </div>
                <el-form-item label="备注信息" prop="remark">
                    <el-input v-model="purchaseForm.remark" type="textarea" :disabled="!localEdit" :rows="1"
                        placeholder="请填写备注信息" />
                </el-form-item>
                <el-form-item label="申请理由" prop="reason">
                    <el-input v-model="purchaseForm.reason" type="textarea" :rows="1" :disabled="!localEdit"
                        placeholder="请详细说明采购理由和设备用途" />
                </el-form-item>

                <!-- 操作按钮 -->
                <div class="approval-actions">
                    <el-button v-if="canApprove && status == 1" type="success"
                        @click="handleApproveConfirm(2)">通过</el-button>
                    <el-button v-if="status == 1 && is_last_step == 0 && can_approve" type="success"
                        @click="saveConfirm">提交</el-button>
                    <el-button v-if="canApprove && status == 2 && finish_prepay != 1" type="danger"
                        @click="handleReject">退回</el-button>
                    <el-button v-if="status == 2" @click="getExportExcel">导出文件</el-button>
                    <el-button @click="handleBack">返回</el-button>
                </div>
            </el-form>
        </div>
    </div>
</template>

<script setup>
// 引入 Vue 的核心 API
import { ref, reactive, onMounted, watch, nextTick, computed } from 'vue';
// 引入 Vue Router，用于页面跳转
import { useRouter } from 'vue-router';
// 引入 Element Plus 的消息提示组件
import { ElMessage } from 'element-plus';
// 引入 Element Plus 图标
import { Delete, Plus } from '@element-plus/icons-vue';
import { useUserStore } from '@/stores/userStore'
import { useCommonStore } from '@/stores/commonStore'
// 引入 API 模块，用于与后端交互
import api from '@/api/index.js';
const finish_prepay = ref('')
const props = defineProps({
    canEdit: Boolean,
    status: Number,
    canSubmit: Boolean,
    purchase_id: String,
    currentStepname: String
});
const emit = defineEmits(['data-change'])

const userStore = useUserStore()
const commonStore = useCommonStore()
const factoryOptions = commonStore.Common_factory
const departmentOptions = commonStore.Common_department

// 表单数据，使用 ref
const purchaseForm = reactive({
    filiale: '', // 申购部门
    updated_at: '', // 申请日期
    remark: '', // 备注
    description: '', // 备注
    reason: '', // 申请理由
    applicant: '', // 申请人
    applicant_id: '', // 申请人ID
    manager: '', // 分管经理
    mold: '0', // 默认值为"设备"
    production_opinion: '', // 生产意见
    equipmentList: [ // 设备清单
        {
            equipment_name: '', // 设备名称
            brand: '', // 品牌
            model: '', // 型号
            spec: '', // 规格/要求
            unit: '台', // 单位
            quantity: 1, // 数量
            price: 0 // 预计单价
        }
    ]
});

const formRef = ref();
const is_last_step = ref(''); // 是否为最后一步
const can_approve = ref(true); // 是否可以审批
const projectList = ref([]);
const equipment_list = ref([]);

// 计算属性 - 是否可编辑
const localEdit = computed(() => {
    const isEditable = props.status == 1 ? true : false;
    return isEditable;
})
const getProjectList = async () => {
    api.projectList({
    }).then(data => {
        projectList.value = data.project_list
        api.equipmentCategory({
            action: 'tree',
        }).then((data) => {
            equipment_list.value = data.equipment_list
            console.log('设备分类数据', equipment_list.value)
        }).catch(() => {
            ElMessage.error('大类创建失败')
        })
        console.log('项目列表数据', projectList.value)
    })
}
// 计算属性 - 是否可审批
const canApprove = computed(() => {
    if (userStore.role == 1) {
        return can_approve.value; // 管理员角色可以审批
    } else {
        return true
    }
});
// 表单验证规则
const rules = reactive({
    project_name: [
        { required: true, message: '请输入项目名称', trigger: 'blur' }
    ],
    factory: [
        { required: true, message: '请选择工厂', trigger: 'change' }
    ],
    filiale: [
        { required: true, message: '请输入申购部门', trigger: 'blur' }
    ],
    updated_at: [
        { required: true, message: '请选择日期', trigger: 'change' }
    ],
    remark: [
        { required: true, message: '备注不能超过200字', trigger: 'blur' }
    ],
    description: [
        { required: true, message: '描述不能超过200字', trigger: 'blur' }
    ],
    reason: [
        { required: true, message: '请填写采购理由', trigger: 'blur' }
    ],
    applicant: [
        { required: true, message: '请输入申请人', trigger: 'blur' }
    ],
    mold: [
        { required: true, message: '请选择采购类型', trigger: 'blur' }
    ],
});
// 动态生成设备列表验证规则的函数
const generateEquipmentRules = (length) => {
    // 清除之前的设备验证规则
    Object.keys(rules).forEach(key => {
        if (key.startsWith('equipmentList.')) {
            delete rules[key];
        }
    });

    // 添加新的设备验证规则
    for (let i = 0; i < length; i++) {
        rules[`equipmentList.${i}.equipment_name`] = [
            { required: true, message: '请输入设备名称', trigger: 'blur' }
        ];
        // rules[`equipmentList.${i}.brand`] = [
        //     { required: true, message: '请输入品牌', trigger: 'blur' }
        // ];
        // rules[`equipmentList.${i}.model`] = [
        //     { required: true, message: '请输入型号', trigger: 'blur' }
        // ];
        // rules[`equipmentList.${i}.spec`] = [
        //     { required: true, message: '请输入规格/要求', trigger: 'blur' }
        // ];
        rules[`equipmentList.${i}.unit`] = [
            { required: true, message: '请选择单位', trigger: 'change' }
        ];
        rules[`equipmentList.${i}.quantity`] = [
            { required: true, type: 'number', min: 1, message: '数量必须大于0', trigger: 'blur' }
        ];
        rules[`equipmentList.${i}.price`] = [
            { required: true, type: 'number', min: 0, message: '请输入预计单价', trigger: 'blur' }
        ];
    }
};

// 监听设备列表长度变化
watch(
    () => purchaseForm.equipmentList.length,
    (newLength) => {
        generateEquipmentRules(newLength);
        // 强制更新表单验证
        nextTick(() => {
            if (formRef.value) {
                formRef.value.clearValidate();
            }
        });
    },
    { immediate: true }
);
// 路由实例
const router = useRouter();

onMounted(() => {
    console.log('当前用户信息', factoryOptions);
    if (!canApprove.value) return;
    getPurchaseDetail();
});
const handleChange = (equipmentValue, index, row) => {
    // 检查是否已存在相同设备ID
    const exists = purchaseForm.equipmentList.some(
        (item, idx) => item.equipment_id === equipmentValue && idx !== index
    );
    if (exists) {
        ElMessage.warning('不能添加重复的设备');
        // 恢复为未选中，并强制刷新 el-cascader
        row.equipment_id = '';
        row.equipment_name = '';
        row._cascaderKey = Date.now(); // 新增：强制刷新
        return;
    }
    // equipmentValue 已经是最后一级 value
    const selectedEquipment = findEquipmentById(equipment_list.value, equipmentValue);
    if (selectedEquipment) {
        row.equipment_id = selectedEquipment.value;
        row.equipment_name = selectedEquipment.label;
    } else {
        row.equipment_id = '';
        row.equipment_name = '';
    }
    // 可选：每次正常选择也同步刷新key，避免缓存
    row._cascaderKey = Date.now();
    console.log('选中的设备信息', row);
};

// 递归查找设备的辅助函数
const findEquipmentById = (equipmentTree, targetId) => {
    for (const item of equipmentTree) {
        if (item.value === targetId) {
            return item;
        }
        if (item.children && item.children.length > 0) {
            const found = findEquipmentById(item.children, targetId);
            if (found) return found;
        }
    }
    return null;
};
// 处理项目选择变化
const handleProjectChange = (projectId) => {
    // 根据选中的项目ID，找到对应的项目对象
    const selectedProject = projectList.value.find(project => project.project_id === projectId);

    if (selectedProject) {
        // 同时设置项目ID和项目名称
        purchaseForm.project_id = selectedProject.project_id;
        purchaseForm.project_name = selectedProject.project_name;
    } else {
        // 如果没有找到项目，清空相关字段
        purchaseForm.project_id = '';
        purchaseForm.project_name = '';
    }
};
// API 调用
const getPurchaseDetail = async () => {
    try {
        const data = await api.purchaseDetail({
            purchase_id: props.purchase_id,
            detail_type: 'project',
            step_order: 0,
            user_id: userStore.user_id
        });
        Object.assign(purchaseForm, data.purchaseForm);
        is_last_step.value = data.is_last_step;
        can_approve.value = data.can_approve;
        finish_prepay.value = data.finish_prepay;
        getProjectList()
    } catch (err) {
        console.error('获取发货详情失败', err);
    }
};

// 添加设备项
const addEquipment = () => {
    purchaseForm.equipmentList.push({
        equipment_name: '',
        equipment_id: '',
        brand: '',
        model: '',
        spec: '',
        mold: 0,
        unit: '台',
        quantity: 1,
        price: 0
    });
};

// 删除设备项
const removeEquipment = (index, equipment_id) => {
    if (equipment_id) {
        ElMessageBox.confirm('确定要删除这个设备项吗？', '删除确认', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        }).then(() => {
            api.deleteEquipment({
                equipment_id: equipment_id,
                purchase_id: props.purchase_id
            }).then(() => {
                purchaseForm.equipmentList.splice(index, 1);
            })
        })
    } else {
        purchaseForm.equipmentList.splice(index, 1);
    }


};


// 计算单项小计
const calculateSubtotal = (item) => {
    return ((item.quantity || 0) * (item.price || 0)).toFixed(2);
};

// 计算总计
const calculateTotal = () => {
    return purchaseForm.equipmentList.reduce((total, item) => {
        return total + (item.quantity || 0) * (item.price || 0);
    }, 0).toFixed(2);
};

// 计算总数量
const calculateTotalQuantity = () => {
    return purchaseForm.equipmentList.reduce((total, item) => {
        return total + (item.quantity || 0);
    }, 0);
};

// 事件处理
const handleBack = () => {
    router.go(-1);
}

const getExportExcel = () => {
    api.exportExcel({
        purchaseForm: purchaseForm
    })
        .then(data => {
            console.log('导出成功', data);
            window.open(data.file_url, '_blank')
        });
};

const handleApproveConfirm = (type) => {
    api.submitStep({
        purchase_id: props.purchase_id,
        step_order: 0,
        operator_id: userStore.user_id,
        operator: userStore.user_name,
        purchaseForm: purchaseForm
    }).then(() => {
        api.approveStepPass({
            purchase_id: props.purchase_id,
            flow_type: 0,
            operator_id: userStore.user_id,
            operator: userStore.user_name,
            is_last_step: is_last_step.value,
        }).then(() => {
            getPurchaseDetail()
            emit('data-change');
            ElMessage.success(type === 2 ? '审批通过成功' : '审批驳回成功')
        })
    }).catch((e) => {
        ElMessage.error('审批失败，请稍后重试', e)
    }).finally(() => {
    })
}

const handleReject = async () => {
    try {
        await api.approveStepReject({
            purchase_id: props.purchase_id,
            step_order: 0,
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

const saveConfirm = async () => {
    formRef.value.validate(valid => {
        if (!valid) {
            return;
        } else {
            api.submitStep({
                purchase_id: props.purchase_id,
                step_order: 0,
                operator_id: userStore.user_id,
                operator: userStore.user_name,
                purchaseForm: purchaseForm
            }).then(() => {
                getPurchaseDetail()
                emit('data-change');
                ElMessage.success('提交成功')
            }).catch((e) => {
                ElMessage.error('提交失败，请稍后重试', e)
            }).finally(() => {
            })


        }

    });
}
</script>

<style scoped lang="scss">
// @import '../style/indexPage.scss';

.el-input,
.el-input-number,
.el-select {
    width: 100%;
}

/* 设备清单区域 */
.equipment-list {
    margin-bottom: 20px;

    .list-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;

        h3 {
            margin: 0;
            color: #333;
        }
    }

    .total-summary {
        margin-top: 20px;
        display: flex;
        justify-content: flex-end;

        .total-info {
            text-align: right;
            padding: 15px 0;
            margin: 0 10px;

            .total-text {
                font-size: 16px;
                color: #333;

                strong {
                    color: #409eff;
                }
            }
        }
    }
}

.table-cell-center {
    display: block;
    text-align: center;
    width: 100%;
}

/* 可编辑表格样式 */
.equipment-table {
    :deep(.el-table__header) {
        th {
            background: #f8fafc !important;
            border-bottom: 2px solid #e5e7eb !important;
        }
    }

    :deep(.el-table__body) {
        .cell {
            padding: 0 !important;
        }

        tr {
            transition: all 0.3s ease;

            &:hover {
                background: #f8fafc;
            }
        }
    }

    .table-input,
    .table-select,
    .table-number {
        :deep(.el-input__wrapper) {
            border: 1px solid #e5e7eb;
            border-radius: 6px;

            &:hover {
                border-color: #667eea;
            }

            &.is-focus {
                border-color: #667eea;
                box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
            }
        }
    }

    .subtotal-cell {
        .amount {
            font-weight: 600;
            color: #059669;
            font-size: 16px;
        }
    }

    .delete-btn {
        background: linear-gradient(135deg, #ef4444, #dc2626);
        border: none;
        color: white;
        transition: all 0.3s ease;

        &:hover {
            transform: scale(1.1);
            box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
        }
    }
}

/* 响应式 */
@media (max-width: 768px) {
    .equipment-list {
        .total-summary {
            flex-direction: column;
            align-items: flex-end;
        }
    }
}
</style>