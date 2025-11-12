export default async function CatalogPage() {
  const res = await fetch('/api/products', { cache: 'no-store' });
  let json: any = {};
  try { json = await res.json(); } catch {}
  const list = Array.isArray(json?.data) ? json.data : [];

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
      {!list.length && (
        <p className="text-sm opacity-70 mt-3">
          沒拿到資料（可能 D1 尚未綁定），目前已啟用 fallback，請先檢查 Settings。
        </p>
      )}
    </main>
  );
}
