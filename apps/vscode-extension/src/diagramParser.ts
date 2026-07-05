import { FluxSqlColumn, FluxSqlDiagram, FluxSqlRelationship, FluxSqlTable } from './diagramTypes';

interface RawTable {
  name: string;
  body: string;
}

const constraintStartRegex = /^(?:CONSTRAINT|PRIMARY\s+KEY|FOREIGN\s+KEY|UNIQUE|CHECK|EXCLUDE)\b/i;

export function generateDiagramFromSql(sql: string): FluxSqlDiagram {
  const warnings: string[] = [];
  const tables: FluxSqlTable[] = [];
  const relationships: FluxSqlRelationship[] = [];

  const cleanSql = stripComments(sql);
  if (!cleanSql.trim()) {
    warnings.push('No SQL content was provided.');
    return createDiagram(tables, relationships, warnings);
  }

  const rawTables = extractCreateTableBlocks(cleanSql);
  if (rawTables.length === 0) {
    warnings.push('No CREATE TABLE statements were found.');
  }

  for (const rawTable of rawTables) {
    const parts = splitDefinitions(rawTable.body);
    const primaryKeys = collectTableLevelPrimaryKeys(parts);
    const tableRelationships = collectTableLevelForeignKeys(rawTable.name, parts);
    const columns: FluxSqlColumn[] = [];

    for (const part of parts) {
      const definition = part.trim();
      if (!definition || constraintStartRegex.test(definition)) {
        continue;
      }

      const column = parseColumnDefinition(rawTable.name, definition, primaryKeys, relationships);
      if (column) {
        columns.push(column);
      }
    }

    for (const relationship of tableRelationships) {
      const column = columns.find((item) => item.name.toLowerCase() === relationship.fromColumn.toLowerCase());
      if (column) {
        column.foreignKey = true;
        column.references = { table: relationship.toTable, column: relationship.toColumn };
      }
      relationships.push(relationship);
    }

    tables.push({ name: rawTable.name, columns });
  }

  applyAlterTableForeignKeys(cleanSql, tables, relationships);

  if (tables.length > 0 && tables.every((table) => table.columns.length === 0)) {
    warnings.push('Tables were found, but no columns could be parsed.');
  }

  return createDiagram(tables, dedupeRelationships(relationships), warnings);
}

function createDiagram(
  tables: FluxSqlTable[],
  relationships: FluxSqlRelationship[],
  warnings: string[]
): FluxSqlDiagram {
  return {
    dialect: 'postgresql',
    source: 'local-parser',
    generatedAt: new Date().toISOString(),
    tables,
    relationships,
    warnings,
  };
}

function stripComments(sql: string): string {
  return sql.replace(/--.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
}

function extractCreateTableBlocks(sql: string): RawTable[] {
  const tables: RawTable[] = [];
  const regex = /CREATE\s+(?:TEMP(?:ORARY)?\s+)?TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?((?:"[^"]+"|\w+)(?:\s*\.\s*(?:"[^"]+"|\w+))?)\s*\(/gi;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(sql)) !== null) {
    const bodyStart = regex.lastIndex;
    const bodyEnd = findMatchingParen(sql, bodyStart - 1);
    if (bodyEnd === -1) {
      continue;
    }

    tables.push({
      name: cleanIdentifier(match[1]),
      body: sql.slice(bodyStart, bodyEnd),
    });
    regex.lastIndex = bodyEnd + 1;
  }

  return tables;
}

function findMatchingParen(text: string, openParenIndex: number): number {
  let depth = 0;
  let quote: string | undefined;

  for (let index = openParenIndex; index < text.length; index += 1) {
    const char = text[index];
    const previous = text[index - 1];

    if ((char === '"' || char === "'") && previous !== '\\') {
      quote = quote === char ? undefined : quote ?? char;
      continue;
    }

    if (quote) {
      continue;
    }

    if (char === '(') {
      depth += 1;
    } else if (char === ')') {
      depth -= 1;
      if (depth === 0) {
        return index;
      }
    }
  }

  return -1;
}

function splitDefinitions(body: string): string[] {
  const definitions: string[] = [];
  let depth = 0;
  let quote: string | undefined;
  let current = '';

  for (let index = 0; index < body.length; index += 1) {
    const char = body[index];
    const previous = body[index - 1];

    if ((char === '"' || char === "'") && previous !== '\\') {
      quote = quote === char ? undefined : quote ?? char;
      current += char;
      continue;
    }

    if (!quote) {
      if (char === '(') {
        depth += 1;
      } else if (char === ')') {
        depth -= 1;
      } else if (char === ',' && depth === 0) {
        definitions.push(current);
        current = '';
        continue;
      }
    }

    current += char;
  }

  if (current.trim()) {
    definitions.push(current);
  }

  return definitions;
}

function collectTableLevelPrimaryKeys(parts: string[]): string[] {
  const primaryKeys = new Set<string>();

  for (const part of parts) {
    const match = part.match(/(?:CONSTRAINT\s+(?:"[^"]+"|\w+)\s+)?PRIMARY\s+KEY\s*\(([^)]+)\)/i);
    if (!match) {
      continue;
    }

    for (const column of match[1].split(',')) {
      primaryKeys.add(cleanIdentifier(column));
    }
  }

  return Array.from(primaryKeys);
}

function collectTableLevelForeignKeys(tableName: string, parts: string[]): FluxSqlRelationship[] {
  const relationships: FluxSqlRelationship[] = [];

  for (const part of parts) {
    const match = part.match(
      /(?:CONSTRAINT\s+(?:"[^"]+"|\w+)\s+)?FOREIGN\s+KEY\s*\(\s*("[^"]+"|\w+)\s*\)\s+REFERENCES\s+((?:"[^"]+"|\w+)(?:\s*\.\s*(?:"[^"]+"|\w+))?)\s*\(\s*("[^"]+"|\w+)\s*\)/i
    );
    if (!match) {
      continue;
    }

    relationships.push({
      fromTable: tableName,
      fromColumn: cleanIdentifier(match[1]),
      toTable: cleanIdentifier(match[2]),
      toColumn: cleanIdentifier(match[3]),
    });
  }

  return relationships;
}

function parseColumnDefinition(
  tableName: string,
  definition: string,
  tablePrimaryKeys: string[],
  relationships: FluxSqlRelationship[]
): FluxSqlColumn | undefined {
  const match = definition.match(/^("[^"]+"|\w+)\s+(.+)$/is);
  if (!match) {
    return undefined;
  }

  const name = cleanIdentifier(match[1]);
  const rest = match[2].trim();
  const type = extractColumnType(rest);
  const primaryKey = tablePrimaryKeys.some((column) => column.toLowerCase() === name.toLowerCase()) || /PRIMARY\s+KEY/i.test(rest);
  const reference = rest.match(
    /REFERENCES\s+((?:"[^"]+"|\w+)(?:\s*\.\s*(?:"[^"]+"|\w+))?)\s*\(\s*("[^"]+"|\w+)\s*\)/i
  );

  const column: FluxSqlColumn = {
    name,
    type,
    primaryKey,
    foreignKey: false,
  };

  if (reference) {
    column.foreignKey = true;
    column.references = {
      table: cleanIdentifier(reference[1]),
      column: cleanIdentifier(reference[2]),
    };
    relationships.push({
      fromTable: tableName,
      fromColumn: name,
      toTable: column.references.table,
      toColumn: column.references.column,
    });
  }

  return column;
}

function extractColumnType(rest: string): string {
  const keywordMatch = rest.match(
    /\s(?:PRIMARY|NOT|NULL|DEFAULT|REFERENCES|CONSTRAINT|CHECK|UNIQUE|COLLATE|GENERATED|IDENTITY)\b/i
  );
  const rawType = keywordMatch ? rest.slice(0, keywordMatch.index).trim() : rest.trim();
  return rawType.replace(/\s+/g, ' ').toUpperCase() || 'UNKNOWN';
}

function applyAlterTableForeignKeys(sql: string, tables: FluxSqlTable[], relationships: FluxSqlRelationship[]): void {
  const regex =
    /ALTER\s+TABLE\s+(?:ONLY\s+)?((?:"[^"]+"|\w+)(?:\s*\.\s*(?:"[^"]+"|\w+))?)\s+ADD\s+(?:CONSTRAINT\s+(?:"[^"]+"|\w+)\s+)?FOREIGN\s+KEY\s*\(\s*("[^"]+"|\w+)\s*\)\s+REFERENCES\s+((?:"[^"]+"|\w+)(?:\s*\.\s*(?:"[^"]+"|\w+))?)\s*\(\s*("[^"]+"|\w+)\s*\)/gi;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(sql)) !== null) {
    const fromTable = cleanIdentifier(match[1]);
    const fromColumn = cleanIdentifier(match[2]);
    const toTable = cleanIdentifier(match[3]);
    const toColumn = cleanIdentifier(match[4]);

    const sourceTable = tables.find((table) => table.name.toLowerCase() === fromTable.toLowerCase());
    const sourceColumn = sourceTable?.columns.find((column) => column.name.toLowerCase() === fromColumn.toLowerCase());
    if (sourceColumn) {
      sourceColumn.foreignKey = true;
      sourceColumn.references = { table: toTable, column: toColumn };
    }

    relationships.push({ fromTable, fromColumn, toTable, toColumn });
  }
}

function dedupeRelationships(relationships: FluxSqlRelationship[]): FluxSqlRelationship[] {
  const seen = new Set<string>();
  return relationships.filter((relationship) => {
    const key = [
      relationship.fromTable.toLowerCase(),
      relationship.fromColumn.toLowerCase(),
      relationship.toTable.toLowerCase(),
      relationship.toColumn.toLowerCase(),
    ].join('|');
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function cleanIdentifier(value: string): string {
  return value
    .split('.')
    .map((part) => part.trim().replace(/^["'`]|["'`]$/g, ''))
    .filter(Boolean)
    .join('.');
}
