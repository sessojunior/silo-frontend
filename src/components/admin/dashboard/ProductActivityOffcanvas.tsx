import { useEffect, useState } from 'react'
import Offcanvas from '@/components/ui/Offcanvas'
import Label from '@/components/ui/Label'
import Select, { SelectOption } from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import { toast } from '@/lib/toast'
import { formatDateBR } from '@/lib/dateUtils'
import { NO_INCIDENTS_CATEGORY_ID, isRealIncident } from '@/lib/constants'
import IncidentManagementOffcanvas from './IncidentManagementOffcanvas'

interface Props {
	open: boolean
	onClose: () => void
	productId: string
	productName: string
	date: string
	turn: number
	existingId?: string | null
	initialStatus?: string
	initialDescription?: string | null
	initialCategoryId?: string | null
	onSaved?: () => void
	onAddSaveLog?: (step: string, details: unknown, success?: boolean, error?: string) => void
}

const STATUS_OPTIONS: SelectOption[] = [
	{ label: 'Concluído', value: 'completed' },
	{ label: 'Aguardando', value: 'waiting' },
	{ label: 'Em execução', value: 'in_progress' },
	{ label: 'Pendente', value: 'pending' },
	{ label: 'Sob intervenção', value: 'under_support' },
	{ label: 'Suspenso', value: 'suspended' },
	{ label: 'Não rodou', value: 'not_run' },
	{ label: 'Com problemas', value: 'with_problems' },
	{ label: 'Rodar novamente', value: 'run_again' },
]

const INCIDENT_STATUS = new Set(['pending', 'under_support', 'suspended', 'not_run', 'with_problems', 'run_again'])

export default function ProductActivityOffcanvas({ open, onClose, productId, productName, date, turn, existingId = null, initialStatus = 'completed', initialDescription = '', initialCategoryId = null, onSaved, onAddSaveLog }: Props) {
	const [status, setStatus] = useState<string>(initialStatus)
	const [description, setDescription] = useState<string>(initialDescription || '')
	const [incidentId, setIncidentId] = useState<string | null>(initialCategoryId || null)
	const [incidents, setIncidents] = useState<SelectOption[]>([])
	const [allIncidents, setAllIncidents] = useState<SelectOption[]>([])
	const [loading, setLoading] = useState(false)
	const [incidentManagementOpen, setIncidentManagementOpen] = useState(false)

	useEffect(() => {
		if (open) {
			// reset fields when reopened
			setStatus(initialStatus)
			setDescription(initialDescription || '')
			setIncidentId(initialCategoryId || null)
		}
	}, [open, initialStatus, initialDescription, initialCategoryId])

	// Carregar incidentes quando o offcanvas abre
	useEffect(() => {
		if (open) {
			loadIncidents()
		}
	}, [open])

	// Atualizar opções de incidentes quando o status mudar
	useEffect(() => {
		if (allIncidents.length > 0) {
			updateIncidentsForStatus(allIncidents, status)

			// Se o status não for "Concluído" e o incidente selecionado for "Não houve incidentes",
			// limpar a seleção
			if (status !== 'completed' && incidentId === NO_INCIDENTS_CATEGORY_ID) {
				setIncidentId(null)
			}
		}
	}, [status, allIncidents])

	const loadIncidents = async () => {
		try {
			const response = await fetch('/api/admin/incidents', {
				credentials: 'include',
				headers: { 'Content-Type': 'application/json' },
			})

			if (response.status === 401) {
				throw new Error('Usuário não autenticado')
			}
			if (!response.ok) {
				throw new Error(`HTTP ${response.status}`)
			}

			const data = await response.json()
			if (data.success && data.data) {
				const incidentOptions = [
					{ label: 'Não houve incidentes', value: NO_INCIDENTS_CATEGORY_ID },
					...data.data.map((incident: { name: string; id: string }) => ({
						label: incident.name,
						value: incident.id,
					})),
				]
				setAllIncidents(incidentOptions)
				updateIncidentsForStatus(incidentOptions, status)
			} else {
				const defaultOptions = [{ label: 'Não houve incidentes', value: NO_INCIDENTS_CATEGORY_ID }]
				setAllIncidents(defaultOptions)
				updateIncidentsForStatus(defaultOptions, status)
			}
		} catch (error) {
			console.error('❌ Erro ao carregar incidentes:', error)
			// Manter opção padrão
			const defaultOptions = [{ label: 'Não houve incidentes', value: NO_INCIDENTS_CATEGORY_ID }]
			setAllIncidents(defaultOptions)
			updateIncidentsForStatus(defaultOptions, status)
		}
	}

	const updateIncidentsForStatus = (allOptions: SelectOption[], currentStatus: string) => {
		// Se o status for "Concluído", incluir "Não houve incidentes"
		// Caso contrário, filtrar essa opção
		if (currentStatus === 'completed') {
			setIncidents(allOptions)
		} else {
			setIncidents(allOptions.filter((option) => option.value !== NO_INCIDENTS_CATEGORY_ID))
		}
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		onAddSaveLog?.('Iniciando salvamento', {
			productId,
			date,
			turn,
			status,
			description,
			incidentId,
			existingId,
		})

		// validate
		if (INCIDENT_STATUS.has(status) && !incidentId) {
			toast({ type: 'error', title: 'Selecione o incidente' })
			return
		}

		// Validação: se há incidente real selecionado, descrição é obrigatória
		if (hasRealIncident && !description.trim()) {
			toast({ type: 'error', title: 'Descrição de incidentes é obrigatória quando um incidente é selecionado' })
			return
		}

		setLoading(true)
		try {
			const payload: { productId: string; date: string; turn: number; status: string; description: string; problemCategoryId: string | null; id?: string } = {
				productId,
				date,
				turn,
				status,
				description,
				problemCategoryId: incidentId,
			}
			const url = '/api/admin/products/activities'
			let method: 'POST' | 'PUT' = 'POST'
			if (existingId) {
				method = 'PUT'
				payload.id = existingId
			}

			onAddSaveLog?.('Enviando requisição', {
				method,
				url,
				payload,
			})

			const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
			const json = await res.json()

			onAddSaveLog?.('Resposta da API', {
				status: res.status,
				ok: res.ok,
				json,
			})

			if (res.ok && json.success) {
				const action = json.action ?? (existingId ? 'updated' : 'created')
				onAddSaveLog?.(
					'Salvamento bem-sucedido',
					{
						action,
					},
					true,
				)
				toast({ type: 'success', title: action === 'updated' ? 'Acontecimento atualizado' : 'Acontecimento criado' })
				onClose()
				onSaved?.()
			} else {
				onAddSaveLog?.(
					'Erro no salvamento',
					{
						message: json.message,
					},
					false,
					json.message,
				)
				toast({ type: 'error', title: json.message || 'Erro' })
			}
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
			onAddSaveLog?.(
				'Erro na requisição',
				{
					error: errorMessage,
				},
				false,
				errorMessage,
			)
			toast({ type: 'error', title: 'Erro na requisição' })
		} finally {
			setLoading(false)
		}
	}

	const requireIncident = INCIDENT_STATUS.has(status)
	const hasRealIncident = isRealIncident(incidentId)

	return (
		<Offcanvas open={open} onClose={onClose} title='Editar acontecimentos no turno' side='right' width='lg' zIndex={80}>
			{/* Bloco de contexto mais elegante */}
			<div className='mb-6 flex items-center gap-4 rounded-lg border border-blue-200 bg-blue-50/50 p-4 dark:border-blue-700/50 dark:bg-blue-950/20'>
				<div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-800 dark:text-blue-300'>
					<span className='icon-[lucide--calendar-clock] size-6'></span>
				</div>
				<div className='flex flex-col'>
					<span className='text-lg font-semibold text-blue-900 dark:text-blue-100'>{productName}</span>
					<div className='flex items-center gap-3 text-sm text-blue-700 dark:text-blue-300'>
						<span className='flex items-center gap-1'>
							<span className='icon-[lucide--calendar-days] size-4'></span>
							{formatDateBR(date)}
						</span>
						<span className='flex items-center gap-1'>
							<span className='icon-[lucide--clock] size-4'></span>
							{turn}h
						</span>
					</div>
				</div>
			</div>

			<form onSubmit={handleSubmit} className='flex flex-col gap-4'>
				<div>
					<Label required>Status</Label>
					<Select name='status' options={STATUS_OPTIONS} selected={status} onChange={setStatus} placeholder='Selecione o status' required />
				</div>
				<div>
					<div className='flex gap-2'>
						<div className='flex-1'>
							<Label required={requireIncident}>Incidentes</Label>
							<div className='flex items-center gap-2'>
								<Select name='incident' options={incidents} selected={incidentId ?? undefined} onChange={setIncidentId} placeholder='Selecione o incidente' required={requireIncident} />
								<Button icon='icon-[lucide--settings]' type='button' style='bordered' onClick={() => setIncidentManagementOpen(true)} className='px-3 py-3 h-12' title='Gerenciar incidentes'></Button>
							</div>
						</div>
					</div>
				</div>
				{hasRealIncident && (
					<div>
						<Label required>Descrição de incidentes</Label>
						<textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className='block w-full rounded-lg border border-zinc-200 dark:border-zinc-700 px-4 py-3 dark:bg-zinc-900 dark:text-zinc-200' placeholder='Descreva os detalhes do incidente...' />
					</div>
				)}
				<div className='flex justify-end gap-2'>
					<Button style='bordered' type='button' onClick={onClose}>
						Cancelar
					</Button>
					<Button type='submit' disabled={loading}>
						{loading ? 'Salvando...' : 'Salvar'}
					</Button>
				</div>
			</form>

			{/* Offcanvas de gerenciamento de incidentes */}
			<IncidentManagementOffcanvas
				open={incidentManagementOpen}
				onClose={() => setIncidentManagementOpen(false)}
				onIncidentUpdated={() => {
					loadIncidents()
					onSaved?.()
				}}
			/>
		</Offcanvas>
	)
}
