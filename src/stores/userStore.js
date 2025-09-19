import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', () => {
  const user_id = ref('')
  const user_name = ref('')
  const pageName = ref(1) // 3: 一览页面, 2: 操作页面
  const role = ref('')
  const user_detail = ref({})

  const filiale = computed(() => user_detail.value.filiale)
  const role_second = computed(() => user_detail.value.role_second)

  function newUser(text) {
    user_id.value = text
  }
  function newPage(text) {
    pageName.value = text
    console.log('新页面标识:', pageName.value);
  }
  function newRole(text) {
    role.value = text
  }

  function newName(text) {
    user_name.value = text
    console.log('新用户名:', user_name.value);
  }

  function newUserDetail(detail) {
    user_detail.value = detail
    console.log('设置用户详情:', detail);
  }

  // 清空持久化和重置 state
  function clearPersisted() {
    localStorage.removeItem('pinia-user')
    user_id.value = ''
    user_name.value = ''
    role.value = ''
    user_detail.value = {}
  }

  // 调试日志 - 只在开发环境显示
  if (import.meta.env.DEV) {
    console.log('UserStore 初始化:');
    console.log('user_id:', user_id.value);
    console.log('role:', role.value);
    console.log('user_name:', user_name.value);
    console.log('user_detail:', user_detail.value);
    console.log('role_second:', role_second.value);
  }

  return {
    user_id,
    user_name,
    user_detail,
    pageName,
    role,
    role_second,
    filiale,
    newName,
    newUser,
    newRole,
    newPage,
    newUserDetail,
    clearPersisted
  }
}, {
  persist: {
    // 只持久化基础的 ref 数据，计算属性会自动从 user_detail 计算出来
    paths: ['user_id', 'role', 'user_name', 'user_detail']
  }
})