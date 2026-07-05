CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(120) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES users(id),
  name VARCHAR(140) NOT NULL,
  tax_id VARCHAR(50),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE organization_members (
  organization_id UUID NOT NULL REFERENCES organizations(id),
  user_id UUID NOT NULL REFERENCES users(id),
  role VARCHAR(40) NOT NULL DEFAULT 'member',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (organization_id, user_id)
);

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  sku VARCHAR(40) NOT NULL UNIQUE,
  name VARCHAR(140) NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  customer_id UUID NOT NULL REFERENCES users(id),
  status VARCHAR(30) NOT NULL DEFAULT 'draft',
  ordered_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id),
  product_id UUID NOT NULL REFERENCES products(id),
  quantity INT NOT NULL,
  unit_price NUMERIC(10, 2) NOT NULL
);

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id),
  amount NUMERIC(10, 2) NOT NULL,
  method VARCHAR(30) NOT NULL,
  paid_at TIMESTAMPTZ
);

CREATE TABLE shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id),
  tracking_code VARCHAR(80),
  status VARCHAR(30) NOT NULL DEFAULT 'pending',
  shipped_at TIMESTAMPTZ
);

CREATE TABLE support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  requester_id UUID NOT NULL REFERENCES users(id),
  order_id UUID REFERENCES orders(id),
  subject VARCHAR(180) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO users (id, email, full_name) VALUES
  ('00000000-0000-0000-0000-000000000001', 'ana@fluxsql.dev', 'Ana Torres'),
  ('00000000-0000-0000-0000-000000000002', 'luis@fluxsql.dev', 'Luis Ramos'),
  ('00000000-0000-0000-0000-000000000003', 'maria@fluxsql.dev', 'Maria Silva');

INSERT INTO organizations (id, owner_id, name, tax_id) VALUES
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Aqua Demo SAC', '20123456789');

INSERT INTO organization_members (organization_id, user_id, role) VALUES
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'owner'),
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'admin');

INSERT INTO products (id, organization_id, sku, name, price) VALUES
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'SKU-001', 'Filtro premium', 129.90),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'SKU-002', 'Kit mantenimiento', 79.50);

INSERT INTO orders (id, organization_id, customer_id, status) VALUES
  ('30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', 'paid');

INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES
  ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 1, 129.90),
  ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', 2, 79.50);

INSERT INTO payments (order_id, amount, method, paid_at) VALUES
  ('30000000-0000-0000-0000-000000000001', 288.90, 'card', now());

INSERT INTO shipments (order_id, tracking_code, status) VALUES
  ('30000000-0000-0000-0000-000000000001', 'FLX-TRACK-001', 'in_transit');

INSERT INTO support_tickets (organization_id, requester_id, order_id, subject) VALUES
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000001', 'Consulta sobre envio');
