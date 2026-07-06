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

// ── Hierarchical Layout based on Relationships ──

export function layoutByRelationships<N extends { id: string, position: { x: number, y: number }, data?: { tableName?: string } | any }, E extends { source: string, target: string }>(nodes: N[], edges: E[]): N[] {
  const nodeIds = new Set(nodes.map((node) => node.id))
  
  // 1. Build adjacency list for undirected graph to find components
  const adj = new Map<string, string[]>()
  nodes.forEach(n => adj.set(n.id, []))
  edges.forEach(e => {
    if (adj.has(e.source) && adj.has(e.target)) {
      adj.get(e.source)!.push(e.target)
      adj.get(e.target)!.push(e.source)
    }
  })

  // 2. Find Connected Components
  const visited = new Set<string>()
  const components: string[][] = []
  
  nodes.forEach(node => {
    if (!visited.has(node.id)) {
      const comp: string[] = []
      const q = [node.id]
      visited.add(node.id)
      while (q.length > 0) {
        const curr = q.shift()!
        comp.push(curr)
        for (const neighbor of adj.get(curr) || []) {
          if (!visited.has(neighbor)) {
            visited.add(neighbor)
            q.push(neighbor)
          }
        }
      }
      components.push(comp)
    }
  })

  // 3. For each component, compute its local hierarchical layout
  const childrenByParent = new Map<string, string[]>()
  const parentByChild = new Map<string, Set<string>>()
  nodes.forEach((node) => {
    childrenByParent.set(node.id, [])
    parentByChild.set(node.id, new Set())
  })
  edges.forEach((edge) => {
    if (!nodeIds.has(edge.source) || !nodeIds.has(edge.target)) return
    childrenByParent.get(edge.target)?.push(edge.source)
    parentByChild.get(edge.source)?.add(edge.target)
  })

  const columnGap = 340
  const rowGap = 180

  const compLayouts = components.map(compNodeIds => {
    const compNodes = compNodeIds.map(id => nodes.find(n => n.id === id)!).sort(compareNodes)
    
    // Find roots in this component (nodes with 0 in-degree in the directed graph)
    const roots = compNodes.filter((node) => (parentByChild.get(node.id)?.size ?? 0) === 0).sort(compareNodes)
    const queue = roots.length > 0 ? [...roots.map((node) => node.id)] : [compNodes[0].id]
    
    const levels = new Map<string, number>()
    queue.forEach((id) => levels.set(id, 0))

    while (queue.length > 0) {
      const parentId = queue.shift()!
      const parentLevel = levels.get(parentId) ?? 0
      const children = [...(childrenByParent.get(parentId) ?? [])]
        .map((id) => compNodes.find((node) => node.id === id))
        .filter((node): node is N => Boolean(node))
        .sort(compareNodes)

      children.forEach((child) => {
        const nextLevel = parentLevel + 1
        const currentLevel = levels.get(child.id)
        if (currentLevel === undefined || nextLevel > currentLevel) {
          levels.set(child.id, nextLevel)
          queue.push(child.id)
        }
      })
    }
    
    // Fallback for cycles or disconnected within directed edges
    compNodes.forEach((node) => {
      if (!levels.has(node.id)) levels.set(node.id, 0)
    })

    const lanes = new Map<number, N[]>()
    compNodes.forEach((node) => {
      const level = levels.get(node.id) ?? 0
      lanes.set(level, [...(lanes.get(level) ?? []), node])
    })
    lanes.forEach((items) => items.sort(compareNodes))

    const positioned = compNodes.map(node => {
      const level = levels.get(node.id) ?? 0
      const lane = lanes.get(level) ?? []
      const row = Math.max(0, lane.findIndex((item) => item.id === node.id))
      // Center single items in their lane visually
      const laneOffset = Math.max(0, (3 - lane.length) * 42)
      return {
        node,
        localX: level * columnGap,
        localY: row * rowGap + laneOffset
      }
    })

    const maxX = Math.max(...positioned.map(p => p.localX))
    const maxY = Math.max(...positioned.map(p => p.localY))
    
    return {
      positioned,
      width: maxX + 300, // Approx node width
      height: maxY + 200 // Approx node height
    }
  })

  // 4. Pack the components into a 2D grid
  const MAX_ROW_WIDTH = 1800
  let currentX = 100
  let currentY = 140
  let currentRowHeight = 0
  
  const finalNodes: N[] = []
  
  compLayouts.forEach(comp => {
    if (currentX + comp.width > MAX_ROW_WIDTH && currentX > 100) {
      currentX = 100
      currentY += currentRowHeight + 100
      currentRowHeight = 0
    }
    
    comp.positioned.forEach(p => {
      finalNodes.push({
        ...p.node,
        position: {
          x: currentX + p.localX,
          y: currentY + p.localY
        }
      })
    })
    
    currentX += comp.width + 100
    currentRowHeight = Math.max(currentRowHeight, comp.height)
  })

  // Ensure original node order is preserved for React Flow
  return nodes.map(n => finalNodes.find(fn => fn.id === n.id) || n)
}

export function compareNodes(a: { id: string, data?: { tableName?: string } | any }, b: { id: string, data?: { tableName?: string } | any }) {
  const aName = typeof a.data?.tableName === 'string' ? a.data.tableName : a.id
  const bName = typeof b.data?.tableName === 'string' ? b.data.tableName : b.id
  return aName.localeCompare(bName)
}
