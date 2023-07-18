// eslint-disable-next-line @typescript-eslint/no-var-requires
const { withSentryConfig } = require("@sentry/nextjs");

/** @type {import('next').NextConfig} */
const moduleExports = {
  transpilePackages: [
    "@bleu-balancer-tools/gql",
    "@bleu-balancer-tools/schema",
  ],
  experimental: {
    appDir: true,
    serverActions: true,
  },
  reactStrictMode: true,
  swcMinify: true,
  /**
   * This configuration is following Rainbowkit Migration Guide to Viem
   * 3. Ensure bundler and polyfill compatibility
   * https://www.rainbowkit.com/docs/migration-guide
   */
  webpack: (config) => {
    config.resolve.fallback = { fs: false, net: false, tls: false };
    return config;
  },
  async redirects() {
    return [
      {
        source: "/",
        destination: "/metadata/ethereum",
        permanent: false,
      },
      {
        source: "/metadata",
        destination: "/metadata/ethereum",
        permanent: false,
      },
      {
        source: "/internalmanager",
        destination: "/internalmanager/ethereum",
        permanent: false,
      },
    ];
  },
  sentry: {
    hideSourceMaps: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "assets.coingecko.com",
        port: "",
        pathname: "/coins/images/**",
      },
      {
        protocol: "https",
        hostname: "raw.githubusercontent.com",
        port: "",
        pathname: "/balancer/frontend-v2/**",
      },
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
        port: "",
        pathname:
          "/images/r2mka0oi/production/bf37b9c7fb36c7d3c96d3d05b45c76d89072b777-1800x1800.png",
      },
    ],
  },
};

const sentryWebpackPluginOptions = {
  silent: true,
};

module.exports = withSentryConfig(moduleExports, sentryWebpackPluginOptions);
