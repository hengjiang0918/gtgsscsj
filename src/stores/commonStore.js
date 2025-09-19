import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useCommonStore = defineStore('Common', () => {
  const Common_factory = ref([
    { label: 'CBK', value: 'CBK' },
    { label: 'RG', value: 'RG' },
    { label: 'KH', value: 'KH' },
    { label: 'GS', value: 'GS' },
    { label: 'GW', value: 'GW' },
    { label: 'WINAS', value: 'WINAS' }
  ]

  )
  const Common_department = ref([
    { label: '服一分公司', value: '服一分公司' },
    { label: '服三分公司', value: '服三分公司' },
    { label: '服五分公司', value: '服五分公司' },
    { label: '服六分公司', value: '服六分公司' },
    { label: '服七分公司', value: '服七分公司' },
    { label: '服八分公司', value: '服八分公司' },
    { label: '服九分公司', value: '服九分公司' },
    { label: '服十二分公司', value: '服十二分公司' },
    { label: '服十五分公司', value: '服十五分公司' },
    { label: '服十六分公司', value: '服十六分公司' },
    { label: '服十七分公司', value: '服十七分公司' },
    { label: '服十九分公司', value: '服十九分公司' },
    { label: '生产部', value: '生产部' }
  ]

  )

  return { Common_factory, Common_department }
}, {
  persist: {
    paths: ['Common_factory', 'Common_department'] // 只持久化 Common_factory 和 Common_department
  }
})
