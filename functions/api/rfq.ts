import { Hono } from 'hono'
import { z } from 'zod'

type Bindings = { DB: D1Database }

const rfqSchema = z.object({
  company: z.object({
    name: z.string().min(1),
    contact_name: z.string().min(1),
    contact_email: z.string().email(),
    contact_phone: z.string().optional()
  }),
  items: z.array(z.object({
    product_id: z.string(),
    variant_id: z.string().optional(),
    quantity: z.number().int().min(1),
    expected_ship_date: z.string().optional(),
    notes: z.string().optional()
  })).min(1),
  note: z.string().optional()
})

export const onRequest: PagesFunction<Bindings> = async (ctx) => {
  const app = new Hono<{ Bindings: Bindings }>()

  app.post('/', async (c) => {
    const body = await c.req.json()
    const parsed = rfqSchema.safeParse(body)
    if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400)

    const db = c.env.DB
    const rfqId = crypto.randomUUID()
    const companyId = crypto.randomUUID()

    await db.batch([
      db.prepare(`INSERT INTO companies (id,name,contact_name,contact_email,contact_phone) VALUES (?,?,?,?,?)`)
        .bind(companyId, body.company.name, body.company.contact_name, body.company.contact_email, body.company.contact_phone || null),
      db.prepare(`INSERT INTO rfqs (id, company_id, source, note) VALUES (?,?,?,?)`)
        .bind(rfqId, companyId, 'web', body.note || null)
    ])

    for (const it of body.items) {
      await db.prepare(
        `INSERT INTO rfq_items (id, rfq_id, product_id, variant_id, quantity, expected_ship_date, notes)
         VALUES (?,?,?,?,?,?,?)`
      ).bind(
        crypto.randomUUID(),
        rfqId,
        it.product_id,
        it.variant_id || null,
        it.quantity,
        it.expected_ship_date || null,
        it.notes || null
      ).run()
    }

    return c.json({ ok: true, rfq_id: rfqId })
  })

  return app.fetch(ctx.request, ctx.env, ctx.executionCtx)
}
