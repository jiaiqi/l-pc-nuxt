import { defineStore } from 'pinia'

interface ThemeItem { name: string; variable?: Record<string, string> }

export const useThemeStore = defineStore('theme', () => {
  const currentTheme = ref(import.meta.client ? (localStorage.getItem('currentTheme') || '') : '')
  const themeList = ref<ThemeItem[]>(import.meta.client ? JSON.parse(localStorage.getItem('themeList') || '[]') : [])

  const themeVariable = computed<Record<string, string>>(() => {
    const vars: Record<string, string> = {}
    if (!themeList.value.length || !currentTheme.value) return vars
    const theme = themeList.value.find(t => t.name === currentTheme.value)
    if (!theme?.variable) return vars
    for (const [key, val] of Object.entries(theme.variable)) {
      const cssKey = key.startsWith('--') ? key : `--${key}`
      vars[cssKey] = val
    }
    return vars
  })

  function setCurrentTheme(theme: string) {
    currentTheme.value = theme
    if (import.meta.client) localStorage.setItem('currentTheme', theme)
  }

  function setThemeList(list: ThemeItem[]) {
    themeList.value = list
    if (import.meta.client) localStorage.setItem('themeList', JSON.stringify(list))
  }

  function initTheme(params: { currentTheme?: string; themeList?: ThemeItem[] }) {
    if (params.themeList?.length) setThemeList(params.themeList)
    const ct = params.currentTheme
    if (ct) { setCurrentTheme(ct); return }
    if (currentTheme.value && params.themeList?.length) {
      if (!params.themeList.some(t => t.name === currentTheme.value) && params.themeList.length) {
        setCurrentTheme(params.themeList[0].name)
      }
    }
  }

  return { currentTheme, themeList, themeVariable, setCurrentTheme, setThemeList, initTheme }
})
