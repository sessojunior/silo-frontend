import Image from 'next/image'
import Accordion, { type Section } from '@/components/ui/Accordion'
import Button from '@/components/ui/Button'

// Tipos para os dados da API (copiados da página principal)
interface ProductContact {
	id: string
	name: string
	role: string
	team: string
	email: string
	phone?: string
	image?: string
}

interface ProductManualChapter {
	id: string
	title: string
	content: string
	order: number
}

interface ProductManualSection {
	id: string
	title: string
	description?: string
	order: number
	chapters: ProductManualChapter[]
}

// Props que o componente recebe da página principal
interface ProductDetailsColumnProps {
	// Dados
	sections: ProductManualSection[]
	contacts: ProductContact[]
	problemsCount: number
	solutionsCount: number
	lastUpdated: Date | null

	// Dados computados
	totalChapters: number
	accordionSections: Section[]

	// Handlers (callbacks para página principal)
	onAddSection: () => void

	// Utilitários
	formatTimeAgo: (date: Date | null) => string
}

export default function ProductDetailsColumn({ sections, contacts, problemsCount, solutionsCount, lastUpdated, totalChapters, accordionSections, onAddSection, formatTimeAgo }: ProductDetailsColumnProps) {
	return (
		<div className='flex w-full flex-grow flex-col'>
			<div className='scrollbar size-full h-[calc(100vh-131px)] overflow-y-auto'>
				{/* Cabeçalho */}
				<div className='flex flex-col gap-2 border-b border-zinc-200 p-8 md:grid md:grid-cols-2 dark:border-zinc-700'>
					<div className='flex'>
						<div className='flex w-8 items-center justify-center'>
							<span className='icon-[lucide--book-text] size-4'></span>
						</div>
						<div className='flex'>
							<span>
								{sections.length} seções & {totalChapters} capítulos
							</span>
						</div>
					</div>
					<div className='flex'>
						<div className='flex w-8 items-center justify-center'>
							<span className='icon-[lucide--users-round] size-4'></span>
						</div>
						<div className='flex'>
							<span>Técnicos responsáveis: {contacts.length}</span>
						</div>
					</div>
					<div className='flex'>
						<div className='flex w-8 items-center justify-center'>
							<span className='icon-[lucide--triangle-alert] size-4'></span>
						</div>
						<div className='flex'>
							<span>Problemas reportados: {problemsCount}</span>
						</div>
					</div>
					<div className='flex'>
						<div className='flex w-8 items-center justify-center'>
							<span className='icon-[lucide--book-check] size-4'></span>
						</div>
						<div className='flex'>
							<span>Soluções encontradas: {solutionsCount}</span>
						</div>
					</div>
					<div className='flex'>
						<div className='flex w-8 items-center justify-center'>
							<span className='icon-[lucide--clock-4] size-4'></span>
						</div>
						<div className='flex'>
							<span>Atualizado {formatTimeAgo(lastUpdated)}</span>
						</div>
					</div>
				</div>

				{/* Responsáveis técnicos */}
				<div className='border-b border-zinc-200 p-8 dark:border-zinc-700'>
					<div className='flex w-full items-center justify-between pb-6'>
						<div>
							<h3 className='text-xl font-medium'>Contatos em caso de problemas</h3>
							<div>
								<span className='text-sm font-medium text-zinc-600 dark:text-zinc-400'>{contacts.length} responsáveis técnicos</span>
							</div>
						</div>
						<Button type='button' icon='icon-[lucide--plus]' style='unstyled' className='py-2'>
							Adicionar contato
						</Button>
					</div>
					<div className='flex flex-col gap-4 md:grid md:grid-cols-2'>
						{/* Contatos */}
						{contacts.map((contact) => (
							<div key={contact.id} className='flex gap-x-2'>
								<div className='size-12 shrink-0'>
									<Image src={contact.image || '/images/profile.png'} alt={contact.name} width={40} height={40} className='size-full rounded-full' />
								</div>
								<div className='flex flex-col'>
									<div className='text-base font-bold'>{contact.name}</div>
									<div className='text-sm font-medium text-zinc-600 dark:text-zinc-400'>
										{contact.role} <span className='text-zinc-300 dark:text-zinc-600'>•</span> {contact.team}
									</div>
									<div className='text-sm font-medium'>
										<a href={`mailto:${contact.email}`} className='text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300'>
											{contact.email}
										</a>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Manual do produto */}
				<div className='p-8'>
					<div className='flex w-full items-center justify-between pb-6'>
						<div>
							<h3 className='text-xl font-medium'>Manual do produto</h3>
							<div>
								<span className='text-sm font-medium text-zinc-600 dark:text-zinc-400'>
									{sections.length} seções <span className='text-zinc-300 dark:text-zinc-600'>•</span> {totalChapters} capítulos
								</span>
							</div>
						</div>
						<Button type='button' icon='icon-[lucide--plus]' style='unstyled' className='py-2' onClick={onAddSection}>
							Adicionar seção
						</Button>
					</div>
					<div className='flex flex-col'>
						{/* Manual */}
						{accordionSections.length > 0 ? (
							<Accordion sections={accordionSections} />
						) : (
							<div className='flex flex-col items-center justify-center py-12 text-center'>
								<span className='icon-[lucide--book-open] mb-4 text-4xl text-zinc-400'></span>
								<h4 className='text-lg font-medium text-zinc-600 dark:text-zinc-300'>Nenhum manual encontrado</h4>
								<p className='text-sm text-zinc-500 dark:text-zinc-400'>Adicione seções e capítulos para começar a documentar este produto.</p>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	)
}

// Exportando tipos para uso na página principal
export type { ProductContact, ProductManualChapter, ProductManualSection, ProductDetailsColumnProps }
