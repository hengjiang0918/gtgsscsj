<template>
  <div class="personnel-management">

    <div class="header">
      <el-button type="primary" @click="showAddDialog = true">
        <el-icon>
          <Plus />
        </el-icon>
        添加人员
      </el-button>
    </div>

    <el-table :data="user_list" stripe class="personnel-table" height="calc(100% - 55px)">
      <el-table-column label="序号" min-width="50" align="center">
        <template #default="scope">
          {{ scope.$index + 1 }}
        </template>
      </el-table-column>
      <el-table-column prop="name" label="姓名" min-width="80" align="center" />
      <el-table-column prop="department" label="部门" min-width="120" align="center" />
      <el-table-column prop="factory" label="工厂" min-width="80" align="center" />
      <el-table-column prop="role" label="权限角色" min-width="80" align="center">
        <template #default="scope">
          <el-tag :type="getRoleType(scope.row.role)">
            {{ getRoleText(scope.row.role) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="last_login" label="最后登录时间" min-width="120" align="center">
        <template #default="scope">
          <el-tag :type="scope.row.last_login ? 'success' : 'danger'">
            {{ scope.row.last_login ? scope.row.last_login : '未登录' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="created_at" label="创建时间" min-width="120" align="center">
        <template #default="scope">
          <el-tag :type="scope.row.created_at ? 'primary' : 'danger'">
            {{ scope.row.created_at ? scope.row.created_at : '未创建' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" min-width="80" align="center">
        <template #default="scope">
          <el-tag :type="scope.row.status == 1 ? 'success' : 'danger'">
            {{ scope.row.status == 1 ? '正常' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" min-width="200" align="center">
        <template #default="scope">
          <el-button size="small" @click="editPersonnel(scope.row)">
            编辑
          </el-button>
          <el-button size="small" :type="scope.row.status == 1 ? 'danger' : 'success'" @click="toggleStatus(scope.row)">
            {{ scope.row.status == 1 ? '禁用' : '启用' }}
          </el-button>
          <el-button size="small" type="warning" @click="editUserInfo(scope.row)">
            账号信息
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog v-model="showEditDialog" title="编辑人员信息" width="500px">
      <el-form :model="editForm" label-width="100px">
        <el-form-item label="姓名">
          <el-input v-model="editForm.name" />
        </el-form-item>
        <el-form-item label="部门">
          <el-select v-model="editForm.department" placeholder="请选择部门" class="custom-select">
            <el-option v-for="item in departmentOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="工厂">
          <el-select v-model="editForm.factory" placeholder="请选择工厂" class="custom-select">
            <el-option v-for="item in factoryOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="权限角色">
          <el-select v-model="editForm.rolename" placeholder="请选择权限角色" class="custom-select">
            <el-option label="工厂行政" value=1></el-option>
            <el-option label="采购员" value=2></el-option>
            <el-option label="领导" value=3></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button type="primary" @click="saveEdit">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showInfoDialog" title="账号信息" width="500px">
      <el-form :model="userInfoForm" label-width="100px">
        <el-form-item label="用户名" required>
          <el-input v-model="userInfoForm.username" disabled />
        </el-form-item>
        <el-form-item label="修改密码" required>
          <el-input v-model="userInfoForm.password" type="password" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showInfoDialog = false">取消</el-button>
        <el-button type="primary" @click="saveUserInfo" :loading="globalLoading">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showAddDialog" title="添加人员" width="500px">
      <el-form :model="addForm" :rules="addRules" ref="addFormRef" label-width="100px">
        <el-form-item label="姓名" prop="name" required>
          <el-input v-model="addForm.name" />
        </el-form-item>
        <el-form-item label="工厂" prop="factory" required>
          <el-select v-model="addForm.factory" placeholder="请选择工厂" class="custom-select">
            <el-option v-for="item in factoryOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="部门" prop="department" required>
          <el-select v-model="addForm.department" placeholder="请选择部门" class="custom-select">
            <el-option v-for="item in departmentOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="权限角色" prop="role" required>
          <el-select v-model="addForm.role" placeholder="请选择权限角色">
            <el-option label="工厂行政" value="1"></el-option>
            <el-option label="采购员" value="2"></el-option>
            <el-option label="领导" value="3"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="用户名" prop="username" required>
          <el-input v-model="addForm.username"
            @input="addForm.username = addForm.username.replace(/[^a-zA-Z0-9]/g, '')" />
        </el-form-item>
        <el-form-item label="密码" prop="password" required>
          <el-input v-model="addForm.password" type="password" show-password />
        </el-form-item>
        <el-form-item label="登录权限" prop="status" required>
          <el-select v-model="addForm.status" placeholder="请选择登录权限">
            <el-option label="启用" value="1"></el-option>
            <el-option label="禁用" value="0"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="addPersonnel" :loading="globalLoading">添加</el-button>
      </template>
    </el-dialog>
  </div>

</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import api from '@/api'
import { useCommonStore } from '@/stores/commonStore'
const commonStore = useCommonStore()
const factoryOptions = commonStore.Common_factory
const departmentOptions = commonStore.Common_department
const globalLoading = ref(false)
// 人员列表数据
const user_list = ref([

])
const addFormRef = ref(null)
const addRules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  factory: [{ required: true, message: '请选择工厂', trigger: 'change' }],
  department: [{ required: true, message: '请选择部门', trigger: 'change' }],
  role: [{ required: true, message: '请选择权限角色', trigger: 'change' }],
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  status: [{ required: true, message: '请选择登录权限', trigger: 'change' }]
}
onMounted(() => {
  getUserList()
})
const getUserList = async () => {
  try {
    const response = await api.userList()
    user_list.value = response.user_list || []
  } catch (error) {
    ElMessage.error('获取人员列表失败')
  }
}
// 对话框控制
const showEditDialog = ref(false)
const showAddDialog = ref(false)
const showInfoDialog = ref(false)

// 编辑表单
const editForm = reactive({
  id: null,
  name: '',
  department: '',
  position: '',
  factory: '',
  role: '',
  rolename: '',
})
const userInfoForm = reactive({
  username: '',
  user_id: '',
  password: ''
})
// 添加表单
const addForm = reactive({
  name: '',
  department: '',
  position: '',
  role: '',
  factory: '',
  username: '',
  password: 'gtgs666666',
  status: '1'  // 默认启用

})

// 获取角色标签类型
const getRoleType = (role) => {
  const types = {
    1: 'warning',  // 工厂行政
    2: 'danger',      // 采购员
    3: 'success'     // 领导
  }
  return types[role] || 'info'
}

// 获取角色文本
const getRoleText = (role) => {
  const texts = {
    1: '工厂行政',
    2: '采购员',
    3: '领导'
  }
  return texts[role] || '未知'
}

// 编辑人员
const editPersonnel = (personnel) => {
  Object.assign(editForm, personnel)
  // 用getRoleText处理editForm中的role
  console.log('editForm.rolename', editForm.rolename)
  if (editForm.role) {
    editForm.rolename = getRoleText(editForm.role)
  }
  showEditDialog.value = true
}

// 编辑人员账号信息
const editUserInfo = (personnel) => {
  Object.keys(userInfoForm).forEach(key => {
    if (key !== 'password') {
      userInfoForm[key] = personnel[key] || ''
    }
  })
  console.log('userInfoForm.username', userInfoForm)
  showInfoDialog.value = true

}

const saveEdit = () => {
  console.log('editForm', editForm.rolename)
  api.updateUserinfo({
    name: editForm.name,
    department: editForm.department,
    factory: editForm.factory,
    role: editForm.rolename == '工厂行政' ? 1 : editForm.rolename == '采购员' ? 2 : editForm.rolename == '领导' ? 3 : editForm.rolename,
    user_id: editForm.user_id
  }).then((data) => {
    user_list.value.forEach(item => {
      if (item.user_id === data.user.user_id) {
        Object.assign(item, data.user)
      }
    })
    ElMessage.success('人员信息修改成功')
    showEditDialog.value = false
  }).catch(() => {
    ElMessage.error('人员信息修改失败')
  })
}

const saveUserInfo = () => {
  if (globalLoading.value) return
  globalLoading.value = true
  api.resetPassword({
    user_id: userInfoForm.user_id,
    new_password: userInfoForm.password
  }).then(() => {
    ElMessage.success('密码修改成功')
    showInfoDialog.value = false
    userInfoForm.password = ''
  }).catch(() => {
    ElMessage.error('密码修改失败')
  }).finally(() => {
    globalLoading.value = false
  })
}

// 切换状态
const toggleStatus = async (personnel) => {

  const action = personnel.status == '1' ? '禁用' : '启用'
  try {
    await ElMessageBox.confirm(`确定要${action}该人员吗？`, '提示', {
      type: 'warning'
    })

    api.updateUserinfo({
      user_id: personnel.user_id,
      status: personnel.status == 1 ? 0 : 1,
    }).then((data) => {
      personnel.status = personnel.status == '1' ? 'disabled' : '1'
      showEditDialog.value = false
    }).catch(() => {
      ElMessage.error('人员信息修改失败')
    })
    ElMessage.success(`${action}成功`)
  } catch {
    // 用户取消操作
  }
}

// 添加人员
const addPersonnel = () => {
  addFormRef.value.validate((valid) => {
    if (!valid) return
    // 调用本地后端接口
    console.log('addForm', addForm)
    api.register({
      username: addForm.username,
      password: addForm.password,
      department: addForm.department,
      name: addForm.name,
      role: addForm.role,
      factory: addForm.factory,
      status: addForm.status
    },
    )
      .then(data => {
        user_list.value.push(data.user)
        ElMessage.success('添加成功')
        showAddDialog.value = false
        // 重置表单
        Object.assign(addForm, {
          name: '',
          department: '',
          role: '',
          factory: '',
          username: '',
          password: 'gtgs666666',
          status: '1'  // 默认启用
        })
      })
      .catch(err => {
        // 错误已自动弹窗，这里可选写自定义处理
      })
  })

}
</script>

<style scoped lang="scss">
.personnel-management {
  background: #f6f8fa;
  height: 100%;

  .header {
    display: flex;
    justify-content: flex-end;
    height: 40px;
    margin-bottom: 15px;

    .el-button {
      font-size: 16px;
      padding: 8px 28px;
      border-radius: 24px;
      font-weight: 600;
      box-shadow: 0 2px 8px rgba(37, 99, 235, 0.08);
    }
  }

  .personnel-table {
    background: #fff;
    border-radius: 14px;
    box-shadow: 0 4px 5px rgba(0, 0, 0, 0.08);
    overflow: hidden;

    .el-table__header th {
      background: #f0f6ff;
      color: #2563eb;
      font-weight: bold;
      font-size: 15px;
      border-bottom: 1px solid #e5e7eb;
    }

    .el-table__row {
      transition: background 0.2s;

      &:hover {
        background: #f5f7fa;
      }
    }

    .el-tag {
      border-radius: 8px;
      font-size: 13px;
      padding: 0 12px;
    }

    .el-button--small {
      border-radius: 16px;
      font-size: 13px;
      padding: 4px 18px;
      margin-right: 8px;
    }
  }

  .el-dialog {
    border-radius: 14px;

    .el-dialog__header {
      background: #f0f6ff;
      border-bottom: 1px solid #e5e7eb;
      font-weight: bold;
      font-size: 17px;
    }

    .el-dialog__footer {
      background: #f9fafb;
      border-top: 1px solid #e5e7eb;
    }

    .el-form-item__label {
      font-weight: 600;
      color: #2563eb;
    }

    .el-input,
    .el-select {
      border-radius: 8px;
    }
  }
}
</style>