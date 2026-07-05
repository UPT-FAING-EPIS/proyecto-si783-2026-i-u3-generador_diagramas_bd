# FluxSQL Test Databases

Use these local databases to test FluxSQL Desktop connections, schema inspection, graph diagrams, table previews and synthetic data generation.

## Start

```powershell
docker compose -f docker-compose.test-dbs.yml up -d
```

## PostgreSQL Demo

- Engine: `postgresql`
- Host: `127.0.0.1`
- Port: `15432`
- Database: `fluxsql_demo`
- User: `fluxsql`
- Password: `fluxsql123`

Suggested project tables:

- `users`
- `organizations`
- `organization_members`
- `products`
- `orders`
- `order_items`
- `payments`
- `shipments`
- `support_tickets`

## MySQL Demo

- Engine: `mysql`
- Host: `127.0.0.1`
- Port: `13306`
- Database: `fluxsql_demo`
- User: `fluxsql`
- Password: `fluxsql123`

Suggested project tables:

- `customers`
- `categories`
- `products`
- `orders`
- `order_items`
- `payments`
- `inventory_movements`

## Stop

```powershell
docker compose -f docker-compose.test-dbs.yml down
```

To reset all data:

```powershell
docker compose -f docker-compose.test-dbs.yml down -v
docker compose -f docker-compose.test-dbs.yml up -d
```
