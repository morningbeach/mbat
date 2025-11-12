// functions/api/products.ts
export interface Product {
  id: number;
  name: string;
  price: number | null;
  image: string | null;
  slug: string;
}

export const onRequestGet: PagesFunction = async ({ env }) => {
  try {
    const DB = (env as any).DB as D1Database;

    // 建表
    await DB.exec(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        price REAL,
        image TEXT,
        slug TEXT UNIQUE NOT NULL
      );
    `);

    // 種子資料（避免重覆）
    await DB.prepare(`
      INSERT OR IGNORE INTO products (name, price, image, slug)
      VALUES ('Tote Bag', 12.5, NULL, 'tote-bag'),
             ('Gift Box', 25.0, NULL, 'gift-box')
    `).run();

    // 這裡重點：泛型放在 .all<Product>()
    const { results } = await DB.prepare(`
      SELECT id, name, price, image, slug
      FROM products
      ORDER BY id DESC
    `).all<Product>();

    return new Response(JSON.stringify({ ok: true, data: results }), {
      headers: { 'content-type': 'application/json; charset=utf-8' },
      status: 200,
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ ok: false, error: String(err?.message ?? err) }), {
      headers: { 'content-type': 'application/json; charset=utf-8' },
      status: 500,
    });
  }
};
