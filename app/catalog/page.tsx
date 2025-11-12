// 確保是 Server Component（預設）
export default async function CatalogPage() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/api/products`, {
    // Cloudflare Pages 同域可直接 '/api/products'
    // 若 SSR 與 Edge 皆需運作，保險作法用相對：'/api/products'
    cache: 'no-store',
  });
  const json = await res.json();
  const list = json?.data ?? [];
  return (
    <main className="container">
      <h1 className="text-xl font-bold mb-4">Catalog</h1>
      <ul className="space-y-2">
        {list.map((p: any) => (
          <li key={p.id}>
            <a href={`/p/${p.slug}`} className="underline">{p.name}</a>
          </li>
        ))}
      </ul>
    </main>
  );
}
