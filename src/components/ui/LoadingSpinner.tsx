'use client'

import React from 'react'

interface LoadingSpinnerProps {
	isLoading: boolean
	children: React.ReactNode
	size?: 'sm' | 'md' | 'lg'
	variant?: 'overlay' | 'inline' | 'centered'
	text?: string
	className?: string
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
	isLoading,
	children,
	size = 'md',
	variant = 'overlay',
	text,
	className = ''
}) => {
	const sizeClasses = {
		sm: 'h-4 w-4',
		md: 'h-8 w-8',
		lg: 'h-12 w-12'
	}

	const spinnerElement = (
		<div className={`animate-spin rounded-full border-2 border-zinc-300 border-t-blue-600 ${sizeClasses[size]}`} />
	)

	if (!isLoading) {
		return <>{children}</>
	}

	if (variant === 'inline') {
		return (
			<div className={`flex items-center gap-2 ${className}`}>
				{spinnerElement}
				{text && <span className="text-sm text-zinc-600 dark:text-zinc-400">{text}</span>}
			</div>
		)
	}

	if (variant === 'centered') {
		return (
			<div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
				{spinnerElement}
				{text && <span className="text-sm text-zinc-600 dark:text-zinc-400">{text}</span>}
			</div>
		)
	}

	// variant === 'overlay' (default)
	return (
		<div className={`relative ${className}`}>
			{children}
			<div className="absolute inset-0 bg-white/50 dark:bg-zinc-900/50 flex items-center justify-center z-10">
				<div className="flex flex-col items-center gap-2">
					{spinnerElement}
					{text && <span className="text-sm text-zinc-600 dark:text-zinc-400">{text}</span>}
				</div>
			</div>
		</div>
	)
}

export default LoadingSpinner

