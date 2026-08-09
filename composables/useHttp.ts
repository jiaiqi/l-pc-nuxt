/**
 * HTTP 请求封装 composable
 *
 * 迁移自原项目 src/common/http.js 的核心功能：
 * - 环境感知的 baseURL
 * - bx_auth_ticket 认证拦截
 * - $selectOne / $selectList / $delete 等业务级封装
 */
import type { ApiResponse } from '~/types/lowcode'

export function useHttp() {
  const { gateway } = useEnv()
  const ticketCookie = useCookie<string>('bx_auth_ticket', { default: () => '' })

  /**
   * 获取认证票据（优先 Cookie → sessionStorage）
   */
  function getTicket(): string {
    if (import.meta.client) {
      return ticketCookie.value || sessionStorage.getItem('bx_auth_ticket') || ''
    }
    return ticketCookie.value || ''
  }

  /**
   * 创建 API 请求实例
   */
  const apiFetch = $fetch.create({
    timeout: 600000, // 10 分钟超时

    onRequest({ options }) {
      // 动态设置 baseURL（gateway 是 computed，每次请求取最新值）
      const base = gateway.value
      // 如果 URL 已经是完整 http(s) 地址，不拼接
      const url = options.path || ''
      if (!url.startsWith('http')) {
        options.baseURL = base
      }

      // 注入认证票据
      const ticket = getTicket()
      if (ticket) {
        const headers = (options.headers || {}) as Record<string, string>
        headers['bx_auth_ticket'] = ticket
        headers['bx-auth-ticket'] = ticket
        options.headers = headers
      }
    },

    onResponseError({ response }) {
      const body = response._data as Record<string, unknown> | null
      if (body?.resultCode === '0011') {
        // 登录失效处理 → 后续扩展
        console.warn('[useHttp] Auth required, resultCode=0011')
      }
    },
  })

  /**
   * 查询单条记录
   */
  async function selectOne<T = Record<string, unknown>>(
    url: string,
    req: Record<string, unknown>
  ): Promise<ApiResponse<T>> {
    try {
      const res = await apiFetch<{
        state: string
        data?: T[]
        resultMessage?: string
      }>(url, {
        method: 'POST',
        body: req,
      })

      if (res.state === 'SUCCESS') {
        if (res.data && res.data.length > 0) {
          return { ok: true, data: res.data[0] }
        }
        return { ok: false, msg: '未查询到数据' }
      }
      return { ok: false, msg: res.resultMessage || '请求失败' }
    } catch (err: unknown) {
      return { ok: false, msg: (err as Error)?.message || '网络错误' }
    }
  }

  /**
   * 查询列表
   */
  async function selectList<T = Record<string, unknown>>(
    url: string,
    req: Record<string, unknown>
  ): Promise<ApiResponse<T[]>> {
    try {
      const res = await apiFetch<{
        state: string
        data?: T[]
        page?: { pageNo: number; rownumber: number; total: number }
        resultMessage?: string
      }>(url, {
        method: 'POST',
        body: req,
      })

      if (res.state === 'SUCCESS') {
        return { ok: true, data: res.data || [], page: res.page }
      }
      return { ok: false, data: [], msg: res.resultMessage || '请求失败' }
    } catch (err: unknown) {
      return { ok: false, data: [], msg: (err as Error)?.message || '网络错误' }
    }
  }

  /**
   * 通用 select 查询（自动拼接 URL：/{app}/select/{serviceName}）
   */
  async function select<T = Record<string, unknown>>(
    req: Record<string, unknown> & { serviceName: string; srvApp?: string; mapp?: string },
    app?: string
  ): Promise<ApiResponse<T[]>> {
    const serviceApp = app || (req.srvApp as string) || (req.mapp as string)
    if (!serviceApp) {
      return { ok: false, msg: 'app 不能为空' }
    }
    const url = `/${serviceApp}/select/${req.serviceName}`
    return selectList<T>(url, req)
  }

  /**
   * 删除记录
   */
  async function deleteRecord(params: {
    app: string
    service: string
    key?: string
    value: string | string[]
  }): Promise<ApiResponse> {
    const { app: serviceApp, service, key = 'id', value } = params
    if (!value || (Array.isArray(value) && !value.length)) {
      return { ok: false, msg: '删除的数据不能为空' }
    }
    if (!service) {
      return { ok: false, msg: 'service 不能为空' }
    }

    const valStr = Array.isArray(value) ? value.join(',') : value
    const url = `/${serviceApp}/delete/${service}`
    const req = [
      {
        serviceName: service,
        condition: [{ colName: key, ruleType: 'in', value: valStr }],
      },
    ]

    try {
      const res = await apiFetch<{ state: string; resultMessage?: string }>(url, {
        method: 'POST',
        body: req,
      })
      if (res.state === 'SUCCESS') {
        return { ok: true, msg: '删除成功' }
      }
      return { ok: false, msg: res.resultMessage || '删除失败' }
    } catch (err: unknown) {
      return { ok: false, msg: (err as Error)?.message || '网络错误' }
    }
  }

  /**
   * 获取图片下载 URL（根据 fileNo 拼接）
   */
  function getImagePath(no: string): string {
    if (!no) return ''
    if (no.startsWith('http://') || no.startsWith('https://')) return no
    if (no.startsWith('data:image') && no.includes('base64')) return no

    const ticket = getTicket()
    let url = `${gateway.value}/file/download?fileNo=${no}`
    if (ticket) {
      url += `&bx_auth_ticket=${ticket}`
    }
    return url
  }

  return {
    apiFetch,
    selectOne,
    selectList,
    select,
    deleteRecord,
    getImagePath,
    getTicket,
  }
}
