<template>
  <div class="project-management">
    <!-- 搜索和筛选 -->
    <div class="search-section">
      <div class="search-bar">
        <el-input v-model="searchText" placeholder="搜索项目名称或描述" clearable class="search-input">
          <template #prefix>
            <el-icon>
              <Search />
            </el-icon>
          </template>
        </el-input>
      </div>
      <el-button type="primary" @click="showAddDialog = true" class="add-btn">
        <el-icon>
          <Plus />
        </el-icon>
        新增项目
      </el-button>
    </div>
    <!-- 美化后的项目表格 -->
    <el-table :data="filteredProjects" class="project-table" stripe empty-text="暂无项目数据" :header-cell-style="{
      background: '#f8f9fa',
      color: '#333',
      fontWeight: '600',
      borderBottom: '2px solid #e9ecef'
    }" height="calc(100% - 100px)">
      <el-table-column prop="name" label="项目名称" min-width="150" align="center" show-overflow-tooltip>
        <template #default="{ row }">
          <div class="project-info">
            <div class="project-name">{{ row.project_name }}</div>
          </div>
        </template>
      </el-table-column>

      <el-table-column prop="description" label="项目描述" min-width="350" align="center" show-overflow-tooltip>
        <template #default="{ row }">
          <div class="description-cell">
            <el-tooltip :content="row.description" placement="top" :disabled="row.description.length < 50">
              <span class="description-text">{{ row.description }}</span>
            </el-tooltip>
          </div>
        </template>
      </el-table-column>


      <el-table-column label="开始时间" width="200" align="center">
        <template #default="{ row }">
          <div class="date-range-cell">
            <div class="date-item">
              <el-icon class="date-icon">
                <Calendar />
              </el-icon>
              <span class="date-value">{{ formatDate(row.start_date) }}</span>
            </div>

          </div>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right" align="center">
        <template #default="{ row }">
          <div class="action-buttons">
            <el-tooltip content="编辑项目" placement="top">
              <el-button type="warning" size="small" class="action-btn" @click="editProject(row)" circle>
                <el-icon>
                  <Edit />
                </el-icon>
              </el-button>
            </el-tooltip>
            <el-tooltip content="删除项目" placement="top">
              <el-button type="danger" size="small" class="action-btn" @click="deleteProject(row.project_id)" circle>
                <el-icon>
                  <Delete />
                </el-icon>
              </el-button>
            </el-tooltip>
          </div>
        </template>
      </el-table-column>
    </el-table>
    <!-- 新增/编辑项目对话框 -->
    <el-dialog :title="isEdit ? '编辑项目' : '新增项目'" v-model="showAddDialog" width="600px" draggable class="project-dialog">
      <el-form :model="projectForm" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="项目名称" prop="project_name">
          <el-input v-model="projectForm.project_name" placeholder="请输入项目名称" />
        </el-form-item>
        <el-form-item label="所属工厂" prop="factory">
          <el-select v-model="projectForm.factory" placeholder="请选择工厂" class="custom-select">
            <el-option label="CBK" value="CBK"></el-option>
            <el-option label="RG" value="RG"></el-option>
            <el-option label="KH" value="KH"></el-option>
            <el-option label="GS" value="GS"></el-option>
            <el-option label="GW" value="GW"></el-option>
            <el-option label="WINAS" value="WINAS"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="项目描述" prop="description">
          <el-input type="textarea" v-model="projectForm.description" :rows="3" placeholder="请输入项目描述" resize="none" />
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="开始日期" prop="start_date">
              <el-date-picker v-model="projectForm.start_date" type="date" placeholder="选择开始日期" style="width: 100%"
                format="YYYY-MM-DD" value-format="YYYY-MM-DD" />
            </el-form-item>
          </el-col>

        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showAddDialog = false" class="cancel-btn">取消</el-button>
          <el-button type="primary" @click="submitProject" class="submit-btn">
            <el-icon>
              <Check />
            </el-icon>
            {{ isEdit ? '保存' : '创建' }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import api from '@/api'
import { ref, computed, onMounted, watch } from 'vue'
// 响应式数据
const searchText = ref('')
const statusFilter = ref('')
const showAddDialog = ref(false)
const isEdit = ref(false)
const formRef = ref(null)
const project_name = ref('')
const factory = ref('')

watch(showAddDialog, (val) => {
  if (!val) {
    projectForm.value = {
      id: '',
      project_name: '',
      description: '',
      factory: '',
      start_date: '',
    }
    isEdit.value = false
  }
})
// 项目表单数据
const projectForm = ref({
  id: '',
  project_name: '',
  description: '',
  factory: '',
  start_date: '',

})

// 表单验证规则
const rules = {
  project_name: [
    { required: true, message: '请输入项目名称', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入项目描述', trigger: 'blur' }
  ],
  factory: [
    { required: true, message: '请选择所属工厂', trigger: 'change' }
  ],
  start_date: [
    { required: true, message: '请选择开始日期', trigger: 'change' }
  ]
}

// 模拟项目数据
const projects = ref([
])
onMounted(() => {
  getProjectList()
})
const getProjectList = async () => {
  api.projectList({
    project_name: project_name.value,
    factory: factory.value,
  }).then(data => {
    projects.value = data.project_list
    console.log('项目列表数据', projects.value)
  })
}

// 计算属性
const filteredProjects = computed(() => {
  return projects.value.filter(project => {
    const matchesSearch = project.project_name.includes(searchText.value) ||
      project.description.includes(searchText.value)
    const matchesStatus = !statusFilter.value || project.factory === statusFilter.value
    return matchesSearch && matchesStatus
  })
})
const formatDate = (date) => {
  if (!date) return '未设置'
  return new Date(date).toLocaleDateString('zh-CN')
}

const editProject = (project) => {
  isEdit.value = true
  projectForm.value = { ...project }
  showAddDialog.value = true
}

const deleteProject = async (project_id) => {
  try {
    await ElMessageBox.confirm('确定要删除这个项目吗？', '确认删除', {
      type: 'warning'
    })
    await api.projectDelete({
      project_id: project_id
    })
    const index = projects.value.findIndex(p => p.project_id === project_id)
    if (index > -1) {
      projects.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
  } catch {
    // 用户取消删除
  }
}

const submitProject = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()

    if (isEdit.value) {
      // 编辑项目
      const index = projects.value.findIndex(p => p.id === projectForm.value.id)
      if (index > -1) {
        projects.value[index] = { ...projectForm.value }
      }
      ElMessage.success('编辑成功')
    } else {
      api.projectCreate({
        ...projectForm.value
      }).then((data) => {
        projects.value.push(data.project)
      })
      ElMessage.success('新增成功')
    }

    showAddDialog.value = false
  } catch {
    // 表单验证失败
  }
}

</script>

<style scoped lang="scss">
.project-management {
  height: 100%;

  // 搜索区域
  .search-section {
    margin-bottom: 15px;
    background: white;
    padding: 20px 24px;
    border-radius: 12px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
    display: flex;
    justify-content: space-between;

    .search-bar {
      display: flex;
      gap: 16px;
      align-items: center;

      .search-input {
        width: 320px;
      }

      .status-filter {
        width: 160px;
      }
    }
  }

  .project-table {
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);

    :deep(.el-table__row) {
      &:hover {
        background-color: #f8f9ff !important;
      }
    }

    .project-info {
      .project-name {
        font-weight: 600;
        color: #333;
        margin-bottom: 4px;
      }

      .project-id {
        font-size: 12px;
        color: #999;
        font-family: 'Monaco', 'Consolas', monospace;
      }
    }

    // 描述单元格
    .description-cell {
      .description-text {
        color: #666;
        font-size: 14px;
        line-height: 1.5;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
    }

    // 状态标签
    .status-tag {
      font-weight: 500;
      border-radius: 16px;
      padding: 6px 12px;

      .status-icon {
        margin-right: 4px;
      }
    }

    // 日期范围单元格
    .date-range-cell {
      .date-item {
        display: flex;
        align-items: center;
        gap: 4px;
        margin-bottom: 4px;
        font-size: 14px;
        font-weight: 600;
        justify-content: center;

        .date-icon {
          color: #409eff;
          font-size: 14px;
        }

        .date-label {
          color: #999;
          min-width: 32px;
        }

        .date-value {
          color: #333;
          font-weight: 500;
        }
      }
    }

    // 进度单元格
    .progress-cell {
      .progress-text {
        font-size: 12px;
        color: #666;
        margin-top: 4px;
        text-align: center;
      }
    }

    // 操作按钮
    .action-buttons {
      display: flex;
      justify-content: center;
      gap: 8px;

      .action-btn {
        width: 32px;
        height: 32px;
        transition: all 0.3s ease;

        &:hover {
          transform: scale(1.1);
        }
      }
    }
  }

  // 对话框样式
  .project-dialog {
    :deep(.el-dialog) {
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
    }

    :deep(.el-dialog__header) {
      padding: 24px 24px 0;
      border-bottom: 1px solid #f0f0f0;
    }

    .dialog-footer {
      padding: 16px 24px 24px;
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      border-top: 1px solid #f0f0f0;

      .cancel-btn,
      .submit-btn {
        height: 40px;
        border-radius: 8px;
        font-weight: 500;
        min-width: 100px;
      }

      .submit-btn {
        box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .project-management {
    padding: 16px;

    .page-header {
      flex-direction: column;
      align-items: stretch;
      gap: 16px;
    }

    .search-section {
      .search-bar {
        flex-direction: column;
        align-items: stretch;

        .search-input,
        .status-filter {
          width: 100%;
        }
      }
    }

    .table-section {
      padding: 16px;
      overflow-x: auto;
    }
  }
}
</style>