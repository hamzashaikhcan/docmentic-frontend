/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export configuration
  // output: 'export',
  distDir: 'out',

  // Development configurations
  reactStrictMode: false, // Disable strict mode to reduce render cycles

  // Skip checks to improve performance
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Configure image handling
  images: {
    unoptimized: true,
    domains: [
      "source.unsplash.com",
      "images.unsplash.com",
      "ext.same-assets.com",
      "ugc.same-assets.com",
    ],
  },

  // Reduce memory usage
  onDemandEntries: {
    // Keep pages in memory for 30 seconds (default is 15)
    maxInactiveAge: 30 * 1000,
    // Only keep 5 pages in memory
    pagesBufferLength: 5,
  },

  // Add webpack configuration to handle HTML files and Node.js polyfills
  webpack: (config, { isServer }) => {
    // Handle HTML files
    config.module.rules.push({
      test: /\.html$/,
      loader: 'ignore-loader',
    });

    // Disable polyfills for Node.js modules in browser
    if (!isServer) {
      // Add specific node modules to externals to prevent them from being bundled
      config.externals = [
        ...(config.externals || []),
        'bcrypt',
        '@mapbox/node-pre-gyp',
      ];

      // Also set fallbacks for common Node.js modules used by these packages
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
        crypto: false,
        stream: false,
        http: false,
        https: false,
        zlib: false,
        child_process: false,
        'mock-aws-s3': false,
        'aws-sdk': false,
        'nock': false,
      };
    }

    return config;
  }
};

module.exports = nextConfig;
