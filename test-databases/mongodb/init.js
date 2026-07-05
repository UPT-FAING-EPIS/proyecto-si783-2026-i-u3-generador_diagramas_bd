db = db.getSiblingDB('fluxsql_demo');

db.createCollection('customers');
db.customers.insertMany([
  {
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    plan: 'pro',
    tags: ['analytics', 'sql'],
    createdAt: new Date()
  },
  {
    name: 'Grace Hopper',
    email: 'grace@example.com',
    plan: 'enterprise',
    tags: ['compiler', 'database'],
    createdAt: new Date()
  }
]);

db.createCollection('projects');
db.projects.insertMany([
  {
    name: 'Retail Warehouse',
    engine: 'postgresql',
    status: 'active',
    tables: 12
  },
  {
    name: 'IoT Events',
    engine: 'mongodb',
    status: 'draft',
    collections: 5
  }
]);
