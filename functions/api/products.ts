// functions/api/products.ts
export interface Product {
  id: number;
  name: string;
  price: number | null;
  image: string | null;
  slug: string;
}

type Bindings = { DB?: D1Database };

export const onRequestGet: PagesFunction<Bindings> = async ({ env }) => {
  try {
    const DB = (env as Bindings).DB;

    // 沒綁 D1：直接回內建資料，避免 500
    if (!DB) {
      const fallback: Product[] = [
        { id: 1, name: 'Tote Bag', price: 12.5, image: null, slug: 'tote-bag' },
        { id: 2, name: 'Gift Box', price: 25.0, image: null, slug: 'gift-box' },
      ];
      return Response.json({ ok: true, source: 'fallback', data: fallback });
    }

    // 有 D1：正常讀 DB（含建表與種子）
    await DB.exec(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        price REAL,
        image TEXT,
        slug TEXT UNIQUE NOT NULL
      );
    `);

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

    return Response.json({ ok: true, source: 'd1', data: results ?? [] });
  } catch (err: any) {
    // 避免未處理例外導致 500
    return new Response(
      JSON.stringify({ ok: false, error: String(err?.message ?? err) }),
      { status: 200, headers: { 'content-type': 'application/json' } }
    );
  }
};
