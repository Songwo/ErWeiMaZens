import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      { source: '/api/:path*', destination: 'http://localhost:8787/api/:path*' },
      { source: '/q/:path*', destination: 'http://localhost:8787/q/:path*' },
    ]
  },
}

export default withNextIntl(nextConfig)
