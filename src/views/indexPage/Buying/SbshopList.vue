<template>
    <div class="purchase-list-container">
        <!-- 页面头部 -->


        <!-- 列表卡片 -->
        <div class="list-card">
            <div class="card-header">
                <div class="header-title">
                    <el-icon>
                        <Document />
                    </el-icon>
                    <span>采购申请记录</span>
                </div>
            </div>

            <div class="table-container">
                <el-table :data="purchaseList" class="purchase-table" stripe highlight-current-row
                    @row-click="goToApprovalPage" :header-cell-style="{
                        backgroundColor: '#f8fafc',
                        color: '#374151',
                        fontWeight: '600',
                        borderBottom: '2px solid #e5e7eb',
                        textAlign: 'center'
                    }" :cell-style="{ textAlign: 'center', padding: '16px 8px' }" :row-style="{ cursor: 'pointer' }"
                    empty-text="暂无采购申请记录">

                    <el-table-column label="工厂" prop="factory" min-width="100" align="center">
                        <template #default="scope">
                            <div class="factory-cell">
                                <el-tag type="primary" size="small">{{ scope.row.factory }}</el-tag>
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column label="项目" prop="project_name" min-width="200" align="center">
                        <template #default="scope">
                            <span>{{ scope.row.project_name }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="采购描述" prop="mold" min-width="100" align="center">
                        <template #default="scope">
                            <span>{{ scope.row.description }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="申购部门" prop="filiale" min-width="120" align="center">
                        <template #default="scope">
                            <div class="department-cell">
                                {{ scope.row.filiale }}
                            </div>
                        </template>
                    </el-table-column>


                    <el-table-column label="立项时间" prop="updated_at" min-width="120" align="center">
                        <template #default="scope">
                            <div class="date-cell">
                                <el-icon>
                                    <Calendar />
                                </el-icon>
                                <span>{{ scope.row.updated_at }}</span>
                            </div>
                        </template>
                    </el-table-column>



                    <el-table-column label="当前状态" prop="current_step_name" min-width="120" align="center">
                        <template #default="scope">
                            <div class="status-cell">
                                <div class="status-indicator"
                                    :class="`status-${getStatusType(scope.row.current_step_name)}`"></div>
                                <span :class="`status-text-${getStatusType(scope.row.current_step_name)}`">
                                    {{ scope.row.current_step_name ? scope.row.current_step_name : '采购完成' }}
                                </span>
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" width="100" align="center" v-if="role != 1">
                        <template #default="scope">
                            <el-button type="danger" size="small" @click.stop="deletePurchase(scope.row.purchase_id)"
                                class="delete-btn">
                                <el-icon>
                                    <Delete />
                                </el-icon>
                                删除
                            </el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { List, Document, Calendar, Delete } from '@element-plus/icons-vue';
import api from '@/api'
import { useUserStore } from '@/stores/userStore';

const router = useRouter();
const activeItemId = ref(null);
const purchaseList = ref([]);
const userStore = useUserStore();
const role = userStore.role;

// 获取采购列表
const getPurchaseList = () => {
    api.purchaseList({
        user_id: userStore.user_id,
        role: userStore.role
    })
        .then(data => {
            console.log('采购列表数据', data)
            purchaseList.value = data.purchaseList
        })
        .catch(err => {
            console.error('获取采购列表失败', err);
        })
}
const getStatusType = (status) => {
    switch (status) {
        case '立项审批':
            return 'approval'
        case '询价比价':
            return 'inquiry'
        case '合同签订':
            return 'contract'
        case '预付款审批':
            return 'prepay'
        case '发货状态':
            return 'delivery'
        case '到货验收':
            return 'acceptance'
        case '付款情况':
            return 'payment'
        default:
            return 'finish'
    }
}
// 删除采购记录
const deletePurchase = (purchase_id) => {
    ElMessageBox.confirm(
        '确定要删除这条采购记录吗？',
        '删除确认',
        {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
        }
    )
        .then(() => {
            api.deletePurchase({
                purchase_id: purchase_id
            })
                .then(() => {
                    ElMessage.success('删除成功');
                    getPurchaseList();
                })
                .catch(err => {
                    console.error('删除失败', err);
                    ElMessage.error('删除失败');
                });
        })
        .catch(() => {
        });
};

// 跳转到审批页面
const goToApprovalPage = (item) => {
    console.log('跳转到审批页面', item.purchase_id);
    router.push({
        name: 'ApprovalPage',
        query: { purchase_id: item.purchase_id },
    });
};
onMounted(() => {
    getPurchaseList();
});
</script>

<style lang="scss" scoped>
.purchase-list-container {
    // min-height: 100vh;

    // 列表卡片
    .list-card {
        background: white;
        border-radius: 12px;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
        border: 1px solid #f0f2f5;
        overflow: hidden;

        .card-header {
            background: #fafbfc;
            padding: 16px 24px;
            border-bottom: 1px solid #e4e7ed;

            .header-title {
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 16px;
                font-weight: 600;
                color: #303133;

                .el-icon {
                    color: #409eff;
                    font-size: 18px;
                }
            }
        }

        .table-container {
            .purchase-table {
                :deep(.el-table__header-wrapper) {
                    .el-table__header {
                        th {
                            background: #f8f9fa !important;
                            color: #606266 !important;
                            font-weight: 600 !important;
                            border-bottom: 2px solid #ebeef5 !important;
                        }
                    }
                }

                :deep(.el-table__body-wrapper) {
                    .el-table__body {
                        tr {
                            transition: all 0.3s ease;

                            &:hover {
                                background: #f5f7fa !important;
                                transform: translateY(-1px);
                                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                            }

                            td {
                                border-bottom: 1px solid #f0f2f5 !important;
                            }
                        }
                    }
                }

                // 单元格样式
                .factory-cell {
                    .el-tag {
                        font-weight: 500;
                    }
                }

                .department-cell {
                    font-weight: 500;
                    color: #606266;
                }

                .description-cell {
                    max-width: 200px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    color: #303133;
                }

                .date-cell {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 4px;
                    color: #909399;
                    font-size: 14px;

                    .el-icon {
                        font-size: 14px;
                    }
                }

                .status-cell {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;

                    .status-indicator {
                        &.status-approval {
                            background: #e6a23c;
                        }

                        &.status-inquiry {
                            background: #73a858;
                        }

                        &.status-contract {
                            background: #f56c6c;
                        }

                        &.status-prepay {
                            background: #409eff;
                        }

                        &.status-delivery {
                            background: #36cfc9;
                        }

                        &.status-acceptance {
                            background: #909399;
                        }

                        &.status-payment {
                            background: #f7ba2a;
                        }

                        &.status-finish {
                            background: #06f040;
                        }
                    }

                    .status-text-approval {
                        color: #e6a23c;
                        font-weight: 600;
                    }

                    .status-text-inquiry {
                        color: #73a858;
                        font-weight: 600;
                    }

                    .status-text-contract {
                        color: #f56c6c;
                        font-weight: 600;
                    }

                    .status-text-prepay {
                        color: #409eff;
                        font-weight: 600;
                    }

                    .status-text-delivery {
                        color: #36cfc9;
                        font-weight: 600;
                    }

                    .status-text-acceptance {
                        color: #909399;
                        font-weight: 600;
                    }

                    .status-text-payment {
                        color: #f7ba2a;
                        font-weight: 600;
                    }

                    .status-text-finish {
                        color: #06f040;
                        font-weight: 600;
                    }
                }

                .delete-btn {
                    background: #f56c6c;
                    border-color: #f56c6c;
                    color: white;
                    font-size: 12px;
                    padding: 6px 12px;

                    &:hover {
                        background: #f78989;
                        border-color: #f78989;
                        transform: scale(1.05);
                    }

                    .el-icon {
                        margin-right: 4px;
                    }
                }
            }
        }
    }
}

// 动画效果
@keyframes pulse {

    0%,
    100% {
        opacity: 1;
        transform: scale(1);
    }

    50% {
        opacity: 0.7;
        transform: scale(1.1);
    }
}

// 响应式设计
@media (max-width: 768px) {
    .purchase-list-container {
        padding: 16px;

        .page-header .header-content {
            padding: 16px 20px;
            flex-direction: column;
            gap: 16px;
            text-align: center;
        }

        .list-card {
            .card-header {
                padding: 12px 16px;
            }

            .table-container {
                overflow-x: auto;

                .purchase-table {
                    min-width: 800px;
                }
            }
        }
    }
}

// 空状态样式
:deep(.el-table__empty-block) {
    padding: 60px 0;

    .el-table__empty-text {
        color: #909399;
        font-size: 14px;
    }
}
</style>