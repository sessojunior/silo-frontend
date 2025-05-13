interface SwitchProps {
	id: string
	name: string
	checked?: boolean
	onChange?: (value: boolean) => void
	size?: 'lg' | 'md' | 'sm' | 'xs'
	title?: string
	description?: string
	isInvalid?: boolean
	invalidMessage?: string
}

export default function Switch({ id, name, checked = false, onChange, size = 'md', title = '', description = '', isInvalid, invalidMessage }: SwitchProps) {
	const sizes = {
		lg: 'h-8 w-15 size-7',
		md: 'h-7 w-13 size-6',
		sm: 'h-6 w-11 size-5',
		xs: 'h-5 w-9 size-4',
	}

	return (
		<>
			<div className='flex w-full items-center justify-between gap-3'>
				<label htmlFor={id}>
					<h3 className='text-lg font-bold tracking-tight text-zinc-600 dark:text-zinc-200'>{title}</h3>
					<p className='mt-1 text-base text-zinc-400 dark:text-zinc-600'>{description}</p>
				</label>
				<label htmlFor={id} className={`relative inline-block cursor-pointer shrink-0 ${sizes[size]}`}>
					<input id={id} name={name} type='checkbox' checked={checked} onChange={(e) => onChange?.(e.target.checked)} className='peer sr-only' />
					<span className='absolute inset-0 rounded-full bg-gray-200 transition-colors duration-200 ease-in-out peer-checked:bg-blue-600 peer-disabled:pointer-events-none peer-disabled:opacity-50 dark:bg-neutral-700 dark:peer-checked:bg-blue-500'></span>
					<span className={`absolute start-0.5 top-1/2 -translate-y-1/2 rounded-full bg-white shadow-xs transition-transform duration-200 ease-in-out peer-checked:translate-x-full dark:bg-neutral-400 dark:peer-checked:bg-white ${sizes[size]?.split(' ')[2]}`}></span>
				</label>
			</div>
			{isInvalid && <p className='dark:text-red-600 mt-2 text-xs text-red-500'>{invalidMessage}</p>}
		</>
	)
}
