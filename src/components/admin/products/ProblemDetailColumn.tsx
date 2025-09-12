'use client'

import ReactMarkdown from 'react-markdown'
import Button from '@/components/ui/Button'
import { getMarkdownClasses } from '@/lib/markdown'
import Image from 'next/image'
import { ProductProblem, ProductProblemImage } from '@/lib/db/schema'

interface SolutionWithDetails {
	id: string
	replyId: string | null
	date: Date
	description: string
	verified: boolean
	user: {
		id: string
		name: string
		image: string
	}
	image: {
		image: string
		description: string
	} | null
	isMine: boolean
}

interface ProblemDetailColumnProps {
	loadingDetail: boolean
	problem: ProductProblem | null
	solutions: SolutionWithDetails[]
	images: ProductProblemImage[]
	onEditProblem: () => void
	onImageClick: (image: string, description: string) => void
	formatDate: (date: Date) => string
}

export function ProblemDetailColumn({ loadingDetail, problem, solutions, images, onEditProblem, onImageClick, formatDate }: ProblemDetailColumnProps) {
	if (loadingDetail) {
		return (
			<div className='flex items-center justify-center h-full'>
				<div className='text-center'>
					<div className='animate-spin text-4xl'>⏳</div>
					<p className='mt-2 text-zinc-600 dark:text-zinc-400'>Carregando detalhes...</p>
				</div>
			</div>
		)
	}

	return (
		<>
			{/* Descrição do problema */}
			<div className='flex w-full flex-col p-8'>
				<div className='flex w-full items-center justify-between pb-6'>
					<div>
						<h3 className='text-xl font-medium'>{problem ? problem.title : 'Sem problemas'}</h3>
						{problem && solutions.length > 0 && (
							<div className='text-base'>
								<span className='text-sm font-medium'>{solutions.length} soluções</span> <span className='text-zinc-300 dark:text-zinc-600'>•</span> <span className='text-sm text-zinc-400'>Registrado em {formatDate(problem.createdAt)}</span>
							</div>
						)}
					</div>
					{problem && (
						<Button type='button' icon='icon-[lucide--edit]' style='unstyled' className='shrink-0 py-2' onClick={onEditProblem}>
							Editar problema
						</Button>
					)}
				</div>

				<div className={getMarkdownClasses('base', 'text-zinc-800 dark:text-zinc-200')}>
					{/* Uso de Markdown para a descrição */}
					<ReactMarkdown>{problem ? problem.description : 'Nenhum problema registrado para este produto.'}</ReactMarkdown>
				</div>

				<div className='flex gap-2 pt-6'>
					{images.length > 0 &&
						images.map(({ id, image, description }) => (
							<div key={id} className='cursor-pointer' onClick={() => onImageClick(image, description)}>
								<Image src={image} alt={description} className='h-32 w-auto rounded-lg transition hover:brightness-90' width={200} height={128} style={{ objectFit: 'cover', height: 'auto' }} priority />
							</div>
						))}
				</div>
			</div>
		</>
	)
}
