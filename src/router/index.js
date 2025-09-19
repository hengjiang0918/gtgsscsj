import { createRouter, createWebHashHistory } from 'vue-router' // 使用 hash 模式

// 路由配置
const routes = [
  {
    path: '/',
    redirect: '/userpage', // Redirect to the home page
  },
  {
    path: '/userpage',
    name: 'userpage',
    component: () => import('@/views/userPage.vue'),
    meta: {
      title: '首页 - 登录&注册',
    },
    children: [
      {
        path: '/userpage',
        redirect: '/userpage/login',
      },
      {
        path: '/userpage/login',
        name: 'login',
        component: () => import('@/views/userPage/LoginForm.vue'),
        meta: {
          title: '首页 - 登录',
        },
      },
      {
        path: '/userpage/register',
        name: 'register',
        component: () => import('@/views/userPage/RegisterForm.vue'),
        meta: {
          title: '首页 - 注册',
        },
      },

    ]
  },
  {
    path: '/indexUser',
    name: 'indexUser',
    component: () => import('@/views/indexUser.vue'),
    redirect: '/BuyingSituation', // 绝对路径
    meta: {
      title: '首页 - 首页',
    },
    children: [
      {
        path: '/BuyingSituation',
        name: 'BuyingSituation',
        component: () => import('../views/indexPage/BuyingSituation.vue'),
        meta: {
          title: '采购情况',
        },
        redirect: '/BuyingSituation/SbshopList', // Redirect to the default child route
        children: [
          {
            path: 'SbshopList',
            name: 'SbshopList',
            component: () => import('../views/indexPage/Buying/SbshopList.vue'),
            meta: {
              title: '采购情况 ',
            },
          },
          {
            path: 'JwlshopList',
            name: 'JwlshopList',
            component: () => import('../views/indexPage/Buying/JwlshopList.vue'),
            meta: {
              title: '采购情况',
            },
          },
          {
            path: '/approval',
            name: 'ApprovalPage',
            component: () => import('../views/indexPage/Buying/ApprovalPage.vue'),
            props: true, // 允许传递参数
            meta: {
              title: '采购情况 ',
            },
          },

        ],
      },
      {
        path: '/EquipmentInfo',
        name: 'EquipmentInfo',
        component: () => import('../views/indexPage/EquipmentInfo.vue'), // Lazy load Dashboard
        meta: {
          title: '首页 - 设备概览', // Page title
        },
        redirect: '/EquipmentInfo/EquipmentList', // 相对路径，指向本 children 下的 EquipmentOverview
        children: [
          {
            path: 'EquipmentOverview',
            name: 'EquipmentOverview',
            component: () => import('../views/indexPage/Equipment/EquipmentOverview.vue'),
            meta: { title: '首页 - 设备概览' },
          },
          {
            path: 'EquipmentList',
            name: 'EquipmentList',
            component: () => import('../views/indexPage/Equipment/EquipmentList.vue'),
            meta: { title: '首页 - 设备列表' },
          },
        ],
      },


      {
        path: '/SupplierManagement',
        name: 'SupplierManagement',
        component: () => import('../views/indexPage/SupplierManagement.vue'),
        meta: {
          title: '供应商管理',
        },
        redirect: '/SupplierManagement/SupplierList', // Redirect to the default child route
        children: [

          {
            path: 'SupplierList',
            name: 'SupplierList',
            component: () => import('../views/indexPage/Supplier/SupplierList.vue'),
            meta: {
              title: '供应商管理 - 供应商列表',
            },
          },
          {
            path: 'SupplierContract',
            name: 'SupplierContract',
            component: () => import('../views/indexPage/Supplier/SupplierContract.vue'),
            meta: {
              title: '供应商管理 - 供应商合同执行情况',
            },
          },
          {
            path: '/SupplierDetail',
            name: 'SupplierDetail',
            component: () => import('../views/indexPage/Supplier/SupplierDetail.vue'),
            meta: {
              title: '供应商管理 - 供应商详情',
            },
          },
        ],
      },

      {
        path: '/Approval',
        name: 'Approval',
        component: () => import('../views/indexPage/Approval.vue'),
        meta: {
          title: '首页 - 采购申报',
        },
        redirect: '/Approval/Purchase', // Redirect to the default child route
        children: [
          {
            path: 'Purchase',
            name: 'Purchase',
            component: () => import('../views/indexPage/Approval/PurchaseApply.vue'),
            meta: {},
          },
          {
            path: 'Scrap',
            name: 'Scrap',
            component: () => import('../views/indexPage/Approval/ScrapApply.vue'),
            meta: {},
          },
        ],
      },
      {
        path: '/Management',
        name: 'Management',
        component: () => import('../views/indexPage/Management.vue'),
        meta: {
          title: '首页 - 管理',
        },

      },
      // {
      //   path: '/ExistingProjectImport',
      //   name: 'ExistingProjectImport',
      //   component: () => import('../views/indexPage/ExistingProjectImport.vue'),
      //   meta: {
      //     title: '首页 - 已有项目录入',
      //   },
      // },
    ]
  },
  {
    path: '/indexManager',
    name: 'indexManager',
    component: () => import('@/views/indexManager.vue'),
    redirect: '/equipmentComparison',
    meta: {
      title: '首页 - 首页',
    },
    children: [
      {
        path: '/equipmentComparison',
        name: 'equipmentComparison',
        component: () => import('@/views/indexManager/equipmentComparison.vue'),
        meta: {
          title: '设备一览',
        },
      },
      {
        path: '/priceComparison',
        name: 'priceComparison',
        component: () => import('@/views/indexManager/priceComparison.vue'),
        meta: {
          title: '比价一览',
        },
      },
      {
        path: '/PrepaymentOverview',
        name: 'PrepaymentOverview',
        component: () => import('@/views/indexManager/PrepaymentOverview.vue'),
        meta: {
          title: '预付款一览',
        },
      },
      {
        path: '/ProgressOverview',
        name: 'ProgressOverview',
        component: () => import('@/views/indexManager/ProgressOverview.vue'),
        meta: {
          title: '进度一览',
        },
      },
    ]
  }
];

// 创建路由实例
const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL), // 使用 hash 模式
  routes,
})

// 路由导航守卫：动态设置页面标题
router.beforeEach((to, from, next) => {
  document.title = to.meta.title || '设备管理系统' // 设置页面标题
  next()
})

export default router