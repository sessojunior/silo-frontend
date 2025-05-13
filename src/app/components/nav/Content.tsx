export default function NavContent({ children }: { children: React.ReactNode }) {
	return (
		<div className='bg-white dark:bg-zinc-800'>
			<div className='flex w-full flex-shrink-0 flex-col border-r border-zinc-200 dark:border-zinc-700'>
				<div className='scrollbar size-full h-[calc(100vh-131px)] overflow-y-auto'>{children}</div>
			</div>
		</div>
	)
}
