import type { UniqueIdentifier } from '@dnd-kit/core'

// Types
export interface TreeItemType {
	id: UniqueIdentifier
	href?: string
	children: TreeItemType[]
	collapsed?: boolean
	name: string
}

export type TreeItems = TreeItemType[]

export interface FlattenedItem extends TreeItemType {
	parentId: UniqueIdentifier | null
	depth: number
	index: number
}

export type SensorContext = React.MutableRefObject<{
	items: FlattenedItem[]
	offset: number
}>
