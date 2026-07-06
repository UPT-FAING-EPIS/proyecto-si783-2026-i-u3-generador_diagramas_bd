import { FluxSqlColumn, FluxSqlDiagram, FluxSqlRelationship, FluxSqlTable } from './diagramTypes';

type NoSqlDialect = Extract<FluxSqlDiagram['dialect'], 'mongodb' | 'mongoose' | 'prisma' | 'json'>;

export function generateDiagramFromNoSql(code: string, languageId: string): FluxSqlDiagram {
  const warnings: string[] = [];
  let tables: FluxSqlTable[] = [];
  let relationships: FluxSqlRelationship[] = [];
  let dialect: NoSqlDialect = normalizeNoSqlDialect(code, languageId);

  if (dialect === 'json') {
    const result = parseJsonCollections(code);
    tables = result.tables;
    relationships = result.relationships;
    warnings.push(...result.warnings);
  } else if (dialect === 'prisma') {
    const result = parsePrismaSchema(code);
    tables = result.tables;
    relationships = result.relationships;
  } else {
    const mongoose = parseMongooseSchema(code);
    if (mongoose.tables.length > 0) {
      dialect = 'mongoose';
      tables = mongoose.tables;
      relationships = mongoose.relationships;
    } else {
      const mongodb = parseMongoNative(code);
      dialect = 'mongodb';
      tables = mongodb.tables;
      relationships = mongodb.relationships;
    }
  }

  if (tables.length === 0) {
    warnings.push(`No NoSQL collections/models were found for engine: ${dialect}.`);
  }

  return {
    dialect,
    family: 'nosql',
    renderMode: dialect === 'prisma' ? 'tables' : 'graph',
    source: 'local-parser',
    generatedAt: new Date().toISOString(),
    tables,
    relationships: dedupeRelationships(relationships),
    warnings,
  };
}

function normalizeNoSqlDialect(code: string, languageId: string): NoSqlDialect {
  const language = languageId.toLowerCase();
  if (language === 'json' || language === 'jsonc') return 'json';
  if (language === 'prisma' || (code.includes('model ') && code.includes('@id'))) return 'prisma';
  if (language === 'mongoose') return 'mongoose';
  return 'mongodb';
}

function parseJsonCollections(code: string): { tables: FluxSqlTable[]; relationships: FluxSqlRelationship[]; warnings: string[] } {
  const warnings: string[] = [];

  try {
    const parsed = JSON.parse(code) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return { tables: [], relationships: [], warnings: ['JSON root must be an object.'] };
    }

    const root = parsed as Record<string, unknown>;
    const source = root.tables && typeof root.tables === 'object' && !Array.isArray(root.tables)
      ? root.tables as Record<string, unknown>
      : root;

    const tables = Object.entries(source)
      .filter(([name, value]) => name !== 'relations' && value && typeof value === 'object' && !Array.isArray(value))
      .map(([collectionName, fields]) => ({
        name: collectionName,
        columns: objectFieldsToColumns(fields as Record<string, unknown>),
      }));

    const tableNames = new Set(tables.map((table) => table.name));
    const relationships: FluxSqlRelationship[] = [];

    for (const table of tables) {
      for (const column of table.columns) {
        const target = inferReferenceTarget(column.name, tableNames);
        if (!target) continue;

        column.foreignKey = true;
        column.references = { table: target, column: 'id' };
        relationships.push({
          fromTable: table.name,
          fromColumn: column.name,
          toTable: target,
          toColumn: 'id',
        });
      }
    }

    const explicitRelations = Array.isArray(root.relations) ? root.relations : [];
    for (const item of explicitRelations) {
      if (!item || typeof item !== 'object') continue;
      const relation = item as { source?: unknown; target?: unknown; sourceColumn?: unknown; targetColumn?: unknown };
      if (typeof relation.source !== 'string' || typeof relation.target !== 'string') continue;
      relationships.push({
        fromTable: relation.source,
        fromColumn: typeof relation.sourceColumn === 'string' ? relation.sourceColumn : 'id',
        toTable: relation.target,
        toColumn: typeof relation.targetColumn === 'string' ? relation.targetColumn : 'id',
      });
    }

    return { tables, relationships, warnings };
  } catch (error) {
    warnings.push(error instanceof Error ? error.message : 'Invalid JSON.');
    return { tables: [], relationships: [], warnings };
  }
}

function parsePrismaSchema(code: string): { tables: FluxSqlTable[]; relationships: FluxSqlRelationship[] } {
  const tables: FluxSqlTable[] = [];
  const relationships: FluxSqlRelationship[] = [];

  const modelRegex = /model\s+(\w+)\s+\{([^}]+)\}/g;
  let match: RegExpExecArray | null;

  while ((match = modelRegex.exec(code)) !== null) {
    const modelName = match[1];
    const body = match[2];
    const columns: FluxSqlColumn[] = [];

    const lineRegex = /^\s*(\w+)\s+([A-Za-z0-9_]+)(\[\]|\?)?\s*(.*)$/gm;
    let lineMatch: RegExpExecArray | null;

    while ((lineMatch = lineRegex.exec(body)) !== null) {
      const fieldName = lineMatch[1];
      const fieldType = lineMatch[2];
      const cardinality = lineMatch[3] ?? '';
      const decorators = lineMatch[4] || '';

      const isRelation = decorators.includes('@relation');
      if (isRelation) {
        relationships.push({
          fromTable: modelName,
          fromColumn: fieldName,
          toTable: fieldType,
          toColumn: 'id',
        });
      }

      columns.push({
        name: fieldName,
        type: `${fieldType}${cardinality}`,
        primaryKey: decorators.includes('@id'),
        foreignKey: isRelation,
        references: isRelation ? { table: fieldType, column: 'id' } : undefined,
      });
    }

    tables.push({ name: modelName, columns });
  }

  return { tables, relationships };
}

function parseMongooseSchema(code: string): { tables: FluxSqlTable[]; relationships: FluxSqlRelationship[] } {
  const tables: FluxSqlTable[] = [];
  const relationships: FluxSqlRelationship[] = [];
  const schemaAssignments = new Map<string, string>();
  const schemaRegex = /(?:const|let|var)\s+(\w+)\s*=\s*new\s+(?:mongoose\.)?Schema\s*\(/g;
  let schemaMatch: RegExpExecArray | null;

  while ((schemaMatch = schemaRegex.exec(code)) !== null) {
    const schemaVar = schemaMatch[1];
    const start = code.indexOf('{', schemaMatch.index);
    const end = start >= 0 ? findMatching(code, start, '{', '}') : -1;
    if (start < 0 || end < 0) continue;
    schemaAssignments.set(schemaVar, code.slice(start + 1, end));
    schemaRegex.lastIndex = end;
  }

  const modelToSchema = new Map<string, string>();
  const modelRegex = /mongoose\.model\s*\(\s*['"]([^'"]+)['"]\s*,\s*(\w+)/g;
  let modelMatch: RegExpExecArray | null;
  while ((modelMatch = modelRegex.exec(code)) !== null) {
    modelToSchema.set(modelMatch[1], modelMatch[2]);
  }

  let anonymousIndex = 1;
  for (const [schemaVar, body] of schemaAssignments.entries()) {
    const modelName = Array.from(modelToSchema.entries()).find(([, value]) => value === schemaVar)?.[0]
      ?? schemaVar.replace(/Schema$/i, '')
      ?? `Collection${anonymousIndex++}`;
    const table = parseDocumentBody(modelName, body, relationships);
    tables.push(table);
  }

  return { tables, relationships };
}

function parseMongoNative(code: string): { tables: FluxSqlTable[]; relationships: FluxSqlRelationship[] } {
  const tablesByName = new Map<string, FluxSqlTable>();
  const relationships: FluxSqlRelationship[] = [];
  const collectionRegex = /db\.(\w+)\.(?:insertOne|insertMany|createCollection|updateOne|updateMany)\s*\(/g;
  let match: RegExpExecArray | null;

  while ((match = collectionRegex.exec(code)) !== null) {
    const collectionName = match[1];
    const start = code.indexOf('{', match.index);
    const end = start >= 0 ? findMatching(code, start, '{', '}') : -1;
    const body = start >= 0 && end >= 0 ? code.slice(start + 1, end) : '';
    const table = parseDocumentBody(collectionName, body, relationships);
    tablesByName.set(collectionName, mergeTable(tablesByName.get(collectionName), table));
    if (end >= 0) collectionRegex.lastIndex = end;
  }

  return { tables: Array.from(tablesByName.values()), relationships };
}

function parseDocumentBody(collectionName: string, body: string, relationships: FluxSqlRelationship[]): FluxSqlTable {
  const columns: FluxSqlColumn[] = [{
    name: '_id',
    type: 'ObjectId',
    primaryKey: true,
    foreignKey: false,
  }];

  const fields = splitTopLevelFields(body);
  for (const field of fields) {
    const separator = field.indexOf(':');
    if (separator < 0) continue;

    const fieldName = cleanKey(field.slice(0, separator));
    const fieldValue = field.slice(separator + 1).trim();
    if (!fieldName || fieldName === '_id') continue;

    const refMatch = fieldValue.match(/ref\s*:\s*['"]([^'"]+)['"]/);
    const type = normalizeNoSqlType(fieldValue);
    const isRef = Boolean(refMatch) || /_id$/i.test(fieldName);
    const target = refMatch?.[1] ?? inferCollectionFromField(fieldName);

    if (isRef && target) {
      relationships.push({
        fromTable: collectionName,
        fromColumn: fieldName,
        toTable: target,
        toColumn: '_id',
      });
    }

    columns.push({
      name: fieldName,
      type,
      primaryKey: false,
      foreignKey: Boolean(isRef && target),
      references: isRef && target ? { table: target, column: '_id' } : undefined,
    });
  }

  return { name: collectionName, columns };
}

function objectFieldsToColumns(fields: Record<string, unknown>): FluxSqlColumn[] {
  const columns: FluxSqlColumn[] = [];
  if (!('_id' in fields) && !('id' in fields)) {
    columns.push({ name: '_id', type: 'ObjectId', primaryKey: true, foreignKey: false });
  }

  for (const [name, value] of Object.entries(fields)) {
    columns.push({
      name,
      type: inferJsonType(value),
      primaryKey: name === '_id' || name === 'id',
      foreignKey: /_id$/i.test(name) && name !== '_id',
    });
  }

  return columns;
}

function splitTopLevelFields(body: string): string[] {
  const fields: string[] = [];
  let current = '';
  let depth = 0;
  let quote: string | undefined;

  for (let index = 0; index < body.length; index += 1) {
    const char = body[index];
    const previous = body[index - 1];
    if ((char === '"' || char === "'" || char === '`') && previous !== '\\') {
      quote = quote === char ? undefined : quote ?? char;
    }
    if (!quote) {
      if (char === '{' || char === '[' || char === '(') depth += 1;
      if (char === '}' || char === ']' || char === ')') depth -= 1;
      if (char === ',' && depth === 0) {
        if (current.trim()) fields.push(current.trim());
        current = '';
        continue;
      }
    }
    current += char;
  }

  if (current.trim()) fields.push(current.trim());
  return fields;
}

function normalizeNoSqlType(value: string): string {
  const clean = value.replace(/mongoose\.Schema\.Types\./g, '').replace(/Schema\.Types\./g, '');
  const typeMatch = clean.match(/type\s*:\s*([A-Za-z0-9_.]+)/);
  if (typeMatch) return typeMatch[1].replace(/^mongoose\./, '');
  if (/^\[/.test(clean)) return 'Array';
  if (/^\{/.test(clean)) return 'Object';
  const simple = clean.match(/^([A-Za-z0-9_.]+)/);
  return simple ? simple[1].replace(/^mongoose\./, '') : 'Mixed';
}

function inferJsonType(value: unknown): string {
  if (Array.isArray(value)) return 'Array';
  if (value === null) return 'Null';
  if (typeof value === 'object') {
    const descriptor = value as { type?: unknown };
    if (typeof descriptor.type === 'string') return descriptor.type;
    return 'Object';
  }
  return typeof value;
}

function inferReferenceTarget(fieldName: string, tableNames: Set<string>): string | undefined {
  const base = inferCollectionFromField(fieldName);
  if (!base) return undefined;
  return Array.from(tableNames).find((name) => name.toLowerCase() === base.toLowerCase() || name.toLowerCase() === `${base.toLowerCase()}s`);
}

function inferCollectionFromField(fieldName: string): string | undefined {
  if (!/_id$/i.test(fieldName) || fieldName === '_id') return undefined;
  return fieldName.replace(/_id$/i, '');
}

function mergeTable(previous: FluxSqlTable | undefined, next: FluxSqlTable): FluxSqlTable {
  if (!previous) return next;
  const existing = new Set(previous.columns.map((column) => column.name));
  return {
    ...previous,
    columns: [
      ...previous.columns,
      ...next.columns.filter((column) => !existing.has(column.name)),
    ],
  };
}

function findMatching(text: string, start: number, open: string, close: string): number {
  let depth = 0;
  let quote: string | undefined;
  for (let index = start; index < text.length; index += 1) {
    const char = text[index];
    const previous = text[index - 1];
    if ((char === '"' || char === "'" || char === '`') && previous !== '\\') {
      quote = quote === char ? undefined : quote ?? char;
    }
    if (quote) continue;
    if (char === open) depth += 1;
    if (char === close) {
      depth -= 1;
      if (depth === 0) return index;
    }
  }
  return -1;
}

function cleanKey(value: string): string {
  return value.trim().replace(/^['"`]|['"`]$/g, '');
}

function dedupeRelationships(relationships: FluxSqlRelationship[]): FluxSqlRelationship[] {
  const seen = new Set<string>();
  return relationships.filter((relationship) => {
    const key = `${relationship.fromTable}|${relationship.fromColumn}|${relationship.toTable}|${relationship.toColumn}`.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
