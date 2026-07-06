'use client'

import { useEffect } from 'react'
import { useEditorStore } from '@/store/useEditorStore'

// Updated Palette: Blue/Slate tones instead of rainbow
const NEO4J_PALETTE = [
  '#3B82F6', // Blue 500
  '#0EA5E9', // Sky 500
  '#06B6D4', // Cyan 500
  '#6366F1', // Indigo 500
  '#60A5FA', // Blue 400
  '#38BDF8', // Sky 400
  '#22D3EE', // Cyan 400
  '#818CF8', // Indigo 400
]

function getLabelColor(label: string): string {
  let hash = 0
  for (let i = 0; i < label.length; i++) {
    hash = label.charCodeAt(i) + ((hash << 5) - hash)
  }
  return NEO4J_PALETTE[Math.abs(hash) % NEO4J_PALETTE.length]
}

export function Neo4jSidebar() {
  const nodes = useEditorStore((state) => state.nodes)
  const edges = useEditorStore((state) => state.edges)
  const neo4jFilterLabel = useEditorStore((state) => state.neo4jFilterLabel)
  const setNeo4jFilterLabel = useEditorStore((state) => state.setNeo4jFilterLabel)

  const neo4jFilterRelationship = useEditorStore((state) => state.neo4jFilterRelationship)
  const setNeo4jFilterRelationship = useEditorStore((state) => state.setNeo4jFilterRelationship)

  // Legend data
  const labels = Array.from(
    new Set(nodes.map(n => (n.data as { tableName?: string })?.tableName).filter(Boolean))
  ) as string[]

  const relTypes = Array.from(
    new Set(
      edges
        .map(e => (e.data as { relType?: string })?.relType ?? (typeof e.label === 'string' ? e.label : null))
        .filter(Boolean)
    )
  ) as string[]

  // Auto-clear orphaned filters
  useEffect(() => {
    if (neo4jFilterLabel && !labels.includes(neo4jFilterLabel)) {
      setNeo4jFilterLabel(null)
    }
  }, [labels, neo4jFilterLabel, setNeo4jFilterLabel])

  useEffect(() => {
    if (neo4jFilterRelationship && !relTypes.includes(neo4jFilterRelationship)) {
      setNeo4jFilterRelationship(null)
    }
  }, [relTypes, neo4jFilterRelationship, setNeo4jFilterRelationship])

  const propertyKeys = Array.from(
    new Set(
      nodes.flatMap(n => {
        const cols = (n.data as { columns?: Array<{ name: string; type: string }> })?.columns ?? []
        return cols.filter(c => c.type !== 'Relation' && c.name !== '_id').map(c => c.name)
      })
    )
  ).sort() as string[]

  const isAllActive = neo4jFilterLabel === null && neo4jFilterRelationship === null

  return (
    <div
      className="flex h-full min-h-0 w-64 shrink-0 flex-col overflow-y-auto border-l border-border bg-card px-4 py-4 gap-6"
    >
      <div className="mb-2">
        <h2 className="text-sm font-semibold text-foreground">Filtros Neo4j</h2>
        <p className="text-xs text-muted-foreground mt-1">Explora tu base de datos gráfica</p>
      </div>

      {/* Nodes section */}
      {labels.length > 0 && (
        <div className="flex flex-col gap-3 shrink-0">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Nodos ({nodes.length})
          </p>

          <div className="flex flex-wrap gap-2">
            {/* Asterisk pill — show ALL nodes */}
            <button
              onClick={() => {
                setNeo4jFilterLabel(null)
                setNeo4jFilterRelationship(null)
              }}
              title="Mostrar todos los nodos sin conexiones"
              className="flex items-center justify-center rounded-full transition-all duration-150"
              style={{
                width: 28,
                height: 28,
                background: isAllActive ? 'var(--primary-10)' : 'transparent',
                border: isAllActive ? '1.5px solid var(--primary)' : '1.5px solid var(--border)',
                color: isAllActive ? 'var(--primary)' : 'var(--muted-foreground)',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              *
            </button>

            {/* Label pills — click to filter */}
            {labels.map(label => {
              const nodeColor =
                (nodes.find(n => (n.data as { tableName?: string })?.tableName === label)?.data as { color?: string })?.color
                ?? getLabelColor(label)
              const isActive = neo4jFilterLabel === label

              return (
                <button
                  key={label}
                  onClick={() => setNeo4jFilterLabel(isActive ? null : label)}
                  title={isActive ? `Ocultar filtro: ${label}` : `Filtrar: solo ${label}`}
                  className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-all duration-150"
                  style={{
                    background: isActive ? nodeColor + '44' : nodeColor + '18',
                    color: nodeColor,
                    border: isActive
                      ? `2px solid ${nodeColor}`
                      : `1px solid ${nodeColor}55`,
                    cursor: 'pointer',
                    transform: isActive ? 'scale(1.05)' : 'scale(1)',
                  }}
                >
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: nodeColor,
                      display: 'inline-block',
                      flexShrink: 0,
                    }}
                  />
                  {label}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Relationships section */}
      {relTypes.length > 0 && (
        <div className="flex flex-col gap-3 shrink-0 border-t border-border pt-5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Relaciones ({edges.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {relTypes.map(rel => {
              const isActive = neo4jFilterRelationship === rel
              return (
                <button
                  key={rel}
                  onClick={() => setNeo4jFilterRelationship(isActive ? null : rel)}
                  title={isActive ? `Ocultar filtro de relación: ${rel}` : `Filtrar por relación: ${rel}`}
                  className="rounded px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider transition-all duration-150"
                  style={{ 
                    background: isActive ? 'var(--primary)' : 'var(--muted)', 
                    color: isActive ? 'white' : 'var(--muted-foreground)', 
                    border: isActive ? '1px solid var(--primary)' : '1px solid var(--border)',
                    cursor: 'pointer',
                    transform: isActive ? 'scale(1.05)' : 'scale(1)',
                  }}
                >
                  {rel}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Property Keys section */}
      {propertyKeys.length > 0 && (
        <div className="flex flex-col gap-3 shrink-0 border-t border-border pt-5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Property keys
          </p>
          <div className="flex flex-wrap gap-1.5">
            {propertyKeys.map(key => (
              <span
                key={key}
                className="rounded px-2 py-0.5 text-[10px] bg-muted text-muted-foreground border border-border"
              >
                {key}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
