// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  i18n: {
    locales: ['pt', 'en'],
    defaultLocale: 'pt',
    localeDetection: false
  },
  images: {
    domains: ['i.vimeocdn.com', 'vumbnail.com'], // add any other domains here too if needed
  },
  rules: {
    '@typescript-eslint/no-unused-vars': 'off',
  },
};

export default nextConfig;
