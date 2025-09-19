<template>
    <div class="management-container">
        <!-- Tab 导航栏 -->
        <div class="tabs-nav">
            <div v-for="(tab, key) in tabs" :key="key" class="tab-item" :class="{ active: activeTab === key }"
                @click="switchTab(key)">
                <el-icon class="tab-icon">
                    <Box v-if="key === 'EquipmentManagement'" />
                    <Files v-else-if="key === 'ProjectManagement'" />
                    <User v-else-if="key === 'PersonnelManagement'" />
                </el-icon>
                <span class="tab-label">{{ tab.label }}</span>
                <div class="tab-indicator" v-if="activeTab === key"></div>
            </div>
        </div>

        <!-- 内容区域 -->
        <div class="content-wrapper">
            <transition name="fade-slide" mode="out-in">
                <!-- 设备管理 -->
                <EquipmentManagement v-if="activeTab === 'EquipmentManagement'" key="equipment" />
                <!-- 项目管理 -->
                <ProjectManagement v-else-if="activeTab === 'ProjectManagement'" key="project" />
                <!-- 人员管理 -->
                <PersonnelManagement v-else-if="activeTab === 'PersonnelManagement'" key="personnel" />
            </transition>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Setting, Box, Files, User } from '@element-plus/icons-vue'

// 导入子组件
import EquipmentManagement from './Management/EquipmentManagement.vue'
import ProjectManagement from './Management/ProjectManagement.vue'
import PersonnelManagement from './Management/PersonnelManagement.vue'

const router = useRouter()
const route = useRoute()

// 响应式数据
const activeTab = ref('EquipmentManagement') // 默认选中设备管理

// Tab 配置
const tabs = {
    EquipmentManagement: {
        label: '设备管理',
        path: 'EquipmentManagement',
        description: '设备信息维护与管理'
    },
    ProjectManagement: {
        label: '项目管理',
        path: 'ProjectManagement',
        description: '项目进度跟踪与管理'
    },
    PersonnelManagement: {
        label: '人员管理',
        path: 'PersonnelManagement',
        description: '人员信息与权限管理'
    },
}



// 页面加载时恢复 Tab 状态
onMounted(() => {
    // 从路由参数或 URL 恢复状态
    const queryTab = route.query.tab
    const currentPath = route.path.split('/').pop()

    if (queryTab && tabs[queryTab]) {
        activeTab.value = queryTab
    } else if (currentPath) {
        const foundTab = Object.keys(tabs).find(
            key => tabs[key].path === currentPath
        )
        if (foundTab) {
            activeTab.value = foundTab
        }
    }
})

// 切换 Tab
const switchTab = (tabId) => {
    if (activeTab.value === tabId) return

    activeTab.value = tabId

    // 更新路由，但不刷新页面
    router.push({
        path: route.path,
        query: {
            ...route.query,
            tab: tabId
        }
    }).catch(() => {
        // 忽略重复导航错误
    })
}

// 监听路由变化
watch(
    () => route.query.tab,
    (newTab) => {
        if (newTab && tabs[newTab] && activeTab.value !== newTab) {
            activeTab.value = newTab
        }
    }
)

// 监听 activeTab 变化，更新文档标题
watch(
    () => activeTab.value,
    (newTab) => {
        if (tabs[newTab]) {
            document.title = `${tabs[newTab].label} - 设备管理系统`
        }
    },
    { immediate: true }
)
</script>

<style scoped lang="scss">
.management-container {
    height: calc(100% - 100px);

    .tabs-nav {
        display: flex;
        justify-content: center;
        gap: 8px;
        padding: 5px;
        border-radius: 12px;
        height: 100px;

        .tab-item {
            position: relative;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 20px 32px;
            cursor: pointer;
            border-radius: 8px;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            background: transparent;
            color: #666;
            min-width: 140px;

            &:hover {
                background: white;
                color: #409eff;
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
            }

            &.active {
                background: white;
                color: #409eff;
                box-shadow: 0 4px 16px rgba(64, 158, 255, 0.2);

                .tab-indicator {
                    position: absolute;
                    bottom: -8px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 24px;
                    height: 3px;
                    background: linear-gradient(90deg, #409eff, #36cfc9);
                    border-radius: 2px;
                }
            }

            .tab-icon {
                font-size: 24px;
                margin-bottom: 8px;
                transition: all 0.3s ease;
            }

            .tab-label {
                font-size: 14px;
                font-weight: 600;
                text-align: center;
                transition: all 0.3s ease;
            }

            // 不同类型的图标颜色
            &:nth-child(1) {

                &.active,
                &:hover {
                    .tab-icon {
                        color: #52c41a;
                    }

                    color: #52c41a;
                }
            }

            &:nth-child(2) {

                &.active,
                &:hover {
                    .tab-icon {
                        color: #1890ff;
                    }

                    color: #1890ff;
                }
            }

            &:nth-child(3) {

                &.active,
                &:hover {
                    .tab-icon {
                        color: #722ed1;
                    }

                    color: #722ed1;
                }
            }
        }

    }

    .content-wrapper {
        // background: white;
        border-radius: 16px;
        height: 100%;
        // box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        overflow: hidden;
    }
}

// 切换动画
.fade-slide-enter-active,
.fade-slide-leave-active {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-slide-enter-from {
    opacity: 0;
    transform: translateY(20px);
}

.fade-slide-leave-to {
    opacity: 0;
    transform: translateY(-20px);
}

// 响应式设计
@media (max-width: 768px) {
    .management-container {
        padding: 16px;

        .tabs-wrapper {
            padding: 20px;

            .tabs-header {
                margin-bottom: 24px;

                .page-title {
                    font-size: 24px;
                    flex-direction: column;
                    gap: 8px;
                }

                .page-description {
                    font-size: 14px;
                }
            }

            .tabs-nav {
                flex-direction: column;
                gap: 8px;

                .tab-item {
                    flex-direction: row;
                    padding: 16px 20px;
                    justify-content: flex-start;

                    .tab-icon {
                        margin-bottom: 0;
                        margin-right: 12px;
                        font-size: 20px;
                    }

                    .tab-label {
                        font-size: 16px;
                    }

                    &.active .tab-indicator {
                        display: none;
                    }
                }
            }
        }
    }
}

@media (max-width: 480px) {
    .management-container {
        padding: 12px;

        .tabs-wrapper {
            padding: 16px;

            .tabs-nav {
                .tab-item {
                    padding: 12px 16px;
                    min-width: auto;
                    width: 100%;
                }
            }
        }
    }
}
</style>