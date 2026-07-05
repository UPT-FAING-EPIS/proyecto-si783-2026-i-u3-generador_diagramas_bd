export interface FluxSqlColumn {
  name: string;
  type: string;
  primaryKey: boolean;
  foreignKey: boolean;
  references?: {
    table: string;
    column: string;
  };
}

export interface FluxSqlTable {
  name: string;
  columns: FluxSqlColumn[];
}

export interface FluxSqlRelationship {
  fromTable: string;
  fromColumn: string;
  toTable: string;
  toColumn: string;
}

export interface FluxSqlDiagram {
  dialect: 'postgresql';
  source: 'local-parser';
  generatedAt: string;
  tables: FluxSqlTable[];
  relationships: FluxSqlRelationship[];
  warnings: string[];
}
