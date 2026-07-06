import { create } from 'zustand'
import {
  applyNodeChanges,
  applyEdgeChanges,
  MarkerType,
  type Node,
  type Edge,
  type NodeChange,
  type EdgeChange,
} from '@xyflow/react'
import {
  makeRelationshipEdge,
  makeTableNode,
  serializeSchema,
  isEditorNode,
  type EditorColumn,
  type EditorDialect,
  type EditorNode,
  type RelationshipCardinality,
} from '@/lib/editor-schema'
import { layoutByRelationships } from '@/lib/parsers/utils/layout'

const SQL_PLACEHOLDER = `-- FluxSQL Editor
-- Escribe tu DDL aquí

CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL
);
`

interface EditorStore {
  nodes: Node[]
  edges: Edge[]
  selectedNodeId: string | null
  hoveredNodeId: string | null
  dialect: EditorDialect
  syncPaused: boolean
  onNodesChange: (changes: NodeChange[]) => void
  onEdgesChange: (changes: EdgeChange[]) => void
  setNodesAndEdges: (nodes: Node[], edges: Edge[]) => void
  setSelectedNodeId: (nodeId: string | null) => void
  setHoveredNodeId: (nodeId: string | null) => void
  setDialect: (dialect: EditorDialect) => void
  setSyncPaused: (paused: boolean) => void
  addTable: () => void
  updateTable: (nodeId: string, data: Partial<EditorNode['data']>) => void
  deleteTable: (nodeId: string) => void
  addColumn: (nodeId: string) => void
  updateColumn: (nodeId: string, columnIndex: number, column: Partial<EditorColumn>) => void
  deleteColumn: (nodeId: string, columnIndex: number) => void
  addRelationship: (sourceId: string, sourceColumn: string, targetId: string, targetColumn: string, cardinality?: RelationshipCardinality) => void
  syncSqlFromCanvas: () => void
  sqlValue: string
  setSqlValue: (value: string, isUserEdit?: boolean) => void
  userEditedSql: boolean
  setUserEditedSql: (edited: boolean) => void
  neo4jFilterLabel: string | null
  setNeo4jFilterLabel: (label: string | null) => void
  neo4jFilterRelationship: string | null
  setNeo4jFilterRelationship: (relationship: string | null) => void
}

export const useEditorStore = create<EditorStore>((set) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  hoveredNodeId: null,
  dialect: 'postgresql',
  syncPaused: false,
  userEditedSql: false,
  neo4jFilterLabel: null,
  neo4jFilterRelationship: null,
  setUserEditedSql: (userEditedSql) => set({ userEditedSql }),
  setNeo4jFilterLabel: (neo4jFilterLabel) => set({ neo4jFilterLabel, neo4jFilterRelationship: null }),
  setNeo4jFilterRelationship: (neo4jFilterRelationship) => set({ neo4jFilterRelationship, neo4jFilterLabel: null }),
  onNodesChange: (changes) =>
    set((state) => {
      const nodes = applyNodeChanges(changes, state.nodes)
      const affectsSql = changes.some(c => c.type === 'remove' || c.type === 'add')
      if (!affectsSql) return { nodes }
      return { nodes, sqlValue: serializeSchema(nodes, state.dialect, state.edges), syncPaused: true, userEditedSql: false }
    }),
  onEdgesChange: (changes) =>
    set((state) => {
      const edges = applyEdgeChanges(changes, state.edges)
      const affectsSql = changes.some(c => c.type === 'remove' || c.type === 'add')
      if (!affectsSql) return { edges }
      return { edges, sqlValue: serializeSchema(state.nodes, state.dialect, edges), syncPaused: true, userEditedSql: false }
    }),
  setNodesAndEdges: (nodes, edges) => set({ nodes, edges, userEditedSql: false }),
  setSelectedNodeId: (selectedNodeId) => set({ selectedNodeId }),
  setHoveredNodeId: (hoveredNodeId) => set({ hoveredNodeId }),
  setDialect: (dialect) => set((state) => {
    const nodes = state.nodes.map((node) => {
      if (!isEditorNode(node)) return node
      const type =
        dialect === 'mongodb' ? 'mongoNode' :
        dialect === 'neo4j' ? 'neo4jNode' :
        dialect === 'json' ? 'nosqlNode' : 'tableNode'
      return { ...node, type }
    })
    const edges = state.edges.map((edge) => ({
      ...edge,
      type: dialect === 'neo4j' ? 'neo4jEdge' : 'relationship',
    }))
    const finalNodes = state.dialect === 'neo4j' && dialect !== 'neo4j'
      ? layoutByRelationships(nodes, edges)
      : dialect === 'neo4j' && state.dialect !== 'neo4j'
        ? nodes.map((node) => ({ ...node, position: { x: 0, y: 0 } }))
        : nodes

    return {
      dialect,
      nodes: finalNodes,
      edges,
      sqlValue: serializeSchema(finalNodes, dialect, edges) || state.sqlValue,
      syncPaused: true,
      userEditedSql: false,
      neo4jFilterLabel: null,
      neo4jFilterRelationship: null,
    }
  }),
  setSyncPaused: (syncPaused) => set({ syncPaused }),
  addTable: () =>
    set((state) => {
      const node = makeTableNode(state.nodes.length + 1)
      node.type =
        state.dialect === 'mongodb' ? 'mongoNode' :
        state.dialect === 'neo4j' ? 'neo4jNode' :
        state.dialect === 'json' ? 'nosqlNode' : 'tableNode'
      return {
        nodes: [...state.nodes, node],
        selectedNodeId: node.id,
        sqlValue: serializeSchema([...state.nodes, node], state.dialect, state.edges),
        syncPaused: true,
        userEditedSql: false,
      }
    }),
  updateTable: (nodeId, data) =>
    set((state) => {
      const nodes = state.nodes.map((node) =>
        node.id === nodeId ? { ...node, data: { ...node.data, ...data } } : node
      )
      return { nodes, sqlValue: serializeSchema(nodes, state.dialect, state.edges), syncPaused: true, userEditedSql: false }
    }),
  deleteTable: (nodeId) =>
    set((state) => {
      const nodes = state.nodes.filter((node) => node.id !== nodeId)
      const edges = state.edges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId)
      return {
        nodes,
        edges,
        selectedNodeId: state.selectedNodeId === nodeId ? null : state.selectedNodeId,
        sqlValue: serializeSchema(nodes, state.dialect, edges),
        syncPaused: true,
        userEditedSql: false,
      }
    }),
  addColumn: (nodeId) =>
    set((state) => {
      const nodes = state.nodes.map((node) => {
        if (node.id !== nodeId) return node
        const columns = Array.isArray(node.data.columns) ? node.data.columns : []
        return {
          ...node,
          data: {
            ...node.data,
            columns: [
              ...columns,
              {
                name: `campo_${columns.length + 1}`,
                type: 'VARCHAR(100)',
                nullable: true,
              },
            ],
          },
        }
      })
      return { nodes, sqlValue: serializeSchema(nodes, state.dialect, state.edges), syncPaused: true, userEditedSql: false }
    }),
  updateColumn: (nodeId, columnIndex, column) =>
    set((state) => {
      const nodes = state.nodes.map((node) => {
        if (node.id !== nodeId) return node
        const columns = Array.isArray(node.data.columns) ? [...node.data.columns] : []
        columns[columnIndex] = { ...columns[columnIndex], ...column }
        return { ...node, data: { ...node.data, columns } }
      })
      return { nodes, sqlValue: serializeSchema(nodes, state.dialect, state.edges), syncPaused: true, userEditedSql: false }
    }),
  deleteColumn: (nodeId, columnIndex) =>
    set((state) => {
      const targetNode = state.nodes.find((node) => node.id === nodeId)
      const targetColumn = Array.isArray(targetNode?.data.columns) ? targetNode.data.columns[columnIndex]?.name : undefined
      const nodes = state.nodes.map((node) => {
        if (node.id !== nodeId) return node
        const columns = Array.isArray(node.data.columns) ? node.data.columns.filter((_, index) => index !== columnIndex) : []
        return { ...node, data: { ...node.data, columns } }
      })
      const edges = targetColumn
        ? state.edges.filter((edge) => edge.sourceHandle !== `${targetColumn}-source` && edge.targetHandle !== `${targetColumn}-target`)
        : state.edges
      return { nodes, edges, sqlValue: serializeSchema(nodes, state.dialect, edges), syncPaused: true, userEditedSql: false }
    }),
  addRelationship: (sourceId, sourceColumn, targetId, targetColumn, cardinality = 'many-to-one') =>
    set((state) => {
      const source = state.nodes.find((node): node is EditorNode => node.id === sourceId && isEditorNode(node))
      const target = state.nodes.find((node): node is EditorNode => node.id === targetId && isEditorNode(node))
      const sourceCol = source?.data.columns.find((column) => column.name === sourceColumn)
      const targetCol = target?.data.columns.find((column) => column.name === targetColumn)
      if (!source || !target || !sourceCol || !targetCol) return state

      const nodes = state.nodes.map((node) => {
        if (node.id !== sourceId) return node
        const columns = Array.isArray(node.data.columns) ? node.data.columns : []
        return {
          ...node,
          data: {
            ...node.data,
            columns: columns.map((column) =>
              column.name === sourceColumn
                ? { ...column, isForeignKey: true, references: { table: target.data.tableName, column: targetColumn } }
                : column
            ),
          },
        }
      })
      const edge = makeRelationshipEdge(source, { ...sourceCol, isForeignKey: true }, target, targetCol, cardinality)
      const edges = [...state.edges.filter((item) => item.id !== edge.id), edge]
      return { nodes, edges, sqlValue: serializeSchema(nodes, state.dialect, edges), syncPaused: true, userEditedSql: false }
    }),
  syncSqlFromCanvas: () => set((state) => ({ sqlValue: serializeSchema(state.nodes, state.dialect, state.edges), userEditedSql: false })),
  sqlValue: SQL_PLACEHOLDER,
  setSqlValue: (value, isUserEdit = true) => set({ sqlValue: value, userEditedSql: isUserEdit }),
}))

/**
 * Stamps a parser-generated FlowEdge with the markerEnd arrow config.
 * Call this when converting ParseResult.edges → React Flow edges.
 */
export function toReactFlowEdge(edge: Edge): Edge {
  if (edge.type === 'neo4jEdge') {
    return {
      ...edge,
      markerEnd: edge.markerEnd ?? {
        type: MarkerType.ArrowClosed,
        width: 14,
        height: 14,
        color: '#71717A',
      },
    }
  }

  return {
    ...edge,
    type: edge.type || 'relationship',
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 16,
      height: 16,
      color: '#00D4FF',
    },
  }
}
