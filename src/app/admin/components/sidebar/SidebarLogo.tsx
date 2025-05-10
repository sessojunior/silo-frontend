import Image from 'next/image'

export default function SidebarLogo() {
	return (
		<div className='flex'>
			<Image src='/images/logo.png' alt='Logo' width={32} height={32} className='-ml-1 block h-8 w-8' />
			<div className='inline-block px-0.5 pt-0.5 text-2xl font-bold text-zinc-600 dark:text-zinc-200'>Silo</div>
		</div>
	)
}
