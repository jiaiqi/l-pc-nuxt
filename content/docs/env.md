---
title: 环境配置
navigation.title: 环境配置
---

# 环境配置

## 切换方式

环境解析优先级（从高到低）：

| 优先级 | 方式 | 说明 |
|--------|------|------|
| 1 | URL 参数 `?env=xxx` | 仅开发环境生效，方便临时调试 |
| 2 | Cookie `dev_env` | 跨页面持久化，SSR 可用 |
| 3 | `.env` `NUXT_PUBLIC_DEFAULT_ENV` | 构建时注入 |
| 4 | 默认值 `saas` | 兜底 |

## 开发时切换

```bash
# 方式 1: URL 参数（临时）
http://localhost:3000/?env=parkDev

# 方式 2: 浏览器 console（持久）
document.cookie = 'dev_env=parkDev;path=/;max-age=2592000'

# 方式 3: 构建时指定
NUXT_PUBLIC_DEFAULT_ENV=baobo npm run build
```

## 环境列表

| 环境名 | 说明 | 网关 |
|--------|------|------|
| `dev` | 本地开发 | `http://192.168.0.54:8104` |
| `dev4` | 配置开发 | `http://192.168.0.209/bxapi` |
| `saas` | SaaS 正式 | `https://api.100xsys.cn:443` |
| `parkDev` | 延安园区开发 | `http://192.168.0.214/bxapi` |
| `park` | 延安园区生产 | `https://www.gxqcxkj.com/bxapi` |
| `baobo` | 宝博正式 | `https://sxbbcs.com/bxapi` |
| `yanxue2` | 研学 2.0 | `http://yxsj.sneducloud.com/yxapi` |

完整列表见 [utils/envList.ts](https://github.com/jiaiqi/l-pc-nuxt/blob/main/utils/envList.ts)。

## useEnv Composable

```ts
const {
  resolvedEnv,   // 当前环境名
  gateway,       // 当前网关地址
  envConfig,     // 当前完整配置
  switchEnv,     // 切换环境
} = useEnv()
```
