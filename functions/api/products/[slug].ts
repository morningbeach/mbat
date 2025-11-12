// functions/api/products/[slug].ts
export type Product = {
  id: number;
  name: string;
  price: number | null;
  image: string | null;
  slug: string;
};

type ApiResp<T> = { ok: boolean; data: T; message?: string };

export const onRequestGet: PagesFunction = async (ctx) => {
  const DB = (ctx.env as any).DB as D1Database;
  const slug = ctx.params?.slug as string;

  // 資料表保險建立
  await DB.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price REAL,
      image TEXT,
      slug TEXT UNIQUE NOT NULL
    );
  `);

  // 簡單種子（避免重複）
  await DB.prepare(`
    INSERT OR IGNORE INTO products (name, price, image, slug)
    VALUES ('Tote Bag', 12.5, NULL, 'tote-bag'),
           ('Gift Box', 25.0, NULL, 'gift-box')
  `).run();

  const row = await DB.prepare(
    `SELECT id, name, price, image, slug FROM products WHERE slug = ? LIMIT 1`
  ).bind(slug).first<Product>();

  const body: ApiResp<Product | null> = { ok: true, data: row ?? null };
  return Response.json(body, { headers: { 'cache-control': 'no-store' } });
};
