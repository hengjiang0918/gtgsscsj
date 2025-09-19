<template>
  <div class="purchase-apply-container">


    <!-- 表单主体 -->
    <div class="form-container">
      <el-form :model="purchaseForm" :rules="rules" ref="formRef" class="purchase-form">
        <!-- 基本信息卡片 -->
        <div class="form-card">
          <div class="card-header">
            <el-icon>
              <OfficeBuilding />
            </el-icon>
            <span>基本信息</span>
          </div>
          <div class="card-body">
            <div class="form-grid">
              <el-form-item label="工厂" prop="factory" class="form-item">
                <el-select v-model="purchaseForm.factory" placeholder="请选择工厂" class="custom-select">
                  <el-option v-for="item in factoryOptions" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
              </el-form-item>
              <el-form-item label="申购部门" prop="filiale" class="form-item">
                <el-select v-model="purchaseForm.filiale" class="form-input" placeholder="请选择分公司">
                  <el-option v-for="item in departmentOptions" :key="item.value" :label="item.label"
                    :value="item.value" />
                </el-select> </el-form-item>
              <el-form-item label="采购类型" prop="mold" class="form-item">
                <el-select v-model="purchaseForm.mold" placeholder="请选择采购类型" class="custom-select">
                  <el-option label="设备" value="0"></el-option>
                  <el-option label="机物料" value="1"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="申请日期" prop="updated_at" class="form-item">
                <el-date-picker v-model="purchaseForm.updated_at" type="date" placeholder="选择日期"
                  value-format="YYYY-MM-DD" class="custom-date-picker" />
              </el-form-item>
            </div>
          </div>
        </div>

        <!-- 设备清单卡片 -->
        <div class="form-card equipment-card">
          <div class="card-header">
            <el-icon>
              <List />
            </el-icon>
            <span>设备清单</span>
            <div class="header-actions">
              <el-button type="primary" @click="addEquipment" class="add-equipment-btn">
                <el-icon>
                  <CirclePlus />
                </el-icon>
                添加设备
              </el-button>
            </div>
          </div>
          <div class="card-body">
            <div class="equipment-table-container">
              <el-table :data="purchaseForm.equipmentList" class="equipment-table" :header-cell-style="{
                backgroundColor: '#f8fafc',
                color: '#374151',
                fontWeight: '600',
                borderBottom: '2px solid #e5e7eb'
              }" :cell-style="{ padding: '12px 8px' }">

                <el-table-column label="设备名称" min-width="120" align="center">
                  <template #default="scope">
                    <el-form-item :prop="`equipmentList.${scope.$index}.equipment_name`" style="margin-bottom:0">
                      <el-cascader v-model="scope.row.equipment_id" :options="equipment_list" filterable clearable
                        :show-all-levels="false"
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
                      <el-input-number v-model="scope.row.price" :min="0" :max="100000000" :controls="false"
                        class="table-number" />
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

                <el-table-column label="操作" width="80" align="center" v-if="purchaseForm.equipmentList.length > 1">
                  <template #default="scope">
                    <el-button type="danger" size="small" circle @click="removeEquipment(scope.$index)"
                      class="delete-btn">
                      <el-icon>
                        <Delete />
                      </el-icon>
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>

            <!-- 统计信息 -->
            <div class="summary-section">
              <div class="summary-cards">
                <div class="summary-card quantity-card">
                  <div class="summary-icon">
                    <el-icon>
                      <Goods />
                    </el-icon>
                  </div>
                  <div class="summary-content">
                    <span class="summary-label">总数量</span>
                    <span class="summary-value">{{ calculateTotalQuantity() }} 个</span>
                  </div>
                </div>
                <div class="summary-card amount-card">
                  <div class="summary-icon">
                    <el-icon>
                      <Money />
                    </el-icon>
                  </div>
                  <div class="summary-content">
                    <span class="summary-label">总金额</span>
                    <span class="summary-value">¥{{ calculateTotal() }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 申请详情卡片 -->
        <div class="form-card">
          <div class="card-header">
            <el-icon>
              <EditPen />
            </el-icon>
            <span>申请详情</span>
          </div>
          <div class="card-body">
            <div class="form-grid">
              <el-form-item label="采购描述" prop="description" class="form-item">
                <el-input v-model="purchaseForm.description" placeholder="大致描述采购内容" class="custom-input" />
              </el-form-item>
              <el-form-item label="项目选择" prop="project_name" class="form-item">
                <el-select v-model="purchaseForm.project_name" placeholder="请选择项目" class="table-select"
                  @change="handleProjectChange">
                  <el-option v-for="project in projectList" :key="project.id" :label="project.project_name"
                    :value="project.project_id"></el-option>

                </el-select>
              </el-form-item>
              <el-form-item label="申请人" prop="applicant" class="form-item">
                <el-input v-model="purchaseForm.applicant" disabled class="custom-input disabled-input" />
              </el-form-item>
            </div>
            <el-form-item label="备注信息" prop="remark" class="full-width">
              <el-input v-model="purchaseForm.remark" type="textarea" :rows="1" placeholder="请填写备注信息"
                class="custom-textarea" />
            </el-form-item>
            <el-form-item label="申请理由" prop="reason" class="full-width">
              <el-input v-model="purchaseForm.reason" type="textarea" :rows="1" placeholder="请详细说明采购理由和设备用途"
                class="custom-textarea" />
            </el-form-item>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="form-actions">
          <el-button type="primary" @click="submitForm" class="submit-btn">
            <el-icon>
              <Check />
            </el-icon>
            提交申请
          </el-button>
          <el-button @click="resetForm" class="reset-btn">
            <el-icon>
              <RefreshRight />
            </el-icon>
            重置表单
          </el-button>
        </div>
      </el-form>
    </div>
  </div>
</template>
<script setup>
// 引入 Vue 的核心 API
import { ref, reactive, onMounted, watch } from 'vue';
// 引入 Vue Router，用于页面跳转
import { useRouter } from 'vue-router';
// 引入 Element Plus 的消息提示组件
import { ElMessage } from 'element-plus';
// 引入 Element Plus 图标
import { Delete } from '@element-plus/icons-vue';
import { useUserStore } from '@/stores/userStore'
import { useCommonStore } from '@/stores/commonStore'
// 引入 API 模块，用于与后端交互
import api from '@/api/index.js';
const userStore = useUserStore()
const commonStore = useCommonStore()
// 表单数据，使用 reactive 创建响应式对象
const purchaseForm = reactive({
  factory: '', // 工厂
  updated_at: '', // 申请日期
  remark: '', // 备注
  reason: '', // 申请理由
  applicant: userStore.user_name, // 申请人
  applicant_id: userStore.user_id, // 申请人ID
  project_name: '', // 项目名称
  project_id: '', // 项目ID
  manager: '', // 分管经理
  mold: '0', // 默认值为“设备”
  description: '', // 描述
  production_opinion: '', // 生产意见
  equipmentList: [ // 设备清单
    {
      equipment_name: '', // 设备名称
      equipment_id: '', // 设备ID
      brand: '', // 品牌
      model: '', // 型号
      spec: '', // 规格/要求
      unit: '台', // 单位
      quantity: 1, // 数量
      price: 0 // 预计单价
    }
  ]
});

const factoryOptions = commonStore.Common_factory
const departmentOptions = commonStore.Common_department
const formRef = ref();
const rules = {
  factory: [
    { required: true, message: '请输入工厂', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入描述', trigger: 'blur' }
  ],
  filiale: [
    { required: true, message: '请输入分公司', trigger: 'blur' }
  ],
  project_name: [
    { required: true, message: '请输入项目名称', trigger: 'blur' }
  ],

  updated_at: [
    { required: true, message: '请选择日期', trigger: 'change' }
  ],
  remark: [
    { required: true, message: '备注不能超过200字', trigger: 'blur' }
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

};
watch(
  () => purchaseForm.equipmentList.length,
  (len) => {
    for (let i = 0; i < len; i++) {
      rules[`equipmentList.${i}.equipment_name`] = [{ required: true, message: '请输入设备名称', trigger: 'blur' }];
      // rules[`equipmentList.${i}.brand`] = [{ required: true, message: '请输入品牌', trigger: 'blur' }];
      // rules[`equipmentList.${i}.model`] = [{ required: true, message: '请输入型号', trigger: 'blur' }];
      // rules[`equipmentList.${i}.spec`] = [{ required: true, message: '请输入规格/要求', trigger: 'blur' }];
      rules[`equipmentList.${i}.unit`] = [{ required: true, message: '请选择单位', trigger: 'change' }];
      rules[`equipmentList.${i}.quantity`] = [{ required: true, type: 'number', min: 1, message: '数量必须大于0', trigger: 'blur' }];
      rules[`equipmentList.${i}.price`] = [{ required: true, type: 'number', min: 0, message: '请输入预计单价', trigger: 'blur' }];
    }
  },
  { immediate: true }
);


// 路由实例，用于页面跳转
const router = useRouter();
const projectList = ref([]);
const equipment_list = ref([]);
onMounted(async () => {
  // 获取供应商报价数据
  getProjectList()
});
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

const submitForm = () => {
  console.log('提交采购申请表单数据', purchaseForm);
  formRef.value.validate(valid => {
    if (!valid) return;
    else {
      api.createPurchase({
        purchaseForm: purchaseForm,
      })
        .then(data => {
          ElMessage.success('采购申请提交成功，请等待审批');
          resetForm()
          // 通知主页面刷新
        })
        .catch(err => {
          // 错误已自动弹窗，这里可选写自定义处理
        })
    }

  });
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
const removeEquipment = (index) => {
  if (purchaseForm.equipmentList.length > 1) {
    purchaseForm.equipmentList.splice(index, 1);
  } else {
    ElMessage.warning('至少保留一个设备项');
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
// 计算总计
const calculateTotalQuantity = () => {
  return purchaseForm.equipmentList.reduce((total, item) => {
    return total + (item.quantity || 0);
  }, 0);
};

// 重置表单方法也需要修改
const resetForm = () => {

  purchaseForm.date = '';
  purchaseForm.equipmentList = [
    {
      equipment_name: '',
      equipment_id: '',
      brand: '',
      model: '',
      spec: '',
      mold: 0,
      unit: '台',
      quantity: 0,
      price: 0
    }
  ];
  purchaseForm.remark = '';
  purchaseForm.reason = '';
  purchaseForm.description = '';
  purchaseForm.project_name = '';
  purchaseForm.project_id = '';
  purchaseForm.factory = '';
  purchaseForm.filiale = '';
};
</script>


<style scoped lang="scss">
.purchase-apply-container {
  padding: 20px;

  // 表单容器
  .form-container {
    margin: 0 auto;

    .purchase-form {
      .form-card {
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
        border-radius: 16px;
        margin-bottom: 24px;
        overflow: hidden;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        transition: all 0.3s ease;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
        }

        .card-header {
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          padding: 10px 15px;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 18px;
          font-weight: 600;
          color: #374151;

          .el-icon {
            color: #1c7255;
            font-size: 20px;
            margin-right: 10px;
          }

          .header-actions {
            margin-left: auto;
          }
        }

        .card-body {
          padding: 15px;
        }
      }
    }
  }

  // 表单网格布局
  .form-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
    margin-bottom: 20px;

    .form-item {
      display: flex;
      align-self: center;
      margin-bottom: 0;
      height: 100%;

      :deep(.el-form-item__label) {
        font-weight: 600;
        color: #374151;
      }
    }

    .full-width {
      grid-column: 1 / -1;
    }
  }

  // 输入组件样式
  .custom-input,
  .custom-select,
  .custom-date-picker,
  .custom-textarea {
    width: 100%;

    :deep(.el-input__wrapper) {
      border-radius: 8px;
      border: 2px solid #e5e7eb;
      transition: all 0.3s ease;
      background: #ffffff;

      &:hover {
        border-color: #d1d5db;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      &.is-focus {
        border-color: #667eea;
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
      }
    }

    &.disabled-input {
      :deep(.el-input__wrapper) {
        background: #f9fafb;
        border-color: #e5e7eb;
      }
    }
  }

  // 设备清单表格
  .equipment-card {
    .equipment-table-container {
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid #e5e7eb;

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

  // 统计卡片
  .summary-section {
    margin-top: 20px;

    .summary-cards {
      display: flex;
      gap: 15px;
      justify-content: flex-end;

      .summary-card {
        background: #f8fafc;
        border-radius: 8px;
        padding: 12px 16px;
        display: flex;
        align-items: center;
        gap: 8px;
        border: 1px solid #e5e7eb;
        min-width: 120px;

        .summary-icon {
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          color: #6b7280;
        }

        .summary-content {
          display: flex;
          flex-direction: column;

          .summary-label {
            font-size: 12px;
            color: #6b7280;
            line-height: 1;
          }

          .summary-value {
            font-size: 14px;
            font-weight: 600;
            color: #111827;
            line-height: 1.2;
          }
        }
      }
    }
  }

  // 操作按钮
  .form-actions {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-top: 40px;

    .submit-btn {
      background: linear-gradient(135deg, #667eea, #764ba2);
      border: none;
      color: white;
      padding: 12px 32px;
      font-size: 16px;
      font-weight: 600;
      border-radius: 12px;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
      }

      &:active {
        transform: translateY(0);
      }
    }

    .reset-btn {
      background: white;
      border: 2px solid #e5e7eb;
      color: #374151;
      padding: 12px 32px;
      font-size: 16px;
      font-weight: 600;
      border-radius: 12px;
      transition: all 0.3s ease;

      &:hover {
        border-color: #d1d5db;
        background: #f9fafb;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }

      &:active {
        transform: translateY(0);
      }
    }
  }

  // 添加设备按钮
  .add-equipment-btn {
    background: linear-gradient(135deg, #10b981, #059669);
    border: none;
    color: white;
    padding: 8px 16px;
    border-radius: 8px;
    transition: all 0.3s ease;



    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
    }
  }
}

// 动画效果
@keyframes pulse {

  0%,
  100% {
    opacity: 0.6;
    transform: scale(1);
  }

  50% {
    opacity: 1;
    transform: scale(1.1);
  }
}

// 响应式设计
@media (max-width: 768px) {
  .purchase-apply-container {
    padding: 10px;

    .page-header .header-content {
      padding: 20px;
      flex-direction: column;
      text-align: center;
      gap: 20px;
    }

    .form-grid {
      grid-template-columns: 1fr;
    }

    .summary-cards {
      flex-direction: column;
    }

    .form-actions {
      flex-direction: column;
      align-items: center;
    }
  }
}
</style>
