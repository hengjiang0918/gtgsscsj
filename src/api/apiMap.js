/**
 * 系统的API接口映射表。
 * 
 * @typedef {Object} ApiMap
 * // ...更多接口
 */

export default {
  // 用户相关接口
  register: '/api/register',                  // 用户注册
  login: '/api/login',                        // 用户登录
  logout: '/api/logout',                      // 用户退出
  userinfo: '/api/userinfo',                  // 获取用户信息
  userList: '/api/userList',                  // 获取用户信息
  resetPassword: '/api/resetPassword',                  // 获取用户信息
  updateUserinfo: '/api/updateUserinfo',                  // 获取用户信息

  // 采购管理相关接口
  purchaseList: '/api/purchaseList',          // 获取采购列表
  createPurchase: '/api/createPurchase',      // 创建采购单
  deletePurchase: '/api/deletePurchase',      // 删除采购单
  purchaseSteps: '/api/purchaseSteps',        // 获取采购流程步骤
  purchaseDetail: '/api/purchaseDetail',      // 获取采购详情
  submitStep: '/api/submitStep',              // 提交采购流程步骤
  approveStepPass: '/api/approveStepPass',            // 审批通过采购流程步骤
  approveStepReject: '/api/approveStepReject',            // 审批拒绝采购流程步骤
  updateEquipmentSupply: '/api/updateEquipmentSupply',            // 更新设备供应信息
  saveSupplyChoose: '/api/saveSupplyChoose',            // 保存设备供应选择
  updateTimePayment: '/api/updateTimePayment',            // 更新付款时间
  updatePurchasepayment: '/api/updatePurchasepayment',            // 更新设备采购付款信息
  getEquipmentDeliveryStatus: '/api/getEquipmentDeliveryStatus',            // 获取设备交付状态
  saveEquipmentDelivery: '/api/saveEquipmentDelivery',            // 保存设备交付信息
  updateSupplyChoose: '/api/updateSupplyChoose',            // 更新供应商选择
  deleteEquipment: '/api/deleteEquipment',            // 更新供应商选择

  // 附件管理相关接口
  batchUploadAttachment: '/api/batch_upload_excel',  // 批量上传附件
  uploadAttachment: '/api/uploadAttachment',  // 上传附件
  deleteAttachment: '/api/deleteAttachment',  // 删除附件
  uploadExcel: '/api/upload_excel',           // 上传Excel文件
  exportExcel: '/api/exportExcel',           // 导出Excel文件
  exportPayment: '/api/exportPayment',           // 导出付款信息
  updateInquiryStatus: '/api/updateInquiryStatus',           // 更新询价状态

  // 供应商相关接口
  supplierList: '/api/supplierList',          // 获取供应商列表

  // 资产管理相关接口
  getAssetList: '/api/getAssetList',          // 获取资产列表
  getScanQrcode: '/api/getScanQrcode',          // 获取二维码
  resetSupply: '/api/resetSupply',          // 重置报价
  getEquipmentQuotes: '/api/getEquipmentQuotes',          // 获取设备报价

  // ===========================================
  // 设备分类和项目管理接口
  // ===========================================
  equipmentCategory: '/api/equipmentCategory',     // 获取设备分类列表
  projectList: '/api/projectList',            // 获取项目列表
  projectCreate: '/api/projectCreate',        // 创建项目
  projectUpdate: '/api/projectUpdate',        // 更新项目
  projectDelete: '/api/projectDelete',        // 删除项目
  equipmentUpdate: '/api/equipmentUpdate',        // 更新设备



  equipmentList: '/api/equipmentList',        // 更新设备
  equipmentPaymentList: '/api/equipmentPaymentList',        // 更新设备
  equipmentProgressList: '/api/equipmentProgressList',        // 更新设备
}
