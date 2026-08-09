/**
 * 环境解析与切换 composable
 *
 * 优先级（从高到低）：
 *   1. URL 参数 ?env=xxx（仅开发环境生效）
 *   2. Cookie dev_env（替代 sessionStorage，SSR 安全）
 *   3. runtimeConfig.public.defaultEnv（构建时注入）
 *   4. 默认值 'saas'
 */
import { pathConfigMap } from '~/utils/envList'

export function useEnv() {
  const config = useRuntimeConfig()
  const route = useRoute()
  const devEnvCookie = useCookie<string>('dev_env', {
    default: () => '',
    maxAge: 60 * 60 * 24 * 30,
  })

  /**
   * 从 URL 查询参数中提取指定参数的值（兼容 hash 模式）
   */
  function getQueryParam(name: string): string | null {
    // window.location.search
    const reg = new RegExp(`(^|&)${name}=([^&]*)(&|$)`, 'i')
    let r: RegExpMatchArray | null = null
    if (import.meta.client) {
      r = window.location.search.substring(1).match(reg)
      if (!r && window.location.hash) {
        const hashSearch = window.location.hash.split('?')[1] || ''
        r = hashSearch.match(reg)
      }
    }
    if (r != null) {
      return decodeURIComponent(r[2])
    }
    return null
  }

  /** 当前解析的环境名 */
  const resolvedEnv = computed<string>(() => {
    // 1. URL 参数（仅开发环境）
    if (import.meta.dev) {
      const urlEnv = getQueryParam('env')
      if (urlEnv && pathConfigMap[urlEnv]) return urlEnv
    }
    // 2. Cookie
    if (devEnvCookie.value && pathConfigMap[devEnvCookie.value]) {
      return devEnvCookie.value
    }
    // 3. runtimeConfig
    const defaultEnv = config.public.defaultEnv as string
    if (defaultEnv && pathConfigMap[defaultEnv]) return defaultEnv
    // 4. 默认
    return 'saas'
  })

  /** 当前环境配置 */
  const envConfig = computed(() => pathConfigMap[resolvedEnv.value])

  /** 网关地址 */
  const gateway = computed(() => envConfig.value?.gateway || '')

  /** WebSocket 配置 */
  const wsConfig = computed(() => ({
    protocol: envConfig.value?.ws_protocol || 'ws',
    ip: envConfig.value?.ws_ip || '',
    port: envConfig.value?.ws_port || '',
    gateway: envConfig.value?.ws_gateway || '',
  }))

  /** 首页 pageNo */
  const homePageNo = computed(() => envConfig.value?.homePageNo)

  /** 切换环境 */
  function switchEnv(env: string) {
    if (!pathConfigMap[env]) {
      console.warn(`[useEnv] Unknown environment: ${env}`)
      return
    }
    devEnvCookie.value = env
    // 生产环境切换需要刷新页面
    if (import.meta.client && !import.meta.dev) {
      window.location.reload()
    }
  }

  return {
    resolvedEnv,
    envConfig,
    gateway,
    wsConfig,
    homePageNo,
    switchEnv,
    pathConfigMap,
    getQueryParam,
  }
}
