import { NextResponse } from 'next/server'

export async function GET() {
	return NextResponse.json({
		success: true,
		totalProducts: 3,
		avgAvailability: 95.5,
		products: [
			{
				id: '1',
				name: 'Produto Teste 1',
				slug: 'produto-teste-1',
				totalActivities: 10,
				completedActivities: 8,
				activeActivities: 1,
				failedActivities: 1,
				availabilityPercentage: 95.0,
				avgResolutionHours: 2.5,
			},
		],
	})
}
