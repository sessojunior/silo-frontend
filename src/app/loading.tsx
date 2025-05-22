export default function Loading() {
	return (
		<div className='min-h-screen w-full flex justify-center items-center'>
			<div className='flex items-center gap-2'>
				<span className='icon-[lucide--loader-circle] animate-spin size-8 text-blue-600 pt-1'></span>
				<div className='text-lg text-zinc-600'>Carregando...</div>
			</div>
		</div>
	)
}
