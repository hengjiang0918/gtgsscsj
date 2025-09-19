<template>

    <div class="user-profile">
        <div class="user-info">
            <div class="user-row user-id">
                <el-icon>
                    <UserFilled />
                </el-icon>
                <span>姓名: {{ userdetail.name }}</span>
            </div>
            <div class="user-row user-department">
                <el-icon>
                    <OfficeBuilding />
                </el-icon>
                <span>部门: {{ userdetail.department }}</span>
            </div>
            <div class="user-row user-position">
                <el-icon>
                    <Briefcase />
                </el-icon>
                <span>职位: {{ userdetail.position }}</span>
            </div>
            <div class="divider"></div>
            <div class="user-row user-contact">
                <el-icon>
                    <Phone />
                </el-icon>
                <span>联系方式: {{ userdetail.phone }}</span>
            </div>
            <div class="user-row user-join-date">
                <el-icon>
                    <Calendar />
                </el-icon>
                <span>创建日期: {{ userdetail.created_at }}</span>
            </div>
            <div class="user-row user-last-login">
                <el-icon>
                    <Clock />
                </el-icon>
                <span>上次登录: {{ userdetail.last_login }}</span>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { UserFilled, OfficeBuilding, Briefcase, Phone, Calendar, Clock } from '@element-plus/icons-vue'
const userStore = useUserStore()
const userdetail = ref(userStore.user_detail)
</script>

<style scoped lang="scss">
.user-profile {
    display: flex;
    align-items: flex-start;
    padding: 28px 24px;
    background: linear-gradient(135deg, #f7fbff 60%, #e3f2fd 100%);
    border-radius: 14px;
    box-shadow: 0 4px 16px rgba(64, 158, 255, 0.10);
    width: 420px;
    transition: background 0.3s;

    .el-avatar {
        box-shadow: 0 2px 8px rgba(64, 158, 255, 0.10);
        border: 2px solid #fff;
        background: #fff;
    }

    .user-info {
        display: flex;
        flex-direction: column;
        gap: 10px;
        width: 100%;

        .user-row {
            display: flex;
            align-items: center;
            font-size: 15px;
            color: #333;
            line-height: 1.7;
            background: #f5faff;
            border-radius: 6px;
            padding: 6px 14px;
            box-sizing: border-box;
            transition: background 0.2s, color 0.2s;
            gap: 8px;

            svg {
                font-size: 18px;
                color: #409eff;
            }
        }

        .user-id {
            font-size: 18px;
            font-weight: 700;
            color: #1976d2;
            background: #e3f2fd;

            svg {
                color: #1976d2;
            }
        }

        .user-last-login {
            color: #888;
            background: #f0f4f8;

            svg {
                color: #888;
            }
        }

        .divider {
            height: 1px;
            background: linear-gradient(90deg, #e3f2fd 0%, #fff 100%);
            margin: 8px 0;
            border-radius: 1px;
        }
    }
}

@media (max-width: 500px) {
    .user-profile {
        flex-direction: column;
        align-items: center;
        // padding: 16px 6px;
        min-width: 0;
        max-width: 100%;

        .el-avatar {
            margin-right: 0;
            margin-bottom: 16px;
        }

        .user-info {
            width: 100%;
            align-items: center;
        }
    }
}
</style>