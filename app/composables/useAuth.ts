/**
 * 登录认证 composable
 * 迁移自旧项目 login-dialog.vue 的核心登录逻辑
 */
export function useAuth() {
  const { apiFetch, setTicket } = useHttp()
  const loading = ref(false)
  const error = ref<string | null>(null)
  const logined = ref(false)

  // 检查是否已登录
  if (import.meta.client) {
    const ticket = sessionStorage.getItem('bx_auth_ticket')
    const user = sessionStorage.getItem('current_login_user')
    logined.value = !!(ticket && user)
  }

  async function login(username: string, password: string) {
    loading.value = true
    error.value = null
    try {
      const url = '/sso/operate/srvuser_login'
      const data: Record<string, unknown> = {
        user_no: username,
        pwd: password,
        terminal_type: 'PC',
      }

      // 尝试使用已记录的租户信息
      if (import.meta.client) {
        try {
          const ti = JSON.parse(sessionStorage.getItem('_tenant_info') || 'null')
          if (ti?.tenant && ti?.application) {
            data.tenant = ti.tenant
            data.application = ti.application
          }
        } catch {}
      }

      const req = [{ serviceName: 'srvuser_login', data: [data] }]
      const res = await apiFetch<any>(url, { method: 'POST', body: req })

      if (res?.state === 'SUCCESS') {
        const resData = res.response?.[0]?.response
        if (resData?.bx_auth_ticket) {
          setTicket(resData.bx_auth_ticket)
          sessionStorage.setItem('bx_auth_ticket', resData.bx_auth_ticket)
          sessionStorage.setItem('current_login_user', JSON.stringify(resData.login_user_info || {}))
          sessionStorage.setItem('logined', 'true')
          logined.value = true

          // 检查是否需要租户选择
          const otherTenants = resData.login_user_info?.otherTenantInfos
          if (Array.isArray(otherTenants) && otherTenants.length > 0) {
            return { ok: true, needTenantSelect: true, tenants: otherTenants }
          }
          return { ok: true }
        }
      }
      error.value = res?.resultMessage || '登录失败'
      return { ok: false, error: error.value }
    } catch (e: any) {
      error.value = e?.message || '网络错误'
      return { ok: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  async function switchTenant(tenantNo: string, appNo: string, tenantName: string) {
    console.log('[useAuth] switchTenant:', { tenantNo, appNo, tenantName })
    sessionStorage.setItem('_tenant_info', JSON.stringify({ tenant: tenantNo, tenant_name: tenantName, application: appNo }))
    // 直接跳转首页，后端的 tenant/application 会通过后续 API 请求的 tenant header 生效
    // 老项目中的 srvuser_app_tenant_swh_login 调用是为 iframe 模式设计的，SPA 模式下不需要
    if (window.top !== window) {
      // iframe 模式：通知父窗口
      try { window.top.postMessage({ action: 'tenant_switched', tenantNo, appNo }, '*') } catch {}
    }
    window.location.href = '/'
    return
  }
  // --- legacy ---
  async function _switchTenantLegacy(tenantNo: string, appNo: string, tenantName: string) {
    console.log('[useAuth] switchTenant:', { tenantNo, appNo, tenantName })
    sessionStorage.setItem('_tenant_info', JSON.stringify({ tenant: tenantNo, tenant_name: tenantName, application: appNo }))
    try {
      const url = '/sso/operate/srvuser_app_tenant_swh_login'
      const req = [{ serviceName: 'srvuser_app_tenant_swh_login', data: [{ tenant_no: tenantNo, tenant_name: tenantName, application: appNo }] }]
      const res = await apiFetch(url, { method: 'POST', body: req })
      console.log('[useAuth] switchTenant result:', res?.state)
      if (res?.state === 'SUCCESS') {
        const resData = res.response?.[0]?.response
        if (resData?.bx_auth_ticket) {
          setTicket(resData.bx_auth_ticket)
          sessionStorage.setItem('bx_auth_ticket', resData.bx_auth_ticket)
          sessionStorage.setItem('current_login_user', JSON.stringify(resData.login_user_info || {}))
        }
        window.location.reload()
      }
    } catch (e) {
      console.error('[useAuth] switchTenant error:', e)
    }
  }

  function logout() {
    if (import.meta.client) {
      sessionStorage.removeItem('bx_auth_ticket')
      sessionStorage.removeItem('current_login_user')
      sessionStorage.removeItem('logined')
      logined.value = false
    }
  }

  return { login, switchTenant, logout, logined, loading, error }
}
