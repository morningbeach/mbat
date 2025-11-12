// app/api/p/[slug]/route.ts
export const runtime = 'edge';

import { getRequestContext } from '@cloudflare/next-on-pages';

export async function GET(
  _req: Request,
  ctx: { params: { slug: string } }
) {
  const { env } = getRequestContext();
  const DB = (env as any).DB as D1Database;

  const slug = ctx.params.slug;

  // 確保表存在
  await DB.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price REAL,
      image TEXT,
      slug TEXT UNIQUE NOT NULL
    );
  `);

  // 簡單種子
  await DB.prepare(`
    INSERT OR IGNORE INTO products (name, price, image, slug)
    VALUES ('Tote Bag', 12.5, NULL, 'tote-bag'),
           ('Gift Box', 25.0, NULL, 'gift-box')
  `).run();

  const row = await DB.prepare(
    `SELECT id, name, price, image, slug FROM products WHERE slug = ? LIMIT 1`
  ).bind(slug).first<Product>();

  if (!row) {
    return new Response(JSON.stringify({ ok: false, error: 'Not found' }), {
      status: 404,
      headers: { 'content-type': 'application/json; charset=utf-8' },
    });
  }

  return new Response(JSON.stringify(row), {
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

type Product = {
  id: number;
  name: string;
  price: number | null;
  image: string | null;
  slug: string;
};
