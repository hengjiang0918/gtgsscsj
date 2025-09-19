import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'
const baseURL = import.meta.env.VITE_API_DEVELOPMENT_URL
console.log('当前环境的API地址:', baseURL)
const instance = axios.create({
    baseURL,
    timeout: 10000,
    withCredentials: true // 关键：允许携带cookie
})

// 响应拦截器：统一处理 HTTP 状态码和错误信息
instance.interceptors.response.use(
    response => {
        // 业务code未登录或无权限（如后端返回 {code: 401/403, ...}）
        if (response.data && (response.data.code === 403 || response.data.code === 401)) {
            ElMessage.error(response.data.message || '请先登录')
            router.replace({ name: 'login' })
            return Promise.reject(new Error('未登录或无权限'))
        }
        return response.data
    },
    error => {
        // HTTP状态码未登录或无权限
        if (error.response && (error.response.status === 403)) {
            ElMessage.error(error.response.data?.message || '请先登录')
            router.replace({ name: 'login' })
            return Promise.reject(new Error('未登录或无权限'))
        } else if (error.response && (error.response.status === 401)) {
            ElMessage.error(error.response.data?.message || '用户名或密码错误')
            router.replace({ name: 'login' })
            return Promise.reject(new Error('用户名或密码错误'))
        }
        ElMessage.error(error.response.data.message || '请求失败')
        return Promise.reject(error)
    }
)

export default instance