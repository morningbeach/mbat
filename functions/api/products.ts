// functions/api/products.ts
import { Hono } from 'hono';

type Bindings = {
  DB: D1Database;
};

type Product = {
  id: string | number;
  name: string;
  price?: number | null;
  image?: string | null;
  description?: string | null;
  created_at?: string | null;
};

// 讓 D1 的 .all() 統一回傳陣列
async function d1All<T = unknown>(stmt: D1PreparedStatement): Promise<T[]> {
  const res = await stmt.all<T>();
  // 不同 Node 版本 / 打包可能有 res.results 或 res.rows
  // @ts-expect-error 兼容不同型態
  return (res?.results ?? res?.rows ?? []) as T[];
}

const app = new Hono<{ Bindings: Bindings }>();

/**
 * GET /api/products
 * 取得所有產品（可依需要調整欄位）
 */
app.get('/', async (c) => {
  try {
    const rows = await d1All<Product>(
      c.env.DB.prepare(
        `SELECT id, name, price, image, description, created_at
         FROM products
         ORDER BY created_at DESC, id DESC`
      )
    );
    return c.json({ ok: true, data: rows });
  } catch (err) {
    return c.json({ ok: false, error: String(err) }, 500);
  }
});

/**
 * GET /api/products/:id
 * 取得單一產品
 */
app.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const rows = await d1All<Product>(
      c.env.DB.prepare(
        `SELECT id, name, price, image, description, created_at
         FROM products
         WHERE id = ?1
         LIMIT 1`
      ).bind(id)
    );
    if (!rows.length) return c.json({ ok: false, error: 'NOT_FOUND' }, 404);
    return c.json({ ok: true, data: rows[0] });
  } catch (err) {
    return c.json({ ok: false, error: String(err) }, 500);
  }
});

// ✅ Cloudflare Pages Functions 入口：把 ctx 直接當作 ExecutionContext 傳入
export const onRequest: PagesFunction<Bindings> = async (ctx) => {
  return app.fetch(ctx.request, ctx.env, ctx);
};
