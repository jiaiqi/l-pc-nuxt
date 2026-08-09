/**
 * 格式化样式数据（迁移自 old project datav/common/index.js）
 * 将配置中的样式对象转为 CSS 样式对象，处理：
 * - 下划线转连字符 (bg_color → bg-color)
 * - 数值自动加 px 单位
 * - 主题变量引用 (primary-color → var(--primary-color))
 */
const THEME_VAR_KEYS = [
  'primary-color', 'text-color', 'header-bg-color', 'header-text-color',
  'footer-bg-color', 'footer-text-color', 'menu-bg-color', 'menu-text-color',
  'menu-active-bg-color', 'menu-hover-bg-color', 'menu-active-text-color', 'menu-hover-text-color',
]

const SIZE_KEYS = [
  'width', 'height', 'left', 'right', 'top', 'bottom',
  'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
  'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
  'font-size', 'border-radius', 'border-width',
]

export function formatStyleData(val: unknown): Record<string, string> {
  let json: Record<string, unknown> = {}
  if (typeof val === 'string') {
    try { json = JSON.parse(val) } catch { return {} }
  } else if (val && typeof val === 'object') {
    json = val as Record<string, unknown>
  } else {
    return {}
  }

  const obj: Record<string, string> = {}
  for (const [key, value] of Object.entries(json)) {
    const cssKey = key.replace(/_/g, '-')
    let cssVal = String(value).replace(/;+$/g, "").trim()

    // 尺寸属性自动加 px
    if (SIZE_KEYS.includes(cssKey) && value !== '' && !isNaN(Number(value))) {
      cssVal = `${value}px`
    }

    // 主题变量引用
    if (typeof value === 'string' && THEME_VAR_KEYS.some(k => value.includes(k))) {
      const fallback = value.includes('text') ? '#fff' : '#409eff'
      cssVal = `var(--${value}, ${fallback})`
    }

    obj[cssKey] = cssVal
  }
  return obj
}

/**
 * 将样式对象转为内联 style 字符串
 */
export function toStyleString(style: Record<string, string>): string {
  return Object.entries(style)
    .map(([k, v]) => `${k}: ${v}`)
    .join('; ')
}
