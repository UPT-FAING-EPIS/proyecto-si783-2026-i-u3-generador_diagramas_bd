import { FluxSqlColumn, FluxSqlDiagram, FluxSqlRelationship, FluxSqlTable } from './diagramTypes';

export function parseNeo4jCypher(code: string): FluxSqlDiagram {
  const warnings: string[] = [];
  const tablesMap = new Map<string, FluxSqlTable>();
  const relationships: FluxSqlRelationship[] = [];

  // Remove comments (//...)
  const cleanCode = code.replace(/\/\/.*$/gm, '');

  // Extract all nodes (Label and properties)
  // Example: (n:Person {name: "John"})
  const nodeRegex = /\(\s*[a-zA-Z0-9_]*\s*:\s*([a-zA-Z0-9_]+)\s*(?:\{([^}]*)\})?\s*\)/g;
  let nodeMatch;
  while ((nodeMatch = nodeRegex.exec(cleanCode)) !== null) {
    const label = nodeMatch[1];
    const propsString = nodeMatch[2] || '';
    
    let table = tablesMap.get(label);
    if (!table) {
      table = { name: label, columns: [] };
      tablesMap.set(label, table);
    }

    // Parse simple JSON-like properties like name: "John", age: 30
    const propRegex = /([a-zA-Z0-9_]+)\s*:/g;
    let propMatch;
    while ((propMatch = propRegex.exec(propsString)) !== null) {
      const propName = propMatch[1];
      if (!table.columns.find(c => c.name === propName)) {
        table.columns.push({
          name: propName,
          type: 'Property',
          primaryKey: false,
          foreignKey: false,
        });
      }
    }
  }

  // Extract relationships
  // Example: (u:User)-[:LIKES]->(m:Movie)
  const relRegex = /\(\s*[a-zA-Z0-9_]*\s*:\s*([a-zA-Z0-9_]+)[^)]*\)\s*-\[\s*[a-zA-Z0-9_]*\s*:\s*([a-zA-Z0-9_]+)[^\]]*\]->\s*\(\s*[a-zA-Z0-9_]*\s*:\s*([a-zA-Z0-9_]+)[^)]*\)/g;
  let relMatch;
  while ((relMatch = relRegex.exec(cleanCode)) !== null) {
    const fromLabel = relMatch[1];
    const relType = relMatch[2];
    const toLabel = relMatch[3];

    // Ensure the nodes exist even if they didn't have properties
    if (!tablesMap.has(fromLabel)) tablesMap.set(fromLabel, { name: fromLabel, columns: [] });
    if (!tablesMap.has(toLabel)) tablesMap.set(toLabel, { name: toLabel, columns: [] });

    // Deduplicate relationships
    const exists = relationships.some(r => r.fromTable === fromLabel && r.toTable === toLabel && r.fromColumn === relType);
    if (!exists) {
      relationships.push({
        fromTable: fromLabel,
        fromColumn: relType, // We use fromColumn to store relationship type as a hack for graph rendering
        toTable: toLabel,
        toColumn: '_node',
      });
    }
  }

  const tables = Array.from(tablesMap.values());

  if (tables.length === 0) {
    warnings.push('No Neo4j nodes (Labels) could be found in the Cypher code.');
  }

  return {
    dialect: 'neo4j',
    family: 'nosql',
    renderMode: 'graph',
    source: 'local-parser',
    generatedAt: new Date().toISOString(),
    tables,
    relationships,
    warnings,
  };
}
