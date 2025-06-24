import { NextResponse } from 'next/server'

import { db } from '@/lib/db'
import { project, projectTask } from '@/lib/db/schema'
import { eq, inArray } from 'drizzle-orm'

// Retorna lista de projetos ativos com percentuais de conclusão das tarefas
export async function GET() {
	try {
		// Buscar projetos com status 'active'
		const projects = await db.select().from(project).where(eq(project.status, 'active'))
		if (projects.length === 0) return NextResponse.json([])

		const projectIds = projects.map((p) => p.id)

		// Buscar tarefas associadas
		const tasks = await db.select({ id: projectTask.id, projectId: projectTask.projectId, status: projectTask.status, startDate: projectTask.startDate }).from(projectTask).where(inArray(projectTask.projectId, projectIds))

		// Agrupar tarefas por projeto
		const summary = new Map<string, { total: number; done: number }>()
		for (const pId of projectIds) summary.set(pId, { total: 0, done: 0 })

		for (const t of tasks) {
			const s = summary.get(t.projectId)
			if (!s) continue
			s.total++
			if (t.status === 'done') s.done++
		}

		// Montar resposta
		const today = new Date()
		const result = projects.map((p) => {
			const agg = summary.get(p.id) || { total: 0, done: 0 }
			const progress = agg.total > 0 ? Math.round((agg.done / agg.total) * 100) : 0

			let daysElapsed = ''
			if (p.startDate) {
				const diffMs = today.getTime() - new Date(p.startDate as unknown as string).getTime()
				const diffDays = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)))
				daysElapsed = `${diffDays} dias`
			}

			return {
				projectId: p.id,
				name: p.name,
				shortDescription: p.shortDescription,
				progress,
				time: daysElapsed,
			}
		})

		return NextResponse.json(result)
	} catch (error) {
		console.error('❌ Erro ao obter progresso dos projetos:', error)
		return NextResponse.json({ success: false, error: 'Erro ao obter progresso dos projetos' }, { status: 500 })
	}
}
