// app/catalog/page.tsx
export const dynamic = 'force-dynamic'
export const runtime = 'edge'

type Product = {
  id: string
  name: string
  price: number | null
  image: string | null
  slug: string
  short_desc: string | null
}

async function fetchProducts(): Promise<Product[]> {
  const res = await fetch('/api/products', {
    cache: 'no-store',
    // @ts-ignore
    next: { revalidate: 0 },
  }).catch(() => null)

  if (!res || !res.ok) return []

  let json: any = {}
  try {
    json = await res.json()
  } catch {
    return []
  }

  const data = json?.data
  return Array.isArray(data) ? (data as Product[]) : []
}

export default async function CatalogPage() {
  const list = await fetchProducts()

  return (
    <main className="container mx-auto p-6">
      <h1 className="text-xl font-bold mb-4">Catalog</h1>

      {list.length === 0 ? (
        <div className="rounded-lg border p-6">
          <p className="opacity-70">目前沒有商品或 API 尚未回傳資料。</p>
          <p className="opacity-70">
            可稍後重試，或前往 <a href="/admin" className="underline">Admin</a> 新增。
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {list.map((p) => (
            <li key={p.id} className="flex items-center gap-3">
              {p.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.image}
                  alt={p.name}
                  width={64}
                  height={64}
                  className="w-16 h-16 object-cover rounded-lg border"
                />
              ) : (
                <div className="w-16 h-16 grid place-items-center rounded-lg border text-xs opacity-70">
                  無圖
                </div>
              )}

              <div className="flex-1">
                <a href={`/p/${p.slug}`} className="font-medium underline">
                  {p.name}
                </a>
                <div className="text-sm opacity-70">
                  {p.price == null ? 'Price: N/A' : `Price: ${p.price}`}
                </div>
                {p.short_desc && <div className="text-xs opacity-60">{p.short_desc}</div>}
                <div className="text-xs opacity-60">slug: {p.slug}</div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
