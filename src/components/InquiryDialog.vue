<template>
    <el-dialog v-model="visible" :title="supply_name" width="400px" :show-close="false" :close-on-click-modal="true"
        :close-on-press-escape="true" center class="qrcode-modal">
        <div class="qrcode-modal-content">
            <el-image :src="qrcodeUrl" fit="contain" style="width: 100%; max-width: 300px; height: 300px;"
                class="modal-qrcode-image">
                <template #error>
                    <div class="modal-qrcode-error">
                        <el-icon size="48" color="#c0c4cc">
                            <Picture />
                        </el-icon>
                        <p>二维码加载失败</p>
                    </div>
                </template>
            </el-image>
            <p class="qrcode-tip">请使用手机扫描二维码进行报价</p>
        </div>
        <template #footer>
            <div class="qrcode-modal-footer">
                <el-button @click="closeDialog">关闭</el-button>
                <el-button type="primary" @click="downloadQRCode" v-if="qrcodeUrl">
                    <el-icon>
                        <Download />
                    </el-icon>
                    下载二维码
                </el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { Picture, Download } from '@element-plus/icons-vue'

const props = defineProps({
    modelValue: { type: Boolean, required: true },
    qrcodeUrl: { type: String, default: '' },
    supply_name: { type: String, default: '' }
})

const emit = defineEmits(['update:modelValue'])

const visible = ref(props.modelValue)
watch(() => props.modelValue, val => visible.value = val)
watch(visible, val => emit('update:modelValue', val))

const closeDialog = () => {
    visible.value = false
}

const downloadQRCode = async () => {
    try {
        const response = await fetch(props.qrcodeUrl)
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `qrcode_${Date.now()}.png`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
    } catch (error) {
        // 可加提示
    }
}
</script>

<style scoped lang="scss">
.qrcode-modal-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;

    .modal-qrcode-image {
        border-radius: 8px;
        border: 2px solid #e9ecef;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    }

    .modal-qrcode-error {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 300px;
        height: 300px;
        background: #f8f9fa;
        color: #6c757d;
        border-radius: 8px;
        border: 2px dashed #dee2e6;

        p {
            margin-top: 16px;
            font-size: 16px;
            font-weight: 500;
        }
    }

    .qrcode-tip {
        font-size: 14px;
        color: #6c757d;
        text-align: center;
        margin: 0;
        line-height: 1.5;
    }
}

.qrcode-modal-footer {
    display: flex;
    justify-content: center;
    gap: 12px;

    .el-button {
        padding: 8px 24px;
        border-radius: 6px;
        font-weight: 500;
    }
}
</style>