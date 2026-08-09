---
title: HTTP 层
navigation.title: HTTP 层
---

# HTTP 层

`useHttp` composable 封装了所有后端 API 请求逻辑。

## 核心功能

- **环境感知 baseURL** — 自动从 `useEnv().gateway` 获取
- **认证拦截** — 自动注入 `bx_auth_ticket` header
- **登录失效处理** — 检测 `resultCode=0011`
- **业务级封装** — `selectOne` / `selectList` / `select` / `deleteRecord`

## API

```ts
const {
  apiFetch,      // 原始 $fetch 实例
  selectOne,     // 查询单条
  selectList,    // 查询列表
  select,        // 通用查询 (自动拼接 URL)
  deleteRecord,  // 删除记录
  getImagePath,  // 获取图片下载 URL
} = useHttp()
```

## 使用示例

```ts
// 查询单条页面配置
const { data, ok } = await selectOne<PageConfig>(
  '/config/select/srvpage_cfg_page_guest_select',
  {
    serviceName: 'srvpage_cfg_page_guest_select',
    colNames: ['*'],
    condition: [{ colName: 'page_no', ruleType: 'eq', value: pageNo }],
  }
)

// 查询组件列表
const { data, ok } = await selectList<ComponentConfig>(
  '/config/select/srvpage_cfg_page_component_select',
  {
    serviceName: 'srvpage_cfg_page_component_select',
    colNames: ['*'],
    condition: [{ colName: 'page_no', ruleType: 'eq', value: pageNo }],
  }
)
```
