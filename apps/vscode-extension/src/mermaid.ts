import { FluxSqlDiagram } from './diagramTypes';

export function toMermaid(diagram: FluxSqlDiagram): string {
  if (diagram.renderMode === 'graph') {
    return toGraphMermaid(diagram);
  }

  const lines = ['erDiagram'];

  for (const table of diagram.tables) {
    lines.push(`  ${sanitize(table.name)} {`);
    for (const column of table.columns) {
      const markers = [
        column.primaryKey ? 'PK' : undefined,
        column.foreignKey ? 'FK' : undefined,
      ].filter(Boolean);
      const suffix = markers.length > 0 ? ` ${markers.join(',')}` : '';
      lines.push(`    ${sanitizeType(column.type)} ${sanitize(column.name)}${suffix}`);
    }
    lines.push('  }');
  }

  const seen = new Set<string>();
  for (const relationship of diagram.relationships) {
    const source = sanitize(relationship.toTable);
    const target = sanitize(relationship.fromTable);
    const key = `${source}|${target}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    lines.push(`  ${source} ||--o{ ${target} : "FK"`);
  }

  return `${lines.join('\n')}\n`;
}

function toGraphMermaid(diagram: FluxSqlDiagram): string {
  const lines = ['flowchart LR'];
  for (const table of diagram.tables) {
    lines.push(`  ${sanitize(table.name)}((" ${escapeLabel(table.name)} "))`);
  }

  const seen = new Set<string>();
  for (const relationship of diagram.relationships) {
    const source = sanitize(relationship.fromTable);
    const target = sanitize(relationship.toTable);
    const label = escapeLabel(relationship.fromColumn || 'relates_to');
    const key = `${source}|${label}|${target}`;
    if (seen.has(key)) continue;
    seen.add(key);
    lines.push(`  ${source} -- "${label}" --> ${target}`);
  }

  return `${lines.join('\n')}\n`;
}

function sanitize(value: string): string {
  return value.replace(/[^\w]/g, '_').replace(/^(\d)/, '_$1');
}

function sanitizeType(value: string): string {
  const noParens = value.replace(/\(.+\)/g, '');
  const withArray = noParens.replace(/\[\]/g, 'Array');
  return sanitize(withArray);
}

function escapeLabel(value: string): string {
  return value.replace(/"/g, '\\"');
}
