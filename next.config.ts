import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'utfs.io',
				pathname: '/**',
			},
			{
				protocol: 'http',
				hostname: 'localhost',
				port: '4000',
				pathname: '/files/**',
			},
		],
	}
}

export default nextConfig