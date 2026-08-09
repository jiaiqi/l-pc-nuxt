---
title: Stores
navigation.title: Stores
---

# Stores

Pinia stores 替代了老项目的 Vuex modules。

## useThemeStore

**源文件**: `stores/theme.ts`

管理主题状态、CSS 变量生成。

```ts
const theme = useThemeStore()

// Getters
theme.currentTheme    // 当前主题名
theme.themeVariable   // CSS 变量对象

// Actions
theme.initTheme({ currentTheme, themeList })
theme.setCurrentTheme('dark')
theme.setThemeList([...])
```

## useDragStore

**源文件**: `stores/drag.ts`

管理编辑器拖拽状态、编辑器模式、组件交换记录。

```ts
const drag = useDragStore()

// State
drag.editorMode        // 'pc' | 'mobile'
drag.isMobileMode      // computed
drag.currentDragType   // 当前拖拽的组件类型

// Actions
drag.setEditorMode('mobile')
drag.setDragType('chart')
drag.clearAllRecords()
```
