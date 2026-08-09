---
title: 架构概览
navigation.title: 架构概览
---

# 架构概览

## 技术栈

| 层级 | 技术 | 版本 |
|------|------|------|
| 框架 | Nuxt | 4.5 |
| UI 框架 | Vue | 3.5 |
| 构建工具 | Vite | 8.2 |
| CSS 方案 | UnoCSS | 66.7 (presetWind3) |
| 图标 | Iconify (carbon/ri/mdi-light) | 通过 presetIcons |
| 状态管理 | Pinia | 4.0 |
| 类型系统 | TypeScript | strict |

## 目录结构

```
l-pc-nuxt/
├── nuxt.config.ts          # Nuxt 配置
├── uno.config.ts           # UnoCSS 配置
├── app/                    # 应用源码 (Nuxt 4 srcDir)
│   ├── app.vue             # 根组件
│   ├── pages/              # 文件路由
│   ├── components/         # 自动导入组件
│   └── assets/css/         # 全局样式
├── composables/            # 自动导入 composables
├── stores/                 # Pinia stores
├── utils/                  # 工具函数
├── types/                  # TypeScript 类型定义
├── server/                 # Nitro server
├── content/                # 文档站内容 (markdown)
└── public/                 # 静态资源
```

## 数据流

低代码页面的数据加载流程：

```
路由进入 (pageNo)
  → useLowcodePage.getPageConfig()
    → HTTP: srvpage_cfg_page_guest_select (页面配置)
    → parsePageConfig: JSON 字段解析 (*_json → *_data)
    → fetchAppConfig: 获取应用配置 (含主题)
    → initComponents: 构建组件树
    → initPageParams: 初始化页面参数
  → 渲染: 递归 lc-view → widgets
```

## 环境切换

优先级：URL ?env=xxx (dev) > Cookie dev_env > runtimeConfig > 默认 'saas'

详见 [环境配置](/docs/env)。
