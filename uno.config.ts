import { defineConfig, presetWind3, presetIcons, presetAttributify } from 'unocss'

export default defineConfig({
  presets: [
    presetWind3(),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
      extraProperties: {
        'display': 'inline-block',
        'vertical-align': 'middle',
      },
      collections: {
        carbon: () => import('@iconify-json/carbon/icons.json').then(m => m.default),
        ri: () => import('@iconify-json/ri/icons.json').then(m => m.default),
        mdi: () => import('@iconify-json/mdi-light/icons.json').then(m => m.default),
      },
    }),
  ],
  shortcuts: {
    'btn': 'py-2 px-4 rounded-lg font-medium transition-colors duration-200',
    'btn-primary': 'btn bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700',
    'btn-ghost': 'btn text-gray-600 hover:bg-gray-100 active:bg-gray-200',
    'card': 'bg-white rounded-xl shadow-sm border border-gray-100 p-4',
    'flex-center': 'flex items-center justify-center',
    'flex-between': 'flex items-center justify-between',
    'text-muted': 'text-gray-400 text-sm',
    'page-wrap': 'relative min-h-screen',
  },
  theme: {
    colors: {
      brand: {
        primary: '#409eff',
        light: '#b3d8ff',
        dark: '#337ecc',
      },
    },
  },
})
