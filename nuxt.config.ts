// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@unocss/nuxt',
    '@pinia/nuxt',
    '@nuxt/content',
  ],

  // 生产环境使用 hash 模式路由（与老项目保持一致）
  router: {
    options: {
      hashMode: process.env.NUXT_ROUTER_HASH_MODE === 'true',
    },
  },

  // 运行时环境变量（对应老项目 VUE_APP_DEFAULT_ENV）
  runtimeConfig: {
    public: {
      defaultEnv: process.env.NUXT_PUBLIC_DEFAULT_ENV || 'saas',
      baseURL: process.env.NUXT_PUBLIC_BASE_URL || '/vpages',
    },
  },

  // CSS 入口
  css: [
    '@/assets/css/reset.css',
  ],

  // Vite 配置
  vite: {
    server: {
      proxy: {
        // 代理后端 API，开发时避免跨域
        '/config': {
          // 可通过 DEV_PROXY_TARGET 环境变量覆盖，默认指向配置开发环境
      target: process.env.DEV_PROXY_TARGET || 'http://192.168.0.209',
          changeOrigin: true,
        },
        '/file': {
          target: 'http://192.168.0.209',
          changeOrigin: true,
        },
      },
    },
  },

  // SSR 暂时关闭（迁移阶段以 SPA 模式运行，后期逐步开启）
  ssr: false,
})
