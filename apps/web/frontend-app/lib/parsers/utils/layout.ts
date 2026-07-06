const COLS = 3
const NODE_WIDTH = 280
const NODE_HEIGHT_BASE = 120
const GAP_X = 80
const GAP_Y = 60

export function calculateLayout(nodeCount: number): Array<{x: number, y: number}> {
  return Array.from({ length: nodeCount }, (_, i) => ({
    x: (i % COLS) * (NODE_WIDTH + GAP_X),
    y: Math.floor(i / COLS) * (NODE_HEIGHT_BASE + GAP_Y)
  }))
}

export function calculateCircularLayout(nodeCount: number, radius: number = 300, centerX: number = 400, centerY: number = 400): Array<{x: number, y: number}> {
  if (nodeCount === 1) return [{ x: centerX, y: centerY }]
  
  return Array.from({ length: nodeCount }, (_, i) => {
    const angle = (i * 2 * Math.PI) / nodeCount
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    }
  })
}

type LayoutNode = {
  id: string
  position: { x: number; y: number }
  data?: { tableName?: unknown }
}

type LayoutEdge = {
  source: string
  target: string
}

export function layoutByRelationships<N extends LayoutNode, E extends LayoutEdge>(nodes: N[], edges: E[]): N[] {
  const nodeIds = new Set(nodes.map((node) => node.id))
  const adjacency = new Map<string, string[]>()

  nodes.forEach((node) => adjacency.set(node.id, []))
  edges.forEach((edge) => {
    if (!adjacency.has(edge.source) || !adjacency.has(edge.target)) return
    adjacency.get(edge.source)?.push(edge.target)
    adjacency.get(edge.target)?.push(edge.source)
  })

  const visited = new Set<string>()
  const components: string[][] = []

  nodes.forEach((node) => {
    if (visited.has(node.id)) return

    const component: string[] = []
    const queue = [node.id]
    visited.add(node.id)

    while (queue.length > 0) {
      const current = queue.shift()!
      component.push(current)

      for (const neighbor of adjacency.get(current) ?? []) {
        if (visited.has(neighbor)) continue
        visited.add(neighbor)
        queue.push(neighbor)
      }
    }

    components.push(component)
  })

  const childrenByParent = new Map<string, string[]>()
  const parentByChild = new Map<string, Set<string>>()

  nodes.forEach((node) => {
    childrenByParent.set(node.id, [])
    parentByChild.set(node.id, new Set())
  })

  edges.forEach((edge) => {
    if (!nodeIds.has(edge.source) || !nodeIds.has(edge.target)) return
    childrenByParent.get(edge.source)?.push(edge.target)
    parentByChild.get(edge.target)?.add(edge.source)
  })

  const columnGap = 340
  const rowGap = 180
  const componentLayouts = components.map((componentIds) => {
    const componentNodes = componentIds
      .map((id) => nodes.find((node) => node.id === id))
      .filter((node): node is N => Boolean(node))
      .sort(compareLayoutNodes)

    const roots = componentNodes
      .filter((node) => (parentByChild.get(node.id)?.size ?? 0) === 0)
      .sort(compareLayoutNodes)
    const queue = roots.length > 0 ? roots.map((node) => node.id) : [componentNodes[0]?.id].filter(Boolean)
    const levels = new Map<string, number>()

    queue.forEach((id) => levels.set(id, 0))

    while (queue.length > 0) {
      const parentId = queue.shift()!
      const parentLevel = levels.get(parentId) ?? 0
      const children = (childrenByParent.get(parentId) ?? [])
        .map((id) => componentNodes.find((node) => node.id === id))
        .filter((node): node is N => Boolean(node))
        .sort(compareLayoutNodes)

      children.forEach((child) => {
        const nextLevel = parentLevel + 1
        const currentLevel = levels.get(child.id)
        if (currentLevel !== undefined && currentLevel >= nextLevel) return

        levels.set(child.id, nextLevel)
        queue.push(child.id)
      })
    }

    componentNodes.forEach((node) => {
      if (!levels.has(node.id)) levels.set(node.id, 0)
    })

    const lanes = new Map<number, N[]>()
    componentNodes.forEach((node) => {
      const level = levels.get(node.id) ?? 0
      lanes.set(level, [...(lanes.get(level) ?? []), node])
    })
    lanes.forEach((items) => items.sort(compareLayoutNodes))

    const positioned = componentNodes.map((node) => {
      const level = levels.get(node.id) ?? 0
      const lane = lanes.get(level) ?? []
      const row = Math.max(0, lane.findIndex((item) => item.id === node.id))
      const laneOffset = Math.max(0, (3 - lane.length) * 42)

      return {
        node,
        localX: level * columnGap,
        localY: row * rowGap + laneOffset,
      }
    })

    return {
      positioned,
      width: Math.max(...positioned.map((item) => item.localX), 0) + 300,
      height: Math.max(...positioned.map((item) => item.localY), 0) + 200,
    }
  })

  const maxRowWidth = 1800
  let currentX = 100
  let currentY = 140
  let currentRowHeight = 0
  const positionedNodes: N[] = []

  componentLayouts.forEach((component) => {
    if (currentX + component.width > maxRowWidth && currentX > 100) {
      currentX = 100
      currentY += currentRowHeight + 100
      currentRowHeight = 0
    }

    component.positioned.forEach(({ node, localX, localY }) => {
      positionedNodes.push({
        ...node,
        position: {
          x: currentX + localX,
          y: currentY + localY,
        },
      })
    })

    currentX += component.width + 100
    currentRowHeight = Math.max(currentRowHeight, component.height)
  })

  return nodes.map((node) => positionedNodes.find((item) => item.id === node.id) ?? node)
}

function compareLayoutNodes(a: LayoutNode, b: LayoutNode) {
  const aName = typeof a.data?.tableName === 'string' ? a.data.tableName : a.id
  const bName = typeof b.data?.tableName === 'string' ? b.data.tableName : b.id
  return aName.localeCompare(bName)
}
