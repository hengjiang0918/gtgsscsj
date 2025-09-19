<template>
    <div ref="chartEl" style="width: 100%; height: 300px;"></div>
  </template>
  
  <script setup>
  import { ref, onMounted, watch } from 'vue'
  import * as echarts from 'echarts'
  
  const props = defineProps({
    data: {
      type: Object,
      required: true,
      validator: (value) => {
        return value.indicator && value.data
      }
    }
  })
  
  const chartEl = ref(null)
  let chart = null
  
  onMounted(() => {
    chart = echarts.init(chartEl.value)
    updateChart()
  })
  
  watch(() => props.data, () => {
    updateChart()
  })
  
  const updateChart = () => {
    if (!chart || !props.data.indicator || !props.data.data) return
    
    const option = {
      tooltip: {},
      radar: {
        indicator: props.data.indicator,
        radius: '65%'
      },
      series: [{
        type: 'radar',
        data: props.data.data.map(item => ({
          ...item,
          areaStyle: {
            color: 'rgba(64, 158, 255, 0.3)'
          },
          lineStyle: {
            width: 2
          }
        }))
      }]
    }
    
    chart.setOption(option)
    window.addEventListener('resize', chart.resize)
  }
  </script>