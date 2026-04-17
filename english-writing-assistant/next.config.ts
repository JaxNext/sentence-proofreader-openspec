import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  output: "export",
  basePath: isProd ? "/sentence-proofreader-openspec" : "",
  assetPrefix: isProd ? "/sentence-proofreader-openspec" : "",
};

export default nextConfig;
