<template>
  <div class="factory-detail-container">
    <!-- 返回按钮 -->
    <el-page-header @click="goBack" :content="factory.name" />

    <!-- 筛选条件 -->
    <div class="filter-container">
      <el-select v-model="selectedType" placeholder="选择设备类型" clearable class="filter-select">
        <el-option v-for="type in deviceTypes" :key="type" :label="type" :value="type" />
      </el-select>
      <el-select v-model="selectedStatus" placeholder="选择设备状态" clearable class="filter-select">
        <el-option v-for="status in deviceStatuses" :key="status" :label="status" :value="status" />
      </el-select>
    </div>

    <!-- 设备列表 -->
    <el-table :data="filteredDevices" style="width: 100%">
      <el-table-column prop="id" label="设备编号" />
      <el-table-column prop="name" label="设备名称" />
      <el-table-column prop="type" label="设备类型" />
      <el-table-column prop="status" label="状态">
        <template #default="{ row }">
          <el-tag :type="statusTagType(row.status)">{{ row.status }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template #default="{ row }">
          <el-button link type="primary" @click="showDeviceDetail(row)">查看详情</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 设备详细信息抽屉 -->
    <el-drawer v-model="detailDrawer" title="设备详细信息" :size="drawerSize" direction="rtl" @dblclick="toggleDrawerSize">
      <div v-if="selectedDevice" class="device-detail">
        <!-- 公共基础信息 -->
        <el-descriptions title="基础信息" border>
          <el-descriptions-item label="设备编号">{{ selectedDevice?.id }}</el-descriptions-item>
          <el-descriptions-item label="设备名称">{{ selectedDevice?.name }}</el-descriptions-item>
          <el-descriptions-item label="设备类型">{{ selectedDevice?.type }}</el-descriptions-item>
          <el-descriptions-item label="设备型号">{{ selectedDevice?.model }}</el-descriptions-item>
          <el-descriptions-item label="供应商">{{ selectedDevice?.supplier }}</el-descriptions-item>
          <el-descriptions-item label="使用状态">
            <el-tag :type="statusTagType(selectedDevice?.status)">
              {{ selectedDevice?.status }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>

        <!-- 流程步骤 -->
        <el-steps :active="activeStep" direction="vertical" align-center>
          <el-step v-for="(step, index) in lifecycleSteps" :key="index" :title="step.title"
            :description="step.description" />
        </el-steps>
      </div>
    </el-drawer>
  </div>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const router = useRouter();
const route = useRoute();

const factory = ref({ name: '' });
const detailDrawer = ref(false);
const drawerSize = ref('50%');
const selectedDevice = ref(null);

// 模拟设备数据
const allDevices = ref([
  { id: 1, name: '设备A', status: '正在运行', type: '缝纫设备', model: '型号A', supplier: '供应商A' },
  { id: 2, name: '设备B', status: '申购中', type: '裁剪设备', model: '型号B', supplier: '供应商B' },
  { id: 3, name: '设备C', status: '已报废', type: '缝纫设备', model: '型号C', supplier: '供应商C' },
  { id: 4, name: '设备D', status: '报废申报', type: '裁剪设备', model: '型号D', supplier: '供应商D' }
]);

// 筛选条件
const deviceTypes = ref(['缝纫设备', '裁剪设备']);
const deviceStatuses = ref(['正在运行', '申购中', '已报废', '报废申报']);
const selectedType = ref('');
const selectedStatus = ref('');

// 当前步骤
const activeStep = ref(0);

// 生命周期步骤
const lifecycleSteps = ref([]);

// 根据状态设置生命周期步骤
const updateLifecycleSteps = (status) => {
  switch (status) {
    case '正在运行':
      lifecycleSteps.value = [
        { title: '购买时间', description: '设备购买于 2023-01-01' },
        { title: '入库时间', description: '设备入库于 2023-01-05' },
        { title: '出库时间', description: '设备出库于 2023-01-10' }
      ];
      break;
    case '申购中':
      lifecycleSteps.value = [
        { title: '申购申报', description: '设备申购申请已提交' },
        { title: '申购立项', description: '申购立项已完成' },
        { title: '合同签订', description: '合同已签订' },
        { title: '发货', description: '设备正在发货中' },
        { title: '入库', description: '设备预计入库时间为 2023-02-01' }
      ];
      break;
    case '报废申报':
      lifecycleSteps.value = [
        { title: '报废申请', description: '设备报废申请已提交' },
        { title: '审批中', description: '报废申请正在审批中' },
        { title: '审批完成', description: '报废申请已通过审批' }
      ];
      break;
    case '已报废':
      lifecycleSteps.value = [
        { title: '报废完成', description: '设备已完成报废流程' },
        { title: '记录归档', description: '报废记录已归档' }
      ];
      break;
    default:
      lifecycleSteps.value = [];
  }
};

// 筛选后的设备列表
const filteredDevices = computed(() => {
  return allDevices.value.filter((device) => {
    const matchesType = !selectedType.value || device.type === selectedType.value;
    const matchesStatus = !selectedStatus.value || device.status === selectedStatus.value;
    return matchesType && matchesStatus;
  });
});

// 返回上一页
const goBack = () => {
  router.back();
};

// 双击切换抽屉大小
const toggleDrawerSize = () => {
  drawerSize.value = drawerSize.value === '50%' ? '80%' : '50%';
};

// 显示设备详情
const showDeviceDetail = (device) => {
  selectedDevice.value = device;
  detailDrawer.value = true;

  // 根据设备状态设置当前步骤
  switch (device.status) {
    case '正在运行':
      activeStep.value = 0;
      break;
    case '申购中':
      activeStep.value = 1;
      break;
    case '报废申报':
      activeStep.value = 2;
      break;
    case '已报废':
      activeStep.value = 3;
      break;
    default:
      activeStep.value = 0;
  }

  // 更新生命周期步骤
  updateLifecycleSteps(device.status);
};

// 根据状态返回标签类型
const statusTagType = (status) => {
  switch (status) {
    case '正在运行':
      return 'success';
    case '申购中':
      return 'warning';
    case '已报废':
      return 'danger';
    case '报废申报':
      return 'info';
    default:
      return '';
  }
};

// 生命周期钩子
onMounted(() => {
  // 模拟获取工厂详情
  factory.value = {
    name: '示例工厂'
  };
});
</script>
<style lang="scss" scoped>
.factory-detail-container {
  padding: 20px;

  .el-page-header {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
    padding: 1rem 2rem;
    cursor: pointer;
    border-radius: 8px;
    background: linear-gradient(135deg, #e0f7fa, #b2ebf2);
    transition: all 0.3s ease;
    color: #00796b;
    text-align: center;
    font-weight: bold;

    &:hover {
      background: linear-gradient(135deg, #b2ebf2, #80deea);
      transform: scale(1.05);
    }
  }

  .filter-container {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;

    .filter-select {
      width: 200px;
    }
  }

  .device-detail {
    padding: 20px;

    .el-descriptions {
      margin-bottom: 20px;
      border-radius: 8px;
      background-color: #f9f9f9;
      padding: 15px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

      .el-descriptions-item__label {
        font-weight: bold;
        color: #333;
      }

      .el-descriptions-item__content {
        color: #555;
      }
    }

    .el-steps {
      margin-top: 20px;
      padding: 15px;
      border-radius: 8px;
      background-color: #f7faff;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

      .el-step__title {
        font-weight: bold;
        color: #333;
      }

      .el-step__description {
        font-size: 14px;
        color: #666;
      }

      .el-step.is-finish .el-step__title {
        color: #67c23a;
        /* 完成状态的标题颜色 */
      }

      .el-step.is-process .el-step__title {
        color: #409eff;
        /* 当前步骤的标题颜色 */
      }

      .el-step.is-wait .el-step__title {
        color: #c0c4cc;
        /* 等待状态的标题颜色 */
      }

      .el-step__icon-inner {
        background-color: #409eff !important;
        /* 当前步骤的图标颜色 */
        color: #fff;
        font-weight: bold;
      }

      .el-step.is-finish .el-step__icon-inner {
        background-color: #67c23a !important;
        /* 完成状态的图标颜色 */
      }

      .el-step.is-wait .el-step__icon-inner {
        background-color: #c0c4cc !important;
        /* 等待状态的图标颜色 */
      }
    }
  }
}
</style>