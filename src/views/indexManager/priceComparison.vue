<template>
    <div class="purchase-list-container">
        <!-- 列表卡片 -->
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

                <el-table-column label="项目" prop="factory" min-width="100" align="center">
                    <template #default="scope">
                        <div class="factory-cell">
                            <el-tag type="primary" size="large">{{ scope.row.project_name }}</el-tag>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column label="采购描述" prop="mold" min-width="100" align="center">
                    <template #default="scope">
                        <span>{{ scope.row.description }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="采购设备" prop="equipment_names" min-width="300" align="center">
                    <template #default="scope">
                        <div class="status-cell">
                            <span>{{ scope.row.equipment_names }}</span>
                        </div>
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <priceDrawer v-if="drawerVisible" v-model="drawerVisible" :purchase_id="purchase_id" direction="btt" />
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/api'
import priceDrawer from './priceDrawer.vue'
const router = useRouter();
const purchaseList = ref([]);
const drawerVisible = ref(false)
const purchase_id = ref('');
// 获取采购列表
const getPurchaseList = () => {
    api.purchaseList({
    })
        .then(data => {
            console.log('采购列表数据', data)
            purchaseList.value = data.purchaseList
        })
        .catch(err => {
            console.error('获取采购列表失败', err);
        })
}

// 跳转到审批页面
const goToApprovalPage = (item) => {
    purchase_id.value = item.purchase_id;
    drawerVisible.value = true;
};
onMounted(() => {
    getPurchaseList();
});
</script>

<style lang="scss" scoped>
.purchase-list-container {
    // min-height: 100vh;


    .table-container {
        background: white;
        border-radius: 12px;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
        border: 1px solid #f0f2f5;
        overflow: hidden;

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
                        background: #67c23a;
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

                    &.status-unknown {
                        background: #d3d3d3;
                    }
                }

                .status-text-approval {
                    color: #e6a23c;
                    font-weight: 600;
                }

                .status-text-inquiry {
                    color: #67c23a;
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

                .status-text-unknown {
                    color: #d3d3d3;
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