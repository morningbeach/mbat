/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // 建議先關掉 next/image 的自動最佳化，避免 Cloudflare 運行時相容性問題
  images: { unoptimized: true },

  // 若你沒有用 instrumentation，就先確保關閉
  experimental: { instrumentationHook: false }
};

export default nextConfig;
