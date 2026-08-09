/**
 * 主题 Store（Pinia）
 * 迁移自原项目 src/store/modules/theme.js
 */
import { defineStore } from 'pinia'

interface ThemeItem {
  name: string
  variable?: Record<string, string>
}

export const useThemeStore = defineStore('theme', () => {
  // ===== State =====
  const currentTheme = ref(
    import.meta.client ? (localStorage.getItem('currentTheme') || '') : ''
  )
  const themeList = ref<ThemeItem[]>(
    import.meta.client
      ? JSON.parse(localStorage.getItem('themeList') || '[]')
      : []
  )

  // ===== Getters =====
  /** 当前主题的 CSS 变量 */
  const themeVariable = computed<Record<string, string>>(() => {
    const style: Record<string, string> = {}

    if (themeList.value.length && currentTheme.value) {
      const theme = themeList.value.find((t: ThemeItem) => t.name === currentTheme.value)
      const variables = theme?.variable || {}

      for (const key of Object.keys(variables)) {
        const cssKey = key.startsWith('--') ? key : `--${key}`
        style[cssKey] = variables[key]
      }
    }

    return style
  })

  // ===== Actions =====
  function setCurrentTheme(theme: string) {
    currentTheme.value = theme
    if (import.meta.client) {
      localStorage.setItem('currentTheme', theme)
    }
  }

  function setThemeList(list: ThemeItem[]) {
    themeList.value = list
    if (import.meta.client) {
      localStorage.setItem('themeList', JSON.stringify(list))
    }
  }

  function initTheme(params: { currentTheme?: string; themeList?: ThemeItem[] }) {
    const { currentTheme: ct, themeList: tl } = params

    if (tl && tl.length) {
      setThemeList(tl)
    }

    if (ct) {
      setCurrentTheme(ct)
    } else if (currentTheme.value && tl && tl.length) {
      const exists = tl.some((t) => t.name === currentTheme.value)
      if (!exists && tl.length > 0) {
        setCurrentTheme(tl[0].name)
      }
    }
  }

  return {
    currentTheme,
    themeList,
    themeVariable,
    setCurrentTheme,
    setThemeList,
    initTheme,
  }
})
