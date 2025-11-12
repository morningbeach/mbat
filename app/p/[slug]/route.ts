export const runtime = 'edge';
import { env } from 'cloudflare:env';

type Params = Promise<{ slug: string }>;
type Row = { id: number; slug: string; name: string; price: number | null };

export async function GET(_req: Request, { params }: { params: Params }) {
  const { slug } = await params;
  const db = env.DB as D1Database;

  const row = await db.prepare(
    `SELECT id, slug, name, price FROM products WHERE slug = ?`
  ).bind(slug).first<Row>();

  if (!row) return Response.json({ ok: false, error: 'NOT_FOUND' }, { status: 404 });
  return Response.json({ ok: true, data: row });
}
