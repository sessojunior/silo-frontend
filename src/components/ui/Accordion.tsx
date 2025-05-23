'use client'

import { useState } from 'react'
import { clsx } from 'clsx' // Usado para juntar classes condicionalmente
import { twMerge } from 'tailwind-merge' // Junta classes do Tailwind com priorização de estilos
import Button from '@/components/ui/Button'

export type Chapter = {
	id: string | number
	title: string
	description: string
}

export type Section = {
	id: string | number
	title: string
	description?: string
	chapters: Chapter[]
}

export type AccordionProps = {
	sections: Section[]
}

export default function Accordion({ sections }: AccordionProps) {
	const [openSection, setOpenSection] = useState<number | null>(0)
	const [openChapter, setOpenChapter] = useState<number | null>(0)

	const toggleSection = (index: number) => {
		setOpenSection((prev) => (prev === index ? null : index))
		setOpenChapter(null)
	}

	const toggleChapter = (index: number) => {
		setOpenChapter((prev) => (prev === index ? null : index))
	}

	return (
		<div className='flex flex-col gap-1'>
			{sections.map((section, sectionIndex) => {
				const isOpenSection = openSection === sectionIndex

				return (
					<div key={section.id} className='rounded-lg'>
						<button onClick={() => toggleSection(sectionIndex)} className={twMerge(clsx('flex w-full items-center justify-between gap-2 px-3 py-2 text-left font-semibold transition rounded-xl border', isOpenSection ? 'text-blue-600 border-transparent' : 'text-zinc-800 hover:bg-zinc-50 hover:border-zinc-200'))} aria-expanded={isOpenSection}>
							<div className='flex items-center gap-2'>
								<span className={`icon-[lucide--chevron-${isOpenSection ? 'up' : 'down'}] size-4`} />
								{section.title}
							</div>
						</button>

						{isOpenSection && (
							<div className='px-6 pb-4 pt-1 text-zinc-800'>
								{section.description && <p className='mb-3 text-sm'>{section.description}</p>}

								{section.chapters.length > 0 ? (
									<div className='flex flex-col gap-2'>
										{section.chapters.map((chapter, chapterIndex) => {
											const isOpenChapter = openChapter === chapterIndex

											return (
												<div key={chapter.id} className='rounded-md'>
													<button onClick={() => toggleChapter(chapterIndex)} className={twMerge(clsx('flex w-full items-center justify-between gap-2 px-3 py-2 text-left font-medium transition rounded-xl border', isOpenChapter ? 'text-blue-600 border-transparent' : 'text-zinc-800 hover:bg-zinc-50 hover:border-zinc-200'))} aria-expanded={isOpenChapter}>
														<div className='flex items-center gap-2'>
															<span className={`icon-[lucide--chevron-${isOpenChapter ? 'up' : 'down'}] size-4`} />
															<span className='icon-[lucide--book-text] size-4' />
															{chapter.title}
														</div>
													</button>

													{isOpenChapter && (
														<div className='px-4 py-2'>
															<p className='text-sm text-zinc-700'>{chapter.description}</p>
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
