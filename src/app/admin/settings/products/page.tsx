'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import ProductTable from './components/ProductTable'
import ProductFilter from './components/ProductFilter'
import ProductForm from './components/ProductForm'
import Offcanvas from '@/components/ui/Offcanvas'
import Dialog from '@/components/ui/Dialog'
import { toast } from '@/lib/toast'
import Button from '@/components/ui/Button'
import type { Product } from '@/lib/db/schema'

const PAGE_SIZE = 40

export default function SettingsProductsPage() {
	const [products, setProducts] = useState<Product[]>([])
	const [loading, setLoading] = useState(false)
	const [hasMore, setHasMore] = useState(true)
	const [page, setPage] = useState(1)
	const [filterOpen, setFilterOpen] = useState(false)
	const [filter, setFilter] = useState('')
	const [filterValue, setFilterValue] = useState('')
	const [offcanvasOpen, setOffcanvasOpen] = useState(false)
	const [editing, setEditing] = useState<Product | null>(null)
	const [dialogOpen, setDialogOpen] = useState(false)
	const [deleting, setDeleting] = useState<Product | null>(null)
	const [formLoading, setFormLoading] = useState(false)

	// Ref para controlar se é reset ou scroll
	const isResetRef = useRef(false)

	// Carregar produtos (paginado)
	const fetchProducts = useCallback(
		async (reset = false, filterName = filterValue) => {
			setLoading(true)
			const currentPage = reset ? 1 : page
			try {
				const res = await fetch(`/api/products?page=${currentPage}&limit=${PAGE_SIZE}&name=${encodeURIComponent(filterName)}`)
				const data = await res.json()
				if (res.ok) {
					if (reset) {
						setProducts(data.items)
						setPage(2)
					} else {
						setProducts((prev) => {
							const ids = new Set(prev.map((p) => p.id))
							const novos = data.items.filter((item: Product) => !ids.has(item.id))
							return [...prev, ...novos]
						})
						setPage(currentPage + 1)
					}
					setHasMore(data.items.length === PAGE_SIZE)
				} else {
					toast({ type: 'error', title: 'Erro', description: data.message })
				}
			} catch (e) {
				toast({ type: 'error', title: 'Erro', description: 'Erro ao carregar produtos.' })
			} finally {
				setLoading(false)
			}
		},
		[filterValue, page],
	)

	// Inicial e ao filtrar
	useEffect(() => {
		setLoading(true)
		isResetRef.current = true
		setPage(1)
		fetchProducts(true, filterValue)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [filterValue])

	// Abrir para editar
	function handleEdit(product: Product) {
		setEditing(product)
		setOffcanvasOpen(true)
	}

	// Abrir para criar
	function handleAdd() {
		setEditing(null)
		setOffcanvasOpen(true)
	}

	// Salvar (criar/editar)
	async function handleFormSubmit(data: { id?: string; name: string; available: boolean }) {
		setFormLoading(true)
		try {
			const res = await fetch('/api/products', {
				method: data.id ? 'PUT' : 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(data),
			})
			const resp = await res.json()
			if (res.ok) {
				setOffcanvasOpen(false)
				setEditing(null)
				isResetRef.current = true
				setLoading(true)
				setPage(1)
				fetchProducts(true)
			} else {
				throw new Error(resp.message)
			}
		} catch (e: any) {
			toast({ type: 'error', title: 'Erro', description: e.message || 'Erro ao salvar produto.' })
		} finally {
			setFormLoading(false)
		}
	}

	// Excluir
	async function handleDelete() {
		if (!deleting) return
		setFormLoading(true)
		try {
			const res = await fetch(`/api/products?id=${deleting.id}`, { method: 'DELETE' })
			const resp = await res.json()
			if (res.ok) {
				setDialogOpen(false)
				setDeleting(null)
				isResetRef.current = true
				setLoading(true)
				setPage(1)
				fetchProducts(true)
				toast({ type: 'success', title: 'Produto excluído' })
			} else {
				throw new Error(resp.message)
			}
		} catch (e: any) {
			toast({ type: 'error', title: 'Erro', description: e.message || 'Erro ao excluir produto.' })
		} finally {
			setFormLoading(false)
		}
	}

	// Filtro
	function handleFilterSubmit() {
		setFilterValue(filter)
	}

	return (
		<>
			{/* Cabecalho */}
			<div className='flex w-full'>
				<div className='flex w-full flex-wrap items-start justify-between gap-4 sm:flex-nowrap'>
					{/* Título e descrição */}
					<div className='flex-grow'>
						<h1 className='text-3xl font-bold tracking-tight'>Produtos & tasks</h1>
						<p className='mt-1 text-base text-muted-foreground'>Lista de produtos e tasks cadastrados no sistema.</p>
					</div>

					{/* Botões */}
					<div className='flex gap-2 shrink-0'>
						<Button onClick={() => setFilterOpen((v) => !v)} icon='icon-[lucide--filter]' className='shrink-0'>
							Filtrar
						</Button>
						<Button type='submit' icon='icon-[lucide--plus]' onClick={handleAdd} className='shrink-0'>
							Novo produto
						</Button>
					</div>
				</div>
			</div>

			{/* Conteúdo principal */}
			<div className='w-full'>
				{/* Tabela de Produtos */}
				<div className='w-full'>
					{/* Filtro (condicional) */}
					{filterOpen && (
						<div className='mb-4'>
							<ProductFilter value={filter} onChange={setFilter} onSubmit={handleFilterSubmit} loading={loading} />
						</div>
					)}

					<ProductTable
						products={products}
						onEdit={handleEdit}
						onDelete={(product) => {
							setDeleting(product)
							setDialogOpen(true)
						}}
						onLoadMore={() => {
							if (!loading && hasMore) fetchProducts()
						}}
						loading={loading}
						hasMore={hasMore}
					/>
				</div>

				{/* Offcanvas para formulário */}
				<Offcanvas
					open={offcanvasOpen}
					onClose={() => {
						setOffcanvasOpen(false)
						setEditing(null)
					}}
					title={
						<div className='flex items-center gap-2'>
							<span className={`icon-[lucide--${editing ? 'pencil' : 'plus'}] size-4`} />
							{editing ? 'Editar produto' : 'Adicionar produto'}
						</div>
					}
					width='md'
				>
					<ProductForm
						initialData={editing || undefined}
						onSubmit={handleFormSubmit}
						onCancel={() => {
							setOffcanvasOpen(false)
							setEditing(null)
						}}
						loading={formLoading}
					/>
				</Offcanvas>

				{/* Dialog de confirmação */}
				<Dialog
					open={dialogOpen}
					onClose={() => setDialogOpen(false)}
					title={
						<div className='flex items-center gap-2 text-red-600'>
							<span className='icon-[lucide--triangle-alert] size-4' />
							Excluir produto
						</div>
					}
					description='Tem certeza que deseja excluir este produto? Esta ação não poderá ser desfeita.'
				>
					<div className='flex gap-2 justify-end mt-6'>
						<button onClick={() => setDialogOpen(false)} className='px-4 py-2 rounded-lg bg-zinc-200 text-zinc-700 hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-600 transition'>
							Cancelar
						</button>
						<button onClick={handleDelete} className='px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition disabled:opacity-50' disabled={formLoading}>
							{formLoading ? 'Excluindo...' : 'Excluir'}
						</button>
					</div>
				</Dialog>
			</div>
		</>
	)
}
