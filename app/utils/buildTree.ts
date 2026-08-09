/**
 * 根据 parent_no 构建组件嵌套树
 * 迁移自原项目 src/pages/lowcode/utils/common.js
 */
import type { ComponentConfig } from '~/types/lowcode'

export function buildComponentsTree(components: ComponentConfig[]): ComponentConfig[] {
  const roots = components.filter((item) => !item.parent_no)

  function buildTree(list: ComponentConfig[], parentId: string): ComponentConfig[] {
    const result: ComponentConfig[] = []
    for (const item of list) {
      if (item.parent_no === parentId) {
        item.children = buildTree(list, item.com_no).sort(
          (a, b) => a.com_seq - b.com_seq
        )
        result.push(item)
      }
    }
    return result
  }

  return roots.map((item) => {
    item.children = buildTree(components, item.com_no).sort(
      (a, b) => a.com_seq - b.com_seq
    )
    return item
  })
}
