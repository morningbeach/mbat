export type CfBindings = {
  DB: D1Database
  ASSETS?: R2Bucket
}

export type CatalogProductRow = {
  id: string
  name: string
  slug: string
  price: number | null
  short_desc: string | null
  hero_image: string | null
  created_at: string | null
}

export type CatalogProduct = {
  id: string
  name: string
  slug: string
  price: number | null
  image: string | null
  short_desc: string | null
}

const CATEGORY_SEED = {
  id: 'cat-core',
  name: 'Core Packaging',
  slug: 'core-packaging',
  sort: 1,
}

const PRODUCT_SEED: Array<{
  id: string
  name: string
  slug: string
  price: number
  short_desc: string
  heroKey: string
}> = [
  {
    id: 'prod-tote-bag',
    name: 'Tote Bag',
    slug: 'tote-bag',
    price: 12.5,
    short_desc: '厚磅帆布手提袋，適合展覽、零售品牌贈禮。',
    heroKey: 'products/tote-bag.svg',
  },
  {
    id: 'prod-gift-box',
    name: 'Magnetic Gift Box',
    slug: 'gift-box',
    price: 25,
    short_desc: '磁扣式硬盒結構，常見於精品禮盒與高階贈禮。',
    heroKey: 'products/gift-box.svg',
  },
]

const PLACEHOLDER_SVGS: Record<string, string> = {
  'products/tote-bag.svg': createPlaceholderSvg('Tote Bag'),
  'products/gift-box.svg': createPlaceholderSvg('Gift Box'),
  'products/placeholder.svg': createPlaceholderSvg('MB Pack'),
}

function createPlaceholderSvg(label: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">\n  <rect width="512" height="512" fill="#f5f5f5" rx="32"/>\n  <g fill="none" stroke="#2d3a4a" stroke-width="18">\n    <rect x="112" y="144" width="288" height="240" rx="24"/>\n    <path d="M160 144c0-44 32-80 96-80s96 36 96 80"/>\n  </g>\n  <text x="50%" y="78%" font-family="'Segoe UI',sans-serif" font-size="48" text-anchor="middle" fill="#2d3a4a">${label}</text>\n</svg>`
}

export function buildAssetUrl(key: string): string {
  return `/api/assets/${key.split('/').map(encodeURIComponent).join('/')}`
}

export async function ensureCatalogBootstrap(env: CfBindings): Promise<void> {
  await ensureCoreTables(env.DB)
  await ensureProductSeeds(env.DB)
  if (env.ASSETS) {
    await ensureAssetPlaceholders(env.ASSETS)
  }
}

async function ensureCoreTables(db: D1Database): Promise<void> {
  const statements: string[] = [
    `PRAGMA foreign_keys = ON;`,
    `CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      sort INTEGER DEFAULT 0
    );`,
    `CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      category_id TEXT REFERENCES categories(id),
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      short_desc TEXT,
      long_desc TEXT,
      hero_image TEXT,
      price REAL,
      status TEXT DEFAULT 'active',
      created_at TEXT DEFAULT (datetime('now'))
    );`,
    `CREATE TABLE IF NOT EXISTS companies (
      id TEXT PRIMARY KEY,
      name TEXT,
      country TEXT,
      contact_name TEXT,
      contact_email TEXT,
      contact_phone TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );`,
    `CREATE TABLE IF NOT EXISTS rfqs (
      id TEXT PRIMARY KEY,
      company_id TEXT REFERENCES companies(id),
      source TEXT,
      note TEXT,
      status TEXT DEFAULT 'new',
      created_at TEXT DEFAULT (datetime('now'))
    );`
  ]

  for (const sql of statements) {
    await db.exec(sql)
  }

  // Guard for legacy schema missing `price`
  try {
    await db.exec(`ALTER TABLE products ADD COLUMN price REAL;`)
  } catch (err: any) {
    if (!String(err?.message ?? err).includes('duplicate column name')) {
      throw err
    }
  }
}

async function ensureProductSeeds(db: D1Database): Promise<void> {
  await db.prepare(
    `INSERT OR IGNORE INTO categories (id, name, slug, sort) VALUES (?, ?, ?, ?)`
  )
    .bind(CATEGORY_SEED.id, CATEGORY_SEED.name, CATEGORY_SEED.slug, CATEGORY_SEED.sort)
    .run()

  const now = new Date().toISOString()

  for (const product of PRODUCT_SEED) {
    await db
      .prepare(
        `INSERT OR IGNORE INTO products (
          id, category_id, name, slug, short_desc, hero_image, price, status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'active', COALESCE(?, datetime('now')))
        `
      )
      .bind(
        product.id,
        CATEGORY_SEED.id,
        product.name,
        product.slug,
        product.short_desc,
        product.heroKey,
        product.price,
        now
      )
      .run()
  }
}

async function ensureAssetPlaceholders(bucket: R2Bucket): Promise<void> {
  const entries = Object.entries(PLACEHOLDER_SVGS)
  for (const [key, body] of entries) {
    const head = await bucket.head(key)
    if (!head) {
      await bucket.put(key, body, {
        httpMetadata: {
          contentType: 'image/svg+xml',
          cacheControl: 'public, max-age=31536000',
        },
      })
    }
  }
}

export async function listCatalogProducts(env: CfBindings): Promise<CatalogProduct[]> {
  await ensureCatalogBootstrap(env)
  const { results } = await env.DB.prepare(
    `SELECT id, name, slug, price, short_desc, hero_image, created_at
     FROM products
     WHERE status = 'active'
     ORDER BY datetime(created_at) DESC`
  ).all<CatalogProductRow>()

  return (results ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    price: row.price ?? null,
    short_desc: row.short_desc ?? null,
    image: row.hero_image ? buildAssetUrl(row.hero_image) : null,
  }))
}

export async function getCatalogProduct(
  env: CfBindings,
  slug: string
): Promise<CatalogProduct | null> {
  await ensureCatalogBootstrap(env)
  const row = await env.DB.prepare(
    `SELECT id, name, slug, price, short_desc, hero_image, created_at
     FROM products
     WHERE slug = ? AND status = 'active'
     LIMIT 1`
  )
    .bind(slug)
    .first<CatalogProductRow>()

  if (!row) return null

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    price: row.price ?? null,
    short_desc: row.short_desc ?? null,
    image: row.hero_image ? buildAssetUrl(row.hero_image) : null,
  }
}

export type RfqInput = {
  name: string
  email: string
  message: string
}

export async function recordRfq(env: CfBindings, data: RfqInput): Promise<string> {
  await ensureCoreTables(env.DB)

  const companyId = crypto.randomUUID()
  const rfqId = crypto.randomUUID()
  const now = new Date().toISOString()

  await env.DB.batch([
    env.DB
      .prepare(
        `INSERT OR IGNORE INTO companies (
          id, name, contact_name, contact_email, created_at
        ) VALUES (?, ?, ?, ?, COALESCE(?, datetime('now')))
        `
      )
      .bind(companyId, data.name, data.name, data.email, now),
    env.DB
      .prepare(
        `INSERT INTO rfqs (
          id, company_id, source, note, status, created_at
        ) VALUES (?, ?, 'web', ?, 'new', COALESCE(?, datetime('now')))
        `
      )
      .bind(rfqId, companyId, data.message, now),
  ])

  if (env.ASSETS) {
    const key = `rfqs/${rfqId}.json`
    await env.ASSETS.put(key, JSON.stringify({ ...data, rfqId, createdAt: now }), {
      httpMetadata: {
        contentType: 'application/json',
        cacheControl: 'no-cache',
      },
    })
  }

  return rfqId
}
