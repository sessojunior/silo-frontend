'use client'

import { useState } from 'react'
import Dialog from '@/components/ui/Dialog'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'

interface ExportDialogProps {
	isOpen: boolean
	onClose: () => void
	reportType?: 'availability' | 'problems' | 'performance' | 'projects' | 'executive'
	reportData?: Record<string, unknown>
}

interface ExportOptions {
	includeCharts: boolean
	includeTables: boolean
	includeSummary: boolean
	orientation: 'portrait' | 'landscape'
}

export function ExportDialog({ isOpen, onClose, reportType, reportData }: ExportDialogProps) {
	const [format, setFormat] = useState('pdf')
	const [options, setOptions] = useState<ExportOptions>({
		includeCharts: true,
		includeTables: true,
		includeSummary: true,
		orientation: 'portrait',
	})
	const [isExporting, setIsExporting] = useState(false)

	const getReportTitle = () => {
		if (!reportType) return 'Relatório'

		switch (reportType) {
			case 'availability':
				return 'Relatório de Disponibilidade por Produto'
			case 'problems':
				return 'Relatório de Problemas Mais Frequentes'
			case 'performance':
				return 'Relatório de Performance da Equipe'
			case 'projects':
				return 'Relatório de Projetos e Atividades'
			case 'executive':
				return 'Relatório Executivo'
			default:
				return 'Relatório'
		}
	}

	const handleExport = async () => {
		setIsExporting(true)
		try {
			// Simular exportação
			console.log('🔵 Exportando relatório:', reportType, 'em formato:', format)
			console.log('🔵 Opções:', options)
			console.log('🔵 Dados:', reportData)

			await new Promise((resolve) => setTimeout(resolve, 2000)) // Simulação
			console.log('✅ Relatório exportado com sucesso')
			onClose()
		} catch (error) {
			console.log('❌ Erro ao exportar relatório:', error)
		} finally {
			setIsExporting(false)
		}
	}

	const handleOptionChange = (key: keyof ExportOptions, value: boolean | string) => {
		setOptions((prev) => ({
			...prev,
			[key]: value,
		}))
	}

	return (
		<Dialog open={isOpen} onClose={onClose}>
			<div className='fixed inset-0 z-50 flex items-center justify-center'>
				<div className='fixed inset-0 bg-black/50' onClick={onClose} />

				<div className='relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 p-6'>
					{/* Header */}
					<div className='flex items-center justify-between mb-6'>
						<h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>📤 Exportar Relatório</h3>
						<button onClick={onClose} className='text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'>
							<span className='icon-[lucide--x] size-5'></span>
						</button>
					</div>

					{/* Conteúdo */}
					<div className='space-y-6'>
						{/* Título do Relatório */}
						<div>
							<label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>Relatório</label>
							<div className='text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-md'>{getReportTitle()}</div>
						</div>

						{/* Formato de Exportação */}
						<div>
							<label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>Formato</label>
							<Select
								name='format'
								selected={format}
								onChange={setFormat}
								options={[
									{ label: 'PDF (Recomendado)', value: 'pdf' },
									{ label: 'Excel (.xlsx)', value: 'excel' },
									{ label: 'CSV (.csv)', value: 'csv' },
								]}
							/>
						</div>

						{/* Opções de Conteúdo */}
						<div>
							<label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3'>Conteúdo a Incluir</label>
							<div className='space-y-3'>
								<label className='flex items-center'>
									<input type='checkbox' checked={options.includeCharts} onChange={(e) => handleOptionChange('includeCharts', e.target.checked)} className='rounded border-gray-300 text-blue-600 focus:ring-blue-500' />
									<span className='ml-2 text-sm text-gray-700 dark:text-gray-300'>Gráficos e visualizações</span>
								</label>

								<label className='flex items-center'>
									<input type='checkbox' checked={options.includeTables} onChange={(e) => handleOptionChange('includeTables', e.target.checked)} className='rounded border-gray-300 text-blue-600 focus:ring-blue-500' />
									<span className='ml-2 text-sm text-gray-700 dark:text-gray-300'>Tabelas de dados</span>
								</label>

								<label className='flex items-center'>
									<input type='checkbox' checked={options.includeSummary} onChange={(e) => handleOptionChange('includeSummary', e.target.checked)} className='rounded border-gray-300 text-blue-600 focus:ring-blue-500' />
									<span className='ml-2 text-sm text-gray-700 dark:text-gray-300'>Resumo executivo</span>
								</label>
							</div>
						</div>

						{/* Orientação (apenas para PDF) */}
						{format === 'pdf' && (
							<div>
								<label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>Orientação</label>
								<Select
									name='orientation'
									selected={options.orientation}
									onChange={(value) => handleOptionChange('orientation', value)}
									options={[
										{ label: 'Retrato', value: 'portrait' },
										{ label: 'Paisagem', value: 'landscape' },
									]}
								/>
							</div>
						)}
					</div>

					{/* Footer */}
					<div className='flex justify-end space-x-3 mt-8'>
						<Button style='bordered' onClick={onClose} disabled={isExporting}>
							Cancelar
						</Button>
						<Button onClick={handleExport} disabled={isExporting} className='min-w-[100px]'>
							{isExporting ? (
								<span className='flex items-center'>
									<div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
									Exportando...
								</span>
							) : (
								'Exportar'
							)}
						</Button>
					</div>
				</div>
			</div>
		</Dialog>
	)
}
