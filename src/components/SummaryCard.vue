<template>
  <el-card shadow="never" class="summary-card" :class="{ active: isActive }" @click="$emit('click')">
    <template #header>
      <div class="card-header">
        <el-icon :size="20" :color="color">
          <component :is="icon" />
        </el-icon>
        <span>{{ title }}</span>
      </div>
    </template>
    <div class="card-value">{{ value }}</div>
  </el-card>
</template>

<script setup>
import { defineProps } from 'vue'
const { title, value, icon, color } = defineProps({
  title: {
    type: String,
    required: true
  },
  value: {
    type: [String, Number],
    required: true
  },
  icon: {
    type: String,
    required: true
  },
  color: {
    type: String,
    default: '#409EFF'
  },
  isActive: {
    type: Boolean,
    default: false
  }
})

</script>

<style lang="scss">
.summary-card {
  margin-bottom: 0;

  :deep(.el-card__header) {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 12px 20px;
    border-bottom: none;
  }

  :deep(.el-card__body) {
    height: 100%;
    padding: 12px 20px;
  }

  .card-header {
    display: flex;
    align-items: center;
    height: 20px;

    .el-icon {
      margin-right: 10px;
    }

    span {
      font-size: 16px;
      font-weight: bold;
      color: #333;
    }
  }

  .card-value {
    font-size: 24px;
    height: 30px;
    line-height: 30px;
    font-weight: bold;
    color: #333;
    text-align: center;
  }

  /* 高亮样式 */
  &.active {
    box-shadow: inset 0 0 10px rgba(64, 158, 255, 0.5);
  }
}
</style>