// functions/api/rfq.ts
import { Hono } from 'hono';

type Bindings = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

app.post('/', async (c) => {
  try {
    const body = await c.req.json<{ name?: string; email?: string; message?: string }>();
    const { name = '', email = '', message = '' } = body ?? {};

    // 範例：寫入 D1
    await c.env.DB.prepare(
      `INSERT INTO rfq(name, email, message, created_at) VALUES (?1, ?2, ?3, datetime('now'))`
    ).bind(name, email, message).run();

    // 假裝拿到一個 ID
    const rfq_id = crypto.randomUUID();
    return c.json({ ok: true, rfq_id });
  } catch (err) {
    return c.json({ ok: false, error: String(err) }, 500);
  }
});

// ✅ Cloudflare Pages Function 入口：把 ctx 直接當 ExecutionContext 傳入
export const onRequest: PagesFunction<Bindings> = async (ctx) => {
  return app.fetch(ctx.request, ctx.env, ctx);
};
