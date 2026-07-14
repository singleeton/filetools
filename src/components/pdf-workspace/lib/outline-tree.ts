import type { OutlineNode } from '../types'

let uidCounter = 0
function nextId(): string {
  uidCounter += 1
  return `outline-${uidCounter}`
}

export function createOutlineNode(title: string, targetPosition: number): OutlineNode {
  return { id: nextId(), title, targetPosition, children: [] }
}

export interface FlatOutlineRow {
  node: OutlineNode
  depth: number
  path: number[] // indices from root to this node, e.g. [0, 2] = root[0].children[2]
}

/** Depth-first flatten, used to render the tree as an indentable flat list. */
export function flattenOutline(tree: OutlineNode[]): FlatOutlineRow[] {
  const rows: FlatOutlineRow[] = []
  function walk(nodes: OutlineNode[], depth: number, path: number[]) {
    nodes.forEach((node, i) => {
      const nodePath = [...path, i]
      rows.push({ node, depth, path: nodePath })
      walk(node.children, depth + 1, nodePath)
    })
  }
  walk(tree, 0, [])
  return rows
}

function getSiblingArray(tree: OutlineNode[], path: number[]): OutlineNode[] {
  let siblings = tree
  for (let i = 0; i < path.length - 1; i++) {
    siblings = siblings[path[i]].children
  }
  return siblings
}

export function addNode(tree: OutlineNode[], title: string, targetPosition: number): OutlineNode[] {
  return [...tree, createOutlineNode(title, targetPosition)]
}

export function removeNode(tree: OutlineNode[], path: number[]): OutlineNode[] {
  function walk(nodes: OutlineNode[], depth: number): OutlineNode[] {
    if (depth === path.length - 1) {
      return nodes.filter((_, i) => i !== path[depth])
    }
    return nodes.map((node, i) => (i === path[depth] ? { ...node, children: walk(node.children, depth + 1) } : node))
  }
  return walk(tree, 0)
}

export function updateNode(tree: OutlineNode[], path: number[], patch: Partial<Pick<OutlineNode, 'title' | 'targetPosition'>>): OutlineNode[] {
  function walk(nodes: OutlineNode[], depth: number): OutlineNode[] {
    return nodes.map((node, i) => {
      if (i !== path[depth]) return node
      if (depth === path.length - 1) return { ...node, ...patch }
      return { ...node, children: walk(node.children, depth + 1) }
    })
  }
  return walk(tree, 0)
}

/** Nests the node under its immediately preceding sibling (becomes that sibling's last child). No-op if it's already the first sibling. */
export function indentNode(tree: OutlineNode[], path: number[]): OutlineNode[] {
  const index = path[path.length - 1]
  if (index === 0) return tree
  const node = getSiblingArray(tree, path)[index]

  const withoutNode = removeNode(tree, path)
  const prevSiblingPath = [...path.slice(0, -1), index - 1]

  function walk(nodes: OutlineNode[], depth: number): OutlineNode[] {
    return nodes.map((n, i) => {
      if (i !== prevSiblingPath[depth]) return n
      if (depth === prevSiblingPath.length - 1) return { ...n, children: [...n.children, node] }
      return { ...n, children: walk(n.children, depth + 1) }
    })
  }
  return walk(withoutNode, 0)
}

/** Promotes the node to become the next sibling of its parent (one level shallower). No-op at the root. */
export function outdentNode(tree: OutlineNode[], path: number[]): OutlineNode[] {
  if (path.length < 2) return tree
  const parentPath = path.slice(0, -1)
  const node = getSiblingArray(tree, path)[path[path.length - 1]]

  const withoutNode = removeNode(tree, path)

  function walk(nodes: OutlineNode[], depth: number): OutlineNode[] {
    if (depth === parentPath.length - 1) {
      return nodes.flatMap((n, i) => (i === parentPath[depth] ? [n, node] : [n]))
    }
    return nodes.map((n, i) => (i === parentPath[depth] ? { ...n, children: walk(n.children, depth + 1) } : n))
  }
  return walk(withoutNode, 0)
}
