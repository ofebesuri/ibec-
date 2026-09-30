/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // v2026.09.20-Final: 启用 standalone 输出，构建产物含 server.js，可直接 `node server.js` 启动
  output: 'standalone',
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' }
    ]
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.worker\.(js|ts)$/,
      use: { loader: 'worker-loader' }
    });
    return config;
  }
};

module.exports = nextConfig;
