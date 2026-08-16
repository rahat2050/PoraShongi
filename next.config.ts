import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep dynamic metadata in the initial <head>. This also ensures a missing
  // profile can return its real 404 status before response headers are sent.
  htmlLimitedBots: /.*/,
};

export default nextConfig;
