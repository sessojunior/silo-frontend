'use client'

import { ReportCard } from './ReportCard'

export function ReportsPage() {
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
			id: 'projects',
			title: '📋 Projetos e Atividades',
			description: 'Análise de projetos, progresso e distribuição de tarefas',
			icon: '📁',
			color: 'purple',
			metrics: ['Total de Projetos', 'Atividades', 'Progresso Médio'],
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
					{/* Cards de Relatórios Disponíveis */}
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto'>
						{reports.map((report) => (
							<ReportCard key={report.id} report={report} />
						))}
					</div>
				</div>
			</div>
		</div>
	)
}
