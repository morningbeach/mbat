type Variant = {
  id: string
  sku?: string
  size_l?: number
  size_w?: number
  size_h?: number
  base_material?: string
  min_order_qty?: number
  lead_time_days?: number
}

async function getData(slug: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE ?? ''}/api/products/${slug}`, { cache: 'no-store' })
  if (!res.ok) return null
  return res.json()
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const data = await getData(params.slug)
  if (!data?.product) return <p>找不到產品。</p>

  const p = data.product
  const variants: Variant[] = data.variants ?? []

  return (
    <section>
      <h1>{p.name}</h1>
      <p>{p.long_desc ?? p.short_desc ?? ''}</p>
      <h3>規格選項</h3>
      {variants.length === 0 ? <p>尚無規格。</p> : (
        <ul>
          {variants.map(v => (
            <li key={v.id}>
              <strong>{v.sku ?? '無SKU'}</strong> — {v.size_l}×{v.size_w}×{v.size_h} cm · {v.base_material} · MOQ {v.min_order_qty} · 交期 {v.lead_time_days} 天
            </li>
          ))}
        </ul>
      )}
      <p style={{ marginTop: 12 }}><a href="/rfq">我要詢價</a></p>
    </section>
  )
}
