/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  trailingSlash: false,
  images: { unoptimized: true },
  eslint: { ignoreDuringBuilds: true }
};
export default nextConfig;
