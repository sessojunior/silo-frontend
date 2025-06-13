import React, { forwardRef, HTMLAttributes, CSSProperties, memo, useCallback, useMemo } from 'react'
import classNames from 'classnames'
import type { UniqueIdentifier } from '@dnd-kit/core'
import { AnimateLayoutChanges, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

import { TreeItemType, TreeItems } from './MenuBuilderTypes'

// Collapse Component - Memoizado para evitar re-renders
export const Collapse = memo(function Collapse(props: { open: boolean; handleOpen: (open: boolean) => void }) {
	const handleClick = useCallback(
		(e: React.PointerEvent) => {
			e.stopPropagation()
			e.preventDefault()
			props.handleOpen(!props.open)
		},
		[props.open, props.handleOpen],
	)

	return (
		<div
			onPointerDown={handleClick}
			style={{
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				height: '30px',
				width: '30px',
				cursor: 'pointer',
			}}
		>
			{!props.open ? (
				<svg width='12' style={{}} viewBox='0 0 22 22' xmlns='http://www.w3.org/2000/svg'>
					<path strokeLinecap='round' strokeLinejoin='round' d='m19.5 8.25-7.5 7.5-7.5-7.5' />
				</svg>
			) : (
				<svg
					width='12'
					style={{
						rotate: '180deg',
					}}
					viewBox='0 0 22 22'
					xmlns='http://www.w3.org/2000/svg'
				>
					<path strokeLinecap='round' strokeLinejoin='round' d='m19.5 8.25-7.5 7.5-7.5-7.5' />
				</svg>
			)}
		</div>
	)
})

// TreeItem Props
export interface Props extends Omit<HTMLAttributes<HTMLLIElement>, 'id'> {
	childCount?: number
	clone?: boolean
	collapsed?: boolean
	depth: number
	disableInteraction?: boolean
	disableSelection?: boolean
	ghost?: boolean
	handleProps?: Record<string, unknown>
	indicator?: boolean
	indentationWidth: number
	value: string
	onCollapse?(): void
	onRemove?(): void
	wrapperRef?(node: HTMLLIElement): void
	childs?: TreeItems
	show?: string
	updateitem?: (id: UniqueIdentifier, data: Omit<TreeItemType, 'children'>) => void
	otherfields?: Record<string, unknown>
}

// Recursive Item Component - Memoizado e otimizado
const RecursiveItem = memo(function RecursiveItem(props: { child: TreeItemType; nDepth: number }) {
	const newDepth = props.nDepth + 1
	const marginLeft = useMemo(() => props.nDepth * 50, [props.nDepth])

	const childItems = useMemo(() => props.child.children.map((child: TreeItemType) => <RecursiveItem key={child.id as string} child={child} nDepth={newDepth} />), [props.child.children, newDepth])

	return (
		<>
			<div
				style={{
					width: '414px',
					height: '42px',
					border: '1px solid #dcdcde',
					marginTop: '9px',
					marginLeft: `${marginLeft}px`, // Esta é a chave para a indentação!
					backgroundColor: '#f6f7f7',
					borderRadius: '4px',
					display: 'flex',
					alignItems: 'center',
					paddingLeft: '0.5rem',
					fontWeight: '600',
					fontSize: '13px',
					userSelect: 'none' as const,
					WebkitUserSelect: 'none' as const,
					MozUserSelect: 'none' as const,
					msUserSelect: 'none' as const,
				}}
			>
				{props.child.name}{' '}
				<span
					style={{
						fontSize: '13px',
						fontWeight: '400',
						fontStyle: 'italic',
						color: '#50575e',
						marginLeft: '4px',
					}}
				>
					sub item
				</span>
			</div>
			{childItems}
		</>
	)
})

// TreeItem Component - Otimizado com memoização
export const TreeItem = memo(
	forwardRef<HTMLDivElement, Props>(function TreeItem({ childCount, clone, depth, disableSelection, disableInteraction, ghost, handleProps, indentationWidth, indicator, onRemove, style, value, updateitem, wrapperRef, ...props }, ref) {
		const [open, setOpen] = React.useState(false)
		const [newData, setNewData] = React.useState<Omit<TreeItemType, 'children'>>(() => ({
			id: value,
			href: (props?.otherfields?.href as string) || '',
			name: (props?.otherfields?.name as string) || '',
		}))

		// Evita problemas de hidratação SSR
		const [isMounted, setIsMounted] = React.useState(false)
		React.useEffect(() => {
			setIsMounted(true)
		}, [])

		// Memoização de estilos para evitar recálculos
		const wrapperStyle = useMemo(
			() => ({
				listStyle: 'none' as const,
				boxSizing: 'border-box' as const,
				marginBottom: '-1px',
				WebkitFontSmoothing: 'subpixel-antialiased' as const,
				...(!clone
					? {
							paddingLeft: `${indentationWidth * depth}px`,
						}
					: {
							display: 'inline-block' as const,
							pointerEvents: 'none' as const,
							padding: 0,
							paddingLeft: '10px',
							paddingTop: '5px',
						}),
			}),
			[clone, indentationWidth, depth],
		)

		const treeItemStyle = useMemo(
			() => ({
				...style,
				width: '100%',
				maxWidth: '414px',
				height: ghost && indicator && childCount ? `${childCount * 42 + (childCount - 1) * 9}px` : '42px',
				position: 'relative' as const,
				display: 'flex',
				alignItems: 'center',
				padding: '10px',
				backgroundColor: ghost && indicator ? 'transparent' : '#f6f7f7',
				border: ghost && indicator ? '2px dashed #c3c4c7' : '1px solid #dcdcde',
				color: '#1d2327',
				boxSizing: 'border-box' as const,
				marginTop: '9px',
				cursor: 'move',
				opacity: ghost && indicator ? 0.6 : 1,
				userSelect: 'none' as const,
				WebkitUserSelect: 'none' as const,
				MozUserSelect: 'none' as const,
				msUserSelect: 'none' as const,
				...(clone && {
					paddingRight: '24px',
					borderRadius: '4px',
					boxShadow: '0px 15px 15px 0 rgba(34, 33, 81, 0.1)',
					minWidth: '414px',
				}),
			}),
			[style, ghost, indicator, childCount, clone],
		)

		// Callbacks otimizados
		const handleToggleOpen = useCallback(() => setOpen(!open), [open])

		const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
			setNewData((prev) => ({ ...prev, name: e.target.value }))
		}, [])

		const handleHrefChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
			setNewData((prev) => ({ ...prev, href: e.target.value }))
		}, [])

		const handleCancel = useCallback(() => setOpen(false), [])

		const handleUpdate = useCallback(() => {
			if (updateitem) {
				updateitem(value, newData)
			}
			setOpen(false)
		}, [updateitem, value, newData])

		// Filtro de props otimizado
		const filteredProps = useMemo(() => Object.fromEntries(Object.entries(props).filter(([key]) => !['collapsed', 'onCollapse', 'onRemove', 'childs', 'show', 'updateitem', 'otherfields', 'childCount', 'depth', 'indentationWidth', 'indicator', 'value'].includes(key))), [props])

		// Renderização otimizada para SSR
		if (!isMounted) {
			return (
				<li
					className={classNames({
						Wrapper: true,
						clone: clone,
						ghost: ghost,
						indicator: indicator,
						disableSelection: disableSelection,
						disableInteraction: disableInteraction,
					})}
					ref={wrapperRef}
					style={wrapperStyle}
					{...filteredProps}
				>
					<div {...handleProps} className='TreeItem' ref={ref} style={treeItemStyle}>
						<span
							className={'Text'}
							style={{
								flexGrow: 1,
								paddingLeft: '0.5rem',
								whiteSpace: 'nowrap',
								textOverflow: 'ellipsis',
								overflow: 'hidden',
								fontWeight: '600',
								fontSize: '13px',
							}}
						>
							{clone ? `📋 Movendo: ${props?.otherfields?.name as string}` : (props?.otherfields?.name as string)}{' '}
							<span
								style={{
									fontSize: '13px',
									fontWeight: '400',
									fontStyle: 'italic',
									color: '#50575e',
									marginLeft: '4px',
								}}
							>
								{depth > 0 ? 'sub item' : ''}
								{clone && childCount && childCount > 1 ? ` (${childCount - 1} filhos)` : ''}
							</span>
						</span>
						{!clone && onRemove && !(ghost && indicator) && <Collapse open={open} handleOpen={handleToggleOpen} />}
						{clone && childCount && childCount > 1 && props.childs ? (
							<div
								className={'Count'}
								style={{
									position: 'absolute',
									top: '100%',
									left: 0,
									display: 'flex',
									flexDirection: 'column',
								}}
							>
								{props.childs.map((child: TreeItemType) => (
									<RecursiveItem key={child.id as string} child={child} nDepth={1} />
								))}
							</div>
						) : null}
					</div>
				</li>
			)
		}

		return (
			<li
				className={classNames({
					Wrapper: true,
					clone: clone,
					ghost: ghost,
					indicator: indicator,
					disableSelection: disableSelection,
					disableInteraction: disableInteraction,
				})}
				ref={wrapperRef}
				style={wrapperStyle}
				{...filteredProps}
			>
				<div {...handleProps} className='TreeItem' ref={ref} style={treeItemStyle}>
					<span
						className={'Text'}
						style={{
							flexGrow: 1,
							paddingLeft: '0.5rem',
							whiteSpace: 'nowrap',
							textOverflow: 'ellipsis',
							overflow: 'hidden',
							fontWeight: '600',
							fontSize: '13px',
						}}
					>
						{clone ? `📋 Movendo: ${props?.otherfields?.name as string}` : (props?.otherfields?.name as string)}{' '}
						{!(ghost && indicator) && (
							<span
								style={{
									fontSize: '13px',
									fontWeight: '400',
									fontStyle: 'italic',
									color: '#50575e',
									marginLeft: '4px',
								}}
							>
								{depth > 0 ? 'sub item' : ''}
								{clone && childCount && childCount > 1 ? ` (${childCount - 1} filhos)` : ''}
							</span>
						)}
					</span>
					{!clone && onRemove && !(ghost && indicator) && <Collapse open={open} handleOpen={handleToggleOpen} />}
					{clone && childCount && childCount > 1 && props.childs ? (
						<div
							className={'Count'}
							style={{
								position: 'absolute',
								top: '100%',
								left: 0,
								display: 'flex',
								flexDirection: 'column',
							}}
						>
							{props.childs.map((child: TreeItemType) => (
								<RecursiveItem key={child.id as string} child={child} nDepth={1} />
							))}
						</div>
					) : null}
				</div>
				{!(props.show === 'true') && open && (
					<div
						style={{
							width: '412px',
							border: '1px solid #c3c4c7',
							marginTop: '-1px',
						}}
					>
						<div
							style={{
								padding: '10px',
								display: 'flex',
								flexDirection: 'column',
							}}
						>
							<label
								style={{
									marginTop: '5px',
									marginBottom: '5px',
									fontSize: '13px',
									color: '#646970',
								}}
								htmlFor='label'
							>
								Navigation Label
							</label>
							<input
								value={newData.name}
								onChange={handleNameChange}
								type='text'
								id='label'
								style={{
									border: '1px solid #dcdcde',
									height: '30px',
									borderRadius: '4px',
									padding: '0 10px',
								}}
							/>
							<label
								style={{
									marginTop: '10px',
									marginBottom: '5px',
									fontSize: '13px',
									color: '#646970',
								}}
								htmlFor='href'
							>
								Navigation Url
							</label>
							<input
								value={newData.href}
								onChange={handleHrefChange}
								type='text'
								id='href'
								style={{
									border: '1px solid #dcdcde',
									height: '30px',
									borderRadius: '4px',
									padding: '0 10px',
								}}
							/>
							<div
								style={{
									display: 'flex',
									justifyContent: 'flex-end',
									marginTop: '10px',
									gap: '12px',
								}}
							>
								<button
									style={{
										all: 'unset',
										cursor: 'pointer',
										padding: '8px 16px',
										backgroundColor: '#f0f0f1',
										border: '1px solid #c3c4c7',
										borderRadius: '3px',
										fontSize: '13px',
									}}
									onClick={handleCancel}
								>
									Cancel
								</button>
								<button
									style={{
										all: 'unset',
										cursor: 'pointer',
										padding: '8px 16px',
										backgroundColor: '#2271b1',
										color: 'white',
										border: '1px solid #2271b1',
										borderRadius: '3px',
										fontSize: '13px',
									}}
									onClick={handleUpdate}
								>
									Update Menu Item
								</button>
							</div>
						</div>
					</div>
				)}
			</li>
		)
	}),
)

// SortableTreeItem Props
interface SortableProps extends Props {
	id: UniqueIdentifier
	childs?: TreeItems
	show?: string
	updateitem?: (id: UniqueIdentifier, data: Omit<TreeItemType, 'children'>) => void
	otherfields?: Record<string, unknown>
}

// Animation Layout Changes - Otimizado
const animateLayoutChanges: AnimateLayoutChanges = ({ isSorting, wasDragging }) => (isSorting || wasDragging ? false : true)

// SortableTreeItem Component - Memoizado para performance
export const SortableTreeItem = memo(function SortableTreeItem({ id, depth, ...props }: SortableProps) {
	const { attributes, isDragging, isSorting, listeners, setDraggableNodeRef, setDroppableNodeRef, transform, transition } = useSortable({
		id,
		animateLayoutChanges,
	})

	const style: CSSProperties = useMemo(
		() => ({
			transform: CSS.Translate.toString(transform),
			transition,
		}),
		[transform, transition],
	)

	return (
		<TreeItem
			ref={setDraggableNodeRef}
			wrapperRef={setDroppableNodeRef}
			style={style}
			depth={depth}
			ghost={isDragging}
			disableSelection={typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.platform)}
			disableInteraction={isSorting}
			handleProps={{
				...attributes,
				...listeners,
			}}
			{...props}
		/>
	)
})
