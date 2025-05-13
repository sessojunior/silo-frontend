export default function InputCheckbox({ id, name, label }: { id: string; name: string; label: string }) {
	return (
		<div className='flex items-center cursor-pointer'>
			<input id={id} type='checkbox' name={name} className='shrink-0 rounded-sm border-zinc-300 text-blue-600 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:checked:border-blue-500 dark:checked:bg-blue-500 dark:focus:ring-offset-zinc-800' />
			<span className='ms-2 text-sm text-zinc-500 dark:text-zinc-400'>{label}</span>
		</div>
	)
}
