import { useState, useEffect, useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import Button from '@/components/ui/Button'
import { getMarkdownClasses } from '@/lib/markdown'

interface ProductManual {
	id: string
	productId: string
	description: string
	createdAt: string
	updatedAt: string
}

interface ProductManualSectionProps {
	manual: ProductManual | null
	onEditManual: () => void
}

export default function ProductManualSection({ manual, onEditManual }: ProductManualSectionProps) {
	// Estado para controlar quais seções estão expandidas (todas expandidas por padrão)
	const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())

	// Função para alternar expansão de uma seção
	const toggleSection = (sectionId: string) => {
		const newExpanded = new Set(expandedSections)
		if (newExpanded.has(sectionId)) {
			newExpanded.delete(sectionId)
		} else {
			newExpanded.add(sectionId)
		}
		setExpandedSections(newExpanded)
	}

	// Função para extrair seções do markdown (apenas headers h1, h2, h3)
	const extractSections = (markdown: string | null | undefined) => {
		if (!markdown || markdown.trim() === '') {
			return []
		}

		const lines = markdown.split('\n')
		const sections: Array<{
			id: string
			title: string
			content: string
			level: number
		}> = []

		let currentSection: { id: string; title: string; content: string; level: number } | null = null
		let contentLines: string[] = []

		for (let i = 0; i < lines.length; i++) {
			const line = lines[i]
			const headerMatch = line.match(/^(#{1,3})\s+(.+)$/)

			if (headerMatch) {
				// Salva seção anterior se existir
				if (currentSection) {
					currentSection.content = contentLines.join('\n').trim()
					sections.push(currentSection)
				}

				// Cria nova seção
				const level = headerMatch[1].length
				const title = headerMatch[2].trim()
				const id = `section-${sections.length + 1}`

				currentSection = {
					id,
					title,
					content: '',
					level,
				}
				contentLines = []
			} else if (currentSection) {
				contentLines.push(line)
			}
		}

		// Adiciona última seção
		if (currentSection) {
			currentSection.content = contentLines.join('\n').trim()
			sections.push(currentSection)
		}

		return sections
	}

	// Memoiza as seções para evitar recriação desnecessária
	const sections = useMemo(() => extractSections(manual?.description), [manual?.description])

	// Inicializa todas as seções como expandidas na primeira renderização
	useEffect(() => {
		if (sections.length > 0) {
			const allSectionIds = new Set(sections.map((s) => s.id))
			setExpandedSections(allSectionIds)
		}
	}, [sections])

	// Função para obter classes de título baseadas no nível
	const getTitleClasses = (level: number) => {
		switch (level) {
			case 1:
				return 'text-xl font-semibold text-gray-600 dark:text-zinc-200'
			case 2:
				return 'text-lg font-medium text-gray-600 dark:text-zinc-200'
			case 3:
				return 'text-lg font-medium text-gray-600 dark:text-zinc-200'
			default:
				return 'text-base font-medium text-gray-600 dark:text-zinc-200'
		}
	}

	// Se não há manual, mostra mensagem
	if (!manual || !manual.description || manual.description.trim() === '') {
		return (
			<div className='p-8'>
				<div className='flex w-full items-center justify-between pb-6'>
					<div>
						<h3 className='text-xl font-medium'>Manual do produto</h3>
						<div>
							<span className='text-base text-zinc-600 dark:text-zinc-400'>Documentação e referência do produto</span>
						</div>
					</div>
					<Button type='button' icon='icon-[lucide--edit]' style='unstyled' className='py-2' onClick={onEditManual}>
						Editar manual
					</Button>
				</div>

				<div className='text-center py-8'>
					<div className='icon-[lucide--book-open] w-12 h-12 mx-auto text-zinc-400 dark:text-zinc-500 mb-3'></div>
					<p className='text-zinc-600 dark:text-zinc-400 mb-4'>Nenhum manual disponível para este produto.</p>
					<Button type='button' onClick={onEditManual} style='bordered'>
						Criar manual
					</Button>
				</div>
			</div>
		)
	}

	// Se há manual, mostra as seções com funcionalidade de expandir/colapsar
	return (
		<div className='p-8'>
			<div className='flex w-full items-center justify-between pb-6'>
				<div>
					<h3 className='text-xl font-medium'>Manual do produto</h3>
					<div>
						<span className='text-base text-zinc-600 dark:text-zinc-400'>Documentação e referência do produto</span>
					</div>
				</div>
				<Button type='button' icon='icon-[lucide--edit]' style='unstyled' className='py-2' onClick={onEditManual}>
					Editar manual
				</Button>
			</div>

			{/* Conteúdo do manual com funcionalidade de expandir/colapsar */}
			<div className='-ml-5 -mr-5'>
				{sections.map((section) => {
					const isExpanded = expandedSections.has(section.id)

					return (
						<div key={section.id}>
							{/* Título clicável com hover visual */}
							<div className='group relative'>
								{/* Título do header com hover effect e funcionalidade de click */}
								<div className='flex items-center hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors py-1 mb-2 rounded-full font-medium cursor-pointer' onClick={() => toggleSection(section.id)}>
									{/* Ícone que muda baseado no estado de expansão */}
									<div className='opacity-0 group-hover:opacity-100 transition-opacity -ml-2 mr-2 size-5 rounded-full flex items-center justify-center bg-gray-200 dark:bg-gray-700 border border-zinc-300 dark:border-zinc-700'>
										<span className={`${isExpanded ? 'icon-[lucide--minus]' : 'icon-[lucide--plus]'} size-4`}></span>
									</div>

									{/* Título com tamanho diferenciado baseado no nível */}
									<h1 className={getTitleClasses(section.level)}>{section.title}</h1>
								</div>
							</div>

							{/* Conteúdo que aparece/desaparece baseado no estado */}
							{isExpanded && section.content && (
								<div className='ml-10 mt-2 mb-4'>
									<div className={getMarkdownClasses('base', 'text-zinc-800 dark:text-zinc-200')}>
										<ReactMarkdown>{section.content}</ReactMarkdown>
									</div>
								</div>
							)}
						</div>
					)
				})}
			</div>
		</div>
	)
}
