<template>
    <el-dialog v-model="visible" :title="isEdit ? '修改供应商' : '新增供应商'" width="600px" class="supplier-dialog"
        :close-on-click-modal="false">
        <div class="custom-form">
            <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
                <el-form-item label="供应商名称" prop="name">
                    <el-input v-model="form.name" placeholder="请输入供应商名称" clearable />
                </el-form-item>
                <el-form-item label="国家/地区" prop="country">
                    <el-select v-model="form.country" placeholder="请选择国家/地区" clearable>
                        <el-option v-for="country in countries" :key="country.value" :label="country.label"
                            :value="country.label" />
                    </el-select>
                </el-form-item>
                <el-form-item label="联系人" prop="contact">
                    <el-input v-model="form.contact" placeholder="请输入联系人姓名" clearable />
                </el-form-item>
                <el-form-item label="联系方式" prop="phone">
                    <el-input v-model="form.phone" placeholder="请输入联系方式" clearable />
                </el-form-item>
                <el-form-item label="专长设备" prop="specialties">
                    <el-tree-select v-model="selectedSpecialties" :data="equipmentTree" multiple check-strictly
                        placeholder="请选择专长设备" />
                </el-form-item>
            </el-form>
        </div>
        <template #footer>
            <div class="dialog-footer">
                <el-button @click="visible = false" class="cancel-button">取消</el-button>
                <el-button type="primary" :loading="isSubmitting" @click="isEdit ? handleEdit() : handleAdd()"
                    class="submit-button">
                    {{ isEdit ? '保存修改' : '提交' }}
                </el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';

const emit = defineEmits(['success']);
const props = defineProps({
    isEdit: { type: Boolean, default: false }, // 是否为编辑模式
    initialData: { type: Object, default: () => ({}) }, // 编辑模式下的初始数据
});
const visible = ref(false); // 控制对话框显示状态

const form = reactive({
    name: '',
    country: '',
    contact: '',
    phone: '',
    specialties: [],
});
const resetForm = () => {
    form.name = '';
    form.country = '';
    form.contact = '';
    form.phone = '';
    form.specialties = [];
};
const countries = ref([]); // 获取国家/地区数据
const equipmentTree = ref([]); // 获取设备树形结构数据
const selectedSpecialties = computed({
    get() {
        // 从 specialties 中提取 value 值
        return form.specialties.map((item) => item.value);
    },
    set(values) {
        // 根据选中的 value 值更新 specialties
        form.specialties = values.map((value) => {
            const found = equipmentTree.value
                .flatMap((category) => category.children || [])
                .find((item) => item.value === value);
            return found ? { label: found.label, value: found.value } : null;
        }).filter(Boolean); // 过滤掉未找到的值
    },
});
// 监听初始数据变化
watch(
    () => [props.initialData, props.isEdit],
    ([newData, isEdit]) => {
        if (isEdit && newData) {
            Object.assign(form, newData); // 将初始数据赋值给表单
            console.log('编辑模式，初始数据:', newData);
        } else {
            resetForm(); // 如果不是编辑模式，重置表单
        }
    },
);

onMounted(async () => {
    console.log('国家/地区数据:', countries);
})
const handleAdd = async () => {
    if (!form.name || !form.country || !form.contact || !form.phone) {
        alert('请填写完整信息');
        return;
    }
    try {
        emit('success', { type: 'add', data: form }); // 通知父组件操作成功
        visible.value = false; // 关闭对话框
        resetForm(); // 重置表单
    } catch (error) {
        console.error('新增供应商失败:', error);
    }
};
const handleEdit = async () => {
    if (!form.name || !form.country || !form.contact || !form.phone) {
        alert('请填写完整信息');
        return;
    }
    try {
        emit('success', { type: 'edit', data: form }); // 通知父组件操作成功
        visible.value = false; // 关闭对话框
        resetForm(); // 重置表单
    } catch (error) {
        console.error('修改供应商失败:', error);
    }
};
defineExpose({ visible });
</script>

<style scoped>
/* 样式保持不变 */
</style>