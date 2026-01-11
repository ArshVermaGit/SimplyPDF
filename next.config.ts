import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: 'path-browserify',
        crypto: false,
      };
    }
    return config;
  },
  // Silence Turbopack error and provide module aliases
  turbopack: {
    resolveAlias: {
      fs: './src/lib/empty-module.ts',
      path: 'path-browserify',
      crypto: './src/lib/empty-module.ts',
    },
  },
};

export default nextConfig;
