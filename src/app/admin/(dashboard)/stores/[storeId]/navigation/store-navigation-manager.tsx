'use client'

import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, GripVertical, Trash2, Plus, Save, Menu, CornerDownRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { addStoreNavItem, removeStoreNavItem, updateStoreNavOrder } from './actions'
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    DragOverEvent,
    defaultDropAnimationSideEffects,
    DropAnimation,
} from '@dnd-kit/core'
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface NavItem {
    id: string
    title: string
    position: number
    page_id: string
    parent_id?: string | null
    pages?: {
        title: string
        slug: string
    } | null
    children?: NavItem[]
    depth?: number
}

interface Page {
    id: string
    title: string
    slug: string
}

interface Props {
    storeId: string
    storeName: string
    navItems: NavItem[]
    availablePages: Page[]
}

// Recursive helper to flatten tree
function flattenTree(items: NavItem[], parentId: string | null = null, depth = 0): NavItem[] {
    return items.reduce<NavItem[]>((acc, item) => {
        const flattened = [{ ...item, parent_id: parentId, depth }]
        if (item.children) {
            flattened.push(...flattenTree(item.children, item.id, depth + 1))
        }
        return [...acc, ...flattened]
    }, [])
}

// Build tree from flat items
function buildTree(items: NavItem[]): NavItem[] {
    const itemMap = new Map<string, NavItem>()
    const roots: NavItem[] = []

    // 1. Initialize map and children array
    items.forEach(item => {
        itemMap.set(item.id, { ...item, children: [] })
    })

    // 2. Build hierarchy
    items.forEach(item => {
        const node = itemMap.get(item.id)!
        if (item.parent_id && itemMap.has(item.parent_id)) {
            const parent = itemMap.get(item.parent_id)!
            parent.children?.push(node)
        } else {
            roots.push(node)
        }
    })

    // 3. Sort by position
    const sortNodes = (nodes: NavItem[]) => {
        nodes.sort((a, b) => a.position - b.position)
        nodes.forEach(node => {
            if (node.children) sortNodes(node.children)
        })
    }
    sortNodes(roots)

    return roots
}

interface SortableItemProps {
    id: string
    item: NavItem
    onRemove: (id: string) => void
    depth: number
}

function SortableItem({ id, item, onRemove, depth }: SortableItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id })

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        marginLeft: `${depth * 2}rem`, // Indentation
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`p-4 flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-lg mb-2 relative ${isDragging ? 'opacity-50 z-50' : ''}`}
        >
            {/* Visual connector for nested items */}
            {depth > 0 && (
                <div className="absolute -left-6 top-1/2 -mt-4 text-zinc-700">
                    <CornerDownRight className="h-5 w-5" />
                </div>
            )}

            <div className="flex items-center gap-3">
                <div {...attributes} {...listeners} className="cursor-grab hover:text-white text-zinc-500">
                    <GripVertical className="h-5 w-5" />
                </div>
                <div>
                    <p className="font-medium text-white">{item.title}</p>
                    <p className="text-sm text-zinc-500">/{item.pages?.slug}</p>
                </div>
            </div>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemove(id)}
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
            >
                <Trash2 className="h-4 w-4" />
            </Button>
        </div>
    )
}

export function StoreNavigationManager({ storeId, storeName, navItems, availablePages }: Props) {
    // 1. Initial State: Flatten the tree structure from DB if it's already nested, or just use flat list
    // DB returns flat list usually. We need to respect parent_id.
    const initialTree = useMemo(() => buildTree(navItems), [navItems])
    const [items, setItems] = useState<NavItem[]>(initialTree) // We manage state as a Tree internally? 
    // Actually dnd-kit works best with flat list for Vertical strategies.
    // Let's keep a "projected" flat list for dnd-kit, but underlying data is...
    // To implement "Indent to nest":
    // The "projection" logic is complex. 
    // Simplified User Request: "hover page will have menu below".
    // Let's implement 2-level nesting via "Drag ON TOP (Drop over)" to nest? Or "Drag right" to nest?
    // "Drag to right" is standard.
    // However, implementing full "Drag to convert to child" is hard in one go.

    // ALTERNATIVE: Use a simple "Parent" dropdown in the UI item? No, user wants DnD.

    // Let's use a simpler approach: 
    // Just maintain a flat list `flattenedItems` in state, which includes `depth`.
    // When dragging, we recalculate `depth` based on x-offset?
    // THAT requires `onDragMove` sensor adjustments.

    // Simpler Plan B: 
    // Only allow 1 level of nesting via a specific UI action or simplified drop.
    // Update: User said "like picture" -> picture shows indentation.

    // Let's try to infer parent based on strict order + depth simulation? 
    // Actually, let's keep it simple: 
    // We render a flat list. 
    // We allow changing 'width' (indentation) by clicking a button? No.

    // Let's try the [dnd-kit/sortable-tree] approach logic manually:
    // When you drop item A after item B:
    // 1. If indented, A becomes child of B.
    // 2. If same level, A is sibling of B.

    // To save time and complexity: I will implement a simpler "Group" concept?
    // No.

    // Let's implement **Visual Indentation Button**: [<] [>] on each item to increase/decrease depth.
    // And DnD for vertical sorting.
    // This is ROBUST and easy to understand.
    // "Drag to reorder, use buttons to nest".

    const [localNavItems, setLocalNavItems] = useState<NavItem[]>(() => {
        // Sort by position first
        const sorted = [...navItems].sort((a, b) => a.position - b.position)
        // We need to return them in a Flattened Tree Order (Root -> Children -> Root)
        // So we build tree then flatten it.
        return flattenTree(buildTree(sorted))
    })

    const [saving, setSaving] = useState(false)
    const [adding, setAdding] = useState(false)
    const [selectedPageId, setSelectedPageId] = useState<string>('')
    const [activeId, setActiveId] = useState<string | null>(null)

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string)
    }

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event

        if (over && active.id !== over.id) {
            setLocalNavItems((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id)
                const newIndex = items.findIndex((item) => item.id === over.id)
                const newItems = arrayMove(items, oldIndex, newIndex)

                // Reset depth/parent logic if needed? 
                // For now, simple reorder. The user manually adjusts depth with buttons.

                return newItems
            })
        }
        setActiveId(null)
    }

    // Depth Management
    const updateDepth = (id: string, delta: number) => {
        setLocalNavItems(items => {
            const index = items.findIndex(i => i.id === id)
            if (index === -1) return items

            const newItems = [...items]
            const item = { ...newItems[index] }

            // Logic: 
            // Max depth: 1 (2 levels total: 0 and 1)
            // Min depth: 0
            const newDepth = Math.min(1, Math.max(0, (item.depth || 0) + delta))

            // Constraint: Can only be depth 1 if previous item is depth 0 or 1. (Actually parent must exist).
            // Actually, if I am depth 1, my parent is the closest previous item with depth < my depth.
            // If I am depth 1, the previous item should be depth 0 (or 1).
            // If I am top of list, must be depth 0.

            if (index === 0 && newDepth > 0) return items // First item must be root

            item.depth = newDepth
            newItems[index] = item
            return newItems
        })
    }

    const saveOrder = async () => {
        setSaving(true)
        // Reconstruct parent_ids based on flat list + depth
        // Algorithm: Iterate list. Maintain stack of parents.
        // Depth 0: Parent = null.
        // Depth 1: Parent = last seen Depth 0.

        let lastRootId: string | null = null
        const payload = localNavItems.map((item, index) => {
            let parentId: string | null = null
            if (item.depth === 1) {
                parentId = lastRootId
            } else {
                lastRootId = item.id
            }
            return {
                id: item.id,
                position: index,
                parent_id: parentId
            }
        })

        // Edge case: orphan depth 1 (if logic above fails). 
        // With "First item must be root" check, we reduce risk.
        // Also if `lastRootId` is null but item is depth 1 (shouldn't happen), it becomes root.

        await updateStoreNavOrder(storeId, payload)
        setSaving(false)
        // Refresh to get clean state
        // window.location.reload()
    }

    const addItem = async () => {
        if (!selectedPageId) return
        setAdding(true)
        const page = availablePages.find(p => p.id === selectedPageId)
        if (page) {
            // Optimistic add? Or assume simple add via server revalidates?
            // Since we use local state mostly, let's use the server action which revalidates, 
            // BUT we need to reload to fetch the new item into our local state properly.
            // Or we append it locally.
            await addStoreNavItem(storeId, page.id, page.title)
            window.location.reload()
        }
        setAdding(false)
    }

    const removeItem = async (navItemId: string) => {
        await removeStoreNavItem(storeId, navItemId)
        setLocalNavItems(items => items.filter(item => item.id !== navItemId))
    }

    // Filter available pages
    const usedPageIds = new Set(localNavItems.map(item => item.page_id))
    const availablePagesFiltered = availablePages.filter(p => !usedPageIds.has(p.id))

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href={`/admin/stores/${storeId}`} className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <p className="text-sm text-zinc-500">{storeName}</p>
                        <h1 className="text-2xl font-bold text-white">導覽目錄管理</h1>
                    </div>
                </div>
                <Button onClick={saveOrder} disabled={saving}>
                    {saving ? '儲存中...' : <><Save className="h-4 w-4 mr-2" />儲存排序</>}
                </Button>
            </div>

            <p className="text-zinc-400 text-sm">
                提示：拖曳調整順序，使用 &gt; 按鈕將項目向右縮排成為子選單（目前支援兩層結構）。
            </p>

            {/* 新增項目 */}
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
                <div className="flex items-center gap-4">
                    <select
                        value={selectedPageId}
                        onChange={(e) => setSelectedPageId(e.target.value)}
                        className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                    >
                        <option value="">選擇要新增的頁面...</option>
                        {availablePagesFiltered.map(page => (
                            <option key={page.id} value={page.id}>{page.title}</option>
                        ))}
                    </select>
                    <Button onClick={addItem} disabled={!selectedPageId || adding}>
                        <Plus className="h-4 w-4 mr-2" />
                        新增頁面
                    </Button>
                </div>
            </div>

            {/* DnD Context */}
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={localNavItems.map(i => i.id)}
                    strategy={verticalListSortingStrategy}
                >
                    <div className="space-y-2">
                        {localNavItems.map((item) => (
                            <div key={item.id} className="group relative">
                                <SortableItem
                                    id={item.id}
                                    item={item}
                                    onRemove={removeItem}
                                    depth={item.depth || 0}
                                />
                                { /* Indent Buttons Overlay (Visible on Hover/Focus? Or always?) 
                                     It's hard to put interactable buttons inside draggable area sometimes.
                                     Let's put them explicitly outside the drag handle but inside container.
                                */ }
                                { /* Indent Buttons Overlay (Visible Always) */}
                                <div className="absolute right-14 top-1/2 -translate-y-1/2 flex gap-1">
                                    <button
                                        onClick={() => updateDepth(item.id, -1)}
                                        className={`p-1 rounded border transition-colors ${!item.depth || item.depth === 0
                                            ? 'bg-zinc-900 border-zinc-800 text-zinc-700 cursor-not-allowed'
                                            : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700 hover:text-white'
                                            }`}
                                        disabled={!item.depth || item.depth === 0}
                                        title="減少縮排"
                                    >
                                        &lt;
                                    </button>
                                    <button
                                        onClick={() => updateDepth(item.id, 1)}
                                        className={`p-1 rounded border transition-colors ${item.depth === 1
                                            ? 'bg-zinc-900 border-zinc-800 text-zinc-700 cursor-not-allowed'
                                            : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700 hover:text-white'
                                            }`}
                                        disabled={item.depth === 1}
                                        title="增加縮排"
                                    >
                                        &gt;
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </SortableContext>
                <DragOverlay>
                    {activeId ? (
                        <div className="p-4 flex items-center gap-4 bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg opacity-80">
                            <GripVertical className="h-5 w-5 text-white" />
                            <span className="text-white">移動中...</span>
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>
        </div>
    )
}
