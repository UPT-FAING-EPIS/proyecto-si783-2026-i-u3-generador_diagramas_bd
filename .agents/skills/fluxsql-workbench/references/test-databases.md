# FluxSQL Docker Test Databases

Start:

```powershell
pnpm run dev:test-dbs
```

Check health:

```powershell
docker compose -f docker-compose.test-dbs.yml ps
```

## PostgreSQL

- Engine: `postgresql`
- Host: `127.0.0.1`
- Port: `15432`
- Database: `fluxsql_demo`
- User: `fluxsql`
- Password: `fluxsql123`

Suggested graph demo tables:

- `users`
- `organizations`
- `organization_members`
- `products`
- `orders`
- `order_items`
- `payments`
- `shipments`
- `support_tickets`

## MySQL

- Engine: `mysql`
- Host: `127.0.0.1`
- Port: `13306`
- Database: `fluxsql_demo`
- User: `fluxsql`
- Password: `fluxsql123`

Suggested graph demo tables:

- `customers`
- `categories`
- `products`
- `orders`
- `order_items`
- `payments`
- `inventory_movements`

## Reset

```powershell
pnpm run reset:test-dbs
```

Only use these credentials for local disposable demos.
