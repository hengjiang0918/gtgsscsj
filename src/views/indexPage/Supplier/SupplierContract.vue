<template>
  <div class="list-wrapper">
    <ul class="list-header">
      <li v-for="header in headers" :key="header" class="list-header-item">
        {{ header }}
      </li>
    </ul>
    <ul class="list-body">
      <li v-for="item in currentData" :key="item.id" class="list-row" @click="showDetail(item)">
        <span v-for="(value, key) in item" :key="key" class="list-cell">
          {{ value }}11
        </span>
      </li>
    </ul>
    <!-- 加载更多按钮 -->
    <div class="pagination">
      <div v-if="!isLoading && hasMore" class="load-more">
        <button @click="loadMore">加载更多</button>
      </div>
      <div v-else-if="isLoading" class="loading">加载中...</div>
      <div v-else class="no-more">没有更多数据了</div>
    </div>
    <!-- 抽屉详情 -->
    <el-drawer v-model="drawerVisible" title="供应商详情" direction="rtl" size="40%">
      <div v-if="selectedItem" class="detail-section">
        <div class="detail-item" v-for="(value, key) in selectedItem" :key="key">
          <label>{{ key }}</label>
          <span>{{ value }}</span>
        </div>
      </div>
    </el-drawer>
  </div>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue';

// 表头配置
const headers = ['序号', '供应商', '合同', '已付款', '未付款', '累计未付情况'];

// 数据状态
const gysData = ref([]);
const currentPage = ref(1);
const pageSize = ref(10);
const isLoading = ref(false);
const hasMore = ref(true);

// 抽屉状态
const drawerVisible = ref(false);
const selectedItem = ref(null);

// 当前列表数据
const currentData = computed(() => gysData.value);

// 显示详情
const showDetail = (item) => {
  selectedItem.value = item;
  drawerVisible.value = true;
};

// 加载更多数据
const loadMore = async () => {
  if (isLoading.value || !hasMore.value) return;
  isLoading.value = true;

  // 模拟假数据
  const mockData = Array.from({ length: pageSize.value }, (_, i) => ({
    id: currentPage.value * pageSize.value + i + 1, // 添加 id 字段
    供应商: `供应商 ${currentPage.value * pageSize.value + i + 1}`,
    合同: `合同 ${currentPage.value * pageSize.value + i + 1}`,
    已付款: `${Math.floor(Math.random() * 10000)} 元`,
    未付款: `${Math.floor(Math.random() * 5000)} 元`,
    累计未付情况: `${Math.floor(Math.random() * 15000)} 元`
  }));

  gysData.value = [...gysData.value, ...mockData];
  hasMore.value = currentPage.value * pageSize.value < 100; // 假设总数据量为 100
  currentPage.value++;
  isLoading.value = false;
};

// 初始化加载
onMounted(() => {
  loadMore();
});
</script>
<style scoped lang="scss">
.list-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;

  .list-header {
    display: flex;
    padding: 1rem;
    font-weight: bold;
    color: #004d40;
    background: linear-gradient(135deg, #80deea, #4dd0e1);

    .list-header-item {
      flex: 1;
      text-align: center;
    }
  }

  .list-body {
    flex: 1;
    overflow-y: auto;
    scrollbar-gutter: stable;

    /* 自定义滚动条样式 */
    &::-webkit-scrollbar {
      width: 8px;
      /* 滚动条宽度 */
    }

    &::-webkit-scrollbar-thumb {
      background: #b0bec5;
      /* 滚动条颜色 */
      border-radius: 4px;
    }

    &::-webkit-scrollbar-thumb:hover {
      background: #90a4ae;
      /* 悬停时滚动条颜色 */
    }

    &::-webkit-scrollbar-track {
      background: #e0e0e0;
      /* 滚动条轨道颜色 */
    }

    .list-row {
      display: flex;
      padding: 1rem;
      border-bottom: 1px solid #eee;

      &:nth-child(odd) {
        background: rgba(0, 0, 0, 0.02);
      }

      &:hover {
        background: rgba(0, 0, 0, 0.05);
        transform: scale(1.01);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .list-cell {
        flex: 1;
        text-align: center;
        color: #004237;
      }
    }
  }

  .pagination {
    text-align: center;
    padding: 0.9rem;

    button {
      padding: 0.5rem 1.5rem;
      border-radius: 8px;
      background: linear-gradient(135deg, #4da6e1, #26c6da);
      color: white;
      cursor: pointer;

      &:hover {
        background: linear-gradient(135deg, #26c6da, #00acc1);
      }
    }
  }
}

.detail-section {
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;

  .detail-item {
    display: flex;
    justify-content: space-between;
    padding: 12px 0;
    border-bottom: 1px solid #eee;

    &:last-child {
      border-bottom: none;
    }

    label {
      color: #00796b;
      font-weight: 500;
    }

    span {
      color: #606266;
    }
  }
}
</style>