// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pas de turbopack pour Tailwind v4
  experimental: {
    optimizePackageImports: ["framer-motion", "lucide-react"],
  },
};

export default nextConfig;
