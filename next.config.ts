import type { NextConfig } from "next";

// Static export: `npm run build` writes a plain site to /out.
// Host it free on Vercel, Netlify or GitHub Pages.
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
