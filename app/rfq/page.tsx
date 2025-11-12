'use client';

import { useState } from 'react';

// 你後端 /api/rfq 應回這種型別
type RfqResponse =
  | { ok: true; rfq_id: string }
  | { ok: false; error?: unknown };

export default function RfqPage() {
  const [okMsg, setOk] = useState<string | null>(null);
  const [errMsg, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setOk(null);
    setErr(null);
    setLoading(true);

    try {
      const form = new FormData(e.currentTarget);
      const payload = {
        name: String(form.get('name') ?? ''),
        email: String(form.get('email') ?? ''),
        message: String(form.get('message') ?? ''),
      };

      const res = await fetch('/api/rfq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      // 明確告訴 TS 我們期望的 JSON 型別
      const j: RfqResponse = await res.json();

      if (!res.ok || !j || j.ok !== true) {
        const msg =
          j && 'error' in j && j.error
            ? JSON.stringify(j.error)
            : `HTTP ${res.status}`;
        throw new Error(msg);
      }

      setOk(`已送出！RFQ ID: ${j.rfq_id}`);
      e.currentTarget.reset();
    } catch (err) {
      setErr(String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">索取報價（RFQ）</h1>

      {okMsg && <div className="rounded-lg bg-green-50 text-green-700 p-3">{okMsg}</div>}
      {errMsg && <div className="rounded-lg bg-red-50 text-red-700 p-3">錯誤：{errMsg}</div>}

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">名字</label>
          <input
            name="name"
            required
            className="w-full rounded-lg border px-3 py-2"
            placeholder="Your name"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Email</label>
          <input
            type="email"
            name="email"
            required
            className="w-full rounded-lg border px-3 py-2"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">需求內容</label>
          <textarea
            name="message"
            rows={5}
            className="w-full rounded-lg border px-3 py-2"
            placeholder="請描述您要的尺寸、材質、數量、交期…"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="rounded-xl px-4 py-2 border shadow-sm disabled:opacity-60"
        >
          {loading ? '送出中…' : '送出'}
        </button>
      </form>
    </main>
  );
}
