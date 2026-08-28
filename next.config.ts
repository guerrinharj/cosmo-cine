// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    // Served under cosmocine.com/filmes and /contato via rewrites on the
    // production-service app (cosmo-user), so _next/static assets must be
    // fetched from this app's own origin instead of relative paths.
    assetPrefix: process.env.NODE_ENV === 'production' ? 'https://cosmo-cine.vercel.app' : undefined,
    images: {
        domains: [
            'i.vimeocdn.com',
            'vumbnail.com',
            'vimeo.com',
            'jylrhuizxdrrzucnxher.supabase.co'
        ]
    }
};

export default nextConfig;
