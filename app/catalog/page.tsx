// app/catalog/page.tsx
export const runtime = 'edge';

type Product = {
  id: number;
  name: string;
  price: number | null;
  image: string | null;
  slug: string;
};

type ApiResp<T> = {
  ok?: boolean;
  data?: T;
  message?: string;
};

// 用相對路徑最穩：同域 /api/products；若你真的需要外部 BASE_URL，再 fallback。
async function getProducts(): Promise<Product[]> {
  const url =
    typeof process?.env?.NEXT_PUBLIC_BASE_URL === 'string' &&
    process.env.NEXT_PUBLIC_BASE_URL.trim()
      ? `${process.env.NEXT_PUBLIC_BASE_URL.replace(/\/$/, '')}/api/products`
      : '/api/products';

  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) return [];
  const json = (await res.json()) as ApiResp<Product[]>;
  return Array.isArray(json.data) ? json.data : [];
}

// Server Component（預設）
export default async function CatalogPage() {
  const list = await getProducts();

  return (
    <main className="container">
      <h1 className="text-xl font-bold mb-4">Catalog</h1>
      <ul className="space-y-2">
        {list.map((p) => (
          <li key={p.id} className="border p-3 rounded">
            <a href={`/p/${p.slug}`} className="underline">
              {p.name}
            </a>
            <div className="text-sm opacity-70">
              {p.price != null ? `$${p.price}` : '—'}
            </div>
          </li>
        ))}
        {list.length === 0 && (
          <li className="opacity-60">No products yet.</li>
        )}
      </ul>
    </main>
  );
}
