import { Hono } from 'hono'

type Bindings = { DB: D1Database }

export const onRequest: PagesFunction<Bindings> = async (ctx) => {
  const app = new Hono<{ Bindings: Bindings }>()

  app.get('/', async (c) => {
    const { results } = await c.env.DB.prepare(
      `SELECT p.id, p.name, p.slug, p.short_desc, p.hero_image, c.name AS category
       FROM products p LEFT JOIN categories c ON p.category_id=c.id
       WHERE p.status='active' ORDER BY p.created_at DESC LIMIT 50`
    ).all()
    return c.json({ data: results })
  })

  app.get('/:slug', async (c) => {
    const slug = c.req.param('slug')
    const product = await c.env.DB.prepare(
      `SELECT * FROM products WHERE slug=?`
    ).bind(slug).first()
    if (!product) return c.json({ error: 'Not found' }, 404)

    const variants = await c.env.DB.prepare(
      `SELECT * FROM variants WHERE product_id=? AND status='active'`
    ).bind((product as any).id).all()

    return c.json({ product, variants: variants.results })
  })

  return app.fetch(ctx.request, ctx.env, ctx.executionCtx)
}
