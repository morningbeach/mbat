// app/catalog/page.tsx
export const dynamic = 'force-dynamic';
export const runtime = 'edge'; // Cloudflare Pages 友善

type Product = {
  id: number;
  name: string;
  price: number | null;
  image: string | null;
  slug: string;
};

async function fetchProducts(): Promise<Product[]> {
  // 用相對路徑，避免不同環境 BASE_URL 造成的 CORS / URL 問題
  const res = await fetch('/api/products', {
    cache: 'no-store',
    // @ts-ignore: Next 15 仍接受 next.revalidate=0
    next: { revalidate: 0 },
  });

  // API 失敗時回空陣列，避免頁面 500
  if (!res.ok) return [];

  let json: any = {};
  try {
    json = await res.json();
  } catch {
    return [];
  }

  const data = json?.data;
  return Array.isArray(data) ? (data as Product[]) : [];
}

// 預設即為 Server Component
export default async function CatalogPage() {
  const list = await fetchProducts();

  return (
    <main className="container mx-auto p-6">
      <h1 className="text-xl font-bold mb-4">Catalog</h1>

      {list.length === 0 ? (
        <div className="rounded-lg border p-6">
          <p className="opacity-70">目前尚無商品或 API 暫時沒有回資料。</p>
          <p className="opacity-70">
            請稍後重試，或前往 <a href="/admin" className="underline">Admin</a> 新增商品。
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {list.map((p) => (
            <li key={p.id} className="flex items-center gap-3">
              {/* 圖片（若無圖則顯示占位） */}
              {p.image ? (
                // eslint-disable-next-lin
