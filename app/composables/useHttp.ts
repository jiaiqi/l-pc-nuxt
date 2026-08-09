/**
 * HTTP 请求封装 composable
 * 迁移自原项目 src/common/http.js
 */
import type { ApiResponse } from '~/types/lowcode'

export function useHttp() {
  const { gateway } = useEnv()
  const ticketCookie = useCookie<string>('bx_auth_ticket', { default: () => '' })

  function getTicket(): string {
    if (import.meta.client) {
      return ticketCookie.value || sessionStorage.getItem('bx_auth_ticket') || ''
    }
    return ticketCookie.value || ''
  }

  function setTicket(val: string) {
    ticketCookie.value = val
    if (import.meta.client) sessionStorage.setItem('bx_auth_ticket', val)
  }

  const apiFetch = $fetch.create({
    timeout: 600000,
    onRequest({ options }) {
      const base = gateway.value
      const url = options.path || ''
      if (!url.startsWith('http')) options.baseURL = base

      const ticket = getTicket()
      if (ticket) {
        const headers = (options.headers || {}) as Record<string, string>
        headers['bx_auth_ticket'] = ticket
        headers['bx-auth-ticket'] = ticket
        options.headers = headers
      }
    },
    onResponse({ response }) {
      // 从响应中提取 ticket 并存储
      const ticketHeader = response.headers.get('bx_auth_ticket') || response.headers.get('bx-auth-ticket')
      if (ticketHeader && import.meta.client) {
        setTicket(ticketHeader)
      }
      const result = (response._data as any)?.data?.bx_auth_ticket
      if (result) setTicket(result)
    },
    onResponseError({ response }) {
      const body = response._data as Record<string, unknown> | null
      if (body?.resultCode === '0011') {
        console.warn('[useHttp] Auth required, resultCode=0011')
      }
    },
  })

  async function selectOne<T = Record<string, unknown>>(
    url: string, req: Record<string, unknown>
  ): Promise<ApiResponse<T>> {
    try {
      const res = await apiFetch<{ state: string; data?: T[]; resultMessage?: string }>(url, {
        method: 'POST', body: req,
      })
      if (res.state === 'SUCCESS') {
        if (res.data?.length) return { ok: true, data: res.data[0] }
        return { ok: false, msg: '未查询到数据' }
      }
      return { ok: false, msg: res.resultMessage || '请求失败' }
    } catch (err: any) {
      return { ok: false, msg: err?.message || '网络错误' }
    }
  }

  async function selectList<T = Record<string, unknown>>(
    url: string, req: Record<string, unknown>
  ): Promise<ApiResponse<T[]>> {
    try {
      const res = await apiFetch<{ state: string; data?: T[]; page?: any; resultMessage?: string }>(url, {
        method: 'POST', body: req,
      })
      if (res.state === 'SUCCESS') return { ok: true, data: res.data || [], page: res.page }
      return { ok: false, data: [], msg: res.resultMessage || '请求失败' }
    } catch (err: any) {
      return { ok: false, data: [], msg: err?.message || '网络错误' }
    }
  }

  async function select<T = Record<string, unknown>>(
    req: Record<string, unknown> & { serviceName: string; srvApp?: string; mapp?: string },
    app?: string
  ): Promise<ApiResponse<T[]>> {
    const serviceApp = app || (req.srvApp as string) || (req.mapp as string)
    if (!serviceApp) return { ok: false, msg: 'app 不能为空' }
    return selectList<T>(`/${serviceApp}/select/${req.serviceName}`, req)
  }

  async function deleteRecord(params: {
    app: string; service: string; key?: string; value: string | string[]
  }): Promise<ApiResponse> {
    const { app: sa, service, key = 'id', value } = params
    if (!value || (Array.isArray(value) && !value.length)) return { ok: false, msg: '删除的数据不能为空' }
    if (!service) return { ok: false, msg: 'service 不能为空' }
    const valStr = Array.isArray(value) ? value.join(',') : value
    try {
      const res = await apiFetch<{ state: string; resultMessage?: string }>(`/${sa}/delete/${service}`, {
        method: 'POST', body: [{
          serviceName: service,
          condition: [{ colName: key, ruleType: 'in', value: valStr }],
        }],
      })
      if (res.state === 'SUCCESS') return { ok: true, msg: '删除成功' }
      return { ok: false, msg: res.resultMessage || '删除失败' }
    } catch (err: any) {
      return { ok: false, msg: err?.message || '网络错误' }
    }
  }

  function getImagePath(no: string): string {
    if (!no) return ''
    if (no.startsWith('http')) return no
    if (no.startsWith('data:image')) return no
    if (no.includes('&bx_auth_ticket')) no = no.split('&bx_auth_ticket')[0]
    const ticket = getTicket()
    let url = `${gateway.value}/file/download?fileNo=${no}`
    if (ticket) url += `&bx_auth_ticket=${ticket}`
    return url
  }

  return { apiFetch, selectOne, selectList, select, deleteRecord, getImagePath, getTicket, setTicket }
}
