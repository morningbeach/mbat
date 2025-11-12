export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const base = process.env.NEXT_PUBLIC_API_BASE ?? ''
  const res = await fetch(`${base}/api${path}`, { ...init, cache: 'no-store' })
  if (!res.ok) throw new Error(await res.text())
  return res.json() as Promise<T>
}
