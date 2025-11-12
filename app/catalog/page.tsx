export const runtime = 'edge';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function CatalogPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const q = (sp.q as string | undefined) ?? '';

  return (
    <main className="container mx-auto p-6">
      <h1 className="text-xl font-bold">Catalog</h1>
      <p className="mt-2 text-sm text-gray-600">query: <b>{q || '（空）'}</b></p>
      <p className="mt-4">資料請打 <code>/api/catalog</code> 驗證 D1 連線。</p>
    </main>
  );
}
