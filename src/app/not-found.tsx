import Button from '@/app/components/Button'

export default function NotFoundPage() {
	return (
		<div className='flex min-h-screen flex-col items-center justify-center bg-white p-6 dark:bg-zinc-900'>
			{/* Ícone de erro */}
			<span className='icon-[lucide--file-x-2] animate-pulse text-6xl text-red-600 dark:text-red-400'></span>

			{/* Mensagem de erro */}
			<h1 className='mt-4 text-center text-3xl font-extrabold tracking-tight text-zinc-800 dark:text-zinc-100'>Página não encontrada</h1>

			{/* Descrição de erro com base no status */}
			<p className='mt-4 text-lg text-zinc-700 dark:text-zinc-300'>Oops! Algo deu errado. Verifique a URL ou volte para a página inicial.</p>

			{/* Botão para voltar para a página inicial */}
			<Button type='button' href='/' className='mt-4'>
				Voltar para a página inicial
			</Button>
		</div>
	)
}
