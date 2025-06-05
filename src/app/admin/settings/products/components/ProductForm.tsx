import React, { useState } from 'react'
import Switch from '@/components/ui/Switch'
import { toast } from '@/lib/toast'

interface ProductFormProps {
	initialData?: { id?: string; name: string; slug: string; available: boolean }
	onSubmit: (data: { id?: string; name: string; slug: string; available: boolean }) => Promise<void>
	onCancel: () => void
	loading: boolean
}

export default function ProductForm({ initialData, onSubmit, onCancel, loading }: ProductFormProps) {
	const [name, setName] = useState(initialData?.name || '')
	const [slug, setSlug] = useState(initialData?.slug || '')
	const [available, setAvailable] = useState(initialData?.available ?? true)
	const [error, setError] = useState<string | null>(null)

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault()
		if (name.trim().length < 2) {
			setError('O nome deve possuir ao menos dois caracteres.')
			return
		}
		setError(null)
		try {
			await onSubmit({ id: initialData?.id, name: name.trim(), slug: slug.trim(), available })
			toast({ type: 'success', title: initialData ? 'Produto atualizado' : 'Produto criado' })
		} catch (err: any) {
			toast({ type: 'error', title: 'Erro', description: err?.message || 'Erro ao salvar produto.' })
		}
	}

	return (
		<form onSubmit={handleSubmit} className='space-y-6'>
			<div>
				<label htmlFor='product-name' className='block text-sm font-medium text-zinc-700 dark:text-zinc-200 mb-1'>
					Nome
				</label>
				<input id='product-name' type='text' className='block w-full rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500' value={name} onChange={(e) => setName(e.target.value)} minLength={2} required disabled={loading} />
				{error && <p className='mt-1 text-xs text-red-500'>{error}</p>}
			</div>
			<div>
				<label htmlFor='product-slug' className='block text-sm font-medium text-zinc-700 dark:text-zinc-200 mb-1'>
					Slug
				</label>
				<input id='product-slug' type='text' className='block w-full rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500' value={slug} onChange={(e) => setSlug(e.target.value)} minLength={2} required disabled={loading} />
			</div>
			<div>
				<Switch id='product-available' name='available' checked={available} onChange={setAvailable} title='Disponível' size='md' disabled={loading} />
			</div>
			<div className='flex gap-2 justify-end'>
				<button type='button' onClick={onCancel} className='px-4 py-2 rounded bg-zinc-200 text-zinc-700 hover:bg-zinc-300 transition' disabled={loading}>
					Cancelar
				</button>
				<button type='submit' className='px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-60' disabled={loading}>
					{loading ? (initialData ? 'Salvando...' : 'Criando...') : initialData ? 'Salvar' : 'Criar'}
				</button>
			</div>
		</form>
	)
}
