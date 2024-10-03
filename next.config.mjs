/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  productionBrowserSourceMaps: true,
  webpack: (config, { isServer, dev }) => {
    // Force source maps in production
    if (!dev) {
      config.devtool = 'source-map'
    }

    // Disable source map for server-side in production
    if (!dev && isServer) {
      config.devtool = 'source-map'
    }

    return config
  }
}

export default nextConfig
