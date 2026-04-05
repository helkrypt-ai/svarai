import type { NextConfig } from 'next'

const HELKRYPT_WEBSITE = 'https://helkrypt-website-r0y71ofl8-helkrypt-ai.vercel.app'

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/privacy',
        destination: `${HELKRYPT_WEBSITE}/privacy`,
        permanent: false,
      },
      {
        source: '/personvern',
        destination: `${HELKRYPT_WEBSITE}/personvern`,
        permanent: false,
      },
    ]
  },
  async headers() {
    return [
      // Allow /embed to be iframed from any domain (widget usage)
      {
        source: '/embed',
        headers: [
          { key: 'X-Frame-Options', value: 'ALLOWALL' },
          { key: 'Content-Security-Policy', value: "frame-ancestors *;" },
        ],
      },
      // Allow widget.js to be loaded cross-origin
      {
        source: '/widget.js',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Cache-Control', value: 'public, max-age=3600' },
        ],
      },
    ]
  },
}

export default nextConfig
