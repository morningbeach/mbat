'use client';

import { useEffect, useState } from 'react';
import { z } from 'zod';

// ---- 型別定義（用 Zod 解析 API 回傳）----
const ProductSchema = z.object({
  id: z.union([z.number(), z.string()]),
  name: z.string(),
  price: z.number().optional(),
  image: z.string().optional(),
  // 你還有其他欄位可以自行加：description、sku、category...
});
const ApiRespSchema = z.object({
  data: z.array(ProductSchema).default([]),
});

type Product = z.infer<typeof ProductSchema>;

// ---- 元件 ----
export default function CatalogPage() {
  const [data, setData] = useState<Product[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch('/api/products', { cache: 'no-store' });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        // 這裡把 unknown 轉成有型別的物件
        const json = await r.json();
        const parsed = ApiRespSchema.parse(json);
        setData(parsed.data);
      } catch (e) {
        setErr(String(e));
        setData([]); // 保底
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="p-6">Loading…</div>;
  if (err) return <div className="p-6 text-red-600">Error: {err}</div>;

  if (!data.length) {
    return <div className="p-6 text-gray-500">目前沒有商品。</div>;
  }

  return (
    <main className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {data.map((p) => (
        <article key={String(p.id)} className="rounded-2xl border p-4 shadow-sm">
          {p.image ? (
            // 你已把 images.unoptimized 設 true，可用 <img>
            <
