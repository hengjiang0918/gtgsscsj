<template>
    <div class="equipment-management">
        <div class="header">
            <h2>设备管理</h2>
            <div class="header-buttons">
                <!-- <el-button type="success" @click="showUploadDialog = true">批量导入</el-button> -->
                <el-button type="success" @click="handleAddCategory">新增大类</el-button>
                <el-button type="warning" @click="handleAddType">新增中类</el-button>
                <el-button type="primary" @click="handleAdd">
                    <el-icon>
                        <Plus />
                    </el-icon>
                    新增设备
                </el-button>
            </div>
        </div>
        <el-table :data="equipmentData" border style="width: 100%" :span-method="tableSpanMethod" height="100%"
            class="equipment-table">
            <el-table-column prop="major_name" label="大类" min-width="120" align="center">
                <template #default="{ row }">
                    <span class="major-cell">{{ row.major_name }}</span>
                </template>
            </el-table-column>
            <el-table-column prop="middle_name" label="中类" min-width="150" align="center">
                <template #default="{ row }">
                    <span class="middle-cell">{{ row.middle_name }}</span>
                </template>
            </el-table-column>
            <el-table-column prop="equipment_name" label="设备名称" min-width="150" align="center">
                <template #default="{ row }">
                    <span class="minor-cell">{{ row.equipment_name }}</span>
                </template>
            </el-table-column>
            <el-table-column prop="equipment_code" label="设备代码" min-width="200" align="center">
                <template #default="{ row }">
                    <span class="code-cell">{{ row.equipment_code }}</span>
                </template>
            </el-table-column>
            <el-table-column label="操作" min-width="180" fixed="right" align="center">
                <template #default="{ row }">
                    <div class="action-buttons">
                        <el-button size="small" @click="handleEdit(row)" class="action-btn">编辑</el-button>
                        <el-button size="small" type="danger" @click="handleDelete(row)"
                            class="action-btn">删除</el-button>
                    </div>
                </template>
            </el-table-column>
        </el-table>

        <!-- 新增/编辑设备对话框 -->
        <el-dialog :title="dialogTitle" v-model="dialogVisible" width="500px">
            <el-form :model="formData" :rules="rules" ref="formRef" label-width="80px">
                <el-form-item label="大类" prop="major_name">
                    <el-select v-model="formData.major_name" placeholder="请选择大类" style="width: 100%"
                        @change="handlemajorChange">
                        <el-option v-for="item in categoryTypeMap" :key="item.major_id" :label="item.major_name"
                            :value="item.major_id" />
                    </el-select>
                </el-form-item>

                <el-form-item label="中类" prop="middle_name">
                    <el-select v-model="formData.middle_name" placeholder="请选择中类" style="width: 100%"
                        @change="handleTypeChange">
                        <el-option v-for="item in typeOptions" :key="item.middle_name" :label="item.middle_name"
                            :value="item.middle_id" />
                    </el-select>
                </el-form-item>

                <el-form-item label="设备名称" prop="equipment_name">
                    <el-input v-model="formData.equipment_name" placeholder="请输入设备名称" />
                </el-form-item>

                <el-form-item label="设备代码" prop="equipment_code">
                    <el-input v-model="formData.equipment_code" placeholder="请输入设备代码" />
                </el-form-item>
            </el-form>

            <template #footer>
                <el-button @click="dialogVisible = false">取消</el-button>
                <el-button type="primary" @click="handleSubmit()">确定</el-button>
            </template>
        </el-dialog>

        <!-- 新增大类对话框 -->
        <el-dialog title="新增大类" v-model="categoryDialogVisible" width="400px">
            <el-form :model="categoryForm" :rules="categoryRules" ref="categoryFormRef" label-width="80px">
                <el-form-item label="大类名称" prop="major_name">
                    <el-input v-model="categoryForm.major_name" placeholder="请输入大类名称" clearable />
                </el-form-item>

            </el-form>

            <template #footer>
                <el-button @click="categoryDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="handleCategorySubmit">确定</el-button>
            </template>
        </el-dialog>

        <!-- 新增中类对话框 -->
        <el-dialog title="新增中类" v-model="typeDialogVisible" width="400px">
            <el-form :model="typeForm" :rules="typeRules" ref="typeFormRef" label-width="80px">
                <el-form-item label="所属大类" prop="major_name">
                    <el-select v-model="typeForm.major_name" placeholder="请选择所属大类" style="width: 100%"
                        @change="handlemid">
                        <el-option v-for="(items, category) in categoryTypeMap" :key="category"
                            :label="items.major_name" :value="items.major_id" />
                    </el-select>
                </el-form-item>
                <el-form-item label="中类名称" prop="middle_name">
                    <el-input v-model="typeForm.middle_name" placeholder="请输入中类名称" clearable />
                </el-form-item>

            </el-form>

            <template #footer>
                <el-button @click="typeDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="handleTypeSubmit">确定</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import api from '@/api'

// 设备数据
const equipmentData = ref([

])

// 分类数据管理
const categoryTypeMap = ref([])

// 对话框相关
const dialogVisible = ref(false)
const categoryDialogVisible = ref(false)
const typeDialogVisible = ref(false)
const dialogTitle = ref('新增设备')
const formRef = ref()
const categoryFormRef = ref()
const typeFormRef = ref()

// 表单数据
const formData = reactive({
    major_name: '',
    middle_name: '',
    middle_id: '',
    major_id: '',
    equipment_name: '',
    equipment_code: '',
})

// 新增大类表单
const categoryForm = reactive({
    major_name: '',
    major_id: ''
})

// 新增中类表单
const typeForm = reactive({
    major_name: '',
    major_id: '',
    middle_name: '',
    description: ''
})
onMounted(() => {
    CreateEquipmentCategory()
    getEquipmentCategory()
})
const CreateEquipmentCategory = async () => {
    api.equipmentCategory({
        action: 'list',
        category_type: 'major',
        name: typeForm.major_name || '',  // 可选：按名称模糊查询
    }).then((data) => {
        categoryTypeMap.value = data.list

    }).catch(() => {
        ElMessage.error('大类创建失败')
    })
}
const getEquipmentCategory = async () => {
    api.equipmentCategory({
        action: 'list',
        category_type: 'equipment',
        name: "",              // 可选：按名称模糊查询
        order: "asc"               // 可选：排序方式
    }).then((data) => {
        equipmentData.value = data.list
    }).catch(() => {

    })
}
// 合并大类和中类的表格行
const tableSpanMethod = ({ row, column, rowIndex }) => {
    // 合并大类
    if (column.property === 'major_name') {
        const majorRows = equipmentData.value.filter(item => item.major_id === row.major_id);
        const firstIndex = equipmentData.value.findIndex(item => item.major_id === row.major_id);
        if (rowIndex === firstIndex) {
            return [majorRows.length, 1];
        } else {
            return [0, 0];
        }
    }
    // 合并中类
    if (column.property === 'middle_name') {
        const middleRows = equipmentData.value.filter(item => item.middle_id === row.middle_id && item.major_id === row.major_id);
        const firstIndex = equipmentData.value.findIndex(item => item.middle_id === row.middle_id && item.major_id === row.major_id);
        if (rowIndex === firstIndex) {
            return [middleRows.length, 1];
        } else {
            return [0, 0];
        }
    }
    // 其他列不合并
    return [1, 1];
};
// 表单验证规则
const rules = {
    major_name: [{ required: true, message: '请选择大类', trigger: 'change' }],
    middle_name: [{ required: true, message: '请选择中类', trigger: 'change' }],
    equipment_name: [{ required: true, message: '请输入设备名称', trigger: 'blur' }],
    // equipment_code: [{ required: true, message: '请输入设备代码', trigger: 'blur' }]
}

// 大类验证规则
const categoryRules = {
    major_name: [
        { required: true, message: '请输入大类名称', trigger: 'blur' },
        { min: 2, max: 20, message: '大类名称长度在 2 到 20 个字符', trigger: 'blur' }
    ]
}

// 中类验证规则
const typeRules = {
    major_name: [{ required: true, message: '请选择所属大类', trigger: 'change' }],
    middle_name: [
        { required: true, message: '请输入中类名称', trigger: 'blur' },
        { min: 2, max: 20, message: '中类名称长度在 2 到 20 个字符', trigger: 'blur' }
    ]
}
// 处理项目选择变化
const handlemid = (major_id) => {
    // 根据选中的项目ID，找到对应的项目对象
    const selectedProject = categoryTypeMap.value.find(project => project.major_id === major_id);

    if (selectedProject) {
        // 同时设置项目ID和项目名称
        typeForm.major_id = selectedProject.major_id;
        typeForm.major_name = selectedProject.major_name;
    } else {
        // 如果没有找到项目，清空相关字段
        typeForm.major_id = '';
        typeForm.major_name = '';
    }
};
const typeOptions = ref([])

const handlemajorChange = (major_id) => {
    // 根据选中的项目ID，找到对应的项目对象
    const selectedProject = categoryTypeMap.value.find(project => project.major_id === major_id);

    if (selectedProject) {
        // 同时设置项目ID和项目名称
        api.equipmentCategory({
            action: 'list',
            category_type: 'middle',
            name: '',  // 可选：按名称模糊查询
            major_id: selectedProject.major_id,  // 可选：按大类ID筛选
            order: 'asc'
        }).then((data) => {
            typeForm.major_id = selectedProject.major_id;
            typeForm.major_name = selectedProject.major_name;
            formData.middle_id = ''
            formData.middle_name = ''
            typeOptions.value = data.list
            console.log('中类列表获取成功:', typeOptions.value);

        }).catch(() => {
            ElMessage.error('大类创建失败')
        })

    } else {
        // 如果没有找到项目，清空相关字段
        typeForm.major_id = '';
        typeForm.major_name = '';
    }
};
const handleTypeChange = (middle_id) => {
    // 根据选中的项目ID，找到对应的项目对象
    const selectedProject = typeOptions.value.find(project => project.middle_id === middle_id);

    if (selectedProject) {
        // 同时设置项目ID和项目名称
        formData.middle_id = selectedProject.middle_id;
        formData.middle_name = selectedProject.middle_name;

    } else {
        // 如果没有找到项目，清空相关字段
        formData.middle_id = '';
        formData.middle_name = '';
    }
    console.log('选中的中类ID:', middle_id);
};
// 新增大类
const handleAddCategory = () => {
    categoryForm.major_name = ''

    categoryDialogVisible.value = true
}

// 新增中类
const handleAddType = () => {
    typeForm.major_id = ''
    typeForm.major_name = ''
    typeForm.middle_name = ''

    typeDialogVisible.value = true
}

// 提交新增大类
const handleCategorySubmit = async () => {
    try {
        await categoryFormRef.value.validate()
        api.equipmentCategory({
            action: 'create',
            category_type: 'major',
            name: categoryForm.major_name,
        }).then(() => {
            ElMessage.success('大类创建成功')
            categoryDialogVisible.value = false
        }).catch(() => {
            ElMessage.error('大类创建失败')
        })


        ElMessage.success('大类添加成功')
        categoryDialogVisible.value = false
    } catch {
        ElMessage.error('请检查输入内容')
    }
}
// 提交新增中类
const handleTypeSubmit = async () => {
    try {
        // await typeFormRef.value.validate()
        const existingTypes = categoryTypeMap.value[typeForm.major_name] || []
        if (existingTypes.includes(typeForm.middle_name)) {
            ElMessage.error('该中类已存在')
            return
        }
        api.equipmentCategory({
            action: 'create',
            category_type: 'middle',
            name: typeForm.middle_name,
            major_id: typeForm.major_id
        }).then(() => {
            ElMessage.success('中类创建成功')
            typeDialogVisible.value = false
        }).catch(() => {
            ElMessage.error('中类创建失败')
        })
    } catch {
        ElMessage.error('请检查输入内容')
    }

}

// 新增设备
const handleAdd = () => {
    dialogTitle.value = '新增设备'
    resetForm()
    dialogVisible.value = true
}

// 编辑设备
const handleEdit = (row) => {
    dialogTitle.value = '编辑设备'
    Object.assign(formData, row)
    dialogVisible.value = true
    api.equipmentCategory({
        action: 'list',
        category_type: 'middle',
        name: '',  // 可选：按名称模糊查询
        major_id: row.major_id,  // 可选：按大类ID筛选
        order: 'asc'
    }).then((data) => {
        typeOptions.value = data.list
        console.log('中类列表获取成功:', typeOptions.value);

    }).catch(() => {
        ElMessage.error('大类创建失败')
    })
}
// 删除设备
const handleDelete = async (row) => {
    try {
        await ElMessageBox.confirm('确定要删除该设备吗？', '提示', {
            type: 'warning'
        })
        api.equipmentCategory({
            action: 'delete',
            category_type: 'equipment',
            id: row.equipment_id
        }).then((data) => {
            const index = equipmentData.value.findIndex(item => item.equipment_id === row.equipment_id)
            if (index > -1) {
                equipmentData.value.splice(index, 1)
                ElMessage.success('删除成功')
            }
        }).catch(() => {

        })

    } catch {
        // 用户取消删除
    }
}

// 提交表单
const handleSubmit = async () => {
    try {
        await formRef.value.validate()
        api.equipmentCategory({
            action: dialogTitle.value === '新增设备' ? 'create' : 'update',
            category_type: 'equipment',
            id: formData.equipment_id,
            name: formData.equipment_name,
            middle_id: formData.middle_id,
            equipment_code: formData.equipment_code
        }).then(() => {
            ElMessage.success('创建成功')
            typeDialogVisible.value = false
        }).catch(() => {
            ElMessage.error('中类创建失败')
        })


        dialogVisible.value = false
    } catch {
        // 表单验证失败
    }
}
// 重置表单
const resetForm = () => {
    Object.assign(formData, {
        major_name: '',
        middle_name: '',
        middle_id: '',
        major_id: '',
        equipment_name: '',
        equipment_code: '',
    })
}


</script>

<style scoped lang="scss">
.equipment-management {
    height: 100%;

    .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
        padding: 10px 24px;
        border-radius: 12px;
        height: 70px;

        h2 {
            margin: 0;
            color: #303133;
            font-size: 24px;
            font-weight: 600;
        }

        .header-buttons {
            display: flex;
            gap: 12px;

            .el-button {
                height: 40px;
                border-radius: 8px;
                font-weight: 500;
                transition: all 0.3s ease;

                &:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                }

                &.el-button--success {
                    background: linear-gradient(135deg, #67c23a, #85ce61);
                    border: none;
                }

                &.el-button--warning {
                    background: linear-gradient(135deg, #e6a23c, #f7ba2a);
                    border: none;
                }

                &.el-button--primary {
                    background: linear-gradient(135deg, #409eff, #67c23a);
                    border: none;
                }
            }
        }
    }

    :deep(.el-table) {
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);

        .el-table__header {
            th {
                background: #f8f9fa;
                color: #333;
                font-weight: 600;
                border-bottom: 2px solid #e9ecef;
            }
        }

        .el-table__row {
            &:hover {
                background-color: #f8f9ff;
            }
        }
    }

    // 对话框样式
    :deep(.el-dialog) {
        border-radius: 16px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);

        .el-dialog__header {
            padding: 24px 24px 0;
            border-bottom: 1px solid #f0f0f0;

            .el-dialog__title {
                font-size: 18px;
                font-weight: 600;
                color: #333;
            }
        }

        .el-dialog__body {
            padding: 24px;
        }

        .el-dialog__footer {
            padding: 16px 24px 24px;
            border-top: 1px solid #f0f0f0;

            .el-button {
                height: 36px;
                border-radius: 8px;
                font-weight: 500;
                min-width: 80px;
            }
        }
    }

    // 表单样式
    :deep(.el-form) {
        .el-form-item {
            margin-bottom: 20px;

            .el-form-item__label {
                font-weight: 500;
                color: #333;
            }

            .el-input,
            .el-select,
            .el-textarea {

                .el-input__wrapper,
                .el-select__wrapper {
                    border-radius: 8px;
                    transition: all 0.3s ease;

                    &:hover {
                        box-shadow: 0 0 0 1px #409eff;
                    }
                }
            }
        }
    }
}

.equipment-table {
    border-radius: 14px;
    overflow: hidden;
    box-shadow: 0 8px 32px rgba(102, 126, 234, 0.08);

    :deep(.el-table__header th) {
        background: #667eea !important;
        color: #fff !important;
        font-weight: 700 !important;
        text-align: center !important;
        padding: 14px 10px !important;
        border-right: 1px solid rgba(255, 255, 255, 0.15) !important;
        font-size: 16px;
        letter-spacing: 1px;
        box-shadow: 0 2px 8px rgba(102, 126, 234, 0.08);
    }

    :deep(.el-table__body tr) {
        transition: background 0.2s;
        border-bottom: 1px solid #f0f0f0;

        &:hover {
            background-color: #eef2fa !important;
        }
    }

    :deep(.el-table__footer) {
        background: #f8f9fa !important;
        font-weight: 600;
        color: #667eea;
    }

    .major-cell,
    .middle-cell,
    .minor-cell {
        font-size: 15px;
        color: #444;
        font-weight: 600;
        text-align: center;
        padding: 6px 0;
        letter-spacing: 0.5px;
    }

    .code-cell {
        font-size: 14px;
        border-radius: 6px;
        padding: 4px 12px;
        display: inline-block;
        text-align: center;
    }

    .action-buttons {
        display: flex;
        gap: 10px;
        justify-content: center;
        flex-wrap: wrap;

        .action-btn {
            border-radius: 10px !important;
            font-weight: 600;
            transition: all 0.18s;
            padding: 7px 18px !important;
            font-size: 14px !important;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
            color: #fff !important;
            border: none !important;
            box-shadow: 0 2px 8px rgba(102, 126, 234, 0.08);
            width: 30%;

            &:hover:not(.is-disabled) {
                box-shadow: 0 6px 18px rgba(102, 126, 234, 0.18);
                filter: brightness(1.08);
            }
        }

        .el-button--danger {
            background: linear-gradient(135deg, #f56c6c 0%, #e6a23c 100%) !important;
            color: #fff !important;
        }
    }
}

// 响应式设计
@media (max-width: 1200px) {
    .equipment-table {
        font-size: 13px;

        .action-buttons {
            .action-btn {
                padding: 5px 10px !important;
                font-size: 12px !important;
            }
        }
    }
}


// 响应式设计
@media (max-width: 1200px) {
    .equipment-table {
        font-size: 12px;

        .action-buttons {
            .action-btn {
                padding: 4px 8px !important;
                font-size: 11px !important;
            }
        }
    }
}


// 响应式设计
@media (max-width: 768px) {
    .equipment-management {
        padding: 0 16px;

        .header {
            flex-direction: column;
            align-items: stretch;
            gap: 16px;

            .header-buttons {
                justify-content: center;
                flex-wrap: wrap;
            }
        }
    }
}
</style>