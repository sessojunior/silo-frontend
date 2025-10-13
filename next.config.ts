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
	},
	// Ignorar fileserver durante o build
	webpack: (config, { isServer }) => {
		if (isServer) {
			config.externals = config.externals || []
			config.externals.push({
				'fileserver': 'commonjs fileserver'
			})
		}
		return config
	}
}

export default nextConfig