import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  i18n: {
    locales: ['pt', 'en'], // supported locales
    defaultLocale: 'pt',   // default fallback locale
  },
};

export default nextConfig;
