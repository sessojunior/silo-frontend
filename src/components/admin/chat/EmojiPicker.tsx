'use client'

import { useState, useRef, useEffect } from 'react'

interface EmojiPickerProps {
	onEmojiSelect: (emoji: string) => void
	onClose: () => void
	position?: { x: number; y: number }
}

interface EmojiCategory {
	id: string
	name: string
	icon: string
	emojis: string[]
}

const EMOJI_CATEGORIES: EmojiCategory[] = [
	{
		id: 'recent',
		name: 'Recentes',
		icon: '🕐',
		emojis: ['😊', '👍', '❤️', '😂', '😢', '😮', '😡', '👏'],
	},
	{
		id: 'smileys',
		name: 'Sorrisos',
		icon: '😀',
		emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥'],
	},
	{
		id: 'people',
		name: 'Pessoas',
		icon: '👤',
		emojis: ['👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '👊', '✊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💅', '🤳', '💪', '🦾', '🦿', '🦵', '🦶', '👂', '🦻', '👃', '🧠', '🫀', '🫁', '🦷', '🦴', '👀', '👁️', '👅', '👄', '💋', '🩸', '👶', '🧒', '👦'],
	},
	{
		id: 'nature',
		name: 'Natureza',
		icon: '🌿',
		emojis: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐽', '🐸', '🐵', '🙈', '🙉', '🙊', '🐒', '🐔', '🐧', '🐦', '🐤', '🐣', '🐥', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐜', '🦟', '🦗', '🕷️', '🕸️', '🦂', '🐢', '🐍', '🦎', '🦖', '🦕', '🐙', '🦑', '🦐', '🦞', '🦀', '🐡', '🐠', '🐟', '🐬', '🐳', '🐋', '🦈', '🐊', '🐅'],
	},
	{
		id: 'food',
		name: 'Comida',
		icon: '🍎',
		emojis: ['🍎', '🍏', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶️', '🫑', '🌽', '🥕', '🫒', '🧄', '🧅', '🥔', '🍠', '🥐', '🥯', '🍞', '🥖', '🥨', '🧀', '🥚', '🍳', '🧈', '🥞', '🧇', '🥓', '🥩', '🍗', '🍖', '🦴', '🌭', '🍔', '🍟', '🍕', '🥪', '🥙', '🧆', '🌮', '🌯'],
	},
	{
		id: 'activity',
		name: 'Atividades',
		icon: '⚽',
		emojis: ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🪃', '🥅', '⛳', '🪁', '🏹', '🎣', '🤿', '🥊', '🥋', '🎽', '🛹', '🛷', '⛸️', '🥌', '🎿', '⛷️', '🏂', '🪂', '🏋️', '🤼', '🤸', '⛹️', '🤺', '🏇', '🧘', '🏄', '🏊', '🤽', '🚣', '🧗', '🚵', '🚴', '🏆', '🥇', '🥈', '🥉', '🏅', '🎖️', '🏵️'],
	},
	{
		id: 'travel',
		name: 'Viagem',
		icon: '✈️',
		emojis: ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐', '🛻', '🚚', '🚛', '🚜', '🏍️', '🛵', '🚲', '🛴', '🛹', '🛼', '🚁', '🛸', '✈️', '🛩️', '🪂', '💺', '🚀', '🛰️', '🚢', '⛵', '🚤', '🛥️', '🛳️', '⛴️', '🚂', '🚃', '🚄', '🚅', '🚆', '🚇', '🚈', '🚉', '🚊', '🚝', '🚞', '🚋', '🚌', '🚍', '🚎', '🚐', '🚑', '🚒', '🚓', '🚔', '🚕', '🚖'],
	},
	{
		id: 'objects',
		name: 'Objetos',
		icon: '📱',
		emojis: ['⌚', '📱', '📲', '💻', '⌨️', '🖥️', '🖨️', '🖱️', '🖲️', '🕹️', '🗜️', '💽', '💾', '💿', '📀', '📼', '📷', '📸', '📹', '🎥', '📽️', '🎞️', '📞', '☎️', '📟', '📠', '📺', '📻', '🎙️', '🎚️', '🎛️', '🧭', '⏱️', '⏲️', '⏰', '🕰️', '⏳', '⌛', '📡', '🔋', '🔌', '💡', '🔦', '🕯️', '🪔', '🧯', '🛢️', '💸'],
	},
	{
		id: 'symbols',
		name: 'Símbolos',
		icon: '❤️',
		emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉️', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐', '⛎', '♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓', '🆔', '⚛️', '🉑', '☢️', '☣️', '📴', '📳', '🈶', '🈚', '🈸', '🈺', '🈷️', '✴️'],
	},
]

export default function EmojiPicker({ onEmojiSelect, onClose, position }: EmojiPickerProps) {
	const [activeCategory, setActiveCategory] = useState('recent')
	const [searchTerm, setSearchTerm] = useState('')
	const [recentEmojis, setRecentEmojis] = useState<string[]>(['😊', '👍', '❤️', '😂', '😢', '😮', '😡', '👏'])
	const pickerRef = useRef<HTMLDivElement>(null)

	// Fechar ao clicar fora
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
				onClose()
			}
		}

		document.addEventListener('mousedown', handleClickOutside)
		return () => document.removeEventListener('mousedown', handleClickOutside)
	}, [onClose])

	// Carregar emojis recentes do localStorage
	useEffect(() => {
		const saved = localStorage.getItem('recent-emojis')
		if (saved) {
			try {
				setRecentEmojis(JSON.parse(saved))
			} catch (error) {
				console.log('Erro ao carregar emojis recentes:', error)
			}
		}
	}, [])

	// Salvar emoji como recente
	const addToRecent = (emoji: string) => {
		setRecentEmojis((prev) => {
			const newRecent = [emoji, ...prev.filter((e) => e !== emoji)].slice(0, 8)
			localStorage.setItem('recent-emojis', JSON.stringify(newRecent))
			return newRecent
		})
	}

	// Filtrar emojis por busca
	const getFilteredEmojis = (categoryEmojis: string[]) => {
		if (!searchTerm) return categoryEmojis

		// Para busca simples, apenas filtrar emojis que "correspondem" ao termo
		// Em uma implementação real, você usaria um mapa emoji-nome
		return categoryEmojis
	}

	// Manipular seleção de emoji
	const handleEmojiClick = (emoji: string) => {
		addToRecent(emoji)
		onEmojiSelect(emoji)
		onClose()
	}

	// Atualizar categoria de recentes
	const categories = EMOJI_CATEGORIES.map((cat) => (cat.id === 'recent' ? { ...cat, emojis: recentEmojis } : cat))

	const currentCategory = categories.find((cat) => cat.id === activeCategory) || categories[0]

	// Calcular posição
	const pickerStyle: React.CSSProperties = position
		? {
				position: 'fixed',
				top: Math.max(10, position.y - 400),
				left: Math.max(10, Math.min(position.x - 200, window.innerWidth - 420)),
				zIndex: 1000,
			}
		: {}

	return (
		<div ref={pickerRef} className='w-96 rounded-lg border bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-800' style={pickerStyle}>
			{/* Header com busca */}
			<div className='border-b p-3 dark:border-zinc-700'>
				<div className='relative'>
					<span className='icon-[lucide--search] absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400'></span>
					<input type='text' placeholder='Buscar emoji...' value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className='w-full rounded-md border border-zinc-200 bg-zinc-50 pl-10 pr-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-700 dark:text-white' />
				</div>
			</div>

			{/* Categorias */}
			<div className='flex border-b p-2 dark:border-zinc-700'>
				{categories.map((category) => (
					<button key={category.id} onClick={() => setActiveCategory(category.id)} className={`flex size-8 items-center justify-center rounded-md text-lg transition-colors ${activeCategory === category.id ? 'bg-blue-100 dark:bg-blue-900/50' : 'hover:bg-zinc-100 dark:hover:bg-zinc-700'}`} title={category.name}>
						{category.icon}
					</button>
				))}
			</div>

			{/* Grid de emojis */}
			<div className='max-h-64 overflow-y-auto p-3'>
				<div className='grid grid-cols-8 gap-1'>
					{getFilteredEmojis(currentCategory.emojis).map((emoji, index) => (
						<button key={`${emoji}-${index}`} onClick={() => handleEmojiClick(emoji)} className='flex size-8 items-center justify-center rounded-md text-lg transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-700' title={emoji}>
							{emoji}
						</button>
					))}
				</div>

				{/* Estado vazio */}
				{getFilteredEmojis(currentCategory.emojis).length === 0 && (
					<div className='py-8 text-center text-zinc-500'>
						<span className='icon-[lucide--search-x] mx-auto size-8'></span>
						<p className='mt-2 text-sm'>Nenhum emoji encontrado</p>
					</div>
				)}
			</div>

			{/* Footer */}
			<div className='border-t p-2 text-center dark:border-zinc-700'>
				<p className='text-xs text-zinc-500'>Clique em um emoji para adicionar à mensagem</p>
			</div>
		</div>
	)
}
