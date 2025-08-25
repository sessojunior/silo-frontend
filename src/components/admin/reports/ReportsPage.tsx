'use client'

import { useState } from 'react'
import { ReportCard } from './ReportCard'
import { ReportFilters } from './ReportFilters'

export interface ReportFilters {
	dateRange: '7d' | '30d' | '90d' | 'custom'
	startDate?: Date
	endDate?: Date
	productId?: string
	productCategory?: string
	problemCategory?: string
	problemStatus?: string
	userId?: string
	userGroup?: string
	priority?: 'low' | 'medium' | 'high' | 'critical'
}

const defaultFilters: ReportFilters = {
	dateRange: '30d',
}

export function ReportsPage() {
	const [filters, setFilters] = useState<ReportFilters>(defaultFilters)

	const reports = [
		{
			id: 'availability',
			title: '📈 Disponibilidade por Produto',
			description: 'Métricas de uptime, tempo de resposta e falhas por período',
			icon: '📊',
			color: 'blue',
			metrics: ['Uptime %', 'Tempo de Resposta', 'Falhas por Período'],
		},
		{
			id: 'problems',
			title: '🚨 Problemas Mais Frequentes',
			description: 'Top problemas, frequência e tempo de resolução',
			icon: '📋',
			color: 'red',
			metrics: ['Top 10 Problemas', 'Frequência', 'Tempo de Resolução'],
		},
		{
			id: 'performance',
			title: '👥 Performance da Equipe',
			description: 'Métricas de resolução, satisfação e ranking por usuário',
			icon: '🏆',
			color: 'green',
			metrics: ['Problemas Resolvidos', 'Tempo Médio', 'Satisfação'],
		},
		{
			id: 'executive',
			title: '🎯 Relatório Executivo',
			description: 'Visão consolidada de todos os sistemas e KPIs principais',
			icon: '📈',
			color: 'purple',
			metrics: ['KPIs Principais', 'Visão Geral', 'Tendências'],
		},
	]

	return (
		<div className='min-h-screen w-full'>
			{/* Cabeçalho fixo */}
			<div className='p-6 border-b border-zinc-200 dark:border-zinc-700'>
				<h1 className='text-3xl font-bold text-gray-900 dark:text-gray-100'>📊 Relatórios Avançados</h1>
				<p className='mt-2 text-gray-600 dark:text-gray-400'>Sistema completo de relatórios e análises do CPTEC</p>
			</div>

			{/* Conteúdo com scroll natural */}
			<div className='p-6'>
				<div className='max-w-7xl mx-auto space-y-6'>
					{/* Filtros Globais */}
					<ReportFilters filters={filters} onFiltersChange={setFilters} />

					{/* Cards de Relatórios Disponíveis */}
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
						{reports.map((report) => (
							<ReportCard key={report.id} report={report} filters={filters} />
						))}
					</div>
				</div>
			</div>
		</div>
	)
}
