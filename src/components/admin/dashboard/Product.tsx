'use client'

import { useState } from 'react'

import ProductTimeline from '@/components/admin/dashboard/ProductTimeline'
import ProductTurn from '@/components/admin/dashboard/ProductTurn'
import ProductCalendar from '@/components/admin/dashboard/ProductCalendar'
import Modal from '@/components/ui/Modal'

const month1 = {
	month: 1,
	year: 2025,
	dates: [
		{
			dateDay: 1,
			dateWeek: 'wednesday',
			dateTurns: [
				{ dateTurn: 0, dateStatus: 'green' },
				{ dateTurn: 6, dateStatus: 'green' },
				{ dateTurn: 12, dateStatus: 'green' },
				{ dateTurn: 18, dateStatus: 'green' },
			],
		},
		{
			dateDay: 2,
			dateWeek: 'thursday',
			dateTurns: [
				{ dateTurn: 0, dateStatus: 'orange' },
				{ dateTurn: 6, dateStatus: 'green' },
				{ dateTurn: 12, dateStatus: 'green' },
				{ dateTurn: 18, dateStatus: 'green' },
			],
		},
		{
			dateDay: 3,
			dateWeek: 'friday',
			dateTurns: [
				{ dateTurn: 0, dateStatus: 'green' },
				{ dateTurn: 6, dateStatus: 'red' },
				{ dateTurn: 12, dateStatus: 'green' },
				{ dateTurn: 18, dateStatus: 'orange' },
			],
		},
		{
			dateDay: 4,
			dateWeek: 'saturday',
			dateTurns: [
				{ dateTurn: 0, dateStatus: 'green' },
				{ dateTurn: 6, dateStatus: 'green' },
				{ dateTurn: 12, dateStatus: 'red' },
				{ dateTurn: 18, dateStatus: 'green' },
			],
		},
		{
			dateDay: 5,
			dateWeek: 'sunday',
			dateTurns: [
				{ dateTurn: 0, dateStatus: 'green' },
				{ dateTurn: 6, dateStatus: 'green' },
				{ dateTurn: 12, dateStatus: 'green' },
				{ dateTurn: 18, dateStatus: 'orange' },
			],
		},
		{
			dateDay: 6,
			dateWeek: 'monday',
			dateTurns: [
				{ dateTurn: 0, dateStatus: 'orange' },
				{ dateTurn: 6, dateStatus: 'red' },
				{ dateTurn: 12, dateStatus: 'green' },
				{ dateTurn: 18, dateStatus: 'green' },
			],
		},
		{
			dateDay: 7,
			dateWeek: 'tuesday',
			dateTurns: [
				{ dateTurn: 0, dateStatus: 'green' },
				{ dateTurn: 6, dateStatus: 'green' },
				{ dateTurn: 12, dateStatus: 'green' },
				{ dateTurn: 18, dateStatus: 'green' },
			],
		},
		{
			dateDay: 8,
			dateWeek: 'wednesday',
			dateTurns: [
				{ dateTurn: 0, dateStatus: 'green' },
				{ dateTurn: 6, dateStatus: 'orange' },
				{ dateTurn: 12, dateStatus: 'green' },
				{ dateTurn: 18, dateStatus: 'red' },
			],
		},
		{
			dateDay: 9,
			dateWeek: 'thursday',
			dateTurns: [
				{ dateTurn: 0, dateStatus: 'orange' },
				{ dateTurn: 6, dateStatus: 'green' },
				{ dateTurn: 12, dateStatus: 'green' },
				{ dateTurn: 18, dateStatus: 'green' },
			],
		},
		{
			dateDay: 10,
			dateWeek: 'friday',
			dateTurns: [
				{ dateTurn: 0, dateStatus: 'green' },
				{ dateTurn: 6, dateStatus: 'green' },
				{ dateTurn: 12, dateStatus: 'green' },
				{ dateTurn: 18, dateStatus: 'green' },
			],
		},
		{
			dateDay: 11,
			dateWeek: 'saturday',
			dateTurns: [
				{ dateTurn: 0, dateStatus: 'green' },
				{ dateTurn: 6, dateStatus: 'orange' },
				{ dateTurn: 12, dateStatus: 'green' },
				{ dateTurn: 18, dateStatus: 'green' },
			],
		},
		{
			dateDay: 12,
			dateWeek: 'sunday',
			dateTurns: [
				{ dateTurn: 0, dateStatus: 'red' },
				{ dateTurn: 6, dateStatus: 'green' },
				{ dateTurn: 12, dateStatus: 'orange' },
				{ dateTurn: 18, dateStatus: 'green' },
			],
		},
		{
			dateDay: 13,
			dateWeek: 'monday',
			dateTurns: [
				{ dateTurn: 0, dateStatus: 'green' },
				{ dateTurn: 6, dateStatus: 'green' },
				{ dateTurn: 12, dateStatus: 'green' },
				{ dateTurn: 18, dateStatus: 'orange' },
			],
		},
		{
			dateDay: 14,
			dateWeek: 'thursday',
			dateTurns: [
				{ dateTurn: 0, dateStatus: 'red' },
				{ dateTurn: 6, dateStatus: 'green' },
				{ dateTurn: 12, dateStatus: 'orange' },
				{ dateTurn: 18, dateStatus: 'green' },
			],
		},
		{
			dateDay: 15,
			dateWeek: 'wednesday',
			dateTurns: [
				{ dateTurn: 0, dateStatus: 'green' },
				{ dateTurn: 6, dateStatus: 'green' },
				{ dateTurn: 12, dateStatus: 'green' },
				{ dateTurn: 18, dateStatus: 'orange' },
			],
		},
		{
			dateDay: 16,
			dateWeek: 'thursday',
			dateTurns: [
				{ dateTurn: 0, dateStatus: 'green' },
				{ dateTurn: 6, dateStatus: 'green' },
				{ dateTurn: 12, dateStatus: 'red' },
				{ dateTurn: 18, dateStatus: 'green' },
			],
		},
		{
			dateDay: 17,
			dateWeek: 'friday',
			dateTurns: [
				{ dateTurn: 0, dateStatus: 'green' },
				{ dateTurn: 6, dateStatus: 'green' },
				{ dateTurn: 12, dateStatus: 'green' },
				{ dateTurn: 18, dateStatus: 'green' },
			],
		},
		{
			dateDay: 18,
			dateWeek: 'saturday',
			dateTurns: [
				{ dateTurn: 0, dateStatus: 'green' },
				{ dateTurn: 6, dateStatus: 'green' },
				{ dateTurn: 12, dateStatus: 'orange' },
				{ dateTurn: 18, dateStatus: 'green' },
			],
		},
		{
			dateDay: 19,
			dateWeek: 'sunday',
			dateTurns: [
				{ dateTurn: 0, dateStatus: 'green' },
				{ dateTurn: 6, dateStatus: 'green' },
				{ dateTurn: 12, dateStatus: 'green' },
				{ dateTurn: 18, dateStatus: 'green' },
			],
		},
		{
			dateDay: 20,
			dateWeek: 'monday',
			dateTurns: [
				{ dateTurn: 0, dateStatus: 'orange' },
				{ dateTurn: 6, dateStatus: 'green' },
				{ dateTurn: 12, dateStatus: 'red' },
				{ dateTurn: 18, dateStatus: 'green' },
			],
		},
		{
			dateDay: 21,
			dateWeek: 'thursday',
			dateTurns: [
				{ dateTurn: 0, dateStatus: 'green' },
				{ dateTurn: 6, dateStatus: 'green' },
				{ dateTurn: 12, dateStatus: 'green' },
				{ dateTurn: 18, dateStatus: 'orange' },
			],
		},
		{
			dateDay: 22,
			dateWeek: 'wednesday',
			dateTurns: [
				{ dateTurn: 0, dateStatus: 'green' },
				{ dateTurn: 6, dateStatus: 'orange' },
				{ dateTurn: 12, dateStatus: 'green' },
				{ dateTurn: 18, dateStatus: 'green' },
			],
		},
		{
			dateDay: 23,
			dateWeek: 'thursday',
			dateTurns: [
				{ dateTurn: 0, dateStatus: 'green' },
				{ dateTurn: 6, dateStatus: 'green' },
				{ dateTurn: 12, dateStatus: 'green' },
				{ dateTurn: 18, dateStatus: 'green' },
			],
		},
		{
			dateDay: 24,
			dateWeek: 'friday',
			dateTurns: [
				{ dateTurn: 0, dateStatus: 'green' },
				{ dateTurn: 6, dateStatus: 'green' },
				{ dateTurn: 12, dateStatus: 'orange' },
				{ dateTurn: 18, dateStatus: 'green' },
			],
		},
		{
			dateDay: 25,
			dateWeek: 'saturday',
			dateTurns: [
				{ dateTurn: 0, dateStatus: 'green' },
				{ dateTurn: 6, dateStatus: 'green' },
				{ dateTurn: 12, dateStatus: 'green' },
				{ dateTurn: 18, dateStatus: 'red' },
			],
		},
		{
			dateDay: 26,
			dateWeek: 'sunday',
			dateTurns: [
				{ dateTurn: 0, dateStatus: 'red' },
				{ dateTurn: 6, dateStatus: 'green' },
				{ dateTurn: 12, dateStatus: 'orange' },
				{ dateTurn: 18, dateStatus: 'green' },
			],
		},
		{
			dateDay: 27,
			dateWeek: 'monday',
			dateTurns: [
				{ dateTurn: 0, dateStatus: 'green' },
				{ dateTurn: 6, dateStatus: 'green' },
				{ dateTurn: 12, dateStatus: 'green' },
				{ dateTurn: 18, dateStatus: 'green' },
			],
		},
		{
			dateDay: 28,
			dateWeek: 'thursday',
			dateTurns: [
				{ dateTurn: 0, dateStatus: 'green' },
				{ dateTurn: 6, dateStatus: 'green' },
				{ dateTurn: 12, dateStatus: 'green' },
				{ dateTurn: 18, dateStatus: 'orange' },
			],
		},
		{
			dateDay: 29,
			dateWeek: 'wednesday',
			dateTurns: [
				{ dateTurn: 0, dateStatus: 'green' },
				{ dateTurn: 6, dateStatus: 'orange' },
				{ dateTurn: 12, dateStatus: 'green' },
				{ dateTurn: 18, dateStatus: 'green' },
			],
		},
		{
			dateDay: 30,
			dateWeek: 'thursday',
			dateTurns: [
				{ dateTurn: 0, dateStatus: 'green' },
				{ dateTurn: 6, dateStatus: 'green' },
				{ dateTurn: 12, dateStatus: 'green' },
				{ dateTurn: 18, dateStatus: 'green' },
			],
		},
		{
			dateDay: 31,
			dateWeek: 'friday',
			dateTurns: [
				{ dateTurn: 0, dateStatus: 'green' },
				{ dateTurn: 6, dateStatus: 'green' },
				{ dateTurn: 12, dateStatus: 'green' },
				{ dateTurn: 18, dateStatus: 'green' },
			],
		},
	],
}

const month2 = {
	month: 2,
	year: 2025,
	dates: [
		{
			dateDay: 1,
			dateWeek: 'saturday',
			dateTurns: [
				{ dateTurn: 0, dateStatus: 'green' },
				{ dateTurn: 6, dateStatus: 'green' },
				{ dateTurn: 12, dateStatus: 'green' },
				{ dateTurn: 18, dateStatus: 'green' },
			],
		},
		{
			dateDay: 2,
			dateWeek: 'sunday',
			dateTurns: [
				{ dateTurn: 0, dateStatus: 'green' },
				{ dateTurn: 6, dateStatus: 'orange' },
				{ dateTurn: 12, dateStatus: 'orange' },
				{ dateTurn: 18, dateStatus: 'green' },
			],
		},
		{
			dateDay: 3,
			dateWeek: 'monday',
			dateTurns: [
				{ dateTurn: 0, dateStatus: 'red' },
				{ dateTurn: 6, dateStatus: 'red' },
				{ dateTurn: 12, dateStatus: 'green' },
				{ dateTurn: 18, dateStatus: 'green' },
			],
		},
		{
			dateDay: 4,
			dateWeek: 'tuesday',
			dateTurns: [
				{ dateTurn: 0, dateStatus: 'green' },
				{ dateTurn: 6, dateStatus: 'green' },
				{ dateTurn: 12, dateStatus: 'orange' },
				{ dateTurn: 18, dateStatus: 'green' },
			],
		},
		{
			dateDay: 5,
			dateWeek: 'wednesday',
			dateTurns: [
				{ dateTurn: 0, dateStatus: 'green' },
				{ dateTurn: 6, dateStatus: 'green' },
				{ dateTurn: 12, dateStatus: 'green' },
				{ dateTurn: 18, dateStatus: 'red' },
			],
		},
		{
			dateDay: 6,
			dateWeek: 'thursday',
			dateTurns: [
				{ dateTurn: 0, dateStatus: 'orange' },
				{ dateTurn: 6, dateStatus: 'orange' },
				{ dateTurn: 12, dateStatus: 'green' },
				{ dateTurn: 18, dateStatus: 'green' },
			],
		},
		{
			dateDay: 7,
			dateWeek: 'friday',
			dateTurns: [
				{ dateTurn: 0, dateStatus: 'green' },
				{ dateTurn: 6, dateStatus: 'red' },
				{ dateTurn: 12, dateStatus: 'green' },
				{ dateTurn: 18, dateStatus: 'orange' },
			],
		},
		{
			dateDay: 8,
			dateWeek: 'saturday',
			dateTurns: [
				{ dateTurn: 0, dateStatus: 'green' },
				{ dateTurn: 6, dateStatus: 'green' },
				{ dateTurn: 12, dateStatus: 'red' },
				{ dateTurn: 18, dateStatus: 'green' },
			],
		},
		{
			dateDay: 9,
			dateWeek: 'sunday',
			dateTurns: [
				{ dateTurn: 0, dateStatus: 'red' },
				{ dateTurn: 6, dateStatus: 'green' },
				{ dateTurn: 12, dateStatus: 'green' },
				{ dateTurn: 18, dateStatus: 'orange' },
			],
		},
		{
			dateDay: 10,
			dateWeek: 'monday',
			dateTurns: [
				{ dateTurn: 0, dateStatus: 'orange' },
				{ dateTurn: 6, dateStatus: 'red' },
				{ dateTurn: 12, dateStatus: 'green' },
				{ dateTurn: 18, dateStatus: 'green' },
			],
		},
		{
			dateDay: 11,
			dateWeek: 'tuesday',
			dateTurns: [
				{ dateTurn: 0, dateStatus: 'green' },
				{ dateTurn: 6, dateStatus: 'green' },
				{ dateTurn: 12, dateStatus: 'green' },
				{ dateTurn: 18, dateStatus: 'red' },
			],
		},
		{
			dateDay: 12,
			dateWeek: 'wednesday',
			dateTurns: [
				{ dateTurn: 0, dateStatus: 'green' },
				{ dateTurn: 6, dateStatus: 'orange' },
				{ dateTurn: 12, dateStatus: 'green' },
				{ dateTurn: 18, dateStatus: 'red' },
			],
		},
		{
			dateDay: 13,
			dateWeek: 'thursday',
			dateTurns: [
				{ dateTurn: 0, dateStatus: 'orange' },
				{ dateTurn: 6, dateStatus: 'red' },
				{ dateTurn: 12, dateStatus: 'green' },
				{ dateTurn: 18, dateStatus: 'green' },
			],
		},
		{
			dateDay: 14,
			dateWeek: 'friday',
			dateTurns: [
				{ dateTurn: 0, dateStatus: 'green' },
				{ dateTurn: 6, dateStatus: 'green' },
				{ dateTurn: 12, dateStatus: 'red' },
				{ dateTurn: 18, dateStatus: 'green' },
			],
		},
		{
			dateDay: 15,
			dateWeek: 'saturday',
			dateTurns: [
				{ dateTurn: 0, dateStatus: 'green' },
				{ dateTurn: 6, dateStatus: 'orange' },
				{ dateTurn: 12, dateStatus: 'green' },
				{ dateTurn: 18, dateStatus: 'red' },
			],
		},
		{
			dateDay: 16,
			dateWeek: 'sunday',
			dateTurns: [
				{ dateTurn: 0, dateStatus: 'red' },
				{ dateTurn: 6, dateStatus: 'green' },
				{ dateTurn: 12, dateStatus: 'orange' },
				{ dateTurn: 18, dateStatus: 'green' },
			],
		},
		{
			dateDay: 17,
			dateWeek: 'monday',
			dateTurns: [
				{ dateTurn: 0, dateStatus: 'green' },
				{ dateTurn: 6, dateStatus: 'green' },
				{ dateTurn: 12, dateStatus: 'green' },
				{ dateTurn: 18, dateStatus: 'orange' },
			],
		},
		{
			dateDay: 18,
			dateWeek: 'thursday',
			dateTurns: [
				{ dateTurn: 0, dateStatus: 'red' },
				{ dateTurn: 6, dateStatus: 'green' },
				{ dateTurn: 12, dateStatus: 'orange' },
				{ dateTurn: 18, dateStatus: 'green' },
			],
		},
		{
			dateDay: 19,
			dateWeek: 'wednesday',
			dateTurns: [
				{ dateTurn: 0, dateStatus: 'green' },
				{ dateTurn: 6, dateStatus: 'red' },
				{ dateTurn: 12, dateStatus: 'green' },
				{ dateTurn: 18, dateStatus: 'orange' },
			],
		},
		{
			dateDay: 20,
			dateWeek: 'thursday',
			dateTurns: [
				{ dateTurn: 0, dateStatus: 'green' },
				{ dateTurn: 6, dateStatus: 'green' },
				{ dateTurn: 12, dateStatus: 'red' },
				{ dateTurn: 18, dateStatus: 'green' },
			],
		},
		{
			dateDay: 21,
			dateWeek: 'friday',
			dateTurns: [
				{ dateTurn: 0, dateStatus: 'green' },
				{ dateTurn: 6, dateStatus: 'green' },
				{ dateTurn: 12, dateStatus: 'green' },
				{ dateTurn: 18, dateStatus: 'green' },
			],
		},
		{
			dateDay: 22,
			dateWeek: 'saturday',
			dateTurns: [
				{ dateTurn: 0, dateStatus: 'red' },
				{ dateTurn: 6, dateStatus: 'green' },
				{ dateTurn: 12, dateStatus: 'orange' },
				{ dateTurn: 18, dateStatus: 'green' },
			],
		},
		{
			dateDay: 23,
			dateWeek: 'sunday',
			dateTurns: [
				{ dateTurn: 0, dateStatus: 'green' },
				{ dateTurn: 6, dateStatus: 'green' },
				{ dateTurn: 12, dateStatus: 'green' },
				{ dateTurn: 18, dateStatus: 'green' },
			],
		},
		{
			dateDay: 24,
			dateWeek: 'monday',
			dateTurns: [
				{ dateTurn: 0, dateStatus: 'orange' },
				{ dateTurn: 6, dateStatus: 'green' },
				{ dateTurn: 12, dateStatus: 'red' },
				{ dateTurn: 18, dateStatus: 'green' },
			],
		},
		{
			dateDay: 25,
			dateWeek: 'thursday',
			dateTurns: [
				{ dateTurn: 0, dateStatus: 'green' },
				{ dateTurn: 6, dateStatus: 'red' },
				{ dateTurn: 12, dateStatus: 'green' },
				{ dateTurn: 18, dateStatus: 'orange' },
			],
		},
		{
			dateDay: 26,
			dateWeek: 'wednesday',
			dateTurns: [
				{ dateTurn: 0, dateStatus: 'green' },
				{ dateTurn: 6, dateStatus: 'orange' },
				{ dateTurn: 12, dateStatus: 'red' },
				{ dateTurn: 18, dateStatus: 'green' },
			],
		},
		{
			dateDay: 27,
			dateWeek: 'thursday',
			dateTurns: [
				{ dateTurn: 0, dateStatus: 'red' },
				{ dateTurn: 6, dateStatus: 'green' },
				{ dateTurn: 12, dateStatus: 'green' },
				{ dateTurn: 18, dateStatus: 'green' },
			],
		},
		{
			dateDay: 28,
			dateWeek: 'friday',
			dateTurns: [
				{ dateTurn: 0, dateStatus: 'green' },
				{ dateTurn: 6, dateStatus: 'green' },
				{ dateTurn: 12, dateStatus: 'orange' },
				{ dateTurn: 18, dateStatus: 'green' },
			],
		},
	],
}

interface ProductProps {
	id: string
	name: string
	progress: number
	priority: string
	date: string
}

export default function Product({ id, name, progress, priority, date }: ProductProps) {
	const [isModalOpen, setIsModalOpen] = useState(false)

	return (
		<>
			<div key={id} className='flex flex-col rounded-lg border border-dashed border-zinc-200 bg-white p-4 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800'>
				<div className='flex items-center justify-between'>
					{/* Produto */}
					<div className='flex flex-col'>
						<div className='flex items-center gap-2'>
							<span className='icon-[lucide--folder-git-2] size-5 shrink-0 text-zinc-400'></span>
							<span className='text-lg font-medium'>{name}</span>
						</div>
						<div className='text-sm'>
							{progress}% <span className='text-zinc-300'>•</span>
							{date}
						</div>
					</div>

					{/* Barra de turno */}
					<div className='flex flex-col'>
						<ProductTurn />
					</div>
				</div>
				<div className='mt-1.5 flex items-center justify-between'>
					{/* Modal Trigger */}
					<button onClick={() => setIsModalOpen(true)} className='rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700'>
						{/* Linha do tempo */}
						<ProductTimeline />
					</button>

					{/* Prioridade */}
					<div className='flex items-center text-xs leading-none'>
						{priority == 'urgent' && (
							<div className='inline-block rounded-full bg-red-100 px-4 py-2 dark:bg-red-600'>
								<span className='text-xs font-medium text-nowrap text-red-500 uppercase dark:text-white'>Urgente</span>
							</div>
						)}
						{priority == 'normal' && (
							<div className='inline-block rounded-full bg-orange-100 px-4 py-2 dark:bg-orange-600'>
								<span className='text-xs font-medium text-nowrap text-orange-500 uppercase dark:text-white'>Normal</span>
							</div>
						)}
						{priority == 'low' && (
							<div className='inline-block rounded-full bg-green-200 px-4 py-2 dark:bg-green-700'>
								<span className='text-xs font-medium text-nowrap text-green-600 uppercase dark:text-white'>Baixa</span>
							</div>
						)}
					</div>
				</div>
			</div>
			<Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Detalhes de ${name}`}>
				{/* Calendário do produto */}
				<ProductCalendar calendar={month1} />
				<ProductCalendar calendar={month2} />
			</Modal>
		</>
	)
}
