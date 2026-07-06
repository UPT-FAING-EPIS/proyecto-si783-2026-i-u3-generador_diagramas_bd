import type { EditorDialect } from './editor-schema'

type SnapshotNode = {
  type?: string
  data?: {
    tableName?: string
    columns?: Array<{
      name?: string
      type?: string
      isPrimaryKey?: boolean
      nullable?: boolean
      defaultValue?: string
      references?: {
        table?: string
        column?: string
      }
    }>
  }
}

type SnapshotEdge = {
  source?: string
  sourceHandle?: string | null
  target?: string
  targetHandle?: string | null
}

export type VersionSnapshots = Record<EditorDialect, string>

function isTableNode(node: SnapshotNode) {
  return (
    (node.type === 'tableNode' || node.type === 'nosqlNode' || node.type === 'mongoNode' || node.type === 'neo4jNode') &&
    typeof node.data?.tableName === 'string' &&
    Array.isArray(node.data?.columns)
  )
}

function quoteIdentifier(name: string, dialect: EditorDialect) {
  if (dialect === 'mysql') return `\`${name}\``
  if (dialect === 'sqlserver') return `[${name}]`
  return `"${name}"`
}

function normalizeType(type: string | undefined, dialect: EditorDialect) {
  const upper = (type || 'TEXT').toUpperCase()
  if (dialect === 'postgresql') {
    if (upper.includes('AUTO_INCREMENT') || upper.includes('IDENTITY')) return 'SERIAL'
    if (upper === 'DATETIME') return 'TIMESTAMP'
    if (upper === 'NVARCHAR') return 'VARCHAR'
  }
  if (dialect === 'sqlserver') {
    if (upper === 'SERIAL' || upper.includes('AUTO_INCREMENT')) return 'INT IDENTITY(1,1)'
    if (upper === 'TEXT') return 'NVARCHAR(MAX)'
    if (upper === 'BOOLEAN') return 'BIT'
    if (upper === 'JSONB' || upper === 'JSON') return 'NVARCHAR(MAX)'
  }
  if (dialect === 'mysql') {
    if (upper === 'SERIAL' || upper.includes('IDENTITY')) return 'INT AUTO_INCREMENT'
    if (upper === 'BOOLEAN') return 'TINYINT(1)'
    if (upper === 'JSONB') return 'JSON'
  }
  return type || 'TEXT'
}

export function serializeSnapshotSchema(nodes: unknown[] | undefined, dialect: EditorDialect, edges: unknown[] = []) {
  const tables = (nodes ?? []).filter((node): node is SnapshotNode => isTableNode(node as SnapshotNode))

  if (dialect === 'json') {
    const json = {
      tables: Object.fromEntries(
        tables.map((table) => [
          table.data?.tableName ?? 'tabla',
          Object.fromEntries(
            (table.data?.columns ?? []).map((column) => [
              column.name ?? 'campo',
              {
                type: column.type || 'string',
                primaryKey: Boolean(column.isPrimaryKey),
                nullable: column.nullable !== false,
                references: column.references,
              },
            ])
          ),
        ])
      ),
      relations: edges
        .map((edge) => edge as SnapshotEdge)
        .filter((edge) => typeof edge.source === 'string' && typeof edge.target === 'string')
        .map((edge) => ({
          source: edge.source,
          sourceHandle: edge.sourceHandle,
          target: edge.target,
          targetHandle: edge.targetHandle,
        })),
    }
    return JSON.stringify(json, null, 2)
  }

  if (dialect === 'mongodb') {
    return tables.map((table) => {
      const fields = (table.data?.columns ?? [])
        .filter((column) => !(column.isPrimaryKey && column.name === '_id'))
        .map((column) => `  ${column.name ?? 'campo'}: { type: ${column.references?.table ? 'Schema.Types.ObjectId' : normalizeMongoType(column.type)},${column.references?.table ? ` ref: '${column.references.table}',` : ''} required: ${column.nullable === false ? 'true' : 'false'} }`)
      const name = table.data?.tableName ?? 'Collection'
      return `const ${name}Schema = new mongoose.Schema({\n${fields.join(',\n')}\n});`
    }).join('\n\n')
  }

  if (dialect === 'neo4j') {
    return tables.map((table) => {
      const props = (table.data?.columns ?? [])
        .filter((column) => !column.references)
        .map((column) => `${column.name ?? 'campo'}: "${column.type || 'String'}"`)
      return `CREATE (:${table.data?.tableName ?? 'Node'} { ${props.join(', ')} });`
    }).join('\n\n')
  }

  return tables.map((table) => {
    const tableName = quoteIdentifier(table.data?.tableName ?? 'tabla', dialect)
    const columns = table.data?.columns ?? []
    const primaryKeys = columns
      .filter((column) => column.isPrimaryKey)
      .map((column) => quoteIdentifier(column.name ?? 'id', dialect))

    const lines = columns.map((column) => {
      const columnName = quoteIdentifier(column.name ?? 'campo', dialect)
      const pieces = [
        columnName,
        normalizeType(column.type, dialect),
        column.nullable === false ? 'NOT NULL' : '',
        column.defaultValue ? `DEFAULT ${column.defaultValue}` : '',
        column.isPrimaryKey && primaryKeys.length === 1 ? 'PRIMARY KEY' : '',
      ].filter(Boolean)

      if (column.references?.table && column.references?.column) {
        pieces.push(`REFERENCES ${quoteIdentifier(column.references.table, dialect)}(${quoteIdentifier(column.references.column, dialect)})`)
      }

      return `  ${pieces.join(' ')}`
    })

    if (primaryKeys.length > 1) {
      lines.push(`  PRIMARY KEY (${primaryKeys.join(', ')})`)
    }

    return `CREATE TABLE ${tableName} (\n${lines.join(',\n')}\n);`
  }).join('\n\n')
}

function normalizeMongoType(type: string | undefined) {
  const upper = (type || 'String').toUpperCase()
  if (upper === 'TEXT' || upper === 'VARCHAR') return 'String'
  if (upper === 'INT' || upper === 'INTEGER' || upper === 'SERIAL') return 'Number'
  if (upper === 'BOOLEAN' || upper === 'BIT') return 'Boolean'
  if (upper === 'DATE' || upper === 'DATETIME' || upper === 'TIMESTAMP' || upper === 'TIMESTAMPTZ') return 'Date'
  if (upper === 'UUID' || upper === 'OBJECTID') return 'Schema.Types.ObjectId'
  return type || 'String'
}

export function serializeVersionSnapshots(nodes: unknown[] | undefined, edges: unknown[] = []): VersionSnapshots {
  return {
    postgresql: serializeSnapshotSchema(nodes, 'postgresql'),
    mysql: serializeSnapshotSchema(nodes, 'mysql'),
    sqlserver: serializeSnapshotSchema(nodes, 'sqlserver'),
    json: serializeSnapshotSchema(nodes, 'json', edges),
    mongodb: serializeSnapshotSchema(nodes, 'mongodb', edges),
    neo4j: serializeSnapshotSchema(nodes, 'neo4j', edges),
  }
}

export function hasVersionSnapshots(value: unknown): value is VersionSnapshots {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<VersionSnapshots>
  return ['postgresql', 'mysql', 'sqlserver', 'json', 'mongodb', 'neo4j'].every(
    (key) => typeof candidate[key as EditorDialect] === 'string'
  )
}
