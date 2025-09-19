<template>
  <div class="supplier-container">
    <SupplierForm ref="supplierFormRef" @success="handleSuccess" :initialData="initialData" :isEdit="isEdit" />

    <div class="list-wrapper">
      <ul class="list-header">
        <li v-for="header in headers" :key="header" class="list-header-item">
          {{ header }}
        </li>
      </ul>
      <ul class="list-body">
        <li v-for="item in supplierList" :key="item.id" class="list-row" @click="viewDetail(item)">
          <span class="list-cell name">{{ item.supplier_category }}</span>
          <span class="list-cell country">{{ item.supplier_name }}</span>
          <span class="list-cell contact">{{ item.region }}</span>
          <span class="list-cell phone">{{ item.contactPerson }}</span>
          <span class="list-cell email">{{ item.contactPhone }}</span>
        </li>
      </ul>
      <!-- 加载更多按钮 -->
      <div class="pagination">
        <button @click="showAddDialog">新增供应商</button>
        <button @click="showUploadDialog = true">上传供应商</button>
      </div>
    </div>
    <el-drawer v-model="showDetailDrawer" title="设备详情" :with-header="true" size="50%" direction="rtl">
      <!-- 基本信息 -->
      <div class="base-info">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="国家/地区">{{ supplier_detail.region || '暂无数据' }}</el-descriptions-item>
          <el-descriptions-item label="联系人">{{ supplier_detail.contactPerson || '暂无数据' }}</el-descriptions-item>
          <el-descriptions-item label="供应商名称">{{ supplier_detail.supplier_name || '暂无数据' }}</el-descriptions-item>
          <el-descriptions-item label="联系方式">{{ supplier_detail.contactPhone || '暂无数据' }}</el-descriptions-item>
          <el-descriptions-item label="合作状态">
            <el-tag :type="supplier_detail.status === 'active' ? 'success' : 'danger'">
              {{ supplier_detail.status === 'active' ? '合作中' : supplier_detail.status === 'terminated' ? '已终止' : '未知状态'
              }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="品类">{{ supplier_detail.supplier_category || '暂无数据' }}</el-descriptions-item>
          <el-descriptions-item label="法人代表">{{ supplier_detail.legal_representative || '暂无数据' }}</el-descriptions-item>

          <el-descriptions-item label="现合作部室">{{ supplier_detail.cooperation_department || '暂无数据'
          }}</el-descriptions-item>
        </el-descriptions>
      </div>
    </el-drawer>
    <el-dialog v-model="showUploadDialog" title="上传附件" width="400px">
      <el-upload class="custom-upload" drag :before-upload="beforeUpload" :http-request="handleCustomRequest"
        accept=".xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        show-file-list>
        <i class="el-icon-upload upload-icon"></i>
        <div class="el-upload__text">
          <span>将文件拖到此处，或 <em class="upload-link">点击上传</em></span>
        </div>
        <div class="el-upload__tip" slot="tip">
          <span class="upload-tip">只允许上传Excel文件（.xls, .xlsx）</span>
        </div>
      </el-upload>
      <template #footer>
        <el-button @click="showUploadDialog = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import SupplierForm from '@/components/SupplierForm.vue'
import api from '@/api';
const supplier_detail = ref({})
const initialData = ref({})
const isEdit = ref({})
const supplierFormRef = ref()
const router = useRouter();
const stats = useRouter();
const activeTab = ref('trendChart'); // 默认显示趋势图
const supplierList = ref([]);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const isLoading = ref(false);
const showUploadDialog = ref(false);
const showDetailDrawer = ref(false);
const hasMore = ref(true);
const trendChart = ref(null)
const pieChart = ref(null)
let trendChartInstance = null
let pieChartInstance = null
// 表头配置
const headers = ref(["品类", '供应商名称', '国家/地区', '联系人', '联系方式'])
const getSupplierList = () => {
  api.supplierList(
  ).then(data => {
    supplierList.value = data.supplier_list || [];
  }).catch(error => {
    console.error('获取供应商列表失败:', error);
  });
  // 获取供应商详情
};


const beforeUpload = (file) => {
  const isExcel = file.type === 'application/vnd.ms-excel' ||
    file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    file.name.endsWith('.xls') || file.name.endsWith('.xlsx');
  if (!isExcel) {
    ElMessage.error('只允许上传Excel文件（.xls, .xlsx）');
    return false;
  }
  return true;
};
// el-upload自定义上传
const handleCustomRequest = (option) => {
  handleUpload(option.file);
};
// 上传文件到后端
const handleUpload = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  // 字段映射，后端用
  formData.append('header_map', JSON.stringify({
    '设备类型': 'category_type',
    '供应商品类': 'supplier_category',
    '供应商名称': 'supplier_name',
    '区域': 'region',
    '法人代表': 'legal_representative',
    '业务联系人': 'contactPerson',
    '联系方式': 'contactPhone',
    '现合作部室': 'cooperation_department',
  }));
  formData.append('table', 'supplier_system'); // 目标表名

  api.uploadExcel(formData, {
    withCredentials: true,
    config: {
      headers: { 'Content-Type': 'multipart/form-data' }
    }
  }).then(data => {
    showUploadDialog.value = false;
    // getStatementList(); // 上传成功后刷新列表
    ElMessage.success('上传成功！');
  })
};


function showDetail(factoryId) {
  router.push({
    name: 'SupplierDetail',
    query: { id: factoryId.id, tab: 'list' } // 传递当前 Tab 状态
  });
}

// 查看设备详情
const viewDetail = async (item) => {

  showDetailDrawer.value = true;

  // 获取设备详情
  const detail = item
  supplier_detail.value = detail || {};
  console.log('设备详情:', supplier_detail.value);

  // 等待抽屉完全打开后初始化图表
  // initCharts();

};
// const initCharts = (text) => {
//   if (text) {
//     activeTab.value = text
//   }
//   // 初始化趋势图表
//   nextTick(() => {
//     if (trendChartInstance) {
//       trendChartInstance.dispose(); // 销毁旧的实例
//       trendChartInstance = null; // 确保实例被清空
//     }

//     if (trendChart.value && trendChart.value.clientWidth > 0 && trendChart.value.clientHeight > 0) {
//       trendChartInstance = echarts.init(trendChart.value);
//       trendChartInstance.setOption({
//         tooltip: {
//           trigger: 'axis',
//           formatter: '{b}<br/>{a0}: {c0}',
//         },
//         legend: {
//           data: ['采购金额'],
//         },
//         xAxis: {
//           type: 'category',
//           data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
//         },
//         yAxis: {
//           type: 'value',
//           name: '金额 (万元)',
//         },
//         series: [
//           {
//             name: '采购金额',
//             type: 'line',
//             data: [12, 18, 15, 22, 19, 25, 30, 28, 32, 40, 35, 45],
//             smooth: true,
//             areaStyle: {
//               color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
//                 { offset: 0, color: 'rgba(58, 77, 233, 0.8)' },
//                 { offset: 1, color: 'rgba(58, 77, 233, 0.1)' },
//               ]),
//             },
//           },
//         ],
//       });
//     }
//     if (pieChartInstance) {
//       pieChartInstance.dispose(); // 销毁旧的实例
//       pieChartInstance = null; // 确保实例被清空
//     }
//     // 初始化饼图
//     if (pieChart.value && pieChart.value.clientWidth > 0 && pieChart.value.clientHeight > 0) {
//       pieChartInstance = echarts.init(pieChart.value);
//       pieChartInstance.setOption({
//         tooltip: {
//           trigger: 'item',
//           formatter: '{a} <br/>{b}: {c} ({d}%)',
//         },
//         legend: {
//           orient: 'vertical',
//           right: 10,
//           top: 'center',
//           data: ['服务器', '网络设备', '存储设备', '安全设备', '其他'],
//         },
//         series: [
//           {
//             name: '设备类型',
//             type: 'pie',
//             radius: ['50%', '70%'],
//             avoidLabelOverlap: false,
//             itemStyle: {
//               borderRadius: 10,
//               borderColor: '#fff',
//               borderWidth: 2,
//             },
//             label: {
//               show: false,
//               position: 'center',
//             },
//             emphasis: {
//               label: {
//                 show: true,
//                 fontSize: '18',
//                 fontWeight: 'bold',
//               },
//             },
//             labelLine: {
//               show: false,
//             },
//             data: [
//               { value: 35, name: '服务器' },
//               { value: 25, name: '网络设备' },
//               { value: 20, name: '存储设备' },
//               { value: 15, name: '安全设备' },
//               { value: 5, name: '其他' },
//             ],
//           },
//         ],
//       });
//     }
//   });
// };
const showAddDialog = () => {
  isEdit.value = false
  supplierFormRef.value.visible = true
};
function editSupplier(item) {

}
const handleSuccess = ({ type, data }) => {

};
onMounted(() => {
  getSupplierList();
});
</script>

<style lang="scss" scoped>
/* 颜色变量 */
$primary-color: #26c6da;
$primary-hover: #00acc1;
$primary-active: #00838f;
$secondary-color: #4da6e1;
$background-color: #f5f5f5;
$text-color: #004d40;
$shadow-color: rgba(0, 0, 0, 0.1);
$border-radius: 8px;

/* 容器样式 */
.supplier-container {
  height: 100%;

  .chart-item {
    background: #fff;
    padding: 15px;
    border-radius: $border-radius;
    box-shadow: 0 4px 12px $shadow-color;
  }

  /* 列表样式 */
  .list-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
    border-radius: $border-radius;
    box-shadow: 0 4px 12px $shadow-color;
    overflow: hidden;
    height: 100%;

    .list-header {
      display: flex;
      padding: 0.5rem 1rem;
      font-weight: bold;
      color: #fff;
      background: $primary-color; // 主色调

      .list-header-item {
        flex: 1;
        text-align: center;
        font-size: 16px;
        letter-spacing: 1px;
      }
    }

    .list-body {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;

      /* 自定义滚动条样式 */
      &::-webkit-scrollbar {
        width: 8px;
      }

      &::-webkit-scrollbar-thumb {
        background: lighten($primary-color, 20%);
        border-radius: 4px;
      }

      &::-webkit-scrollbar-thumb:hover {
        background: $primary-hover;
      }

      &::-webkit-scrollbar-track {
        background: #e0e0e0;
      }

      .list-row {
        display: flex;
        padding: 0.2rem 1rem; // 更紧凑
        border-bottom: 1px solid #eee;
        color: $text-color;
        background: #fff; // 内容区白色
        min-height: 32px; // 更小的行高

        .list-header-item {
          flex: 1;
          text-align: center;
        }

        &:nth-child(odd) {
          background: rgba(0, 0, 0, 0.02);
        }

        &:hover {
          background: rgba(46, 231, 207, 0.05);
          transform: scale(1.01);
          box-shadow: 0 2px 4px $shadow-color;
        }

        .list-cell {
          flex: 1;
          text-align: center;
          color: $text-color;
          height: 32px;
          line-height: 32px;
          font-size: 14px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          position: relative;
          cursor: pointer;

        }
      }
    }

    .pagination {
      margin-top: auto;
      text-align: center;
      padding: 0.9rem;

      .load-more,
      .loading,
      .no-more {
        font-size: 1rem;
        color: $primary-active;
      }

      button {
        min-width: 160px;
        padding: 0.5rem 1.5rem;
        font-size: 1rem;
        border: none;
        border-radius: $border-radius;
        background: linear-gradient(135deg, $secondary-color, $primary-color);
        color: white;
        cursor: pointer;
        transition: background-color 0.3s ease, transform 0.2s ease;

        &:hover {
          background: linear-gradient(135deg, $primary-color, $primary-hover);
          transform: scale(1.05);
        }

        &:active {
          background: linear-gradient(135deg, $primary-active, darken($primary-active, 10%));
          transform: scale(0.95);
        }
      }
    }
  }


}
</style>