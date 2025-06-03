'use client'

import React, { useState, useEffect, useCallback } from 'react'
import ProductTable from './components/ProductTable'
import ProductFilter from './components/ProductFilter'
import ProductForm from './components/ProductForm'
import Offcanvas from '@/components/ui/Offcanvas'
import Dialog from '@/components/ui/Dialog'
import { toast } from '@/lib/toast'

interface Product {
	id: string
	name: string
	available: boolean
}

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

	// Carregar produtos (paginado)
	const fetchProducts = useCallback(
		async (reset = false, filterName = filterValue) => {
			setLoading(true)
			try {
				const res = await fetch(`/api/product?page=${reset ? 1 : page}&limit=${PAGE_SIZE}&name=${encodeURIComponent(filterName)}`)
				const data = await res.json()
				if (res.ok) {
					setProducts((prev) => (reset ? data.items : [...prev, ...data.items]))
					setHasMore(data.items.length === PAGE_SIZE)
					setPage((prev) => (reset ? 2 : prev + 1))
				} else {
					toast({ type: 'error', title: 'Erro', description: data.message })
				}
			} catch (e) {
				toast({ type: 'error', title: 'Erro', description: 'Erro ao carregar produtos.' })
			} finally {
				setLoading(false)
			}
		},
		[page, filterValue],
	)

	// Inicial e ao filtrar
	useEffect(() => {
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
			const res = await fetch('/api/product', {
				method: data.id ? 'PUT' : 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(data),
			})
			const resp = await res.json()
			if (res.ok) {
				setOffcanvasOpen(false)
				setEditing(null)
				setPage(1)
				setProducts([])
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
			const res = await fetch(`/api/product?id=${deleting.id}`, { method: 'DELETE' })
			const resp = await res.json()
			if (res.ok) {
				setDialogOpen(false)
				setDeleting(null)
				setPage(1)
				setProducts([])
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
		<div className='max-w-4xl mx-auto py-8'>
			<div className='flex items-center gap-2 mb-4'>
				<button className='px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition' onClick={() => setFilterOpen((v) => !v)}>
					Filtrar
				</button>
				<button className='px-4 py-2 rounded bg-green-600 text-white font-semibold hover:bg-green-700 transition' onClick={handleAdd}>
					Adicionar novo produto
				</button>
			</div>
			{filterOpen && <ProductFilter value={filter} onChange={setFilter} onSubmit={handleFilterSubmit} loading={loading} />}
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
			<Offcanvas
				open={offcanvasOpen}
				onClose={() => {
					setOffcanvasOpen(false)
					setEditing(null)
				}}
				title={editing ? 'Editar produto' : 'Adicionar produto'}
				width='md'
			>
				<ProductForm
					initialData={editing ? editing : undefined}
					onSubmit={handleFormSubmit}
					onCancel={() => {
						setOffcanvasOpen(false)
						setEditing(null)
					}}
					loading={formLoading}
				/>
			</Offcanvas>
			<Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} title='Excluir produto' description='Tem certeza que deseja excluir este produto? Esta ação não poderá ser desfeita.'>
				<div className='flex gap-2 justify-end mt-4'>
					<button onClick={() => setDialogOpen(false)} className='px-4 py-2 rounded bg-zinc-200 text-zinc-700 hover:bg-zinc-300 transition'>
						Cancelar
					</button>
					<button onClick={handleDelete} className='px-4 py-2 rounded bg-red-600 text-white font-semibold hover:bg-red-700 transition' disabled={formLoading}>
						{formLoading ? 'Excluindo...' : 'Excluir'}
					</button>
				</div>
			</Dialog>
		</div>
	)
}
