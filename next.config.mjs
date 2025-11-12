/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  trailingSlash: false,

  // Cloudflare Pages 上先關掉影像最佳化（用 <img> 或 CDN），避免運行時踩雷
  images: { unoptimized: true },

  // 雲端建置先略過 ESLint
  eslint: { ignoreDuringBuilds: true }
  // 注意：
  // - App Router 的多語系不要寫在 next.config；你已用 react-i18next 客端處理，繼續用即可
};
export default nextConfig;
