---
title: Composables
navigation.title: Composables
---

# Composables

## useEnv

环境解析与切换。

**源文件**: `composables/useEnv.ts`

```ts
const { resolvedEnv, gateway, envConfig, switchEnv, homePageNo } = useEnv()
```

## useHttp

HTTP 请求封装，含认证拦截。

**源文件**: `composables/useHttp.ts`

```ts
const { selectOne, selectList, select, deleteRecord, getImagePath } = useHttp()
```

## useLowcodePage

低代码页面核心逻辑：配置加载、组件树构建、主题应用、参数管理。

**源文件**: `composables/useLowcodePage.ts`

```ts
const {
  pageConfig,
  components,
  contentAreaWidth,
  getPageConfig,
  setPageParams,
} = useLowcodePage()
```

## Stores

### useThemeStore

主题状态管理。

```ts
const theme = useThemeStore()
theme.initTheme({ currentTheme: 'default', themeList: [...] })
```

### useDragStore

编辑器拖拽状态。

```ts
const drag = useDragStore()
drag.setEditorMode('pc')
```
