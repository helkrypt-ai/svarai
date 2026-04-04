import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
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
