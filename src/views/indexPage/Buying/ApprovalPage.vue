<template>
  <div class="approval-container">

    <el-card class="approval-card">
      <!-- 流程概览 -->
      <div class="process-overview">
        <!-- 步骤条 -->
        <el-steps v-if="processSteps && processSteps.length" :active="activeStepIndex" align-center
          finish-status="success" process-status="process" class="custom-steps steps-with-payment">
          <!-- 普通步骤 -->
          <el-step v-for="(step, index) in processSteps.slice(0, processSteps.length - 1)" :key="index"
            :title="step.name" :description="step.description" :status="getStepStatus(index)"
            @click.native="handleStepClick(index)" :class="{ 'last-step': index === processSteps.length - 2 }"
            style="cursor: pointer;">
            <template #description>
              <div class="step-detail">
                <div class="step-description">{{ step.description || '' }}</div>
                <el-tag :type="getStatusType(index)" size="small" effect="plain">
                  {{ getStatusText(index) }}
                </el-tag>
              </div>
            </template>
          </el-step>
          <!-- 付款步骤 -->
          <el-step :title="processSteps[processSteps.length - 1]?.name || '付款'"
            :description="processSteps[5]?.description"
            :status="getPaymentStepStatus(processSteps[processSteps.length - 1]?.status)" class="payment-step"
            @click.native="handleStepClick(processSteps.length - 1)" style="cursor: pointer;">
            <template #description>
              <div class="step-detail">
                <el-tag :type="getStatusType(processSteps.length - 1)" size="small" effect="plain">
                  {{ getStatusText(processSteps.length - 1) }}
                </el-tag>
              </div>
            </template>
          </el-step>
        </el-steps>
      </div>
      <!-- 立项审批步骤组件 -->
      <ProjectStep v-if="currentStep.step_order == '0'" :can-edit="canEdit" :can-submit="canSubmit" :status="status"
        :purchase_id="purchase_id" :currentStepname="currentStep.name" @data-change="handleDataChange"
        @handle-approve="handleApprove" />
      <!-- 询价比价审批步骤组件 -->
      <InquiryStep v-if="currentStep.step_order == '1'" :can-edit="canEdit" :can-submit="canSubmit" :status="status"
        :purchase_id="purchase_id" :currentStepname="currentStep.name" @data-change="handleDataChange"
        @handle-approve="handleApprove" />
      <!-- 合同审批步骤组件 -->
      <ContractStep v-if="currentStep.step_order == '2'" :can-edit="canEdit" :can-submit="canSubmit" :status="status"
        :purchase_id="purchase_id" :currentStepname="currentStep.name" @data-change="handleDataChange"
        @handle-approve="handleApprove" />
      <!-- 预付款审批 -->
      <PrepayStep v-if="currentStep.step_order == '3'" :can-edit="canEdit" :can-submit="canSubmit" :status="status"
        :purchase_id="purchase_id" :currentStepname="currentStep.name" @data-change="handleDataChange"
        @handle-approve="handleApprove" />
      <!-- 发货审批 -->
      <ShippingStep v-if="currentStep.step_order == '4'" :can-edit="canEdit" :can-submit="canSubmit" :status="status"
        :purchase_id="purchase_id" :currentStepname="currentStep.name" @data-change="handleDataChange"
        @handle-approve="handleApprove" />
      <DeliveryStep v-if="currentStep.step_order == '5'" :can-edit="canEdit" :can-submit="canSubmit" :status="status"
        :purchase_id="purchase_id" :currentStepname="currentStep.name" @data-change="handleDataChange"
        @handle-approve="handleApprove" />

      <!-- 付款情况 -->
      <PaymentStep v-if="currentStep.step_order == '6'" :can-edit="canEdit" :can-submit="canSubmit" :status="status"
        :purchase_id="purchase_id" :currentStepname="currentStep.name" @data-change="handleDataChange"
        @handle-approve="handleApprove" />
      <!-- </div> -->
      <!-- 流程历史记录（当前步骤） -->
      <!-- <div class="approval-history">
        <h3>审批历史</h3>
        <el-timeline>
          <el-timeline-item v-for="(history, index) in currentStepHistory" :key="history.updated_at + '-' + index">
            <el-card>
              <h4 class="history-title">{{ history.stepName }}</h4>
              <div class="history-meta">
                <span>
                  <el-tag
                    :type="history.status === 2 ? 'success' : history.status === 1 ? 'warning' : history.status === 3 ? 'danger' : 'info'"
                    size="small" effect="plain">
                    {{ getStatusTextByStatus(history.status) }}
                  </el-tag>
                  <span class="history-operator">操作人：{{ history.operator }}</span>
                </span>
                <span class="history-time">{{ history.updated_at }}</span>
              </div>
              <p v-if="history.comment" class="history-comment">
                <i class="el-icon-edit" style="color:#409EFF;margin-right:4px;"></i>
                意见：{{ history.comment }}
              </p>
            </el-card>
          </el-timeline-item>
        </el-timeline>
      </div> -->
    </el-card>
  </div>
</template>

<script setup>
// -------------------- 依赖与工具 --------------------
import ProjectStep from './components/ProjectStep.vue'
import InquiryStep from './components/InquiryStep.vue'
import ContractStep from './components/ContractStep.vue'
import PrepayStep from './components/PrepayStep.vue'
import ShippingStep from './components/ShippingStep.vue'
import DeliveryStep from './components/DeliveryStep.vue'
import PaymentStep from './components/PaymentStep.vue'
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import api from '@/api'
import { useUserStore } from '@/stores/userStore'

// -------------------- 用户角色与路由 --------------------
// 当前用户角色（'staff' 员工 或 'leader' 领导）
const userStore = useUserStore()
// 路由相关
const currentStep = computed(() => {
  if (
    !processSteps.value ||
    !Array.isArray(processSteps.value) ||
    processSteps.value.length === 0 ||
    activeStepIndex.value < 0 ||
    activeStepIndex.value >= processSteps.value.length
  ) {
    return {}
  }
  return processSteps.value[activeStepIndex.value] || {}
})
const route = useRoute()
// -------------------- 表单数据与验证规则 --------------------
const approveType = ref(2) // 2: 通过, 1: 驳回
const approveLoading = ref(false)
// -------------------- 流程步骤数据 --------------------
// 流程步骤列表（每个步骤包含key、名称、描述）
const processSteps = ref([])

// 当前进行中的步骤索引
const currentStepIndex = ref(0)
// 当前查看的步骤索引
const activeStepIndex = ref(0)
const purchase_id = ref(route.query.purchase_id)

// -------------------- 页面初始化 --------------------
// 页面挂载时获取流程步骤和询价比价详情
onMounted(() => {
  getpurchaseSteps()

})

const getpurchaseSteps = () => {
  api.purchaseSteps({
    purchase_id: purchase_id.value
  })
    .then(data => {
      processSteps.value = data.steps;
      if (Array.isArray(data.steps)) {
        // 找到第一个 status == 1（进行中）的步骤索引
        const idx = data.steps.findIndex(step => step.status != 2)
        if (idx !== -1) {
          activeStepIndex.value = idx
          currentStepIndex.value = idx
        } else {
          // 如果没有进行中的，跳到第一个
          activeStepIndex.value = 0
          currentStepIndex.value = 0
        }
      }
    })
    .catch(err => {
      console.error('获取采购详情失败', err);
      // 错误已自动弹窗，这里可选写自定义处理
    })
}



// -------------------- 步骤条相关方法 --------------------
// 获取步骤状态对应的标签类型（颜色）
// 状态码统一映射
const STATUS_MAP = {
  0: { text: '未开始', type: 'info', step: 'wait' },
  1: { text: '进行中', type: 'warning', step: 'process' },
  2: { text: '已完成', type: 'success', step: 'success' },
  3: { text: '审批中', type: 'primary', step: 'process' }
}
const getStatusText = (statusOrIndex) => {
  let status = statusOrIndex
  if (typeof statusOrIndex === 'number' && processSteps.value[statusOrIndex])
    status = processSteps.value[statusOrIndex].status
  return STATUS_MAP[status]?.text || '未知状态'
}

const getStatusType = (statusOrIndex) => {
  let status = statusOrIndex
  if (typeof statusOrIndex === 'number' && processSteps.value[statusOrIndex])
    status = processSteps.value[statusOrIndex].status
  return STATUS_MAP[status]?.type || 'info'
}

const getStepStatus = (index) => {
  const step = processSteps.value[index]
  if (step && typeof step.status !== 'undefined') {
    return STATUS_MAP[step.status]?.step || 'wait'
  }
  if (index < currentStepIndex.value) return 'success'
  if (index === currentStepIndex.value) return 'process'
  return 'wait'
}

const getPaymentStepStatus = (status) => {
  return STATUS_MAP[status]?.step || 'wait'
}
// 步骤点击切换查看
const handleStepClick = (index) => {
  activeStepIndex.value = index
}

// -------------------- 当前步骤与表单 --------------------
// 当前步骤对象
// 当前步骤对象，防止越界和未初始化时报错

// 当前步骤是否可编辑（仅当前进行中的步骤可编辑）
const canEdit = computed(() => {
  const step = processSteps.value[activeStepIndex.value]

  return activeStepIndex.value === currentStepIndex.value && step && step.status == '1'
})
const status = computed(() => {
  const step = processSteps.value[activeStepIndex.value]

  return step.status
})
// 员工是否可提交（仅第一个步骤且可编辑时）
const canSubmit = computed(() => {
  const status = processSteps.value[activeStepIndex.value]?.status
  return status == 1 && canEdit.value
})
// -------------------- 审批历史记录 --------------------
// 当前步骤的历史记录
const currentStepHistory = computed(() => {
  if (!currentStep.value || typeof currentStep.value.progress !== 'object') return []
  return currentStep.value.progress || []
})


const handleDataChange = (data) => {
  getpurchaseSteps(); // 重新获取数据，确保同步
  console.log('数据变化:', data);
};

// -------------------- 审批操作 --------------------
// 审批（通过，拒绝）（领导操作）
const handleApprove = (type) => {
  approveType.value = type
  approveDialogVisible.value = true
}
function handleApproveConfirm({ type, comment }) {
  approveLoading.value = true
  api.approveStep({
    purchase_id: purchase_id.value,
    status: type,
    step_order: currentStep.value.step_order,
    operator_id: userStore.user_id,
    operator: userStore.user_name,
    comment
  }).then(() => {
    console.log('审批结果1:', type, comment);
    // 调用 InquiryStep 内的方法

    ElMessage.success(type === 2 ? '审批通过成功' : '审批驳回成功')
    console.log('审批结果2:', type, comment);
    getpurchaseSteps()

    console.log('审批结果3:', type, comment);

    approveDialogVisible.value = false
  }).catch((e) => {
    ElMessage.error('审批失败，请稍后重试', e)
  }).finally(() => {
    approveLoading.value = false
  })
}
// 返回上一页
// const handleBack = () => {
//   router.go(-1)
// }
</script>

<style>
@import './style/indexPage.scss';

.last-step {
  .el-step__line {
    display: none !important;
  }
}
</style>