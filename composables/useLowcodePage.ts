/**
 * 低代码页面核心 composable（增强版）
 * 包含：页面配置加载、SWR 缓存、图片预加载、组件树构建、主题、参数管理
 */
import type { PageConfig, ComponentConfig, InterfaceParam, AppConfig } from '~/types/lowcode'
import { buildComponentsTree } from '~/utils/buildTree'

// 模块级缓存（跨页面实例共享）
const appConfigCache = new Map<string, AppConfig>()

interface PageSnapshot {
  fingerprint: string
  prepared: PreparedPageData
}

interface PreparedPageData {
  ok: boolean
  msg?: string
  data: PageConfig
  components: ComponentConfig[]
  appCfg: AppConfig | null
}

const pageSnapshotCache = new Map<string, PageSnapshot>()
const PAGE_CACHE_MAX = 15
let iconifyLoaded = false

export function useLowcodePage() {
  const { selectOne } = useHttp()
  const themeStore = useThemeStore()
  const route = useRoute()
  const app = useNuxtApp()
  const { homePageNo } = useEnv()

  // ===== 状态 =====
  const pageNo = ref<string | null>(null)
  const pageConfig = ref<PageConfig | null>(null)
  const components = ref<ComponentConfig[]>([])
  const queryOptions = ref<Record<string, unknown>>({})
  const pageParams = ref<Record<string, Record<string, unknown>>>({})
  const pageParamsModel = ref<Record<string, Record<string, unknown>>>({})
  const pageSwitching = ref(false)
  const appCfg = ref<AppConfig | null>(null)
  const urlSearchParams = ref<Record<string, unknown>>({})

  // 导航切换序列号（防止竞态）
  let _switchSeq = 0

  // ===== 计算属性 =====
  const contentAreaWidth = computed(() => {
    const width = pageConfig.value?.content_area_width || 1400
    return typeof width === 'string' && width.includes('%') ? width : `${parseFloat(String(width))}px`
  })

  const setStyle = computed(() => {
    const s: Record<string, unknown> = {}
    if (pageConfig.value?.page_style_json_data) Object.assign(s, pageConfig.value.page_style_json_data)
    return s
  })

  // ===== 核心方法 =====

  function parsePageConfig(data: Record<string, unknown>): void {
    for (const key of Object.keys(data)) {
      if (key.includes('_json') && data[key]) {
        const suffixKey = `${key}_data`
        if (typeof data[key] === 'object') {
          ;(data as any)[suffixKey] = data[key]
        } else {
          try { ;(data as any)[suffixKey] = JSON.parse(data[key] as string) } catch {}
        }
      }
    }
  }

  async function fetchAppConfig(appNo: string): Promise<AppConfig | null> {
    if (!appNo) return null
    if (appConfigCache.has(appNo)) return appConfigCache.get(appNo)!
    const { data, ok } = await selectOne<AppConfig>(`/config/select/srvpage_cfg_app_guest_select`, {
      serviceName: 'srvpage_cfg_app_guest_select', colNames: ['*'],
      condition: [{ colName: 'app_no', ruleType: 'eq', value: appNo }],
      page: { pageNo: 1, rownumber: 1 },
    })
    if (ok && data) { appConfigCache.set(appNo, data); return data }
    return null
  }

  function buildComponentList(list: ComponentConfig[]): ComponentConfig[] {
    const mapped = list.map((item) => {
      if (item.com_type === 'layout') {
        const party = (item.layout_json as any)?.layout_party
        if (party === '页面') { item.component = 'lc-container'; item.type = 'container' }
        else if (party === '布局') { item.component = 'lc-block'; item.type = 'layout' }
        else { item.component = 'lc-content'; item.type = 'content' }
      } else {
        item.component = 'page-item'
        if (item.com_option?.includes('悬浮可拖动')) item.component = 'float-component'
      }
      return item
    })
    return buildComponentsTree(mapped).sort((a, b) => a.com_seq - b.com_seq)
  }

  function applyPageTheme(data: PageConfig) {
    const d = data.app_json_data; if (!d) return
    let ct = d.current_theme
    if (import.meta.client) {
      const stored = localStorage.getItem('currentTheme')
      if (stored && stored !== ct) ct = stored
    }
    if (!ct && d.theme_list?.length) ct = d.theme_list[0].name
    themeStore.initTheme({ currentTheme: ct, themeList: d.theme_list || [] })
  }

  function applyThemeToBody() {
    if (!import.meta.client) return
    const vars = themeStore.themeVariable
    const str = Object.entries(vars).map(([k, v]) => `${k}: ${v}`).join('; ')
    document.body.setAttribute('style', str)
  }

  /** 收集组件树中的首屏图片地址 */
  function collectImageUrls(comps: ComponentConfig[], limit = 12): string[] {
    const urls: string[] = []
    const seen = new Set<string>()
    const push = (val: string) => {
      if (!val || seen.has(val) || urls.length >= limit) return
      seen.add(val)
      const m = val.match(/fileNo=(\d+)/)
      if (m) urls.push(`${useEnv().gateway.value}/file/download?fileNo=${m[1]}`)
      else if (/^\d{12,}$/.test(val)) urls.push(`${useEnv().gateway.value}/file/download?fileNo=${val}`)
    }
    function walk(node: unknown) {
      if (!node || urls.length >= limit) return
      if (typeof node === 'string') { push(node); return }
      if (Array.isArray(node)) { node.forEach(walk); return }
      if (typeof node === 'object' && node) {
        for (const [key, val] of Object.entries(node as Record<string, unknown>)) {
          if (typeof val === 'string' && /image|img|icon|logo|photo|pic|src|url/i.test(key)) push(val)
          else if (val && typeof val === 'object') walk(val)
        }
      }
    }
    comps.forEach(walk)
    return urls
  }

  /** 预载图片（带超时） */
  function preloadImages(urls: string[], timeout = 800): Promise<void> {
    if (!urls.length) return Promise.resolve()
    const tasks = urls.map(src => new Promise<void>(resolve => {
      const img = new Image()
      img.onload = () => resolve()
      img.onerror = () => resolve()
      img.src = src
    }))
    return Promise.race([Promise.all(tasks).then(() => {}), new Promise<void>(resolve => setTimeout(resolve, timeout))])
  }

  /** 计算指纹 */
  function fingerprintPage(prepared: PreparedPageData): string {
    try { return JSON.stringify(prepared.data) + '|' + JSON.stringify(prepared.components) }
    catch { return String(Date.now()) }
  }

  // ===== 数据获取与缓存 =====

  /** 准备阶段：只拉取数据，不修改状态 */
  async function fetchPageData(targetNo: string): Promise<PreparedPageData> {
    const { data, ok, msg } = await selectOne<PageConfig>(`/config/select/srvpage_cfg_page_guest_select`, {
      serviceName: 'srvpage_cfg_page_guest_select', colNames: ['*'],
      condition: [{ colName: 'page_no', ruleType: 'eq', value: targetNo }],
    })
    if (!ok || !data) return { ok: false, msg: msg || 'No data', data: {} as PageConfig, components: [], appCfg: null }

    parsePageConfig(data as unknown as Record<string, unknown>)
    const rawComponents = (data as any).page_row_json_data?.component_json || []
    const comps = buildComponentList(rawComponents)
    const ac = data.app_no ? await fetchAppConfig(data.app_no) : null
    return { ok: true, data, components: comps, appCfg: ac }
  }

  /** 提交阶段：一次性应用所有状态 */
  function applyPageData(prepared: PreparedPageData) {
    const { data, components: comps, appCfg: ac } = prepared
    pageNo.value = data.page_no
    pageConfig.value = data
    components.value = comps
    if (ac) { appCfg.value = ac; if (import.meta.client) sessionStorage.setItem('lowAppCfg', JSON.stringify(ac)) }
    applyPageTheme(data)
    applyThemeToBody()
    initPageParams()
  }

  /** 写入缓存 */
  function cacheSet(targetNo: string, prepared: PreparedPageData) {
    if (pageSnapshotCache.has(targetNo)) pageSnapshotCache.delete(targetNo)
    pageSnapshotCache.set(targetNo, { fingerprint: fingerprintPage(prepared), prepared })
    if (pageSnapshotCache.size > PAGE_CACHE_MAX) {
      const oldest = pageSnapshotCache.keys().next().value
      if (oldest) pageSnapshotCache.delete(oldest)
    }
  }

  /** 后台校验缓存 */
  async function revalidatePage(targetNo: string) {
    try {
      const fresh = await fetchPageData(targetNo)
      if (route.params.pageNo !== targetNo) return
      if (!fresh.ok) return
      const cached = pageSnapshotCache.get(targetNo)
      const fp = fingerprintPage(fresh)
      if (cached && cached.fingerprint === fp) return
      cacheSet(targetNo, fresh)
      applyPageData(fresh)
    } catch (e) { console.warn('[revalidatePage]', e) }
  }

  /** 导航切换页面（编排方法） */
  async function loadPageConfig(targetNo: string) {
    if (!targetNo) return

    // 命中缓存：秒开
    const cached = pageSnapshotCache.get(targetNo)
    if (cached) {
      window.scrollTo(0, 0)
      applyPageData(cached.prepared)
      await initPageParams()
      revalidatePage(targetNo)
      return
    }

    // 未命中：两阶段提交
    pageSwitching.value = true
    const seq = (_switchSeq = (_switchSeq || 0) + 1)
    const finish = (delay = 400) => {
      if (_switchSeq !== seq) return
      setTimeout(() => { if (_switchSeq === seq) pageSwitching.value = false }, delay)
    }

    try {
      const prepared = await fetchPageData(targetNo)
      if (route.params.pageNo !== targetNo) return finish()
      if (!prepared.ok) return finish()

      await preloadImages(collectImageUrls(prepared.components))
      if (route.params.pageNo !== targetNo) return finish()

      window.scrollTo(0, 0)
      applyPageData(prepared)
      cacheSet(targetNo, prepared)
      await initPageParams()
      app.$nextTick(() => finish())
    } catch (e) {
      console.error('[loadPageConfig]', e)
      finish()
    }
  }

  // ===== 参数管理 =====

  async function initPageParams() {
    const cfg = pageConfig.value; if (!cfg) return
    const urlParams: Record<string, unknown> = { ...route.query }
    queryOptions.value = urlParams
    urlSearchParams.value = { ...urlParams }

    // 接口查询全局参数
    if (cfg.srv_req_json_data && cfg.cols_map_json_data) {
      try {
        const req = JSON.parse(JSON.stringify(cfg.srv_req_json_data))
        const app = req.mapp || 'config'
        const res = await selectOne(`/${app}/select/${req.serviceName}`, req)
        if (res.ok && res.data) {
          const d = res.data as Record<string, unknown>
          for (const key of Object.keys(cfg.cols_map_json_data)) {
            ;(queryOptions.value as any)[key] = d[cfg.cols_map_json_data[key]]
          }
        }
      } catch (e) { console.error('[initPageParams]', e) }
    }

    const model: Record<string, Record<string, unknown>> = {}
    const paraList = (cfg.interface_json_data || (cfg as any).para_json || []) as InterfaceParam[]
    for (const p of paraList) {
      const k = p.para_name || p.para
      const urlKeys = Object.keys(queryOptions.value)
      model[k] = { value: urlKeys.includes(k) ? queryOptions.value[k] : (p.default_val || '') }
    }
    pageParams.value = { ...model }
    pageParamsModel.value = { ...model }
  }

  function setPageParams(key: string, val: unknown) {
    if (pageParamsModel.value[key]) pageParamsModel.value[key].value = val
  }

  // ===== 图标加载 =====

  async function loadIconify() {
    if (iconifyLoaded || !import.meta.client) return
    try {
      const [{ addCollection }, carbon, ri, mdi] = await Promise.all([
        import('@iconify/vue'),
        import('@iconify-json/carbon/icons.json').then(m => m.default),
        import('@iconify-json/ri/icons.json').then(m => m.default),
        import('@iconify-json/mdi-light/icons.json').then(m => m.default),
      ])
      addCollection(carbon); addCollection(ri); addCollection(mdi)
      iconifyLoaded = true
    } catch (e) { console.warn('[loadIconify]', e) }
  }

  // ===== 清理 =====

  function cleanup() {
    if (import.meta.client) document.body.classList.remove('lc-page-switching')
  }

  return {
    pageNo, pageConfig, components, queryOptions, pageParams, pageParamsModel,
    pageSwitching, appCfg, urlSearchParams,
    contentAreaWidth, setStyle,
    getPageConfig: fetchPageData, // 单次获取
    loadPageConfig,               // 导航编排（带缓存）
    fetchPageData, applyPageData,
    initPageParams, setPageParams,
    applyThemeToBody, buildComponentList,
    fetchAppConfig, parsePageConfig,
    loadIconify, cleanup,
    collectImageUrls, preloadImages,
  }
}
