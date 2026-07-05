import { FluxSqlDiagram, FluxSqlTable } from './diagramTypes';

interface NodeBox {
  table: FluxSqlTable;
  x: number;
  y: number;
  width: number;
  height: number;
}

const nodeWidth = 240;
const headerHeight = 34;
const rowHeight = 24;
const padding = 80;

export function toSvg(diagram: FluxSqlDiagram): string {
  const boxes = layoutTables(diagram);
  const bounds = getBounds(boxes);
  const width = Math.max(760, bounds.maxX + padding);
  const height = Math.max(520, bounds.maxY + padding);
  const boxByName = new Map(boxes.map((box) => [box.table.name.toLowerCase(), box]));
  const edges = diagram.relationships
    .map((relationship, index) => {
      const from = boxByName.get(relationship.fromTable.toLowerCase());
      const to = boxByName.get(relationship.toTable.toLowerCase());
      if (!from || !to) {
        return '';
      }

      const start = anchor(from, to);
      const end = anchor(to, from);
      const midX = (start.x + end.x) / 2;
      const offset = (index % 5) * 8;
      const d = `M ${start.x} ${start.y} C ${midX + offset} ${start.y}, ${midX - offset} ${end.y}, ${end.x} ${end.y}`;
      return `<path d="${d}" class="edge" marker-end="url(#arrow)"><title>${escapeXml(
        `${relationship.fromTable}.${relationship.fromColumn} -> ${relationship.toTable}.${relationship.toColumn}`
      )}</title></path>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="FluxSQL database diagram">
  <defs>
    <pattern id="grid" width="18" height="18" patternUnits="userSpaceOnUse">
      <circle cx="1" cy="1" r="1" fill="#cbd5e1" opacity="0.55" />
    </pattern>
    <marker id="arrow" markerWidth="10" markerHeight="10" refX="7" refY="3" orient="auto" markerUnits="strokeWidth">
      <path d="M0,0 L0,6 L8,3 z" fill="#2275ff" />
    </marker>
    <style>
      .bg { fill: #f8fbff; }
      .grid { fill: url(#grid); }
      .edge { fill: none; stroke: #2275ff; stroke-width: 2; }
      .node { filter: drop-shadow(0 12px 18px rgba(15, 23, 42, 0.18)); }
      .node-body { fill: #111827; stroke: #2d3a4f; stroke-width: 1; }
      .node-head { fill: #1f6feb; }
      .table-name { fill: #ffffff; font: 700 12px Segoe UI, Arial, sans-serif; }
      .column-name { fill: #f8fafc; font: 11px Segoe UI, Arial, sans-serif; }
      .column-type { fill: #9aa7b8; font: 9px Segoe UI, Arial, sans-serif; text-anchor: end; }
      .separator { stroke: rgba(148, 163, 184, 0.2); stroke-width: 1; }
      .key { fill: #facc15; font: 10px Segoe UI, Arial, sans-serif; }
      .fk { fill: #93c5fd; font: 10px Segoe UI, Arial, sans-serif; }
    </style>
  </defs>
  <rect class="bg" width="100%" height="100%" />
  <rect class="grid" width="100%" height="100%" />
  <g class="edges">
${indent(edges, 4)}
  </g>
  <g class="nodes">
${indent(boxes.map(renderNode).join('\n'), 4)}
  </g>
</svg>
`;
}

function layoutTables(diagram: FluxSqlDiagram): NodeBox[] {
  const incoming = new Map(diagram.tables.map((table) => [table.name, 0]));
  const outgoing = new Map(diagram.tables.map((table) => [table.name, 0]));

  for (const relationship of diagram.relationships) {
    incoming.set(relationship.fromTable, (incoming.get(relationship.fromTable) ?? 0) + 1);
    outgoing.set(relationship.toTable, (outgoing.get(relationship.toTable) ?? 0) + 1);
  }

  const sorted = [...diagram.tables].sort((a, b) => {
    const scoreA = (outgoing.get(a.name) ?? 0) - (incoming.get(a.name) ?? 0);
    const scoreB = (outgoing.get(b.name) ?? 0) - (incoming.get(b.name) ?? 0);
    return scoreB - scoreA || a.name.localeCompare(b.name);
  });

  const columns = Math.max(2, Math.ceil(Math.sqrt(Math.max(sorted.length, 1))));
  return sorted.map((table, index) => {
    const column = index % columns;
    const row = Math.floor(index / columns);
    return {
      table,
      x: padding + column * 320 + (row % 2 === 0 ? 0 : 80),
      y: padding + row * 220,
      width: nodeWidth,
      height: headerHeight + 10 + table.columns.length * rowHeight,
    };
  });
}

function renderNode(box: NodeBox): string {
  const rows = box.table.columns
    .map((column, index) => {
      const y = box.y + headerHeight + 10 + index * rowHeight;
      const marker = column.primaryKey ? 'key' : column.foreignKey ? 'fk' : '';
      const markerText = column.primaryKey ? '◆' : column.foreignKey ? '◇' : '';
      const type = column.type.length > 18 ? `${column.type.slice(0, 17)}…` : column.type;
      return `<line class="separator" x1="${box.x}" y1="${y - 5}" x2="${box.x + box.width}" y2="${y - 5}" />
<text class="${marker}" x="${box.x + 12}" y="${y + 8}">${markerText}</text>
<text class="column-name" x="${box.x + 32}" y="${y + 8}">${escapeXml(column.name)}</text>
<text class="column-type" x="${box.x + box.width - 12}" y="${y + 8}">${escapeXml(type)}</text>`;
    })
    .join('\n');

  return `<g class="node">
  <rect class="node-body" x="${box.x}" y="${box.y}" width="${box.width}" height="${box.height}" rx="9" />
  <path class="node-head" d="M ${box.x} ${box.y + 9} Q ${box.x} ${box.y} ${box.x + 9} ${box.y} H ${box.x + box.width - 9} Q ${box.x + box.width} ${box.y} ${box.x + box.width} ${box.y + 9} V ${box.y + headerHeight} H ${box.x} Z" />
  <text class="table-name" x="${box.x + 14}" y="${box.y + 22}">${escapeXml(box.table.name)}</text>
${indent(rows, 2)}
</g>`;
}

function anchor(from: NodeBox, to: NodeBox): { x: number; y: number } {
  const fromCenter = { x: from.x + from.width / 2, y: from.y + from.height / 2 };
  const toCenter = { x: to.x + to.width / 2, y: to.y + to.height / 2 };
  if (toCenter.x >= fromCenter.x) {
    return { x: from.x + from.width, y: fromCenter.y };
  }
  return { x: from.x, y: fromCenter.y };
}

function getBounds(boxes: NodeBox[]): { maxX: number; maxY: number } {
  return boxes.reduce(
    (bounds, box) => ({
      maxX: Math.max(bounds.maxX, box.x + box.width),
      maxY: Math.max(bounds.maxY, box.y + box.height),
    }),
    { maxX: 0, maxY: 0 }
  );
}

function escapeXml(value: string): string {
  return value.replace(/[<>&"']/g, (char) => {
    const entities: Record<string, string> = {
      '<': '&lt;',
      '>': '&gt;',
      '&': '&amp;',
      '"': '&quot;',
      "'": '&apos;',
    };
    return entities[char];
  });
}

function indent(value: string, spaces: number): string {
  const prefix = ' '.repeat(spaces);
  return value
    .split('\n')
    .filter((line) => line.length > 0)
    .map((line) => `${prefix}${line}`)
    .join('\n');
}
