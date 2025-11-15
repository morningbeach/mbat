// functions/api/rfq.ts
import type { ExecutionContext } from '@cloudflare/workers-types'
import { Hono } from 'hono'
import { z } from 'zod'
import { recordRfq } from '../../lib/server/catalog'

type Bindings = {
  DB?: D1Database
  ASSETS?: R2Bucket
}

const rfqSchema = z.object({
  name: z.string().min(1, 'name is required'),
  email: z.string().email('invalid email'),
  message: z.string().min(1, 'message is required'),
})

const app = new Hono<{ Bindings: Bindings }>()

app.post('/', async (c) => {
  const body = await c.req.json().catch(() => null)
  const parsed = rfqSchema.safeParse(body)

  if (!parsed.success) {
    return c.json({ ok: false, error: parsed.error.flatten() }, 400)
  }

  if (!c.env.DB) {
    return c.json({ ok: false, error: 'D1 binding missing' }, 500)
  }

  const rfqId = await recordRfq({ DB: c.env.DB, ASSETS: c.env.ASSETS }, parsed.data)
  return c.json({ ok: true, rfq_id: rfqId }, 201)
})

export const onRequest: PagesFunction<Bindings> = async (ctx) => {
  return app.fetch(ctx.request, ctx.env, ctx as unknown as ExecutionContext)
}
