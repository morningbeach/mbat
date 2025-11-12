PRAGMA foreign_keys=ON;

CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  sort INTEGER DEFAULT 0
);

CREATE TABLE products (
  id TEXT PRIMARY KEY,
  category_id TEXT REFERENCES categories(id),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  short_desc TEXT,
  long_desc TEXT,
  hero_image TEXT,
  status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE variants (
  id TEXT PRIMARY KEY,
  product_id TEXT REFERENCES products(id),
  sku TEXT UNIQUE,
  size_l REAL, size_w REAL, size_h REAL,
  base_material TEXT,
  min_order_qty INTEGER DEFAULT 100,
  lead_time_days INTEGER DEFAULT 14,
  status TEXT DEFAULT 'active'
);

CREATE TABLE materials (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT,
  spec TEXT,
  notes TEXT
);

CREATE TABLE finishes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT,
  notes TEXT
);

CREATE TABLE variant_finishes (
  variant_id TEXT REFERENCES variants(id),
  finish_id TEXT REFERENCES finishes(id),
  PRIMARY KEY (variant_id, finish_id)
);

CREATE TABLE companies (
  id TEXT PRIMARY KEY,
  name TEXT,
  country TEXT,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE rfqs (
  id TEXT PRIMARY KEY,
  company_id TEXT REFERENCES companies(id),
  source TEXT,
  note TEXT,
  status TEXT DEFAULT 'new',
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE rfq_items (
  id TEXT PRIMARY KEY,
  rfq_id TEXT REFERENCES rfqs(id),
  product_id TEXT REFERENCES products(id),
  variant_id TEXT REFERENCES variants(id),
  quantity INTEGER NOT NULL,
  expected_ship_date TEXT,
  notes TEXT
);

CREATE TABLE quotes (
  id TEXT PRIMARY KEY,
  rfq_id TEXT REFERENCES rfqs(id),
  version INTEGER DEFAULT 1,
  price_currency TEXT DEFAULT 'TWD',
  subtotal REAL,
  tooling_cost REAL,
  freight_cost REAL,
  tax_rate REAL,
  discount REAL,
  grand_total REAL,
  lead_time_days INTEGER,
  valid_until TEXT,
  terms TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE quote_items (
  id TEXT PRIMARY KEY,
  quote_id TEXT REFERENCES quotes(id),
  rfq_item_id TEXT REFERENCES rfq_items(id),
  unit_price REAL,
  quantity INTEGER,
  line_total REAL
);

CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  rfq_id TEXT REFERENCES rfqs(id),
  quote_id TEXT REFERENCES quotes(id),
  po_number TEXT,
  status TEXT DEFAULT 'placed',
  placed_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE showcases (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  cover_image TEXT,
  tags TEXT,
  body_md TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
