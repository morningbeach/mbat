'use client'

import { useEffect, useState } from 'react'

type Product = {
  id: string
  name: string
  slug: string
  short_desc?: string
  hero_image?: string
  category?: string
}

export default function Catalog() {
  const [data, setData] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/products')
      .then(r => r.json())
      .then(j => setData(j.data || []))
      .catch(e => setErr(String(e)))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p>載入中…</p>
  if (err) return <p>錯誤：{err}</p>

  return (
    <section>
      <h1>產品目錄</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
        {data.map(p => (
          <a key={p.id} href={`/p/${p.slug}`} style={{ border: '1px solid #eee', padding: 12, borderRadius: 8, textDecoration: 'none' }}>
            <div style={{ aspectRatio: '4/3', background: '#f8f8f8', marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span>{p.hero_image ? '圖' : 'No Image'}</span>
            </div>
            <strong>{p.name}</strong>
            <div style={{ color: '#777' }}>{p.short_desc || ''}</div>
            <div style={{ fontSize: 12, color: '#999', marginTop: 6 }}>{p.category || ''}</div>
          </a>
        ))}
      </div>
    </section>
  )
}
