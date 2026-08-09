<template>
  <div class="min-h-screen flex-center bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
    <div class="w-full max-w-400px p-8">
      <!-- 标题 -->
      <div class="text-center mb-8">
        <span class="i-ri-shield-user-line text-5xl text-blue-400" />
        <h1 class="text-2xl font-bold text-white mt-3">L-PC 低代码平台</h1>
        <p class="text-gray-400 text-sm mt-1">请登录以继续</p>
      </div>

      <!-- 表单 -->
      <div class="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/10">
        <div class="space-y-4">
          <div>
            <input
              v-model="username"
              type="text"
              placeholder="用户名"
              class="w-full px-4 py-3 bg-black/30 border border-white/15 rounded-xl text-white placeholder-gray-400 text-base focus:outline-none focus:border-blue-400/50 transition-colors"
              @keyup.enter="focusPassword"
            />
          </div>
          <div>
            <input
              ref="passwordRef"
              v-model="password"
              type="password"
              placeholder="密码"
              class="w-full px-4 py-3 bg-black/30 border border-white/15 rounded-xl text-white placeholder-gray-400 text-base focus:outline-none focus:border-blue-400/50 transition-colors"
              @keyup.enter="doLogin"
            />
          </div>

          <!-- 错误提示 -->
          <div v-if="loginError" class="bg-red-500/20 border border-red-400/30 rounded-lg px-4 py-2 text-red-300 text-sm">
            {{ loginError }}
          </div>

          <button
            class="w-full py-3 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 rounded-xl text-white font-semibold text-base transition-all flex-center gap-2"
            :disabled="loading"
            @click="doLogin"
          >
            <span v-if="loading" class="i-ri-loader-4-line animate-spin" />
            <span>{{ loading ? '登录中...' : '登 录' }}</span>
          </button>
        </div>
      </div>

      <!-- 环境信息 -->
      <div class="text-center mt-4 text-gray-500 text-xs">
        当前环境：{{ env }} · {{ gateway }}
      </div>
    </div>

    <!-- 租户选择 -->
    <Teleport to="body">
      <div v-if="showTenantSelect" class="fixed inset-0 z-50 bg-black/60 flex-center" @click.self="showTenantSelect = false">
        <div class="bg-gray-800 rounded-2xl p-6 max-w-lg w-full mx-4 max-h-70vh overflow-y-auto">
          <h2 class="text-white text-lg font-semibold mb-4">选择要进入的租户</h2>
          <div class="space-y-2">
            <button
              v-for="t in tenants" :key="t.tenant_no"
              class="w-full text-left p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors"
              @click="doSwitchTenant(t)"
            >
              <div class="text-white font-medium">{{ t.tenant_name || '未命名租户' }}</div>
              <div class="text-gray-400 text-xs mt-1">应用：{{ t.application_name || t.application }}</div>
            </button>
          </div>
          <button class="w-full mt-4 py-2 text-gray-400 text-sm hover:text-white transition-colors" @click="showTenantSelect = false; loginError = null; navigateTo('/')">暂不选择，直接进入</button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
const { login, switchTenant, error: authError, loading } = useAuth()
const { resolvedEnv, gateway } = useEnv()

const username = ref('')
const password = ref('')
const loginError = ref<string | null>(null)
const passwordRef = ref<HTMLInputElement | null>(null)
const env = resolvedEnv

// 租户选择
const showTenantSelect = ref(false)
const tenants = ref<any[]>([])

function focusPassword() { passwordRef.value?.focus() }

async function doLogin() {
  if (!username.value) { loginError.value = '请输入用户名'; return }
  if (!password.value || password.value.length < 6) { loginError.value = '密码至少6个字符'; return }

  const result = await login(username.value, password.value)
  if (result.ok) {
    if (result.needTenantSelect) {
      tenants.value = result.tenants
      showTenantSelect.value = true
    } else {
      navigateTo('/')
    }
  } else {
    loginError.value = result.error || '登录失败'
  }
}

async function doSwitchTenant(t: any) {
  await switchTenant(t.tenant_no, t.application, t.tenant_name)
}
</script>
