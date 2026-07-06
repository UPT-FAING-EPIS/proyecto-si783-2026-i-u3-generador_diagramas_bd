import assert from 'node:assert/strict';
import test from 'node:test';
import { generateDiagramFromCode, generateDiagramFromSql } from '../src/diagramParser';

test('parses two tables with inline foreign key', () => {
  const diagram = generateDiagramFromSql(`
    CREATE TABLE users (
      id SERIAL PRIMARY KEY,
      name TEXT
    );

    CREATE TABLE orders (
      id SERIAL PRIMARY KEY,
      user_id INT REFERENCES users(id)
    );
  `);

  assert.equal(diagram.tables.length, 2);
  assert.equal(diagram.relationships.length, 1);
  assert.deepEqual(diagram.relationships[0], {
    fromTable: 'orders',
    fromColumn: 'user_id',
    toTable: 'users',
    toColumn: 'id',
  });
  assert.equal(diagram.tables[1].columns[1].foreignKey, true);
});

test('parses table-level primary key', () => {
  const diagram = generateDiagramFromSql(`
    CREATE TABLE accounts (
      tenant_id UUID NOT NULL,
      account_id UUID NOT NULL,
      label TEXT,
      PRIMARY KEY (tenant_id, account_id)
    );
  `);

  const columns = diagram.tables[0].columns;
  assert.equal(columns.find((column) => column.name === 'tenant_id')?.primaryKey, true);
  assert.equal(columns.find((column) => column.name === 'account_id')?.primaryKey, true);
});

test('parses alter table foreign key', () => {
  const diagram = generateDiagramFromSql(`
    CREATE TABLE users (
      id UUID PRIMARY KEY
    );

    CREATE TABLE orders (
      id UUID PRIMARY KEY,
      user_id UUID
    );

    ALTER TABLE orders ADD CONSTRAINT fk_orders_user
      FOREIGN KEY (user_id) REFERENCES users(id);
  `);

  assert.equal(diagram.relationships.length, 1);
  assert.equal(diagram.tables[1].columns[1].foreignKey, true);
  assert.deepEqual(diagram.tables[1].columns[1].references, { table: 'users', column: 'id' });
});

test('ignores SQL comments', () => {
  const diagram = generateDiagramFromSql(`
    -- CREATE TABLE ignored (id int);
    /* CREATE TABLE also_ignored (id int); */
    CREATE TABLE visible (
      id INT PRIMARY KEY
    );
  `);

  assert.equal(diagram.tables.length, 1);
  assert.equal(diagram.tables[0].name, 'visible');
});

test('returns warning for empty or invalid SQL', () => {
  const empty = generateDiagramFromSql('');
  const invalid = generateDiagramFromSql('select 1;');

  assert.equal(empty.tables.length, 0);
  assert.match(empty.warnings[0], /No SQL content/);
  assert.equal(invalid.tables.length, 0);
  assert.match(invalid.warnings[0], /No CREATE TABLE/);
});

test('parses Mongoose refs as NoSQL graph relationships', () => {
  const diagram = generateDiagramFromCode(`
    const UserSchema = new mongoose.Schema({
      email: String
    });
    const OrderSchema = new mongoose.Schema({
      user_id: { type: Schema.Types.ObjectId, ref: 'User' },
      total: Number
    });
    mongoose.model('User', UserSchema);
    mongoose.model('Order', OrderSchema);
  `, 'mongoose');

  assert.equal(diagram.family, 'nosql');
  assert.equal(diagram.renderMode, 'graph');
  assert.equal(diagram.tables.length, 2);
  assert.equal(diagram.relationships.length, 1);
  assert.deepEqual(diagram.relationships[0], {
    fromTable: 'Order',
    fromColumn: 'user_id',
    toTable: 'User',
    toColumn: '_id',
  });
});

test('parses JSON collections as NoSQL graph relationships', () => {
  const diagram = generateDiagramFromCode(JSON.stringify({
    users: { id: 'uuid', email: 'text' },
    orders: { id: 'uuid', user_id: 'uuid', total: 'number' },
  }), 'json');

  assert.equal(diagram.dialect, 'json');
  assert.equal(diagram.renderMode, 'graph');
  assert.equal(diagram.tables.length, 2);
  assert.equal(diagram.relationships.length, 1);
});

test('parses Neo4j Cypher as graph diagram', () => {
  const diagram = generateDiagramFromCode(`
    CREATE (u:User {email: "a@b.com"})-[:PLACED]->(o:Order {total: 20})
  `, 'neo4j');

  assert.equal(diagram.dialect, 'neo4j');
  assert.equal(diagram.family, 'nosql');
  assert.equal(diagram.renderMode, 'graph');
  assert.equal(diagram.tables.length, 2);
  assert.equal(diagram.relationships.length, 1);
});
