'use client'

import NextLink from 'next/link'

export default function AuthLink({ children, href }: { children: React.ReactNode; href: string }) {
	return (
		<NextLink href={href} className='font-semibold underline-offset-2 hover:underline'>
			{children}
		</NextLink>
	)
}
