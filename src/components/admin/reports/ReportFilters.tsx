'use client'

import { useState } from 'react'
import { ReportFilters as ReportFiltersType } from './ReportsPage'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'

interface ReportFiltersProps {
	filters: ReportFiltersType
	onFiltersChange: (filters: ReportFiltersType) => void
}

export function ReportFilters({ filters, onFiltersChange }: ReportFiltersProps) {
	const [isExpanded, setIsExpanded] = useState(false)

	const handleFilterChange = (key: keyof ReportFiltersType, value: string | Date | undefined) => {
		onFiltersChange({
			...filters,
			[key]: value,
		})
	}

	const resetFilters = () => {
		onFiltersChange({
			dateRange: '30d',
		})
	}

	return (
		<div className='bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6'>
			<div className='flex items-center justify-between mb-4'>
				<h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>🔍 Filtros Avançados</h3>
				<Button style='bordered' onClick={() => setIsExpanded(!isExpanded)}>
					{isExpanded ? 'Ocultar Filtros' : 'Mostrar Filtros'}
				</Button>
			</div>

			{/* Filtros Básicos Sempre Visíveis */}
			<div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-4'>
				<div>
					<label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>Período</label>
					<Select
						name='dateRange'
						selected={filters.dateRange}
						onChange={(value) => handleFilterChange('dateRange', value)}
						options={[
							{ label: 'Últimos 7 dias', value: '7d' },
							{ label: 'Últimos 30 dias', value: '30d' },
							{ label: 'Últimos 90 dias', value: '90d' },
							{ label: 'Personalizado', value: 'custom' },
						]}
					/>
				</div>

				{filters.dateRange === 'custom' && (
					<>
						<div>
							<label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>Data Início</label>
							<input type='date' value={filters.startDate?.toISOString().split('T')[0] || ''} onChange={(e) => handleFilterChange('startDate', new Date(e.target.value))} className='block w-full rounded-lg py-3 ps-4 pe-10 border border-zinc-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300' />
						</div>
						<div>
							<label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>Data Fim</label>
							<input type='date' value={filters.endDate?.toISOString().split('T')[0] || ''} onChange={(e) => handleFilterChange('endDate', new Date(e.target.value))} className='block w-full rounded-lg py-3 ps-4 pe-10 border border-zinc-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300' />
						</div>
					</>
				)}
			</div>

			{/* Filtros Avançados (Expansíveis) */}
			{isExpanded && (
				<div className='border-t border-gray-200 dark:border-gray-700 pt-4'>
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
						<div>
							<label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>Produto</label>
							<Select
								name='productId'
								selected={filters.productId || ''}
								onChange={(value) => handleFilterChange('productId', value || undefined)}
								options={[
									{ label: 'Todos os produtos', value: '' },
									{ label: 'Produto 1', value: 'product1' },
									{ label: 'Produto 2', value: 'product2' },
									{ label: 'Produto 3', value: 'product3' },
								]}
							/>
						</div>

						<div>
							<label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>Categoria do Problema</label>
							<Select
								name='problemCategory'
								selected={filters.problemCategory || ''}
								onChange={(value) => handleFilterChange('problemCategory', value || undefined)}
								options={[
									{ label: 'Todas as categorias', value: '' },
									{ label: 'Rede', value: 'network' },
									{ label: 'Servidor', value: 'server' },
									{ label: 'Software', value: 'software' },
									{ label: 'Falha Humana', value: 'human' },
								]}
							/>
						</div>

						<div>
							<label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>Status do Problema</label>
							<Select
								name='problemStatus'
								selected={filters.problemStatus || ''}
								onChange={(value) => handleFilterChange('problemStatus', value || undefined)}
								options={[
									{ label: 'Todos os status', value: '' },
									{ label: 'Aberto', value: 'open' },
									{ label: 'Em Progresso', value: 'in_progress' },
									{ label: 'Resolvido', value: 'resolved' },
									{ label: 'Fechado', value: 'closed' },
								]}
							/>
						</div>

						<div>
							<label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>Prioridade</label>
							<Select
								name='priority'
								selected={filters.priority || ''}
								onChange={(value) => handleFilterChange('priority', value || undefined)}
								options={[
									{ label: 'Todas as prioridades', value: '' },
									{ label: 'Baixa', value: 'low' },
									{ label: 'Média', value: 'medium' },
									{ label: 'Alta', value: 'high' },
									{ label: 'Crítica', value: 'critical' },
								]}
							/>
						</div>
					</div>

					<div className='flex justify-end mt-4 space-x-3'>
						<Button style='bordered' onClick={resetFilters}>
							Limpar Filtros
						</Button>
						<Button style='bordered' onClick={() => setIsExpanded(false)}>
							Aplicar
						</Button>
					</div>
				</div>
			)}
		</div>
	)
}
