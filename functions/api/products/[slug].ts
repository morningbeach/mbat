// functions/api/products/[slug].ts
import { getCatalogProduct } from '../../../lib/server/catalog'

type Bindings = {
  DB?: D1Database
  ASSETS?: R2Bucket
}

type ApiResp<T> = { ok: boolean; data: T; message?: string }

type Product = {
  id: string
  name: string
  price: number | null
  image: string | null
  slug: string
  short_desc: string | null
}

export const onRequestGet: PagesFunction<Bindings> = async (ctx) => {
  const DB = ctx.env.DB
  const ASSETS = ctx.env.ASSETS
  const slug = ctx.params?.slug as string

  if (!DB) {
    return new Response('D1 binding missing', { status: 500 })
  }

  const product = await getCatalogProduct({ DB, ASSETS }, slug)

  const body: ApiResp<Product | null> = {
    ok: true,
    data: product ?? null,
  }

  return Response.json(body, { headers: { 'cache-control': 'no-store' } })
}
