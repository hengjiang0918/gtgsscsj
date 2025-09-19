<template>
  <div ref="chartEl" style="width: 100%; height: 300px;"></div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  data: {
    type: Array,
    required: true
  }
})
const chartEl = ref(null)
let chart = null

onMounted(() => {
  chart = echarts.init(chartEl.value)
  updateChart()
  window.addEventListener('resize', chart.resize) // 监听窗口大小变化
})

watch(() => props.data, () => {
  updateChart()
})

const updateChart = () => {
  if (!chart || !props.data.length) return

  // 计算最大值和最小值
  const values = props.data.map(item => item.value)
  const maxValue = Math.max(...values)
  const minValue = Math.min(...values)

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow' // 鼠标悬浮时显示阴影指示器
      },
      backgroundColor: 'rgba(50, 50, 50, 0.8)', // 提示框背景色
      textStyle: {
        color: '#fff' // 提示框文字颜色
      }
    },
    grid: {
      left: '5%',
      right: '5%',
      bottom: '10%',
      top: '10%',
      containLabel: true // 保证坐标轴标签不会被裁剪
    },
    xAxis: {
      type: 'category',
      data: props.data.map(item => item.name),
      axisLine: {
        lineStyle: {
          color: '#ccc' // 坐标轴线颜色
        }
      },
      axisTick: {
        show: false // 隐藏刻度线
      },
      axisLabel: {
        color: '#666', // 坐标轴文字颜色
        fontSize: 13, // 坐标轴文字大小
        interval: 0, // 强制显示所有标签
        rotate: 0 // 旋转标签，避免重叠
      }
    },
    yAxis: {
      type: 'value',
      axisLine: {
        show: false // 隐藏坐标轴线
      },
      splitLine: {
        lineStyle: {
          type: 'dashed', // 虚线分割线
          color: '#e0e0e0'
        }
      },
      axisLabel: {
        color: '#666', // 坐标轴文字颜色
        fontSize: 12 // 坐标轴文字大小
      }
    },
    series: [
      {
        data: props.data.map((item, index) => ({
          value: item.value,
          itemStyle: {
            color:
              item.value === maxValue
                ? '#FF4500' // 最高值颜色（橙红色）
                : item.value === minValue
                  ? '#1E90FF' // 最低值颜色（深蓝色）
                  : new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: '#67C23A' }, // 普通渐变色
                    { offset: 1, color: '#409EFF' }
                  ])
          }
        })),
        type: 'bar',
        barWidth: '20%', // 调整柱状图宽度
        showBackground: true,
        backgroundStyle: {
          color: 'rgba(220, 220, 220, 0.3)' // 柱状图背景颜色
        },
        label: {
          show: true,
          position: 'top', // 数据标签显示在柱状图顶部
          color: '#333', // 数据标签颜色
          fontSize: 12 // 数据标签字体大小
        }
      }
    ],
    animationDuration: 800, // 动画时长
    animationEasing: 'cubicOut' // 动画效果
  }

  chart.setOption(option)
}
</script>