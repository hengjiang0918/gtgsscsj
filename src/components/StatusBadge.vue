<template>
  <el-tag :type="tagType">{{ statusText }}</el-tag>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  status: String
});

const statusText = computed(() => {
  return {
    pending: '审批中',
    approved: '已通过',
    rejected: '已拒绝'
  }[props.status];
});

const tagType = computed(() => {
  return {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger'
  }[props.status];
});
</script>