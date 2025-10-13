import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	// Disable React Strict Mode so effects don't run twice in development
	reactStrictMode: false
};

export default nextConfig;
