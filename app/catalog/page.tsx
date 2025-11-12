'use client';

import { useEffect, useState } from 'react';
import { z } from 'zod';

const ProductSchema = z.object({
  id: z.union([z.number(), z.string()]),
  name: z.string(),
  price: z.number().optional(),
  image: z.string().optional(),
});
const ApiRespSchema = z.object({
  data: z.array(ProductSchema).default([]),
});
type Product = z.infer<typeof ProductSchema>;

export default function CatalogPage() {
  const [data, setData] = useState<Product[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch('/api/products', { cache: 'no-store' });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const json = await r.json();
        const parsed = ApiRespSchema.parse(json);
        setData(parsed.data);
      } catch (e) {
        setErr(String(e));
        setData([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="p-6">Loading…</div>;
  if (err) return <div className="p-6 text-red-600">Error: {err}</div>;
  if (!data.length) return <div className="p-6 text-gray-500">目前沒有商品。</div>;

  return (
    <main className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {data.map((p) => (
        <article key={String(p.id)} className="rounded-2xl border p-4 shadow-sm">
          {p.image ? (
            <img
              src={p.image}
              alt={p.name}
              className="w-full h-48 object-cover rounded-xl mb-3"
            />
          ) : null}

          <h2 className="font-semibold text-lg">{p.name}</h2>
          {'price' in p && typeof p.price === 'number' ? (
            <p className="text-sm text-gray-600 mt-1">${p.price.toFixed(2)}</p>
          ) : (
            <p className="text-sm text-gray-400 mt-1">Price on request</p>
          )}
        </article>
      ))}
    </main>
  );
}
