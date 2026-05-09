/** @type {import('next').NextConfig} */
const securityHeaders = [
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
];

const watchIgnorePatterns = [
  '**/.git',
  '**/.git/**',
  '**/.next/**',
  '**/node_modules/**',
  '**/tsconfig.tsbuildinfo',
];

const nextConfig = {
  webpack(config, { dev }) {
    if (dev && config.watchOptions) {
      config.watchOptions = {
        ...config.watchOptions,
        ignored: watchIgnorePatterns,
      };
    }

    return config;
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
