import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { projectKanban, projectKanbanConfig, projectTask, project, projectActivity } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getAuthUser } from '@/lib/auth/token'

// Função para sincronizar task.status com posição no kanban
async function syncTaskWithKanban(taskId: string, newStatus: 'todo' | 'in_progress' | 'blocked' | 'review' | 'done') {
	try {
		// Mapear status do kanban para status da task
		const statusMapping = {
			todo: 'todo',
			in_progress: 'progress',
			blocked: 'blocked',
			review: 'progress',
			done: 'done',
		} as const

		const taskStatus = statusMapping[newStatus] || 'todo'

		await db
			.update(projectTask)
			.set({
				status: taskStatus,
				updatedAt: new Date(),
			})
			.where(eq(projectTask.id, taskId))

		console.log(`✅ Task ${taskId} sincronizada com status: ${taskStatus}`)
	} catch (error) {
		console.error(`❌ Erro ao sincronizar task ${taskId}:`, error)
	}
}

// Função para sincronizar kanban com task.status (removida - não está sendo usada)
// Esta função foi substituída pela sincronização direta na movimentação

// Interface para estrutura do Kanban
interface KanbanCard {
	projectTaskId: string
	status: 'default' | 'done'
	order: number
}

interface KanbanColumn {
	type: 'todo' | 'in_progress' | 'blocked' | 'review' | 'done'
	order: number
	cards: KanbanCard[]
}

interface KanbanConfigColumn {
	isVisible: boolean
	order: number
	type: 'todo' | 'in_progress' | 'blocked' | 'review' | 'done'
	statusAvailable: string[]
	name: string
	color: string
	icon: string
	limitWip: number
	blockWipReached: boolean
}

// GET /api/projects/[id]/kanban - Buscar configuração e dados do kanban
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		console.log('🔵 GET /api/projects/[id]/kanban')

		// Verificar autenticação
		const user = await getAuthUser()
		if (!user) {
			return NextResponse.json({ success: false, error: 'Usuário não autenticado' }, { status: 401 })
		}

		const { id: projectId } = await params

		// Verificar se o projeto existe
		const existingProject = await db.select().from(project).where(eq(project.id, projectId)).limit(1)

		if (existingProject.length === 0) {
			console.log('❌ Projeto não encontrado:', projectId)
			return NextResponse.json({ success: false, error: 'Projeto não encontrado' }, { status: 404 })
		}

		// Buscar configuração do kanban
		const kanbanConfig = await db.select().from(projectKanbanConfig).where(eq(projectKanbanConfig.projectId, projectId)).limit(1)

		// Buscar dados do kanban
		const kanbanData = await db.select().from(projectKanban).where(eq(projectKanban.projectId, projectId)).limit(1)

		// Buscar todas as tarefas do projeto
		const tasks = await db
			.select({
				id: projectTask.id,
				projectId: projectTask.projectId,
				projectActivityId: projectTask.projectActivityId,
				name: projectTask.name,
				description: projectTask.description,
				category: projectTask.category,
				estimatedDays: projectTask.estimatedDays,
				startDate: projectTask.startDate,
				endDate: projectTask.endDate,
				priority: projectTask.priority,
				status: projectTask.status,
				createdAt: projectTask.createdAt,
				updatedAt: projectTask.updatedAt,
				activityName: projectActivity.name,
			})
			.from(projectTask)
			.leftJoin(projectActivity, eq(projectTask.projectActivityId, projectActivity.id))
			.where(eq(projectTask.projectId, projectId))
			.orderBy(projectTask.createdAt)

		// Configuração padrão do kanban se não existir
		const defaultConfig: KanbanConfigColumn[] = [
			{
				isVisible: true,
				order: 0,
				type: 'todo',
				statusAvailable: ['default'],
				name: 'A Fazer',
				color: 'blue',
				icon: 'icon-[lucide--circle]',
				limitWip: 20,
				blockWipReached: false,
			},
			{
				isVisible: true,
				order: 1,
				type: 'in_progress',
				statusAvailable: ['default'],
				name: 'Em Progresso',
				color: 'yellow',
				icon: 'icon-[lucide--play-circle]',
				limitWip: 5,
				blockWipReached: true,
			},
			{
				isVisible: true,
				order: 2,
				type: 'blocked',
				statusAvailable: ['default'],
				name: 'Bloqueado',
				color: 'red',
				icon: 'icon-[lucide--alert-circle]',
				limitWip: 10,
				blockWipReached: false,
			},
			{
				isVisible: true,
				order: 3,
				type: 'review',
				statusAvailable: ['default'],
				name: 'Em Revisão',
				color: 'orange',
				icon: 'icon-[lucide--eye]',
				limitWip: 3,
				blockWipReached: true,
			},
			{
				isVisible: true,
				order: 4,
				type: 'done',
				statusAvailable: ['default', 'done'],
				name: 'Concluído',
				color: 'green',
				icon: 'icon-[lucide--check-circle]',
				limitWip: 100,
				blockWipReached: false,
			},
		]

		// Dados padrão do kanban se não existir
		let defaultKanbanData: KanbanColumn[] = [
			{ type: 'todo', order: 0, cards: [] },
			{ type: 'in_progress', order: 1, cards: [] },
			{ type: 'blocked', order: 2, cards: [] },
			{ type: 'review', order: 3, cards: [] },
			{ type: 'done', order: 4, cards: [] },
		]

		// ⚠️ CORREÇÃO CRÍTICA: Se não há dados do kanban, distribuir tasks automaticamente
		if (kanbanData.length === 0 && tasks.length > 0) {
			console.log('🔧 Nenhum dado kanban encontrado - distribuindo tasks automaticamente')

			const columnTypes: ('todo' | 'in_progress' | 'blocked' | 'review' | 'done')[] = ['todo', 'in_progress', 'blocked', 'review', 'done']

			// Distribuir tasks igualmente entre as colunas
			tasks.forEach((task, index) => {
				const columnType = columnTypes[index % columnTypes.length]
				const column = defaultKanbanData.find((col) => col.type === columnType)

				if (column) {
					column.cards.push({
						projectTaskId: task.id,
						status: 'default',
						order: column.cards.length,
					})
					console.log(`  📌 Task "${task.name}" adicionada à coluna "${columnType}"`)
				}
			})

			// Salvar a distribuição automática no banco para persistir
			try {
				await db.insert(projectKanban).values({
					projectId,
					columns: JSON.stringify(defaultKanbanData),
				})
				console.log('✅ Distribuição automática salva no banco')
			} catch (insertError) {
				console.error('⚠️ Erro ao salvar distribuição automática:', insertError)
				// Continuar mesmo se não conseguir salvar
			}
		}

		console.log('✅ Dados do kanban carregados - Tarefas:', tasks.length)

		return NextResponse.json({
			success: true,
			config: kanbanConfig.length > 0 ? JSON.parse(kanbanConfig[0].columns) : defaultConfig,
			columns: kanbanData.length > 0 ? JSON.parse(kanbanData[0].columns) : defaultKanbanData,
			tasks,
			refreshAfterSeconds: kanbanConfig.length > 0 ? kanbanConfig[0].refreshAfterSeconds : 30,
			blockWipReached: kanbanConfig.length > 0 ? kanbanConfig[0].blockWipReached : false,
		})
	} catch (error) {
		console.error('❌ Erro ao buscar dados do kanban:', error)
		return NextResponse.json({ success: false, error: 'Erro interno do servidor' }, { status: 500 })
	}
}

// PUT /api/projects/[id]/kanban - Salvar configuração ou movimentação do kanban
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		console.log('🔵 PUT /api/projects/[id]/kanban')

		// Verificar autenticação
		const user = await getAuthUser()
		if (!user) {
			return NextResponse.json({ success: false, error: 'Usuário não autenticado' }, { status: 401 })
		}

		const { id: projectId } = await params
		const body = await request.json()

		// Verificar se o projeto existe
		const existingProject = await db.select().from(project).where(eq(project.id, projectId)).limit(1)

		if (existingProject.length === 0) {
			console.log('❌ Projeto não encontrado:', projectId)
			return NextResponse.json({ success: false, error: 'Projeto não encontrado' }, { status: 404 })
		}

		if (body.type === 'config') {
			// Salvar configuração do kanban
			const { config, refreshAfterSeconds, blockWipReached } = body

			// Verificar se já existe configuração
			const existingConfig = await db.select().from(projectKanbanConfig).where(eq(projectKanbanConfig.projectId, projectId)).limit(1)

			if (existingConfig.length > 0) {
				// Atualizar configuração existente
				await db
					.update(projectKanbanConfig)
					.set({
						columns: JSON.stringify(config),
						refreshAfterSeconds: refreshAfterSeconds || 30,
						blockWipReached: blockWipReached || false,
						updatedAt: new Date(),
					})
					.where(eq(projectKanbanConfig.projectId, projectId))

				console.log('✅ Configuração do kanban atualizada')
			} else {
				// Criar nova configuração
				await db.insert(projectKanbanConfig).values({
					projectId,
					columns: JSON.stringify(config),
					refreshAfterSeconds: refreshAfterSeconds || 30,
					blockWipReached: blockWipReached || false,
				})

				console.log('✅ Configuração do kanban criada')
			}

			return NextResponse.json({ success: true })
		} else if (body.type === 'columns') {
			// Salvar dados das colunas (movimentação de cards)
			const { columns } = body

			// SINCRONIZAÇÃO DUPLA: Atualizar status das tasks baseado na nova posição
			for (const column of columns) {
				for (const card of column.cards) {
					// Sincronizar task.status com a coluna atual
					await syncTaskWithKanban(card.projectTaskId, column.type)
				}
			}

			// Verificar se já existem dados do kanban
			const existingKanban = await db.select().from(projectKanban).where(eq(projectKanban.projectId, projectId)).limit(1)

			if (existingKanban.length > 0) {
				// Atualizar dados existentes
				await db
					.update(projectKanban)
					.set({
						columns: JSON.stringify(columns),
						updatedAt: new Date(),
					})
					.where(eq(projectKanban.projectId, projectId))

				console.log('✅ Dados do kanban atualizados com sincronização dupla')
			} else {
				// Criar novos dados
				await db.insert(projectKanban).values({
					projectId,
					columns: JSON.stringify(columns),
				})

				console.log('✅ Dados do kanban criados com sincronização dupla')
			}

			return NextResponse.json({ success: true })
		} else {
			return NextResponse.json({ success: false, error: 'Tipo de operação inválido' }, { status: 400 })
		}
	} catch (error) {
		console.error('❌ Erro ao salvar dados do kanban:', error)
		return NextResponse.json({ success: false, error: 'Erro interno do servidor' }, { status: 500 })
	}
}
