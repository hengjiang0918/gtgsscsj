<template>
    <el-dialog :model-value="visible" :title="dialogTitle" width="520px" @close="handleClose" destroy-on-close
        class="purchase-dialog">
        <el-form :model="form" ref="formRef" :rules="rules" label-width="110px" class="purchase-form">
            <el-form-item label="项目名称" prop="system_name">
                <el-input v-model="form.system_name" placeholder="请输入项目名称" clearable />
            </el-form-item>
            <el-form-item label="申请工厂" prop="factory">
                <el-input v-model="form.factory" placeholder="请输入申请工厂" clearable />
            </el-form-item>
            <el-form-item label="采购物品" prop="item_name">
                <el-input v-model="form.item_name" placeholder="请输入采购物品名称" clearable />
            </el-form-item>
            <el-form-item label="数量" prop="quantity">
                <el-input-number v-model="form.quantity" :min="1" :max="100000" placeholder="请输入数量"
                    style="width: 100%;" />
            </el-form-item>
            <el-form-item label="单价(元)" prop="unit_price">
                <el-input-number v-model="form.unit_price" :min="0" :precision="2" placeholder="请输入单价"
                    style="width: 100%;" />
            </el-form-item>
            <el-form-item label="总价(元)" prop="total_price">
                <el-input v-model="form.total_price" :disabled="true" />
            </el-form-item>
            <el-form-item label="备注" prop="remark">
                <el-input v-model="form.remark" type="textarea" :rows="2" placeholder="请输入备注" clearable />
            </el-form-item>
        </el-form>
        <template #footer>
            <div class="dialog-footer">
                <el-button @click="handleClose" plain round>取消</el-button>
                <el-button type="primary" @click="submitForm" round>提交</el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script setup>
import api from '@/api'
import { ref, watch, computed } from 'vue'
import { useUserStore } from '@/stores/userStore'
const userStore = useUserStore()
const props = defineProps({
    visible: { type: Boolean, required: true },
    modelValue: { type: Object, default: () => ({}) },
    dialogTitle: { type: String, default: '新建采购申请' }
})
const emits = defineEmits(['update:visible', 'submit'])

const form = ref({
    system_name: '',
    factory: '',
    item_name: '',
    quantity: 0,
    unit_price: 0,
    total_price: 0,
    remark: ''
})

const formRef = ref(null)

const rules = {
    system_name: [{ required: true, message: '请输入项目名称', trigger: 'blur' }],
    factory: [{ required: true, message: '请输入申请工厂', trigger: 'blur' }],
    item_name: [{ required: true, message: '请输入采购物品', trigger: 'blur' }],
    // quantity: [{ required: true, message: '请输入数量', trigger: 'change' }],
    // unit_price: [{ required: true, message: '请输入单价', trigger: 'change' }],
}

// 自动计算总价
watch(
    () => [form.value.quantity, form.value.unit_price],
    ([quantity, unit_price]) => {
        form.value.total_price = (Number(quantity) * Number(unit_price)).toFixed(2)
    }
)

// 打开弹窗时重置表单
watch(
    () => props.visible,
    (val) => {
        if (val) {
            Object.assign(form.value, {
                system_name: '',
                factory: '',
                item_name: '',
                quantity: 0,
                unit_price: 0,
                total_price: 0,
                remark: ''
            }, props.modelValue || {})
        }
    },
    { immediate: true }
)

const handleClose = () => {
    emits('update:visible', false)
}

const submitForm = () => {

    formRef.value.validate((valid) => {
        console.log('表单验证结果', valid)
        api.createPurchase({
            system_name: form.value.system_name,
            factory: form.value.factory,
            item_name: form.value.item_name,
            quantity: form.value.quantity,
            unit_price: form.value.unit_price,
            total_price: form.value.total_price,
            remark: form.value.remark,
            operator: userStore.user_name,
            operator_id: userStore.user_id,
        })
            .then(data => {
                console.log('采购列表数据', data)
                // JwlshopList.value = data;
                emits('update:visible', false)
                // 通知主页面刷新
                emits('submit')
            })
            .catch(err => {
                // 错误已自动弹窗，这里可选写自定义处理
            })
    })
}
</script>

<style scoped>
.purchase-dialog .el-dialog__header {
    background: linear-gradient(90deg, #26c6da 0%, #00acc1 100%);
    color: #fff;
    border-radius: 8px 8px 0 0;
}

.purchase-dialog .el-dialog__title {
    color: #fff;
    font-weight: bold;
    font-size: 18px;
}

.purchase-form {
    padding: 10px 0 0 0;
}

.purchase-form-item {
    margin-bottom: 22px;
}

.dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 16px;
    padding: 8px 0 0 0;
}

.el-input__wrapper,
.el-date-editor {
    border-radius: 6px;
}

.el-switch {
    margin-top: 4px;
}
</style>