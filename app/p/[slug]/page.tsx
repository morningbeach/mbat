// app/p/[slug]/page.tsx
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

type Product = {
  id: number;
  name: string;
  price: number | null;
  image: string | null;
  slug: string;
};

async function fetchProducts(): Promise<Product[]> {
  const res = await fetch('/api/products', {
    cache: 'no-store',
    // @ts-ignore
    next: { revalidate: 0 },
  }).catch(() => null);

  if (!res || !res.ok) return [];
  let json: any = {};
  try {
    json = await res.json();
  } catch {
    return [];
  }
  const data = json?.data;
  return Array.isArray(data) ? (data as Product[]) : [];
}

export default async function ProductPage({
  // ✅ Next.js 15：params 是 Promise，需要 await
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const list = await fetchProducts();
  const product = list.find((p) => p.slug === slug);

  if (!product) {
    // 找不到就回 404
    notFound();
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
      </div>
    </main>
  );
}
