// app/p/[slug]/page.tsx
import { notFound } from "next/navigation";

// 路由參數型別（依你目前專案推斷：params 為 Promise）
type Params = { slug: string };

// 取得商品資料（你之後可改成直接查 D1）
async function getProduct(slug: string) {
  // 相對路徑即可，於伺服端會自動對應目前 domain
  const res = await fetch(`/api/products/${encodeURIComponent(slug)}`, {
    // 可調整快取策略；先設 5 分鐘 revalidate
    next: { revalidate: 300 },
  });

  if (!res.ok) return null;

  // 依你的 API 回傳格式調整
  return (await res.json()) as {
    id: string;
    slug: string;
    name: string;
    description?: string;
    images?: string[];
    priceTWD?: number;
    attrs?: Record<string, string | number>;
  };
}

// 動態產生 <title>/<meta>，以 slug/product name 命名
export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);

  const title = product?.name
    ? `${product.name}｜Dawn Bags`
    : `商品 ${slug}｜Dawn Bags`;

  const description =
    product?.description ??
    "高質感包裝禮盒與禮品服務，支援客製、少量打樣與大量量產。";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: product?.images?.length ? product.images : undefined,
      type: "product",
    },
  };
}

// 若你不想被預先靜態化，強制動態（避免沒有 slug 清單時的建置失敗）
export const dynamic = "force-dynamic";

export default async function ProductPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  return (
    <main
      style={{
        maxWidth: 1120,
        margin: "0 auto",
        padding: "48px 20px",
      }}
    >
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "1.2fr 1fr",
          gap: 32,
          alignItems: "start",
        }}
      >
        {/* 圖片區 */}
        <div>
          <div
            style={{
              width: "100%",
              aspectRatio: "1 / 1",
              borderRadius: 16,
              overflow: "hidden",
              boxShadow: "0 8px 30px rgba(0,0,0,.08)",
              background:
                "linear-gradient(135deg, #f7f7f9 0%, #ffffff 50%, #f2f4f8 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* 主圖 */}
            {product.images?.[0] ? (
              // 先用 <img>；Cloudflare Pages 上已在 next.config.mjs 設 images.unoptimized
              <img
                src={product.images[0]}
                alt={product.name}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            ) : (
              <div style={{ color: "#9aa0a6" }}>No Image</div>
            )}
          </div>

          {/* 縮圖列（預留未來做相簿效果用） */}
          {product.images && product.images.length > 1 && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(5, 1fr)",
                gap: 10,
                marginTop: 12,
              }}
            >
              {product.images.slice(0, 5).map((src, i) => (
                <div
                  key={i}
                  style={{
                    borderRadius: 10,
                    overflow: "hidden",
                    border: "1px solid #eee",
                    height: 72,
                  }}
                >
                  <img
                    src={src}
                    alt={`${product.name} #${i + 1}`}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 文字資訊區 */}
        <div>
          <h1
            style={{
              fontSize: 32,
              lineHeight: 1.2,
              margin: "0 0 12px",
              letterSpacing: 0.2,
            }}
          >
            {product.name}
          </h1>

          {product.priceTWD != null && (
            <div
              style={{
                fontSize: 18,
                color: "#111827",
                marginBottom: 16,
                fontWeight: 600,
              }}
            >
              NT$ {product.priceTWD.toLocaleString()}
            </div>
          )}

          <p style={{ color: "#4b5563", marginBottom: 20 }}>
            {product.description ?? "—"}
          </p>

          {/* 屬性列 */}
          {product.attrs && Object.keys(product.attrs).length > 0 && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
                marginTop: 16,
                marginBottom: 24,
              }}
            >
              {Object.entries(product.attrs).map(([k, v]) => (
                <div
                  key={k}
                  style={{
                    border: "1px solid #eef2f7",
                    borderRadius: 12,
                    padding: "10px 12px",
                    background: "#fff",
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      color: "#6b7280",
                      marginBottom: 4,
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                    }}
                  >
                    {k}
                  </div>
                  <div style={{ fontSize: 14, color: "#111827" }}>{String(v)}</div>
                </div>
              ))}
            </div>
          )}

          {/* CTA（未來可串詢價/加到禮品組） */}
          <div style={{ display: "flex", gap: 12 }}>
            <a
              href={`/contact?ref=${encodeURIComponent(product.slug)}`}
              style={{
                padding: "12px 16px",
                borderRadius: 12,
                border: "1px solid #111827",
                color: "#111827",
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              取得報價 / 洽談
            </a>
            <a
              href={`/sets/build?add=${encodeURIComponent(product.slug)}`}
              style={{
                padding: "12px 16px",
                borderRadius: 12,
                background:
                  "linear-gradient(135deg, rgba(17,24,39,1) 0%, rgba(55,65,81,1) 100%)",
                color: "#fff",
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              加入禮品組
            </a>
          </div>
        </div>
      </section>

      {/* 你可在此補「更多圖片」「規格表」「相關產品」等區塊 */}
    </main>
  );
}
