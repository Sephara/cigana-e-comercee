/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**', pathname: '/**' },
      { protocol: 'http', hostname: 'localhost', pathname: '/**' },
    ],
    unoptimized: true,
  },
  async rewrites() {
    return [
      // Imagens em /uploads/ (antigas no banco) servidas pela mesma API
      { source: '/uploads/:path*', destination: '/api/uploads/:path*' },
    ]
  },
}

module.exports = nextConfig





