/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        // Proxy all API calls to Django backend
        destination: "http://localhost:8000/api/:path*",
      },
    ];
  },
};

export default nextConfig
