export const metadata = {
  title: 'MB Pack — Packaging & Gift Boxes',
  description: 'B2B packaging & gift-box trading website powered by Cloudflare Pages + D1.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-Hant">
      <body style={{ fontFamily: 'system-ui, sans-serif', margin: 0 }}>
        <header style={{ padding: '16px 20px', borderBottom: '1px solid #eee' }}>
          <a href="/" style={{ textDecoration: 'none', fontWeight: 700 }}>MB Pack</a>
          <nav style={{ display: 'inline-block', marginLeft: 12 }}>
            <a href="/catalog" style={{ marginRight: 12 }}>產品</a>
            <a href="/rfq" style={{ marginRight: 12 }}>詢價</a>
            <a href="/materials" style={{ marginRight: 12 }}>材質</a>
            <a href="/admin" style={{ marginRight: 12 }}>後台</a>
          </nav>
        </header>
        <main style={{ padding: '20px' }}>{children}</main>
        <footer style={{ padding: '20px', borderTop: '1px solid #eee' }}>
          © {new Date().getFullYear()} MB Pack
        </footer>
      </body>
    </html>
  )
}
