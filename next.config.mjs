/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'americanroyaltylasvegas.com' }],
        destination: 'https://www.americanroyaltylasvegas.com/:path*',
        permanent: true,
      },
    ]
  },
}

export default nextConfig
