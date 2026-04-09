import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Táctica de Túnel: Redirigir peticiones de /api/v1 al backend de FastAPI y /supabase-api a Supabase Local
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: "http://backend:8000/:path*",
      },
      {
        source: "/supabase-api/:path*",
        destination: "http://host.docker.internal:54321/:path*",
      },
    ];
  },
};

export default nextConfig;
