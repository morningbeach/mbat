// app/p/[slug]/page.tsx
export const dynamic = 'force-dynamic';
export const runtime = 'edge';

type Product = {
  id: number;
  name: string;
  price: number | null;
  image: string | null;
  slug: string;
};

async function getProduct(slug: string): Promise<Product | null> {
  const res = await fetch('/api/products', { cache: 'no-store' });
  let json: any = {};
  try { json = await res.json(); } catch {}
  const list: Product[] = Array.isArray(json?.data) ? json.data : [];
  return list.find(p => p.slug === slug) ?? null;
}

// 支援 Next 15：params 可能是 Promise
type ParamsObj = { slug: string };
type Props =
  | { params: ParamsObj }
  | { params: Promise<ParamsObj> };

export default async function ProductPage(props: Props) {
  const params =
    (props as any).params?.then
      ? await (props as { params: Promise<ParamsObj> }).params
      : (props as { params: ParamsObj }).params;

  const product = await getProduct(params.slug);

  if (!product) {
    return (
      <main className="container mx-auto p-6">
        <h1 className="text-xl font-semibold">商品不存在</h1>
        <p className="opacity-70 mt-2">
          請回到 <a href="/catalog" className="underline">Catalog</a>
        </p>
      </main>
    );
  }

  return (
    <main className="container mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-2">{product.name}</h1>
      {product.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={product.image} alt={product.name} className="w-64 h-64 object-cover rounded-lg" />
      ) : (
        <div className="w-64 h-64 grid place-items-center border rounded-lg">無圖</div>
      )}
      <p className="mt-3">Price: {product.price ?? 'N/A'}</p>
    </main>
  );
}
