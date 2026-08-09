# l-pc-nuxt

低代码平台前端，从 [l-pc-front](../l-pc-front)（Vue 2 + Element UI + Webpack）迁移到 **Nuxt 4 + Vue 3 + Vite + UnoCSS + Pinia**。

## 技术栈

| 类别 | 技术 | 说明 |
|------|------|------|
| 框架 | Nuxt 4.5 | Vue 3 全栈框架 |
| UI 原子化 | UnoCSS (Wind3 preset) | 原子化 CSS + 图标预设 |
| 图标 | @iconify-json (carbon / ri / mdi-light) | 通过 UnoCSS presetIcons 使用 |
| 状态管理 | Pinia | Nuxt 官方推荐 |
| 类型 | TypeScript | 严格模式 |

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器（默认 http://localhost:3000）
npm run dev

# 生产构建
npm run build

# 预览生产构建
npm run preview
```

## 目录结构

```
l-pc-nuxt/
├── nuxt.config.ts          # Nuxt 配置
├── uno.config.ts           # UnoCSS 配置（preset + shortcuts + icons）
├── app/                    # Nuxt 4 srcDir（应用源码）
│   ├── app.vue             # 根组件
│   ├── pages/              # 文件路由
│   │   ├── index.vue       # 首页
│   │   └── lowcode/        # 低代码模块
│   │       ├── editor/[pageNo].vue
│   │       └── view/[pageNo].vue
│   ├── components/         # 自动导入的组件
│   └── assets/css/         # 全局样式
├── composables/            # 自动导入的 composables
│   ├── useEnv.ts           # 环境解析与切换
│   ├── useHttp.ts          # HTTP 请求封装
│   └── useLowcodePage.ts   # 低代码页面核心逻辑
├── stores/                 # Pinia stores
│   ├── theme.ts            # 主题状态
│   └── drag.ts             # 编辑器拖拽状态
├── utils/                  # 工具函数
│   ├── envList.ts          # 环境配置映射表
│   └── buildTree.ts        # 组件树构建
├── types/                  # TypeScript 类型定义
│   └── lowcode.d.ts
├── server/                 # Nitro server（API 代理 + 中间件）
└── public/                 # 静态资源
```

## 环境切换

与老项目一致的优先级链，但使用 Cookie 替代 sessionStorage（SSR 安全）：

1. URL 参数 `?env=xxx`（仅开发环境生效）
2. Cookie `dev_env`（跨页面持久化）
3. `nuxt.config.ts` → `runtimeConfig.public.defaultEnv`（构建时注入）
4. 默认 `saas`

```bash
# 开发时切换环境方式
# 1. URL 参数（临时）
http://localhost:3000/?env=parkDev

# 2. 在浏览器 console 中（持久）
document.cookie = 'dev_env=parkDev;path=/;max-age=2592000'

# 3. 构建时指定
NUXT_PUBLIC_DEFAULT_ENV=baobo npm run build
```

## UnoCSS 图标使用

```html
<!-- 通过 class 使用，格式: i-{collection}-{icon} -->
<div class="i-ri-home-line" />
<div class="i-carbon-settings" />
<div class="i-mdi-account" />

<!-- 可搭配颜色、尺寸等原子类 -->
<div class="i-ri-vuejs-line text-2xl text-green-500" />

<!-- Attributify 模式 -->
<div i-ri-check-line text-green-500 />
```

## 当前迁移进度

- [x] 项目骨架 + Nuxt 4 + UnoCSS + Pinia
- [x] useEnv 环境解析
- [x] useHttp HTTP 封装（含认证拦截）
- [x] useLowcodePage 页面配置加载
- [x] 类型定义 + 构建工具
- [ ] 渲染引擎（engine/view.vue）
- [ ] Widget 组件族（list/chart/card-group/map...）
- [ ] 编辑器三栏面板（materials/editor/property）
- [ ] 子编辑器（card-cell/map/property-form）
