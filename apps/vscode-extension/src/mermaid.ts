import { FluxSqlDiagram } from './diagramTypes';

export function toMermaid(diagram: FluxSqlDiagram): string {
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

function sanitize(value: string): string {
  return value.replace(/[^\w]/g, '_').replace(/^(\d)/, '_$1');
}

function sanitizeType(value: string): string {
  return sanitize(value.replace(/\(.+\)/g, ''));
}
