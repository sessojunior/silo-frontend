'use client'

import { useState } from 'react'
import { clsx } from 'clsx' // Usado para juntar classes condicionalmente
import { twMerge } from 'tailwind-merge' // Junta classes do Tailwind com priorização de estilos
import Button from './Button'

// Tipos para capítulos dentro das seções
export type Chapter = {
	id: string | number
	title: string
	description: string
}

// Tipo para seções que contêm capítulos
export type Section = {
	id: string | number
	title: string
	description?: string // descrição opcional da seção
	chapters: Chapter[] // lista de capítulos dentro da seção
}

// Props do componente Accordion recebem um array de seções
export type AccordionProps = {
	sections: Section[]
}

export default function Accordion({ sections }: AccordionProps) {
	// Estado que guarda qual índice da seção está aberta (null = nenhuma aberta)
	const [openSection, setOpenSection] = useState<number | null>(0) // por padrão abre a primeira seção
	// Estado que guarda qual capítulo está aberto dentro da seção aberta
	const [openChapter, setOpenChapter] = useState<number | null>(0) // padrão abre o primeiro capítulo

	// Função para alternar abertura/fechamento da seção clicada
	const toggleSection = (index: number) => {
		// Se a seção clicada já estiver aberta, fecha (seta null), senão abre
		setOpenSection((prev) => (prev === index ? null : index))
		// Sempre que trocar de seção, fecha qualquer capítulo aberto
		setOpenChapter(null)
	}

	// Função para alternar abertura/fechamento do capítulo clicado dentro da seção aberta
	const toggleChapter = (index: number) => {
		// Se o capítulo clicado já estiver aberto, fecha, senão abre
		setOpenChapter((prev) => (prev === index ? null : index))
	}

	return (
		// Container principal com layout em coluna e espaçamento entre itens
		<div className='flex flex-col gap-1'>
			{/* Mapeia cada seção para renderizar o acordeão */}
			{sections.map((section, sectionIndex) => {
				// Verifica se esta seção está aberta (comparando índice)
				const isOpenSection = openSection === sectionIndex

				return (
					<div key={section.id} className='rounded-lg'>
						{/* Botão que controla a abertura da seção */}
						<button
							onClick={() => toggleSection(sectionIndex)}
							// Combina classes com estilos condicionalmente (aberto x fechado)
							className={twMerge(clsx('flex w-full items-center justify-between gap-2 px-3 py-2 text-left font-semibold transition rounded-xl border', isOpenSection ? 'text-blue-600 border-transparent' : 'text-zinc-800 hover:bg-zinc-50 hover:border-zinc-200'))}
							aria-expanded={isOpenSection} // acessibilidade: indica se o botão está expandido
						>
							{/* Ícone da seta que muda dependendo do estado aberto/fechado */}
							<div className='flex items-center gap-2'>
								<span className={`icon-[lucide--chevron-${isOpenSection ? 'up' : 'down'}] size-4`} />
								{/* Título da seção */}
								{section.title}
							</div>
						</button>

						{/* Conteúdo da seção, mostrado somente se estiver aberta */}
						{isOpenSection && (
							<div className='px-6 pb-4 pt-1 text-zinc-800'>
								{/* Descrição opcional da seção */}
								{section.description && <p className='mb-3 text-sm'>{section.description}</p>}

								{/* Se houver capítulos dentro da seção */}
								{section.chapters.length > 0 ? (
									<div className='flex flex-col gap-2'>
										{/* Mapeia os capítulos */}
										{section.chapters.map((chapter, chapterIndex) => {
											// Verifica se o capítulo está aberto
											const isOpenChapter = openChapter === chapterIndex

											return (
												<div key={chapter.id} className='rounded-md'>
													{/* Botão para abrir/fechar capítulo */}
													<button onClick={() => toggleChapter(chapterIndex)} className={twMerge(clsx('flex w-full items-center justify-between gap-2 px-3 py-2 text-left font-medium transition rounded-xl border', isOpenChapter ? 'text-blue-600 border-transparent' : 'text-zinc-800 hover:bg-zinc-50 hover:border-zinc-200'))} aria-expanded={isOpenChapter}>
														<div className='flex items-center gap-2'>
															{/* Ícone da seta do capítulo (abre/fecha) */}
															<span className={`icon-[lucide--chevron-${isOpenChapter ? 'up' : 'down'}] size-4`} />
															{/* Ícone de livro */}
															<span className='icon-[lucide--book-text] size-4' />
															{/* Título do capítulo */}
															{chapter.title}
														</div>
													</button>

													{/* Conteúdo do capítulo mostrado só se aberto */}
													{isOpenChapter && (
														<div className='px-4 py-2'>
															{/* Descrição do capítulo */}
															<p className='text-sm text-zinc-700'>{chapter.description}</p>
															{/* Botão para adicionar capítulo (exemplo funcional) */}
															<div className='mt-2'>
																<Button type='button' icon='icon-[lucide--plus]' style='unstyled' className='py-2'>
																	Adicionar capítulo
																</Button>
															</div>
														</div>
													)}
												</div>
											)
										})}
									</div>
								) : (
									// Caso não haja capítulos, mostra botão para adicionar
									<Button type='button' icon='icon-[lucide--plus]' style='unstyled' className='py-2'>
										Adicionar capítulo
									</Button>
								)}
							</div>
						)}
					</div>
				)
			})}
		</div>
	)
}
