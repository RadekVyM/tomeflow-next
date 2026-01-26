import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [new URL("https://lh3.googleusercontent.com/**")],
  },
  reactCompiler: true,
};

export default nextConfig;
