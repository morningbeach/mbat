// app/p/[slug]/page.tsx
export const runtime = 'edge';
export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;

  // 伺服端 component 直接用相對路徑呼叫 API（由 Cloudflare Pages 轉發）
  const res = await fetch(`/api/p/${slug}`, {
    // 產品頁通常要即時：避免被預先快取
    cache: 'no-store',
  });

  if (!res.ok) {
    return (
      <main className="container mx-auto p-6">
        <h1 className="text-xl font-bold">Product not found</h1>
      </main>
    );
  }

  const product = await res.json();

  return (
    <main className="container mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-2">{product.name}</h1>
      {product.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={product.image} alt={product.name} className="w-64 h-64 object-cover rounded-lg" />
      ) : (
        <div className="w-64 h-64 grid place-items-center rounded-lg border">No Image</div>
      )}
      <p className="mt-4 text-lg">Price: {product.price ?? 'N/A'}</p>
      <p className="text-gray-500 mt-1">slug: {slug}</p>
    </main>
  );
}
