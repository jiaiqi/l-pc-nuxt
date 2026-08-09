import type { PathConfigMap } from '~/types/lowcode'

/**
 * 环境配置列表
 *
 * 所有环境配置集中管理，提交到 git。
 * 个人本地覆盖通过 .env 的 NUXT_PUBLIC_DEFAULT_ENV 指定环境名即可。
 *
 * 切换方式（优先级从高到低）：
 *   1. URL 参数：?env=xxx（仅开发环境生效）
 *   2. Cookie：dev_env（SSR 安全，替代原 sessionStorage）
 *   3. runtimeConfig.public.defaultEnv（构建时注入）
 *   4. 默认值 'saas'
 */
export const pathConfigMap: PathConfigMap = {
  // ==================== 开发环境 ====================
  dev: {
    name: '本地开发',
    gateway: 'http://192.168.0.54:8104',
    sso_app: 'sso',
    application: 'hsprl',
  },
  dev2: {
    name: '开发环境2',
    gateway: 'http://192.168.0.155:180',
    sso_app: 'sso',
    application: 'sapp',
  },
  dev3: {
    name: '宝博/试飞/低空/电建',
    gateway: 'http://172.17.2.194/bxapi',
    sso_app: 'sso',
    suffix: '/bxapi',
    application: 'bboa',
  },
  dev4: {
    name: '配置开发',
    gateway: 'http://192.168.0.209/bxapi',
    sso_app: 'sso',
    suffix: '/bxapi',
    application: 'config',
  },
  '110': {
    name: '110开发',
    gateway: 'http://192.168.0.110:180',
    sso_app: 'sso',
    application: 'bms',
  },
  '244': {
    name: '244开发',
    gateway: 'http://192.168.0.244:8101',
    sso_app: 'sso',
    application: 'vxfinance',
  },

  // ==================== 正式/SaaS ====================
  saas: {
    name: 'SaaS正式',
    gateway: 'https://api.100xsys.cn:443',
    sso_app: 'sso',
    application: 'config',
    app_path: 'https://api.100xsys.cn:443/oa',
    ws_protocol: 'ws',
    ws_ip: '192.168.0.157',
    ws_port: '55555',
    ws_gateway: 'ws://192.168.0.157:55555',
  },
  baobo: {
    name: '宝博正式',
    gateway: 'https://sxbbcs.com/bxapi',
    sso_app: 'sso',
    application: 'config',
  },

  // ==================== 延安园区 ====================
  parkDev: {
    name: '延安园区开发',
    gateway: 'http://192.168.0.214/bxapi',
    sso_app: 'sso',
    application: 'config',
    homePageNo: 'BX2506130908230001',
    btnStyle: 'park',
  },
  park: {
    name: '延安园区生产',
    gateway: 'https://www.gxqcxkj.com/bxapi',
    sso_app: 'sso',
    application: 'config',
    homePageNo: 'BX2506130908230001',
    btnStyle: 'park',
  },

  // ==================== 研学 ====================
  yanxue2: {
    name: '研学2.0',
    gateway: 'http://yxsj.sneducloud.com/yxapi',
    sso_app: 'sso',
    suffix: '/yxapi',
    application: 'config',
  },
  yanxueDev: {
    name: '研学开发',
    gateway: 'http://192.168.0.157:8104',
    sso_app: 'sso',
    application: 'config',
  },

  // ==================== 稽核 ====================
  audDev: {
    name: '稽核开发',
    gateway: 'http://192.168.0.151:180',
    sso_app: 'sso',
    application: 'aud',
  },

  // ==================== 高速 ====================
  gaosudev: {
    name: '高速开发',
    gateway: 'http://192.168.0.140:180',
    sso_app: 'sso',
    application: 'idm',
  },

  // ==================== 其他 ====================
  xixiang: {
    name: '西乡',
    gateway: 'https://api.laodongcloud.com',
    sso_app: 'sso',
    application: 'ledu',
  },
  healthDev: {
    name: '健康开发',
    gateway: 'http://192.168.0.154:8104',
    sso_app: 'sso',
    application: 'hsprl',
  },
  healthProd: {
    name: '健康生产',
    gateway: 'https://admin.bxjkw.cn/bxapi',
    sso_app: 'sso',
    application: 'hsprl',
  },
}
