/**
 * 低代码页面核心 composable
 *
 * 迁移自原项目：
 * - src/pages/lowcode/mixins/lowcode-page-mixin.js
 * - src/pages/lowcode/mixins/page-params-mixin.js
 *
 * 提供：页面配置加载、组件初始化、主题设置、参数管理
 */
import type { PageConfig, ComponentConfig, InterfaceParam, AppConfig } from '~/types/lowcode'
import { buildComponentsTree } from '~/utils/buildTree'

export function useLowcodePage() {
  const { selectOne, selectList } = useHttp()
  const themeStore = useThemeStore()
  const route = useRoute()
  const { homePageNo } = useEnv()

  // App 配置缓存（页面级 Map，替代原模块级 Map）
  const appConfigCache = new Map<string, AppConfig>()

  // ===== 状态 =====
  const pageNo = ref<string | null>(null)
  const pageConfig = ref<PageConfig | null>(null)
  const components = ref<ComponentConfig[]>([])
  const queryOptions = ref<Record<string, unknown>>({})
  const pageParams = ref<Record<string, Record<string, unknown>>>({})
  const pageParamsModel = ref<Record<string, Record<string, unknown>>>({})
  const pageSwitching = ref(false)
  const appCfg = ref<AppConfig | null>(null)

  // ===== 计算属性 =====
  const contentAreaWidth = computed(() => {
    const width = pageConfig.value?.content_area_width || 1400
    return typeof width === 'string' && width.includes('%') ? width : `${parseFloat(String(width))}px`
  })

  const setStyle = computed(() => {
    const style: Record<string, unknown> = {}
    if (pageConfig.value?.page_style_json_data) {
      Object.assign(style, pageConfig.value.page_style_json_data)
    }
    return style
  })

  // ===== 方法 =====

  /** 解析页面配置中的 JSON 字段（*_json → *_json_data） */
  function parsePageConfig(data: Record<string, unknown>): void {
    for (const key of Object.keys(data)) {
      if (key.includes('_json') && data[key]) {
        const suffixKey = `${key}_data`
        if (typeof data[key] === 'object') {
          ;(data as Record<string, unknown>)[suffixKey] = data[key]
        } else {
          try {
            ;(data as Record<string, unknown>)[suffixKey] = JSON.parse(data[key] as string)
          } catch (e) {
            console.error(`[useLowcodePage] Failed to parse ${key}:`, e)
          }
        }
      }
    }
  }

  /** 获取 App 配置 */
  async function fetchAppConfig(appNo: string): Promise<AppConfig | null> {
    if (!appNo) return null
    if (appConfigCache.has(appNo)) return appConfigCache.get(appNo)!

    const { data, ok } = await selectOne<AppConfig>(
      `/config/select/srvpage_cfg_app_guest_select`,
      {
        serviceName: 'srvpage_cfg_app_guest_select',
        colNames: ['*'],
        condition: [{ colName: 'app_no', ruleType: 'eq', value: appNo }],
        page: { pageNo: 1, rownumber: 1 },
      }
    )
    if (ok && data) {
      appConfigCache.set(appNo, data)
      return data
    }
    return null
  }

  /** 应用页面主题 */
  function applyPageTheme(data: PageConfig) {
    const appJsonData = data.app_json_data
    if (!appJsonData) return

    let ct = appJsonData.current_theme
    if (import.meta.client && localStorage.getItem('currentTheme') && localStorage.getItem('currentTheme') !== ct) {
      ct = localStorage.getItem('currentTheme')!
    }
    if (!ct && appJsonData.theme_list?.length) {
      ct = appJsonData.theme_list[0].name
    }

    themeStore.initTheme({
      currentTheme: ct,
      themeList: appJsonData.theme_list || [],
    })
  }

  /** 构建组件列表（含类型映射） */
  function buildComponentList(list: ComponentConfig[]): ComponentConfig[] {
    const mapped = list.map((item) => {
      if (item.com_type === 'layout') {
        const layoutParty = (item.layout_json as Record<string, string>)?.layout_party
        if (layoutParty === '页面') {
          item.component = 'lc-container'
          item.type = 'container'
        } else if (layoutParty === '布局') {
          item.component = 'lc-block'
          item.type = 'layout'
        } else {
          item.component = 'lc-content'
          item.type = 'content'
        }
      } else {
        item.component = 'page-item'
        if (item.com_option?.includes('悬浮可拖动')) {
          item.component = 'float-component'
        }
      }
      return item
    })

    return buildComponentsTree(mapped).sort((a, b) => a.com_seq - b.com_seq)
  }

  /** 获取页面配置（完整流程） */
  async function getPageConfig(pNo?: string): Promise<boolean> {
    const targetNo = pNo || pageNo.value
    if (!targetNo) return false

    const { data, ok, msg } = await selectOne<PageConfig>(
      `/config/select/srvpage_cfg_page_guest_select`,
      {
        serviceName: 'srvpage_cfg_page_guest_select',
        colNames: ['*'],
        condition: [{ colName: 'page_no', ruleType: 'eq', value: targetNo }],
      }
    )

    if (!ok || !data) {
      console.warn(`[useLowcodePage] Failed to load page config for ${targetNo}:`, msg || 'No data')
      return false
    }

    // 解析 JSON
    parsePageConfig(data as unknown as Record<string, unknown>)
    pageConfig.value = data

    // 获取 App 配置
    if (data.app_no) {
      const ac = await fetchAppConfig(data.app_no)
      if (ac) {
        appCfg.value = ac
        if (import.meta.client) {
          sessionStorage.setItem('lowAppCfg', JSON.stringify(ac))
        }
      }
    }

    // 初始化主题
    applyPageTheme(data)

    // 初始化组件
    const rawComponents = (data as unknown as Record<string, unknown>)
      .page_row_json_data as { component_json?: ComponentConfig[] } | undefined
    if (rawComponents?.component_json) {
      components.value = buildComponentList(rawComponents.component_json)
    }

    // 初始化页面参数
    await initPageParams()

    // 应用主题变量到 DOM
    applyThemeVariables()

    return true
  }

  /** 初始化页面参数（URL query + 接口查询） */
  async function initPageParams() {
    const cfg = pageConfig.value
    if (!cfg) return

    // 从路由获取 query
    const urlParams = { ...route.query }
    queryOptions.value = urlParams

    // 通过页面配置的接口查询全局参数
    if (cfg.srv_req_json_data && cfg.cols_map_json_data) {
      try {
        const req = JSON.parse(JSON.stringify(cfg.srv_req_json_data))
        const app = req.mapp || 'config'
        const res = await selectOne(`/${app}/select/${req.serviceName}`, req)
        if (res.ok && res.data) {
          const data = res.data as Record<string, unknown>
          for (const key of Object.keys(cfg.cols_map_json_data)) {
            const mappedKey = cfg.cols_map_json_data[key]
            ;(queryOptions.value as Record<string, unknown>)[key] = data[mappedKey]
          }
        }
      } catch (e) {
        console.error('[useLowcodePage] Failed to fetch page query options:', e)
      }
    }

    // 构建 paramsModel
    const model: Record<string, Record<string, unknown>> = {}
    const paraList = cfg.interface_json_data || (cfg as unknown as Record<string, InterfaceParam[]>).para_json || []

    for (const param of paraList) {
      const keyName = param.para_name || param.para
      const urlKeys = Object.keys(queryOptions.value)
      model[keyName] = {
        value: urlKeys.includes(keyName) ? queryOptions.value[keyName] : (param.default_val || ''),
      }
    }

    pageParams.value = { ...model }
    pageParamsModel.value = { ...model }
  }

  /** 应用主题 CSS 变量到 body */
  function applyThemeVariables() {
    if (!import.meta.client) return
    const vars = themeStore.themeVariable
    const styleStr = Object.entries(vars)
      .map(([k, v]) => `${k}: ${v}`)
      .join('; ')
    document.body.setAttribute('style', styleStr)
  }

  /** 设置页面参数（子组件调用） */
  function setPageParams(key: string, val: unknown) {
    if (pageParamsModel.value[key]) {
      pageParamsModel.value[key].value = val
    }
  }

  return {
    // 状态
    pageNo,
    pageConfig,
    components,
    queryOptions,
    pageParams,
    pageParamsModel,
    pageSwitching,
    appCfg,
    // 计算属性
    contentAreaWidth,
    setStyle,
    // 方法
    getPageConfig,
    initPageParams,
    setPageParams,
    applyThemeVariables,
    buildComponentList,
    fetchAppConfig,
    parsePageConfig,
  }
}
