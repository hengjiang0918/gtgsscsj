<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import UserProfile from '@/components/UserProfile.vue'
import { useUserStore } from '@/stores/userStore'
import { useRouter } from 'vue-router'

import api from '@/api'
const userStore = useUserStore()
const showProfile = ref(false)
const router = useRouter()
const username = userStore.user_name
const getLogOut = () => {
  api.logout({
  })
    .then(data => {
      ElMessage.success('已退出登录')
      router.replace({ name: 'login' })
      userStore.clearPersisted()
    })

}
onMounted(() => {
})
// 下拉菜单事件
const handleDropdownCommand = (command) => {
  if (command === 'logout') {
    getLogOut()
    // 这里可加实际的退出逻辑
  } else if (command === 'profile') {
    showProfile.value = true
  } else if (command === 'setting') {
    ElMessage.info('功能未实现')
  } else if (command === 'switchView') {
    console.log('当前页面标识:', userStore.pageName)

    if (userStore.pageName == 2) {

      userStore.newPage(3)
      router.replace({ path: '/indexManager' })
    } else {
      userStore.newPage(2)
      router.replace({ path: '/indexUser' })
    }

  }
}
</script>

<template>
  <div class="header-bar">
    <div class="logo">
      <img src="../assets/img/logo.png" alt="Logo" />
      <span class="logo-title">国泰国盛设备管理系统</span>
    </div>
    <div class="user-info">
      <el-dropdown trigger="click" @command="handleDropdownCommand">
        <span class="el-dropdown-link">
          <span class="username">{{ username }}</span>

          <el-icon class="dropdown-arrow" style="margin-left: 6px;">
            <ArrowDown />
          </el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="profile">
              <el-icon>
                <User />
              </el-icon>
              <span>个人信息</span>
            </el-dropdown-item>
            <el-dropdown-item command="setting">
              <el-icon>
                <Setting />
              </el-icon>
              <span>设置</span>
            </el-dropdown-item>
            <el-dropdown-item command="switchView" v-if="userStore.role != 1">
              <el-icon>
                <Setting />
              </el-icon>
              <span>切换页面 </span>
            </el-dropdown-item>
            <el-dropdown-item divided command="logout">
              <el-icon>
                <SwitchButton />
              </el-icon>
              <span>退出登录</span>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
    <el-dialog title="用户信息" v-model="showProfile">
      <UserProfile v-show="showProfile" />
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.header-bar {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
  background: linear-gradient(90deg, #6bb1f7 0%, #409eff 100%);
  color: #fff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.08);
  position: relative;
  z-index: 10;

  :deep(.el-dialog) {
    display: flex !important;
    justify-content: center;
    align-items: center;
    flex-direction: column;


  }

  @media (max-width: 600px) {
    flex-direction: column;
    height: auto;
    padding: 8px 8px;

    .logo-title {
      font-size: 16px;
    }

    .user-info {
      margin-top: 8px;
    }
  }

  .logo {
    display: flex;
    align-items: center;

    img {
      width: 40px;
      height: 40px;
      margin-right: 12px;
      border-radius: 8px;
      background: #fff;
      box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
    }

    .logo-title {
      font-size: 20px;
      font-weight: 700;
      letter-spacing: 2px;
      color: #fff;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);

      @media (max-width: 600px) {
        font-size: 16px;
      }
    }
  }

  .user-info {
    .el-dropdown-link {
      display: flex;
      align-items: center;
      cursor: pointer;
      padding: 4px 18px;
      border-radius: 22px;
      transition: background 0.2s, box-shadow 0.2s;

      &:hover {
        background: rgba(255, 255, 255, 0.22);
        box-shadow: 0 4px 16px rgba(64, 158, 255, 0.14);
      }

      .username {
        margin-left: 12px;
        font-size: 18px;
        font-weight: 700;
        color: #fff;
        letter-spacing: 1px;
        max-width: 140px;
        padding: 2px 8px;
        border-radius: 8px;
        // background: rgba(255, 255, 255, 0.10);
        box-shadow: 0 1px 4px rgba(64, 158, 255, 0.08);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        transition: background 0.2s, color 0.2s, font-size 0.2s;
      }

      .dropdown-arrow {
        margin-left: 10px;
        transition: transform 0.2s;
        opacity: 0.8;
      }
    }

    .el-dropdown-menu {
      min-width: 150px;
      border-radius: 10px;
      box-shadow: 0 6px 24px rgba(64, 158, 255, 0.16);
      padding: 8px 0;
      background: #fff;
      border: none;
      animation: dropdown-fade-in 0.22s;
    }

    .el-dropdown-item {
      font-size: 16px;
      color: #333;
      padding: 12px 28px;
      border-radius: 7px;
      transition: background 0.2s, color 0.2s;

      &:hover {
        background: #e3f2fd;
        color: #1976d2;
      }

      &.is-disabled {
        color: #bbb;
        background: none;
        cursor: not-allowed;
      }
    }

    .el-dropdown-menu__item--divided {
      border-top: 1px solid #f0f0f0;
      margin-top: 6px;
      padding-top: 12px;
    }
  }
}

@keyframes dropdown-fade-in {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>