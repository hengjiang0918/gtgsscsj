<template>
    <div class="inquiry-content" v-if="canApprove">
        <div class="compare-section">
            <!-- 设备信息表格 - 添加动画 -->
            <transition name="fade-slide" appear>
                <el-form label-width="100px" ref="formRef" :model="{ equipmentList: equipment_list }">
                    <transition name="table-expand" mode="out-in">
                        <div class="equipment-info-section">
                            <!-- 设备表格 -->
                            <el-table v-if="equipment_list.length > 0" :data="equipment_list" style="width: 100%; "
                                :header-cell-style="{
                                    backgroundColor: '#667eea',
                                    color: 'white',
                                    fontWeight: 'bold',
                                    textAlign: 'center',
                                }" :cell-style="{ textAlign: 'center', }" :row-class-name="getEquipmentRowClassName">

                                <el-table-column label="名称" align="center" header-align="center">
                                    <template #default="scope">
                                        <div class="equipment-name-cell">
                                            <span>{{ scope.row.equipment_name }}</span>
                                        </div>
                                    </template>
                                </el-table-column>

                                <el-table-column label="品牌" align="center" header-align="center">
                                    <template #default="scope">
                                        <div class="equipment-brand-cell">
                                            <span>{{ scope.row.brand }}</span>
                                        </div>
                                    </template>
                                </el-table-column>

                                <el-table-column label="型号" align="center" header-align="center">
                                    <template #default="scope">
                                        <div class="equipment-model-cell">
                                            <span>{{ scope.row.model }}</span>
                                        </div>
                                    </template>
                                </el-table-column>

                                <el-table-column label="数量" width="120" align="center" header-align="center">
                                    <template #default="scope">
                                        <div class="equipment-quantity-cell">
                                            <span class="quantity-badge">{{ scope.row.quantity }}</span>
                                        </div>
                                    </template>
                                </el-table-column>

                                <el-table-column label="规格/要求" align="center" header-align="center">
                                    <template #default="scope">
                                        <div class="equipment-spec-cell">
                                            <span>{{ scope.row.spec }}</span>
                                        </div>
                                    </template>
                                </el-table-column>
                            </el-table>
                        </div>
                    </transition>

                </el-form>
            </transition>

            <!-- 供应商信息表格 - 移除动画，直接显示 -->
            <transition name="fade-slide" appear :style="{ 'transition-delay': '0.2s' }">
                <el-form ref="supplierFormRef" :model="{ supplierList: equipment_supply }">
                    <div class="supplier-info-section">
                        <div class="supplier-header">
                            <div class="header-title">
                                <el-icon size="20" color="#409eff">
                                    <Shop />
                                </el-icon>
                                <h4>供应商报价管理</h4>
                            </div>
                            <el-button v-if="localEdit" type="primary" size="small" @click="addSupplier" icon="Plus"
                                class="add-supplier-btn">
                                添加供应商
                            </el-button>
                        </div>

                        <!-- 供应商表格容器 - 移除动画包装 -->
                        <div class="supplier-table-wrapper">
                            <!-- 直接显示表格，无动画 -->
                            <el-table :data="equipment_supply" border style="width: 100%;" class="supplier-table"
                                :header-cell-style="{
                                    backgroundColor: '#667eea',
                                    color: 'white',
                                    fontWeight: 'bold',
                                    textAlign: 'center',
                                    padding: '12px 8px'
                                }" :cell-style="{ textAlign: 'center', padding: '10px 6px' }"
                                :row-class-name="getSupplierRowClassName">

                                <!-- 供应商选择列 -->
                                <el-table-column label="供应商" align="center" min-width="200px" header-align="center">
                                    <template #default="scope">
                                        <div class="supplier-select-cell">
                                            <el-form-item style="margin:0; width: 100%;" align="center">
                                                <!-- 已完成报价或不可编辑时显示为文本 -->
                                                <div v-if="scope.row.if_finish == 1 || !localEdit"
                                                    class="supplier-display-text">

                                                    {{ scope.row.supplier_name || '未选择供应商' }}

                                                </div>

                                                <!-- 可编辑状态下的选择器 -->
                                                <el-select v-else :model-value="scope.row.supplier_id"
                                                    placeholder="请选择供应商" style="width:100%;" filterable
                                                    @update:model-value="val => handleSupplierChange(val, scope.$index)"
                                                    class="supplier-select">
                                                    <el-option v-for="item in supplier_list" :key="item.supplier_id"
                                                        :label="item.supplier_name" :value="item.supplier_id">
                                                        <span class="option-content">
                                                            <el-icon>
                                                                <OfficeBuilding />
                                                            </el-icon>
                                                            {{ item.supplier_name }}
                                                        </span>
                                                    </el-option>
                                                </el-select>
                                            </el-form-item>
                                        </div>
                                    </template>
                                </el-table-column>

                                <!-- 报价状态列 -->
                                <el-table-column label="报价状态" align="center" min-width="120px" header-align="center">
                                    <template #default="scope">
                                        <div class="status-cell-wrapper">
                                            <transition name="fade-status" mode="out-in">
                                                <el-tag v-if="scope.row.if_finish == 1 && scope.row.supplier_id != ''"
                                                    type="success" effect="dark" class="status-tag success-tag"
                                                    key="quoted">
                                                    <span>已报价</span>
                                                </el-tag>
                                                <el-tag
                                                    v-else-if="scope.row.if_finish == 0 && scope.row.supplier_id != ''"
                                                    type="warning" effect="dark" class="status-tag warning-tag"
                                                    key="qrcode">
                                                    <span>待报价</span>
                                                </el-tag>
                                                <el-tag
                                                    v-else-if="scope.row.if_finish == 0 && scope.row.supplier_id == ''"
                                                    type="info" effect="plain" class="status-tag info-tag" key="empty">

                                                    <span>未选择</span>
                                                </el-tag>
                                            </transition>
                                        </div>
                                    </template>
                                </el-table-column>

                                <!-- 操作列 -->
                                <el-table-column label="操作管理" align="center" min-width="180" header-align="center">
                                    <!-- 删除操作子列 -->
                                    <el-table-column label="删除" align="center" header-align="center">
                                        <template #default="scope">
                                            <el-button type="danger" @click="saveSupply(scope.row, scope.$index)"
                                                :disabled="scope.row.or_choose == 0 || status == 2" class="delete-btn"
                                                size="small">
                                                <el-icon>
                                                    <Delete />
                                                </el-icon>
                                                删除
                                            </el-button>
                                        </template>
                                    </el-table-column>
                                    <!-- 淘汰操作子列 -->
                                    <el-table-column label="淘汰" align="center" header-align="center">
                                        <template #default="scope">
                                            <el-button type="success" v-if="scope.row.or_choose == 0"
                                                @click="eliminateSupplier(scope.row, 1)" class="reset-btn" size="small"
                                                :disabled="scope.row.if_finish == 0 || status == 2">
                                                <el-icon>
                                                    <Check />
                                                </el-icon>
                                                启用
                                            </el-button>
                                            <el-button type="warning" v-else @click="eliminateSupplier(scope.row, 0)"
                                                class="reset-btn" size="small"
                                                :disabled="scope.row.if_finish == 0 || status == 2">
                                                <el-icon>
                                                    <Close />
                                                </el-icon>
                                                淘汰
                                            </el-button>
                                        </template>
                                    </el-table-column>
                                    <!-- 重新报价操作子列 -->
                                    <el-table-column label="重新报价" align="center" header-align="center">
                                        <template #default="scope">
                                            <el-button type="warning" @click="resetQuote(scope.row)"
                                                :disabled="scope.row.if_finish == 0 || scope.row.or_choose == 0 || status == 2"
                                                class="reset-btn" size="small">
                                                <el-icon>
                                                    <Refresh />
                                                </el-icon>
                                                重新报价
                                            </el-button>
                                        </template>
                                    </el-table-column>
                                </el-table-column>

                                <!-- 链接操作列 -->
                                <el-table-column label="链接操作" align="center" min-width="120" header-align="center">
                                    <template #default="scope">
                                        <div class="link-cell-wrapper">
                                            <div v-if="scope.row.supplier_id != ''" class="link-actions">
                                                <el-button type="primary" size="small"
                                                    @click="copyQuoteUrl(scope.row.quote_url)" icon="DocumentCopy"
                                                    class="action-btn copy-btn">
                                                    复制链接
                                                </el-button>
                                                <el-button type="success" size="small"
                                                    @click="openQuoteUrl(scope.row.quote_url)" icon="Link"
                                                    class="action-btn open-btn">
                                                    打开页面
                                                </el-button>
                                            </div>
                                            <div v-else class="link-empty">
                                                <el-tag type="info" size="default" effect="plain" class="empty-tag">
                                                    <el-icon>
                                                        <Minus />
                                                    </el-icon>
                                                    暂无链接
                                                </el-tag>
                                            </div>
                                        </div>
                                    </template>
                                </el-table-column>
                            </el-table>
                        </div>
                    </div>
                </el-form>
            </transition>
        </div>

        <!-- 操作按钮 - 添加动画 -->
        <div class="approval-actions">
            <el-button v-if="can_approve && status == 2 && finish_prepay != 1" type="danger"
                @click="handleReject">退回</el-button>
            <el-button v-if="canSubmit && is_last_step" type="success" @click="handleApproveConfirm(2)">通过</el-button>
            <el-button type="danger" @click="drawerVisible = true">查看全部报价单</el-button>
            <el-button @click="handleBack">返回</el-button>
        </div>
    </div>

    <!-- 对话框保持不变 -->
    <InquiryDialog v-model="qrcodeModalVisible" :qrcodeUrl="currentQRCodeUrl" :supply_name="supply_name" />
    <InquiryDrawer v-if="drawerVisible" v-model="drawerVisible" :purchase_id="purchase_id" direction="btt" />
</template>

<script setup>
import { reactive, ref, onMounted, computed, watch } from 'vue'
import InquiryDialog from '@/components/InquiryDialog.vue'
import InquiryDrawer from '@/components/InquiryDrawer.vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import api from '@/api';
import { useUserStore } from '@/stores/userStore';
// 二维码弹窗相关
const qrcodeModalVisible = ref(false);
const supply_name = ref('');
const currentQRCodeUrl = ref('');
const drawerVisible = ref(false)
const finish_prepay = ref('')
const userStore = useUserStore()
const router = useRouter()
const canApprove = computed(() => {
    if (userStore.role == 1) {
        return can_approve.value; // 工厂相关人员不允许审批
    } else {
        return true
    }

});
const props = defineProps({
    canEdit: Boolean,
    status: Number,
    canSubmit: Boolean,
    purchase_id: String,
    currentStepname: String
});

const equipment_list = ref([]);
const equipment_supply = ref([]);
const handleReject = async () => {
    try {
        await api.approveStepReject({
            purchase_id: props.purchase_id,
            step_order: 1,
            operator_id: userStore.user_id,
            operator: userStore.user_name,
        })

        emit('data-change')
        ElMessage.success('审批驳回成功')
    } catch (err) {
        console.error('审批操作失败', err)
        ElMessage.error('审批操作失败，请稍后重试')
    }
}
onMounted(() => {
    // 等页面渲染出来以后再调用
    nextTick(() => {
        if (!canApprove.value) return;
        getPurchaseDetail();
        getSupplierList();
        // 初始化一个默认供应商
        addSupplier();
    });
});

// 简化为比价单数组，移除轮次概念

const formRef = ref({});
const is_last_step = ref(false);
const can_approve = ref(false);
const approver_department_type = ref('');
const approver_role = ref('');
const localEdit = computed(() => {
    return props.canEdit && userStore.role != 1 && can_approve.value;
})

const emit = defineEmits(['data-change', 'handle-approve']);
const supplier_list = ref([]);
const getPurchaseDetail = async () => {
    try {
        const data = await api.purchaseDetail({
            purchase_id: props.purchase_id,
            detail_type: 'inquiry',
            step_order: 1,
            user_id: userStore.user_id
        });
        equipment_list.value = data.equipment_list;
        is_last_step.value = data.is_last_step;
        can_approve.value = data.can_approve;
        finish_prepay.value = data.finish_prepay;
        approver_department_type.value = data.approver_department_type;
        approver_role.value = data.approver_role;

        // 处理equipment_supply
        if (Array.isArray(data.supply_choose) && data.supply_choose.length > 0) {
            equipment_supply.value = data.supply_choose.map(item => ({
                supplier_id: item.supplier_id || '',
                supplier_name: item.supplier_name || '',
                created_at: item.created_at || '',
                if_finish: item.if_finish ?? false,
                qrcode_url: item.qr_url || '',
                quote_url: item.qr_content || '',
                or_choose: item.or_choose || 0, // 新增：是否被选中
            }));


        } else {
            equipment_supply.value = [];
            addSupplier();
        }
        console.log('获取采购详情成功', equipment_supply);

    } catch (err) {
        console.error('获取采购详情失败', err);
    }
};
const addSupplier = () => {
    equipment_supply.value.push({
        supplier_name: '',
        supplier_id: '',
        qrcode_url: '',
        if_finish: 0,
        quote_url: '',          // 新增：报价页面网址
        created_at: ''
    });
};
const saveSupply = (item, index) => {

    if (item.supplier_id) {
        api.saveSupplyChoose({
            purchase_id: props.purchase_id,
            supplier_id: item.supplier_id,
            supplier_name: item.supplier_name,
            mode: 0,
        }).then(() => {
            const index = equipment_supply.value.findIndex(s => s.supplier_id === item.supplier_id);
            if (index !== -1) {
                equipment_supply.value.splice(index, 1);
            }
            ElMessage.success("操作成功")
        }).catch((e) => {
            ElMessage.error('审批失败，请稍后重试', e)
        }).finally(() => {
        })
    } else {
        equipment_supply.value.splice(index, 1);
    }
};
const resetQuote = (item) => {
    api.resetSupply({
        purchase_id: props.purchase_id,
        supplier_id: item.supplier_id
    }).then(() => {
        getPurchaseDetail()

        ElMessage.success("报价重置成功");
    }).catch((e) => {
        ElMessage.error('报价重置失败，请稍后重试', e)
    });
};
const openQuoteUrl = (url) => {
    if (url) {
        window.open(url, '_blank');
    } else {
        ElMessage.warning('报价链接无效');
    }
};

// 修改供应商变更处理方法
const handleSupplierChange = async (val, supplierIndex) => {
    const supplier = equipment_supply.value[supplierIndex];


    if (val) {
        const supplierId = val;
        const selectedSupplier = supplier_list.value.find(item => item.supplier_id === supplierId);

        if (selectedSupplier) {


            try {
                api.getScanQrcode({
                    supplier_id: supplierId,
                    purchase_id: props.purchase_id,
                }).then((response) => {
                    supplier.qrcode_url = response.qr_url || '';
                    supplier.quote_url = response.qr_content || '';
                    api.saveSupplyChoose({
                        purchase_id: props.purchase_id,
                        supplier_id: supplierId,
                        supplier_name: selectedSupplier.supplier_name,
                        mode: 1
                    }).then(() => {
                        // 只有成功后才更新
                        supplier.supplier_id = supplierId;
                        supplier.supplier_name = selectedSupplier.supplier_name;


                        ElMessage.success("操作成功");
                    });
                });



            } catch (error) {
                supplier.loading = false;
                // 强制刷新组件，恢复显示原值
                nextTick(() => {
                    // 如果需要强制刷新select组件的显示
                    const selectRef = document.querySelector(`[data-supplier-index="${supplierIndex}"]`);
                    if (selectRef) {
                        selectRef.blur();
                    }
                });
            }
        }
    } else {
        // 清空选择的逻辑
        supplier.supplier_id = '';
        supplier.supplier_name = '';
        supplier.qrcode_url = '';
        supplier.quote_url = '';
    }
};

const getSupplierList = async () => {
    try {
        const data = await api.supplierList({
        });
        supplier_list.value = data.supplier_list;
    } catch (err) {
        console.error('获取发货详情失败', err);
    }
};
const handleApproveConfirm = (type) => {
    api.approveStepPass({
        purchase_id: props.purchase_id,
        flow_type: 1, // 0表示采购流程
        operator_id: userStore.user_id,
        operator: userStore.user_name,
        is_last_step: is_last_step.value,
    }).then(() => {
        getPurchaseDetail()
        emit('data-change');
        ElMessage.success(type === 2 ? '审批通过成功' : '保存成功')


    }).catch((e) => {
        ElMessage.error('审批失败，请稍后重试', e)
    }).finally(() => {
    })
}

// 复制链接到剪贴板
const copyQuoteUrl = async (url) => {
    if (!url) {
        ElMessage.warning('链接为空，无法复制');
        return;
    }

    try {
        // 使用现代浏览器的 Clipboard API
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(url);
            ElMessage.success('链接已复制到剪贴板');
        } else {
            // 降级方案：使用传统的复制方法
            const textArea = document.createElement('textarea');
            textArea.value = url;
            textArea.style.position = 'fixed';
            textArea.style.opacity = '0';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();

            try {
                document.execCommand('copy');
                ElMessage.success('链接已复制到剪贴板');
            } catch (err) {
                ElMessage.error('复制失败，请手动复制');
                console.error('复制失败:', err);
            }

            document.body.removeChild(textArea);
        }
    } catch (err) {
        ElMessage.error('复制失败，请手动复制');
        console.error('复制链接失败:', err);
    }
};
const handleBack = () => {
    router.go(-1)
}


// 表格行样式类名
const getEquipmentRowClassName = ({ row, rowIndex }) => {
    return `equipment-row-${rowIndex % 2 === 0 ? 'even' : 'odd'}`;
};

const getSupplierRowClassName = ({ row, rowIndex }) => {
    if (row.or_choose == 0) {
        console.log('供应商行状态:', row.or_choose);
        return `row-out`;
    }
    return '';
};
const eliminateSupplier = (row, or_choose) => {
    console.log('Eliminating supplier:', row.supplier_id);
    api.updateSupplyChoose({
        purchase_id: props.purchase_id,
        supplier_id: row.supplier_id,
        or_choose: or_choose
    }).then((data) => {
        // 更新本地数据
        row.or_choose = data.updated_record.or_choose;
        console.log('Eliminate supplier response:', data);
        ElMessage.success(or_choose ? '启用成功' : '淘汰成功');
    }).catch((e) => {
        ElMessage.error('操作失败，请稍后重试', e);
    });
};
</script>

<style lang="scss" scoped>
@import '../style/indexPage.scss';
$primary-gradient: linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%);
$card-shadow: 0 10px 30px rgba(53, 134, 248, 0.2);
$border-radius-lg: 20px;
$border-radius-md: 15px;
$transition-default: all 0.3s ease;

.inquiry-content {
    height: 100%;

    .compare-section {

        // 淡入滑动动画
        .fade-slide-enter-active {
            transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .fade-slide-enter-from {
            opacity: 0;
            transform: translateY(30px);
        }

        .fade-slide-enter-to {
            opacity: 1;
            transform: translateY(0);
        }
    }
}

.equipment-info-section {
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    margin-bottom: 20px;
}

.supplier-info-section {
    border-radius: 8px;
    margin-bottom: 20px;


    .supplier-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
        padding-bottom: 8px;
        border-bottom: 1px solid #e5e7eb;

        .header-title {
            display: flex;
            align-items: center;
            gap: 8px;

            h4 {
                margin: 0;
                color: #333;
                font-size: 16px;
                font-weight: bold;
            }
        }

        .add-supplier-btn {
            background: #409eff;
            border: none;
            border-radius: 4px;
            padding: 4px 12px;
            color: #fff;
            font-weight: 500;
            transition: background 0.2s;

            &:hover {
                background: #337ecc;
            }
        }
    }



    // :deep(.el-table__cell) {
    //     border: 1px solid #a9c3f7;
    //     background-color: #f0f9ff;
    // }

    .supplier-table-wrapper {
        border-radius: 12px;
        overflow: hidden;
        background: #fff;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

        .supplier-display-text {
            width: 100%;
            text-align: center;
            color: #667eea;
            font-weight: 600;
        }

        .supplier-table {
            border-radius: 6px;
            overflow: hidden;

            // 表格行样式
            :deep(.el-table__row) {

                // height: 100px !important;
                &.row-out {
                    .supplier-display-text {
                        color: #cfd6f7;
                    }

                    background-color: #f0f9ff !important;

                    .el-table__cell {
                        background-color: #f0f9ff !important;
                    }
                }
            }



            .supplier-select {
                :deep(.el-input__wrapper) {
                    border-radius: 4px;
                    border: 1px solid #e5e7eb;
                }
            }

            .option-content {
                display: flex;
                align-items: center;
                gap: 4px;
            }
        }
    }

}

.status-tag {
    border-radius: 4px;
    padding: 2px 8px;
    font-weight: 500;
    font-size: 13px;
    gap: 2px;
    display: flex !important;



}



.delete-btn {
    background: #f56c6c;
    border: none;
    border-radius: 4px;
    color: white;
    font-weight: 500;
    padding: 4px 10px;
    transition: background 0.2s;

    &:hover:not(:disabled) {
        background: #c0392b;
    }

    &:disabled {
        background: #ccc;
        cursor: not-allowed;
    }
}

.qrcode-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;

    .qrcode-container {
        border-radius: 6px;
        overflow: hidden;
        border: 1px solid #e5e7eb;
        background: #fff;

        .qrcode-image {
            border-radius: 4px;
        }
    }

    .qrcode-text {
        display: flex;
        align-items: center;
        gap: 2px;
        font-size: 12px;
        color: #666;
    }

    .qrcode-error {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 80px;
        height: 80px;
        background: #f3f4f6;
        color: #aaa;
        font-size: 10px;
        border-radius: 4px;
        border: 1px dashed #ccc;

        span {
            margin-top: 2px;
        }
    }
}

.quoted-qr,
.empty-qr {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;

    .success-icon,
    .empty-icon {
        padding: 4px;
        border-radius: 50%;
        background: #f3f4f6;
    }

    .status-text {
        font-size: 12px;
        font-weight: 500;

        &.success {
            color: #67c23a;
        }

        &.empty {
            color: #aaa;
        }
    }
}

.link-actions {
    display: flex;
    // flex-direction: column;
    gap: 4px;
    align-items: center;
    justify-content: center;

    .action-btn {
        width: 80px;
        height: 50px;
        font-size: 12px;
        padding: 4px 8px;
        border-radius: 4px;
        font-weight: 500;
        margin: 0 !important;

        &.copy-btn {
            background: #409eff;
            border: none;
            color: #fff;

            &:hover {
                background: #337ecc;
            }
        }

        &.open-btn {
            background: #67c23a;
            border: none;
            color: #fff;

            &:hover {
                background: #409933;
            }
        }
    }
}

.link-completed,
.link-empty {
    display: flex;
    justify-content: center;

    .completed-tag {
        background: #67c23a;
        border: none;
        border-radius: 4px;
        padding: 4px 10px;
        color: #fff;
        font-weight: 500;
    }

    .empty-tag {
        border-radius: 4px;
        padding: 4px 10px;
        font-weight: 400;
        color: #aaa;
        border: 1px solid #e5e7eb;
        background: #f9f9f9;
    }
}

.qrcode-modal-content {
    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: center;
}

.fade-status-enter-active,
.fade-status-leave-active {
    transition: opacity 0.35s cubic-bezier(.55, 0, .1, 1), transform 0.35s cubic-bezier(.55, 0, .1, 1);
}

.fade-status-enter-from,
.fade-status-leave-to {
    opacity: 0;
    transform: translateY(10px) scale(0.98);
}

.fade-status-enter-to,
.fade-status-leave-from {
    opacity: 1;
    transform: translateY(0) scale(1);
}
</style>