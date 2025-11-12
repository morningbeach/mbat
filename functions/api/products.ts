// functions/api/products.ts
import { Hono } from 'hono'

type Bindings = { DB: D1Database }

const app = new Hono<{ Bindings: Bindings }>()

app.get('/', async (c) => {
  // 範例：讀全部商品
  const { results } = await c.env.DB.prepare(
    `SELECT id, slug, name, description, priceTWD
     FROM products ORDER BY created_at DESC LIMIT 50`
  ).all()
  return c.json(results)
})

app.get('/:slug', async (c) => {
  const slug = c.req.param('slug')
  const row = await c.env.DB.prepare(
    `SELECT id, slug, name, description, priceTWD, images_json
     FROM products WHERE slug = ? LIMIT 1`
  ).bind(slug).first()
  if (!row) return c.notFound()
  // 若有 images_json 欄位：
  if ((row as any).images_json) {
    ;(row as any).images = JSON.parse((row as any).images_json as string)
    delete (row as any).images_json
  }
  return c.json(row)
})

export default app
