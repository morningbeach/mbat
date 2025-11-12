// app/products/page.tsx
export const runtime = 'edge';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function ProductsPage({
  searchParams,
}: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const q = (sp.q as string | undefined) ?? '';

  // 你可以把清單 Hydrate 成前端再打 /api 取資料，這裡先顯示查詢字串確認流程正常
  return (
    <main className="container mx-auto p-6">
      <h1 className="text-xl font-bold">Products</h1>
      <p className="mt-2 text-sm text-gray-600">query: <b>{q || '（空）'}</b></p>
      <p className="mt-4">請前往 <code>/api/products</code> 驗證 D1 連線。</p>
    </main>
  );
}
