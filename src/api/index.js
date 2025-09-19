import apiMap from './apiMap'
import { post, get } from './apiService'

export default {
    // 采购相关接口
    purchaseList: (data, options) => post(apiMap.purchaseList, data, options),   // 获取采购列表
    purchaseDetail: (data, options) => post(apiMap.purchaseDetail, data, options),   // 获取采购详情
    createPurchase: (data, options) => post(apiMap.createPurchase, data, options),   // 创建采购
    deletePurchase: (data, options) => post(apiMap.deletePurchase, data, options),   // 删除采购
    submitStep: (data, options) => post(apiMap.submitStep, data, options),   // 提交采购流程步骤
    approveStepPass: (data, options) => post(apiMap.approveStepPass, data, options),   // 审批采购流程步骤
    approveStepReject: (data, options) => post(apiMap.approveStepReject, data, options),   // 审批采购流程步骤
    purchaseSteps: (data, options) => post(apiMap.purchaseSteps, data, options),   // 获取采购流程步骤
    updateEquipmentSupply: (data, options) => post(apiMap.updateEquipmentSupply, data, options),   // 获取采购流程步骤
    saveSupplyChoose: (data, options) => post(apiMap.saveSupplyChoose, data, options),   // 获取采购流程步骤
    resetSupply: (data, options) => post(apiMap.resetSupply, data, options),   // 获取采购流程步骤
    updateTimePayment: (data, options) => post(apiMap.updateTimePayment, data, options),   // 获取采购流程步骤
    updatePurchasepayment: (data, options) => post(apiMap.updatePurchasepayment, data, options),   // 获取采购流程步骤
    getEquipmentDeliveryStatus: (data, options) => post(apiMap.getEquipmentDeliveryStatus, data, options),   // 获取采购流程步骤
    saveEquipmentDelivery: (data, options) => post(apiMap.saveEquipmentDelivery, data, options),   // 获取采购流程步骤
    updateSupplyChoose: (data, options) => post(apiMap.updateSupplyChoose, data, options),   // 获取采购流程步骤
    deleteEquipment: (data, options) => post(apiMap.deleteEquipment, data, options),   // 获取采购流程步骤

    // 文件上传相关接口
    uploadExcel: (data, options) => post(apiMap.uploadExcel, data, options),   // 上传Excel文件
    uploadAttachment: (data, options) => post(apiMap.uploadAttachment, data, options),   // 上传附件
    exportExcel: (data, options) => post(apiMap.exportExcel, data, options),   // 导出立项文件
    batchUploadAttachment: (data, options) => post(apiMap.batchUploadAttachment, data, options),   // 上传附件
    deleteAttachment: (data, options) => post(apiMap.deleteAttachment, data, options),   // 删除附件
    exportPayment: (data, options) => post(apiMap.exportPayment, data, options),   // 导出付款申请

    // 用户相关接口
    register: (data, options) => post(apiMap.register, data, options),         // 用户注册
    login: (data, options) => post(apiMap.login, data, options),               // 用户登录
    logout: (data, options) => post(apiMap.logout, data, options),             // 用户登出
    userinfo: (data, options) => post(apiMap.userinfo, data, options),         // 获取用户信息
    userList: (data, options) => post(apiMap.userList, data, options),         // 获取用户列表
    resetPassword: (data, options) => post(apiMap.resetPassword, data, options),         // 重置密码
    updateUserinfo: (data, options) => post(apiMap.updateUserinfo, data, options),         // 更新用户信息

    // ...更多接口

    supplierList: (data, options) => post(apiMap.supplierList, data, options),           // 获取供应商列表
    getAssetList: (data, options) => post(apiMap.getAssetList, data, options),           // 获取资产列表
    getScanQrcode: (data, options) => post(apiMap.getScanQrcode, data, options),           // 获取二维码
    getEquipmentQuotes: (data, options) => post(apiMap.getEquipmentQuotes, data, options),  // 获取设备报价
    // 获取二维码

    // ===========================================
    // 设备分类和项目管理接口
    // ===========================================

    equipmentCategory: (data, options) => post(apiMap.equipmentCategory, data, options),  // 获取设备分类列表
    projectList: (data, options) => post(apiMap.projectList, data, options),  // 获取设备分类列表
    projectCreate: (data, options) => post(apiMap.projectCreate, data, options),  // 获取设备分类列表
    projectUpdate: (data, options) => post(apiMap.projectUpdate, data, options),  // 获取设备分类列表
    projectDelete: (data, options) => post(apiMap.projectDelete, data, options),  // 获取设备分类列表
    equipmentUpdate: (data, options) => post(apiMap.equipmentUpdate, data, options),  // 获取设备分类列表
    equipmentList: (data, options) => post(apiMap.equipmentList, data, options),  // 获取设备分类列表
    equipmentPaymentList: (data, options) => post(apiMap.equipmentPaymentList, data, options),  // 获取设备分类列表
    equipmentProgressList: (data, options) => post(apiMap.equipmentProgressList, data, options),  // 获取设备分类列表

}
