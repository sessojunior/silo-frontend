import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
	images: {
		remotePatterns: [
			// Desenvolvimento local
			{
				protocol: 'http',
				hostname: 'localhost',
				port: '4000',
				pathname: '/files/**',
			},
			// Produção - usando variáveis de ambiente
			...(process.env.FILE_SERVER_HOSTNAME ? [{
				protocol: (process.env.FILE_SERVER_PROTOCOL || 'https') as 'http' | 'https',
				hostname: process.env.FILE_SERVER_HOSTNAME,
				pathname: '/files/**',
			}] : [])
		],
	}
}

export default nextConfig