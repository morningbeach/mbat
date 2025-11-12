/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  trailingSlash: false,

  // Cloudflare Pages 上建議先關掉影像最佳化（用純 <img> 或第三方 CDN）
  images: { unoptimized: true },

  // CI/雲端建置比較寬鬆；若你要嚴格型可改回 false
  eslint: { ignoreDuringBuilds: true },

  // 你的網站要多語系：繁中為預設
  i18n: {
    locales: ['zh-TW', 'en', 'ja'],
    defaultLocale: 'zh-TW'
  },

  // 與 Cloudflare 相容性相關的實驗旗標（保守關閉）
  experimental: {
    instrumentationHook: false
  },

  // 如果你在子目錄部署，可用環境變數帶 basePath（可刪）
  ...(process.env.NEXT_BASE_PATH ? { basePath: process.env.NEXT_BASE_PATH } : {})
};

export default nextConfig;
