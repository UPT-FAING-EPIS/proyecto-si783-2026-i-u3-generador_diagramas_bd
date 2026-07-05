CREATE TABLE customers (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(120) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categories (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  parent_id BIGINT NULL,
  CONSTRAINT fk_categories_parent FOREIGN KEY (parent_id) REFERENCES categories(id)
);

CREATE TABLE products (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  category_id BIGINT NOT NULL,
  sku VARCHAR(40) NOT NULL UNIQUE,
  name VARCHAR(140) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE TABLE orders (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  customer_id BIGINT NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'draft',
  ordered_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_orders_customer FOREIGN KEY (customer_id) REFERENCES customers(id)
);

CREATE TABLE order_items (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  order_id BIGINT NOT NULL,
  product_id BIGINT NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(id),
  CONSTRAINT fk_order_items_product FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE payments (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  order_id BIGINT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  method VARCHAR(30) NOT NULL,
  paid_at TIMESTAMP NULL,
  CONSTRAINT fk_payments_order FOREIGN KEY (order_id) REFERENCES orders(id)
);

CREATE TABLE inventory_movements (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  product_id BIGINT NOT NULL,
  movement_type VARCHAR(20) NOT NULL,
  quantity INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_inventory_product FOREIGN KEY (product_id) REFERENCES products(id)
);

INSERT INTO customers (email, full_name) VALUES
  ('cliente1@fluxsql.dev', 'Cliente Uno'),
  ('cliente2@fluxsql.dev', 'Cliente Dos');

INSERT INTO categories (id, name, parent_id) VALUES
  (1, 'Tecnologia', NULL),
  (2, 'Accesorios', 1);

INSERT INTO products (category_id, sku, name, price) VALUES
  (1, 'LAP-001', 'Laptop Demo', 2500.00),
  (2, 'MOU-001', 'Mouse Demo', 55.90);

INSERT INTO orders (customer_id, status) VALUES
  (1, 'paid');

INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES
  (1, 1, 1, 2500.00),
  (1, 2, 2, 55.90);

INSERT INTO payments (order_id, amount, method, paid_at) VALUES
  (1, 2611.80, 'card', CURRENT_TIMESTAMP);

INSERT INTO inventory_movements (product_id, movement_type, quantity) VALUES
  (1, 'in', 10),
  (1, 'out', 1),
  (2, 'in', 50),
  (2, 'out', 2);
