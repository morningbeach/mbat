'use client'

import { useState } from 'react'

export default function RFQPage() {
  const [submitting, setSubmitting] = useState(false)
  const [ok, setOk] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true); setOk(null); setErr(null)

    const form = new FormData(e.currentTarget)
    const payload = {
      company: {
        name: form.get('company') as string,
        contact_name: form.get('name') as string,
        contact_email: form.get('email') as string,
        contact_phone: form.get('phone') as string || undefined,
      },
      items: [{
        product_id: form.get('product_id') as string,
        variant_id: (form.get('variant_id') as string) || undefined,
        quantity: Number(form.get('quantity') || 0),
        expected_ship_date: (form.get('ship') as string) || undefined,
        notes: (form.get('notes') as string) || undefined
      }],
      note: (form.get('note') as string) || undefined
    }

    try {
      const res = await fetch('/api/rfq', { method: 'POST', body: JSON.stringify(payload) })
      const j = await res.json()
      if (!res.ok || !j.ok) throw new Error(j.error ? JSON.stringify(j.error) : '提交失敗')
      setOk(`已送出！RFQ ID: ${j.rfq_id}`)
      e.currentTarget.reset()
    } catch (e: any) {
      setErr(String(e.message || e))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section>
      <h1>詢價</h1>
      <form onSubmit={onSubmit} style={{ maxWidth: 520, display: 'grid', gap: 10 }}>
        <label>公司 / 品牌<input required name="company" /></label>
        <label>聯絡人<input required name="name" /></label>
        <label>Email<input required type="email" name="email" /></label>
        <label>電話<input name="phone" /></label>
        <hr />
        <label>產品ID<input required name="product_id" placeholder="seed 裡預設會有一個產品" /></label>
        <label>變體ID（選填）<input name="variant_id" /></label>
        <label>數量<input required name="quantity" type="number" min="1" /></label>
        <label>期望出貨日<input name="ship" type="date" /></label>
        <label>備註<textarea name="notes" /></label>
        <button disabled={submitting} type="submit">{submitting ? '送出中…' : '送出詢價'}</button>
        {ok && <p style={{ color: 'green' }}>{ok}</p>}
        {err && <p style={{ color: 'red' }}>{err}</p>}
      </form>
    </section>
  )
}
