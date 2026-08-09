// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@unocss/nuxt',
    '@pinia/nuxt',
    '@nuxt/content',
  ],

  // Naive UI 自动导入
  build: {
    transpile: process.env.NODE_ENV === 'production' ? ['naive-ui', 'vueuc', '@css-render/vue3-ssr'] : [],
  },

  vite: {
    optimizeDeps: { include: ['naive-ui', 'vueuc', 'date-fns'] },
    server: {
      proxy: {
        '/config': { target: process.env.DEV_PROXY_TARGET || 'https://www.gxqcxkj.com/bxapi', changeOrigin: true },
        '/file': { target: process.env.DEV_PROXY_TARGET || 'https://www.gxqcxkj.com/bxapi', changeOrigin: true },
        '/sso': { target: process.env.DEV_PROXY_TARGET || 'https://www.gxqcxkj.com/bxapi', changeOrigin: true },
      },
    },
  },

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
          target: process.env.DEV_PROXY_TARGET || 'https://www.gxqcxkj.com/bxapi',  // park 公网
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
