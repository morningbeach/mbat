// functions/api/products.ts
import { Hono } from 'hono'
import { handle } from 'hono/cloudflare-pages'

type Bindings = {
  DB: D1Database
}

type Product = {
  id: number
  name: string
  price?: number | null
  image?: string | null
  slug?: string | null
}

type JsonOk<T> = { ok: true; data: T }
type JsonErr = { ok: false; error: unknown }

const app = new Hono<{ Bindings: Bindings }>()

// 這支 function 被掛在 /api/products 路徑上
// 因此這裡用 "/" 就能對應到 /api/products 本身
app.get('/', async (c) => {
  try {
    const { DB } = c.env
    const { results } = await DB.prepare<Product>(
      `SELECT id, name, price, image, slug
       FROM products
       ORDER BY id DESC
       LIMIT 200`
    ).all()

    return c.json<JsonOk<Product[]>>({ ok: true, data: results ?? [] })
  } catch (e) {
    return c.json<JsonErr>({ ok: false, error: String(e) }, 500)
  }
})

// 例如 /api/products/123
app.get('/:id', async (c) => {
  try {
    const id = Number(c.req.param('id'))
    if (!Number.isFinite(id)) {
      return c.json<JsonErr>({ ok: false, error: 'Invalid id' }, 400)
    }
    const { DB } = c.env
    const row = await DB.prepare<Product>(
      `SELECT id, name, price, image, slug
       FROM products
       WHERE id = ?`
    ).bind(id).first()

    if (!row) {
      return c.json<JsonErr>({ ok: false, error: 'Not found' }, 404)
    }
    return c.json<JsonOk<Product>>({ ok: true, data: row })
  } catch (e) {
    return c.json<JsonErr>({ ok: false, error: String(e) }, 500)
  }
})

// ✅ 核心：用 Hono 的 Cloudflare Pages adapter，自動處理 EventContext / ExecutionContext 差異
export const onRequest: PagesFunction<Bindings> = handle(app)
