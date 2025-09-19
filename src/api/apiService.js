import request from '@/utils/request'
import { ElMessage } from 'element-plus'

// 统一处理接口返回结构
function handleResponse(res, { showSuccessMsg, showErrorMsg } = {}) {
  // 假设后端返回 { code, data, msg }
  if (res.code === 0) {

    if (showSuccessMsg || res.message)
      // console.log('接口响应:', res)

      return res.data
  } else {
    if (showErrorMsg !== false || res.msg)
      throw new Error(res.msg || '接口请求失败')
  }
}

// 通用 post 方法
export function post(url, data = {}, options = {}) {
  return request.post(url, data, options.config || {})
    .then(res => handleResponse(res, options))
}

// 通用 get 方法
export function get(url, params = {}, options = {}) {
  return request.get(url, { params, ...(options.config || {}) })
    .then(res => handleResponse(res, options))
}