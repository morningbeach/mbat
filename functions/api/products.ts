// functions/api/products.ts
import type { CatalogProduct } from '../../lib/server/catalog'
import { listCatalogProducts } from '../../lib/server/catalog'

export interface Product {
  id: string
  name: string
  price: number | null
  image: string | null
  slug: string
  short_desc: string | null
}

type Bindings = {
  DB?: D1Database
  ASSETS?: R2Bucket
}

const FALLBACK: Product[] = [
  {
    id: 'fallback-tote',
    name: 'Tote Bag',
    price: 12.5,
    image: null,
    slug: 'tote-bag',
    short_desc: '開發環境範例商品（未連線到 D1）。',
  },
  {
    id: 'fallback-gift-box',
    name: 'Gift Box',
    price: 25,
    image: null,
    slug: 'gift-box',
    short_desc: '開發環境範例商品（未連線到 D1）。',
  },
]

export const onRequestGet: PagesFunction<Bindings> = async ({ env }) => {
  try {
    const DB = env.DB
    const ASSETS = env.ASSETS

    if (!DB) {
      return Response.json({ ok: true, source: 'fallback', data: FALLBACK })
    }

    const rows = await listCatalogProducts({ DB, ASSETS })

    const data: Product[] = rows.map((item: CatalogProduct) => ({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      slug: item.slug,
      short_desc: item.short_desc,
    }))

    return Response.json({ ok: true, source: 'd1', data })
  } catch (err: any) {
    return new Response(
      JSON.stringify({ ok: false, error: String(err?.message ?? err) }),
      { status: 500, headers: { 'content-type': 'application/json' } }
    )
  }
}
