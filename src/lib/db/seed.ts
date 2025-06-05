import { randomUUID } from 'crypto'
import { eq } from 'drizzle-orm'

import { db } from '@/lib/db'
import * as schema from '@/lib/db/schema'

const USER_ID = 'a5c0b6e7-2c76-4447-a512-a095fb78e4d7'

const products = [
	{ name: 'BAM', slug: 'bam' },
	{ name: 'SMEC', slug: 'smec' },
	{ name: 'BRAMS AMS 15KM', slug: 'brams-ams-15km' },
	{ name: 'WRF', slug: 'wrf' },
]

const generateLorem = (prefix: string) => {
	return Array.from({ length: 10 }, (_, i) => ({
		title: `${prefix} ${i + 1}: Lorem ipsum dolor sit amet`,
		description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
	}))
}

async function seed() {
	console.log('✅ Iniciando seed...')

	// 1. Produtos
	const existingProducts = await db.select().from(schema.product).limit(1)
	const productMap = new Map<string, string>()

	if (existingProducts.length === 0) {
		console.log('🔄 Inserindo produtos...')
		const inserted = await db
			.insert(schema.product)
			.values(products.map((p) => ({ id: randomUUID(), ...p, available: true })))
			.returning()

		inserted.forEach((p) => productMap.set(p.slug, p.id))
	} else {
		console.log('✅ Produtos já existentes.')
		const all = await db.select().from(schema.product)
		all.forEach((p) => productMap.set(p.slug, p.id))
	}

	for (const { slug } of products) {
		const productId = productMap.get(slug)!

		console.log(`🔄 Inserindo problemas para o produto: ${slug.toUpperCase()}`)

		const problems = generateLorem('Problema')
		const problemRows = problems.map((p) => ({
			id: randomUUID(),
			productId,
			userId: USER_ID,
			title: p.title,
			description: p.description,
			createdAt: new Date(),
			updatedAt: new Date(),
		}))

		const insertedProblems = await db.insert(schema.productProblem).values(problemRows).returning()

		for (const problem of insertedProblems) {
			console.log(`🔄 Inserindo soluções para o problema: ${problem.title}`)

			const solutions = generateLorem('Solução').slice(0, 12) // entre 10 e 15 soluções
			const solutionRows = solutions.map((s) => ({
				id: randomUUID(),
				userId: USER_ID,
				productProblemId: problem.id,
				description: s.description,
				replyId: null,
				createdAt: new Date(),
				updatedAt: new Date(),
			}))

			const insertedSolutions = await db.insert(schema.productSolution).values(solutionRows).returning()

			// Checar a primeira solução
			await db.insert(schema.productSolutionChecked).values({
				id: randomUUID(),
				userId: USER_ID,
				productSolutionId: insertedSolutions[0].id,
			})

			// Adicionar imagens exemplo
			await db.insert(schema.productProblemImage).values([
				{
					id: randomUUID(),
					productProblemId: problem.id,
					image: '/uploads/products/problems/erro1.jpg',
					description: 'Imagem demonstrando o erro',
				},
				{
					id: randomUUID(),
					productProblemId: problem.id,
					image: '/uploads/products/problems/erro2.jpg',
					description: 'Outra imagem do erro',
				},
			])
		}
	}

	console.log('✅ Seed finalizado com sucesso.')
}

seed().catch((err) => {
	console.error('❌ Erro ao rodar o seed:', err)
	process.exit(1)
})
