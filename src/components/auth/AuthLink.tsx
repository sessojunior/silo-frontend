'use client'

import NextLink from 'next/link'

export default function AuthLink({ children, href = '', onClick = () => {} }: { children: React.ReactNode; href?: string; onClick?: () => void }) {
	return (
		<NextLink href={href} onClick={onClick} className='font-semibold underline-offset-2 hover:underline'>
			{children}
		</NextLink>
	)
}
