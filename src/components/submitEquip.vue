<template>
    <div class="form-container">
        <h2 class="form-title">设备信息表单</h2>
        <form @submit.prevent="handleSubmit">
            <div class="form-group">
                <label for="factory">工厂名称</label>
                <input id="factory" v-model="formData.factory" type="text" placeholder="请输入工厂名称" />
            </div>
            <div class="form-group">
                <label for="deviceCount">设备台数</label>
                <input id="deviceCount" v-model="formData.deviceCount" type="number" placeholder="请输入设备台数" />
            </div>
            <div class="form-group">
                <label for="newPurchase">新申购数量</label>
                <input id="newPurchase" v-model="formData.newPurchase" type="number" placeholder="请输入新申购数量" />
            </div>
            <div class="form-group">
                <label for="scrapCount">报废数量</label>
                <input id="scrapCount" v-model="formData.scrapCount" type="number" placeholder="请输入报废数量" />
            </div>
            <div class="form-group">
                <label for="remark">备注</label>
                <textarea id="remark" v-model="formData.remark" placeholder="请输入备注信息"></textarea>
            </div>
            <div class="form-actions">
                <button type="submit" class="btn btn-primary">提交</button>
                <button type="button" class="btn btn-secondary" @click="resetForm">
                    重置
                </button>
            </div>
        </form>
    </div>
</template>
<script setup>
import { ref } from 'vue'

const formData = ref({
    factory: '',
    deviceCount: '',
    newPurchase: '',
    scrapCount: '',
    remark: ''
})

const handleSubmit = () => {
    console.log('表单数据:', formData.value)
    alert('表单提交成功！')
}

const resetForm = () => {
    formData.value = {
        factory: '',
        deviceCount: '',
        newPurchase: '',
        scrapCount: '',
        remark: ''
    }
}
</script>

<style scoped lang="scss">
.form-container {
    max-width: 600px;
    margin: 2rem auto;
    padding: 2rem;
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.form-title {
    font-size: 1.5rem;
    font-weight: bold;
    color: #333;
    margin-bottom: 1.5rem;
    text-align: center;
}

.form-group {
    margin-bottom: 1.5rem;

    label {
        display: block;
        font-size: 1rem;
        font-weight: 500;
        color: #444;
        margin-bottom: 0.5rem;
    }

    input,
    textarea {
        width: 100%;
        padding: 0.8rem;
        font-size: 1rem;
        border: 1px solid #ddd;
        border-radius: 8px;
        transition: border-color 0.3s ease;

        &:focus {
            border-color: #409eff;
            outline: none;
            box-shadow: 0 0 4px rgba(64, 158, 255, 0.5);
        }
    }

    textarea {
        resize: none;
        height: 100px;
    }
}

.form-actions {
    display: flex;
    justify-content: space-between;

    .btn {
        padding: 0.8rem 1.5rem;
        font-size: 1rem;
        border-radius: 8px;
        cursor: pointer;
        transition: background-color 0.3s ease;

        &.btn-primary {
            background-color: #409eff;
            color: white;
            border: none;

            &:hover {
                background-color: #66b1ff;
            }
        }

        &.btn-secondary {
            background-color: #f5f5f5;
            color: #666;
            border: 1px solid #ddd;

            &:hover {
                background-color: #e0e0e0;
            }
        }
    }
}
</style>