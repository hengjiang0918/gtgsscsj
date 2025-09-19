<template>
    <div class="container">
        <h2>设备报废申请</h2>
        <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
            <!-- 设备选择 -->
            <el-form-item label="选择设备" prop="deviceId">
                <el-select v-model="form.deviceId" filterable remote reserve-keyword clearable placeholder="请输入设备编号或名称"
                    :remote-method="searchDevice" :loading="deviceLoading" @change="handleDeviceSelect">
                    <el-option v-for="device in devices" :key="device.id" :label="`${device.name} (${device.sn})`"
                        :value="device.id" />
                </el-select>

            </el-form-item>

            <!-- 设备详情 -->
            <el-card v-if="selectedDevice" class="device-details" shadow="hover">
                <h3>设备详情</h3>
                <el-table :data="[selectedDevice]" border style="width: 100%">
                    <el-table-column prop="name" label="设备名称" />
                    <el-table-column prop="sn" label="设备编号" />
                    <el-table-column prop="purchaseDate" label="购入日期" />
                    <el-table-column prop="department" label="使用部门" />
                    <el-table-column prop="status" label="当前状态" />
                    <el-table-column prop="currentValue" label="当前价值" />
                </el-table>
            </el-card>

            <!-- 报废信息 -->
            <el-form-item label="报废原因" prop="reason">
                <el-input v-model="form.reason" type="textarea" :rows="4" placeholder="请详细说明报废原因和技术评估结论" />
            </el-form-item>
            <el-form-item label="处置方式" prop="disposal">
                <el-radio-group v-model="form.disposal">
                    <el-radio label="recycle">回收处理</el-radio>
                    <el-radio label="destroy">销毁处理</el-radio>
                    <el-radio label="auction">公开拍卖</el-radio>
                </el-radio-group>
            </el-form-item>

            <el-form-item label="附件证明">
                <el-upload v-model:file-list="attachments" action="/api/upload" :multiple="false" :limit="1"
                    :file-list="attachments">
                    <el-button type="primary">上传报废证明</el-button>
                    <template #tip>
                        <div class="el-upload__tip">
                            需上传正式报废批准文件（PDF格式）
                        </div>
                    </template>
                </el-upload>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="submitForm">提交申请</el-button>
                <el-button @click="resetForm">重置</el-button>
            </el-form-item>
        </el-form>
    </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import api from '@/api/index.js'
const router = useRouter();
const scrapStore = useScrapStore();

// 表单数据
const form = reactive({
    deviceId: '',
    reason: '',
    disposal: 'recycle',
});

const attachments = ref([]);

// 设备搜索
const devices = ref([]);
const selectedDevice = ref(null);
const deviceLoading = ref(false);

const searchDevice = async (query) => {
    if (query) {
        deviceLoading.value = true;
        try {
            // 将输入的关键字和设备名称/编号都转换为小写进行比较
            const lowerCaseQuery = query.toLowerCase();
            devices.value = scrapStore.devices.filter(
                (device) =>
                    device.name.toLowerCase().includes(lowerCaseQuery) ||
                    device.sn.toLowerCase().includes(lowerCaseQuery)
            );
        } finally {
            deviceLoading.value = false;
        }
    } else {
        devices.value = [];
    }
};

const handleDeviceSelect = (id) => {
    selectedDevice.value = devices.value.find((d) => d.id === id);
};

// 表单验证规则
const rules = reactive({
    deviceId: [{ required: true, message: '请选择设备', trigger: 'change' }],
    reason: [
        { required: true, message: '请输入报废原因', trigger: 'blur' },
        { min: 30, message: '原因说明至少30个字符', trigger: 'blur' },
    ],
    disposal: [{ required: true, message: '请选择处置方式', trigger: 'change' }],
});

// 提交处理
const submitForm = async () => {
    try {
        const payload = {
            ...form,
            deviceInfo: selectedDevice.value,
            attachment: attachments.value[0]?.response?.url,
        };

        await scrapStore.createScrap(payload);
        ElMessage.success('报废申请已提交');
        router.push('/approvals');
    } catch (error) {
        ElMessage.error('提交失败: ' + error.message);
    }
};

// 重置表单
const resetForm = () => {
    form.deviceId = '';
    form.reason = '';
    form.disposal = 'recycle';
    selectedDevice.value = null;
    attachments.value = [];
};
</script>
<style scoped lang="scss">
.container {
    width: 100%;
    height: 100%;
    margin: 20px auto;
    padding: 20px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

h2 {
    text-align: center;
    margin-bottom: 20px;
    color: #333;
    font-size: 24px;
    font-weight: bold;
}

.device-details {
    margin-bottom: 20px;
    padding: 15px;
    background: #f9f9f9;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border: 1px solid #e6e6e6;
}

.device-details h3 {
    margin-bottom: 15px;
    font-size: 20px;
    font-weight: bold;
    color: #409eff;
    border-bottom: 2px solid #409eff;
    padding-bottom: 5px;
}

.el-table {
    border-radius: 8px;
    overflow: hidden;
    background: #fff;
}

.el-table th {
    background: #f5f7fa;
    color: #333;
    font-weight: bold;
    text-align: center;
}

.el-table td {
    text-align: center;
    color: #666;
}

.el-table-column {
    padding: 10px;
}

.el-form-item {
    margin-bottom: 20px;
}

.el-form-item label {
    font-weight: bold;
    color: #555;
}

.el-input,
.el-input-number,
.el-select {
    width: 100%;
}

.el-upload {
    display: block;
    margin-top: 10px;
}

.el-upload__tip {
    font-size: 12px;
    color: #999;
}

.el-button {
    margin-right: 10px;
    border-radius: 4px;
}

.el-button[type='primary'] {
    background: linear-gradient(135deg, #409eff, #66b1ff);
    border: none;
    color: white;
    font-weight: bold;
    transition: all 0.3s ease;
}

.el-button[type='primary']:hover {
    background: linear-gradient(135deg, #66b1ff, #409eff);
    transform: scale(1.05);
}

.el-button[type='primary']:active {
    background: #409eff;
    transform: scale(0.95);
}

.el-button:not([type='primary']) {
    background: #f5f5f5;
    color: #333;
    border: 1px solid #ddd;
    transition: all 0.3s ease;
}

.el-button:not([type='primary']):hover {
    background: #e6e6e6;
}
</style>