// app/p/[slug]/page.tsx
import { notFound } from 'next/navigation'

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

async function fetchProduct(slug: string): Promise<Product | null> {
  const res = await fetch(`/api/products/${slug}`, {
    cache: 'no-store',
    // @ts-ignore
    next: { revalidate: 0 },
  }).catch(() => null)

  if (!res || !res.ok) return null

  let json: any = {}
  try {
    json = await res.json()
  } catch {
    return null
  }

  const data = json?.data
  if (!data || typeof data !== 'object') return null
  return data as Product
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const product = await fetchProduct(slug)

  if (!product) {
    notFound()
  }

  return (
    <main className="container mx-auto p-6">
      <a href="/catalog" className="text-sm underline opacity-70">
        ← Back to Catalog
      </a>

      <h1 className="text-2xl font-semibold mb-3">{product.name}</h1>

      {product.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={product.image}
          alt={product.name}
          width={256}
          height={256}
          className="w-64 h-64 object-cover rounded-lg border mb-4"
        />
      ) : (
        <div className="w-64 h-64 grid place-items-center rounded-lg border mb-4 opacity-70">
          無圖
        </div>
      )}

      <div className="space-y-1">
        <div className="text-sm opacity-70">ID: {product.id}</div>
        <div className="text-sm opacity-70">Slug: {product.slug}</div>
        <div className="text-base">
          {product.price == null ? 'Price: N/A' : `Price: ${product.price}`}
        </div>
        {product.short_desc && (
          <div className="text-sm opacity-70">{product.short_desc}</div>
        )}
      </div>
    </main>
  )
}
