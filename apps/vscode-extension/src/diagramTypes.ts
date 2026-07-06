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
  dialect: 'postgresql' | 'mysql' | 'mongodb' | 'mongoose' | 'prisma' | 'json' | 'sqlserver' | 'sqlite' | 'neo4j';
  family: 'sql' | 'nosql';
  renderMode: 'tables' | 'graph';
  source: 'local-parser';
  generatedAt: string;
  tables: FluxSqlTable[];
  relationships: FluxSqlRelationship[];
  warnings: string[];
}
