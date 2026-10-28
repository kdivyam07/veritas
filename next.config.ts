import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: { root: process.cwd() },
  outputFileTracingRoot: process.cwd(),
  agentRules: false,
  serverExternalPackages: ["@electric-sql/pglite"],
};

export default nextConfig;
