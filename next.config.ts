// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  i18n: {
    locales: ['pt', 'en'],
    defaultLocale: 'pt',
    localeDetection: false
  },
  images: {
    domains: ['i.vimeocdn.com', 'vumbnail.com']
  }
};

export default nextConfig;
