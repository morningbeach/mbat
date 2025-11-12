// functions/api/products.ts
export interface Product {
  id: number;
  name: string;
  price: number | null;
  image: string | null;
  slug: string;
}

export const onRequestGet: PagesFunction = async ({ env }) => {
  const DB = (env as any).DB as D1Database;

  await DB.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price REAL,
      image TEXT,
      slug TEXT UNIQUE NOT NULL
    );
  `);

  // 範例種子資料（避免重覆）
  await DB.prepare(`
    INSERT OR IGNORE INTO products (name, price, image, slug)
    VALUES ('Tote Bag', 12.5, NULL, 'tote-bag'),
           ('Gift Box', 25.0, NULL, 'gift-box')
  `).run();

  const { results } = await DB.prepare(`
    SELECT id, name, price, image, slug
    FROM products
    ORDER BY id DESC
  `).all<Product>();

  return Response.json({ ok: true, data: results });
};
