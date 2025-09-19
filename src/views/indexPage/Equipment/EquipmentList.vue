<template>
    <div class="equipment-list-container">
        <!-- 筛选区 -->
        <div class="filter-bar">
            <el-select v-model="selectedCategory" placeholder="选择工厂" class="filter-select" clearable>
                <el-option v-for="(category, index) in categories" :key="index" :label="category" :value="category" />
            </el-select>
            <el-input v-model="asset_name" placeholder="请输入资产名称" clearable class="filter-input" />
            <el-input v-model="specification" placeholder="请输入规格" clearable class="filter-input" />
            <button @click="getAssetList">搜索</button>
        </div>
        <!-- 表格区 -->
        <el-table :data="asset_list" stripe border class="asset-table" @sort-change="handleSortChange">

            <el-table-column prop="factory" label="工厂" align="center" show-overflow-tooltip />
            <el-table-column prop="asset_name" label="资产名称" align="center" show-overflow-tooltip />
            <el-table-column prop="specification" label="规格" align="center" show-overflow-tooltip />
            <el-table-column prop="model" label="型号" align="center" show-overflow-tooltip />
            <el-table-column prop="original_value" label="本币原值" align="center" show-overflow-tooltip />
            <el-table-column prop="quantity" label="数量" align="center" show-overflow-tooltip />
            <el-table-column prop="unit_price" label="单价" align="center" show-overflow-tooltip />
            <el-table-column prop="currency" label="货币种类" align="center" show-overflow-tooltip />
            <el-table-column prop="start_use_date" label="开始使用日" align="center" show-overflow-tooltip />
            <el-table-column prop="asset_category" label="资产类别" align="center" show-overflow-tooltip />
        </el-table>
        <div class="pagination">
            <el-pagination v-model:currentPage="currentPage" :page-size="pageSize" :total="total"
                @current-change="handlePageChange" />
        </div>
        <!-- 备注详情弹窗 -->
        <el-dialog v-model="dialogVisible" title="备注详情" width="30%" align-center class="custom-dialog">
            <div class="dialog-content">
                <span>{{ currentRemark }}</span>
            </div>
        </el-dialog>
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
import api from '@/api';
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
const router = useRouter();

// 模拟数据
const asset_list = ref([


]);

const dialogVisible = ref(false);
const showUploadDialog = ref(false);
const currentRemark = ref('');
const asset_name = ref('');
const specification = ref('');
const selectedCategory = ref('');
const categories = ref(['CBK', 'GST', 'GW', 'KH', 'RG', 'WINAS',]);
const currentPage = ref(1);
const pageSize = ref(30);
const total = ref();
const sortorder = ref('desc');

const importAssets = () => {
    // 这里可以实现导入资产的逻辑
    showUploadDialog.value = true;
    console.log('导入资产功能待实现');
};
// 筛选后的列表
const filteredList = computed(() => {
    let filtered = list.value;
    console.log('筛选条件:', filtered);
    // 按分类筛选

});
onMounted(() => {
    getAssetList();
});
const getAssetList = () => {
    api.getAssetList(
        {
            page: currentPage.value,
            pageSize: pageSize.value,
            specification: specification.value,
            asset_name: asset_name.value,
            factory: selectedCategory.value,
            created_at: 'created_at',
            order: sortorder.value
        }
    ).then((data) => {
        asset_list.value = data.asset_list;
        total.value = data.total; // 假设后端返回总数
        // 处理获取到的资产列表数据
    });
};
function handleSortChange({ prop, order }) {
    if (prop === 'unit_price') {
        console.log('排序属性:', prop, '排序顺序:', order);
        if (order === 'ascending') {
            sortorder.value = 'asc';
            getAssetList()
        } else if (order === 'descending') {
            sortorder.value = 'desc';
            getAssetList()
        }
    }
}
// 备注详情弹窗
function goToRemark(remark) {
    dialogVisible.value = true;
    currentRemark.value = remark;
}

function goToDetail(factoryId) {
    router.push({
        name: 'EquipmentDetail',
        params: { id: factoryId, tab: 'list' } // 传递当前 Tab 状态
    });
}

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
        '卡片编号': 'card_number',
        '资产编码': 'asset_code',
        '财务组织': 'finance',
        '货币': 'currency',
        '资产名称': 'asset_name',
        '规格': 'specification',
        '型号': 'model',
        '本币原值': 'original_value',
        '累计折旧': 'accumulated_depreciation',
        '月折旧额': 'monthly_depreciation',
        '本年折旧': 'annual_depreciation',
        '使用月限': 'usage_month_limit',
        '已使计提期数': 'used_months',
        '净值': 'net_value',
        '减值准备': 'impairment_provision',
        '净额': 'net_amount',
        '数量': 'quantity',
        '资产类别': 'asset_category',
        '管理部门': 'management_department',
        '使用部门': 'usage_department',
        '使用人': 'user',
        '存放地点': 'location',
        '开始使用日期': 'start_use_date',
        '工厂': 'factory',

    }));
    formData.append('table', 'asset_card'); // 目标表名

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

// 分页切换
function handlePageChange(page) {
    currentPage.value = page;
    getAssetList();

}


</script>
<style scoped lang="scss">
.equipment-list-container {
    height: 100%;

    .el-card {
        height: 100%;

        ::deep(.el-card__body) {
            padding: 0;
            height: 100% !important;
        }
    }


    .main-layout-vertical {
        display: flex;
        flex-direction: column;
        gap: 18px;
        height: 80%;
    }

    ::deep(.el-table__inner-wrapper) {
        height: 100%;
    }

    .filter-bar {
        display: flex;
        gap: 18px;
        margin-bottom: 16px;

        .filter-select,
        .filter-input {
            width: 220px;
        }
    }

    .asset-table {
        height: 85%;
    }

    .list-wrapper-vertical {
        display: flex;
        flex-direction: column;
        gap: 16px;

        .asset-card {
            background: #f9f9f9;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(38, 198, 218, 0.08);
            padding: 18px 24px;
            transition: box-shadow 0.2s, background 0.2s;
            cursor: pointer;

            &:hover {
                background: #e0f7fa;
                box-shadow: 0 6px 24px rgba(38, 198, 218, 0.18);
            }

            .card-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-size: 16px;
                font-weight: 600;
                color: #0097a7;
                margin-bottom: 10px;
            }

            .card-body {
                display: flex;
                flex-direction: column;
                gap: 8px;

                .card-row {
                    display: flex;
                    gap: 32px;
                    font-size: 14px;
                    color: #004237;

                    span {
                        flex: 1;
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                    }
                }
            }
        }

        .pagination {
            text-align: center;
            padding: 1rem 0 0 0;

            .el-pagination {
                margin-top: 10px;
            }
        }
    }
}

.asset-table {
    margin-bottom: 18px;
    font-size: 14px;

    th,
    td {
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
    }
}

.pagination {
    text-align: center;
    padding: 1rem 0 0 0;

    .el-pagination {
        margin-top: 10px;
    }
}
</style>