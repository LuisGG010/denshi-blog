/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'slnxvatqszcksjvnjach.supabase.co' }, // Tu Supabase
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'i.imgur.com' },
      { protocol: 'https', hostname: 'encrypted-tbn0.gstatic.com' },
    ],
  },
};

export default nextConfig;