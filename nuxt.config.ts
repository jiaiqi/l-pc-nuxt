// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',

  // 禁止目录前缀（FloatingEditButton 而非 LowcodeFloatingEditButton）
  components: { dirs: [{ path: '~/components', pathPrefix: false }] },
  devtools: { enabled: true },

  modules: [
    '@unocss/nuxt',
    '@pinia/nuxt',
    '@nuxt/content',
  ],

  // CSS
  css: ['@/assets/css/reset.css'],

  // SPA 模式
  ssr: false,

  // 运行时配置
  runtimeConfig: {
    public: {
      defaultEnv: process.env.NUXT_PUBLIC_DEFAULT_ENV || 'park',
      baseURL: process.env.NUXT_PUBLIC_BASE_URL || '/vpages',
    },
  },

  router: {
    options: {
      hashMode: process.env.NUXT_ROUTER_HASH_MODE === 'true',
    },
  },

  // Vite（合并为单个块）
  vite: {
    optimizeDeps: {
      include: ['naive-ui', 'vueuc', 'date-fns'],
    },
    server: {
      proxy: {
        '/config': {
          target: process.env.DEV_PROXY_TARGET || 'https://www.gxqcxkj.com/bxapi',
          changeOrigin: true,
        },
        '/file': {
          target: process.env.DEV_PROXY_TARGET || 'https://www.gxqcxkj.com/bxapi',
          changeOrigin: true,
        },
        '/sso': {
          target: process.env.DEV_PROXY_TARGET || 'https://www.gxqcxkj.com/bxapi',
          changeOrigin: true,
        },
      },
    },
  },
})
