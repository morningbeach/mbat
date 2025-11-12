// app/p/[slug]/page.tsx
export const runtime = 'edge';

import { notFound } from 'next/navigation';

type Product = {
  id: number;
  name: string;
  price: number | null;
  image: string | null;
  slug: string;
};

type ApiResp<T> = { ok?: boolean; data?: T; message?: string };

async function getProduct(slug: string): Promise<Product | null> {
  // 用相對路徑最穩（同域 Cloudflare Pages Functions）
  const res = await fetch(`/api/products/${encodeURIComponent(slug)}`, {
    cache: 'no-store',
  });
  if (!res.ok) return null;
  const json = (await res.json()) as ApiResp<Product | null>;
  return json.data ?? null;
}

// Next.js 15：params 會是 Promise，要 await
export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) notFound();

  return (
    <main className="container mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-2">{product.name}</h1>
      {product.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={product.image}
          alt={product.name}
          className="w-64 h-64 object-cover rounded-lg"
        />
      ) : (
        <div className="w-64 h-64 bg-gray-200 rounded-lg grid place-items-center">
          No image
        </div>
      )}
      <p className="mt-3 text-lg">
        {product.price != null ? `$${product.price}` : '—'}
      </p>
    </main>
  );
}
