/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'm.media-amazon.com' },
      { protocol: 'https', hostname: 'i.ytimg.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' }
    ]
  },
  webpack: (config, { dev }) => {
    // Next 15 + Windows: the persistent webpack cache races with the
    // dev server and throws ENOENT on pack.gz files, surfacing as
    // unhandledRejection and 500ing the current request. Turn it off
    // for dev — a little slower on subsequent starts, but no crashes.
    if (dev) config.cache = false;
    return config;
  }
};

export default nextConfig;
