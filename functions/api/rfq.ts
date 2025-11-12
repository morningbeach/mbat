// functions/api/rfq.ts
import type { ExecutionContext } from '@cloudflare/workers-types'
import { Hono } from 'hono'

type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

// ... 你的 routes 定義 ...

export const onRequest: PagesFunction<Bindings> = async (ctx) => {
  // 將 EventContext 轉成 ExecutionContext（型別層面的轉換）
  return app.fetch(ctx.request, ctx.env, ctx as unknown as ExecutionContext)
}
