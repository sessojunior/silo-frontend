import React from 'react'

interface ProjectDetailsLayoutProps {
	children: React.ReactNode
	params: Promise<{ id: string }>
}

export default async function ProjectDetailsLayout({ children }: ProjectDetailsLayoutProps) {
	return <div className='w-full flex-1 bg-white dark:bg-zinc-900'>{children}</div>
}
