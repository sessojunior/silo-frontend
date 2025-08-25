import { NextResponse } from 'next/server'

export async function GET() {
	return NextResponse.json({
		success: true,
		totalProblems: 5,
		avgResolutionHours: 3.2,
		topProblems: [
			{
				id: '1',
				title: 'Problema de Conectividade',
				description: 'Falha na conexão com servidor',
				createdAt: '2024-01-15T10:00:00Z',
				updatedAt: '2024-01-15T14:00:00Z',
				product: {
					name: 'Sistema A',
					slug: 'sistema-a',
				},
				category: {
					name: 'Rede externa',
					color: '#ef4444',
				},
				reportedBy: 'João Silva',
				solutionsCount: 3,
				avgResolutionHours: 4.0,
			},
		],
		problemsByCategory: [
			{
				id: '1',
				name: 'Rede externa',
				color: '#ef4444',
				problemsCount: 15,
				avgResolutionHours: 3.5,
			},
			{
				id: '2',
				name: 'Rede interna',
				color: '#f59e0b',
				problemsCount: 8,
				avgResolutionHours: 2.1,
			},
			{
				id: '3',
				name: 'Erro no software',
				color: '#8b5cf6',
				problemsCount: 12,
				avgResolutionHours: 1.8,
			},
		],
		problemsByProduct: [
			{
				id: '1',
				name: 'Sistema A',
				slug: 'sistema-a',
				problemsCount: 10,
				resolvedCount: 8,
				resolutionRate: 80.0,
			},
		],
	})
}
