'use client'

import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import { GripVertical, Trash2, Plus, Save, Menu, CornerDownRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { addNavItem, removeNavItem, updateNavOrder } from './actions'
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
    parent_id: string | null
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
    navItems: NavItem[]
    availablePages: Page[]
}

// Recursive helper to flatten tree
function flattenTree(items: NavItem[], parentId: string | null = null, depth = 0): NavItem[] {
    return items.reduce<NavItem[]>((acc, item) => {
        const flattened: NavItem[] = [{ ...item, parent_id: parentId, depth }]
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

export function NavigationManager({ navItems, availablePages }: Props) {
    const [items, setLocalNavItems] = useState<NavItem[]>(() => {
        const sorted = [...navItems].sort((a, b) => a.position - b.position)
        return flattenTree(buildTree(sorted))
    })

    const [saving, setSaving] = useState(false)
    const [adding, setAdding] = useState(false)
    const [selectedPageId, setSelectedPageId] = useState<string>('')
    const [activeId, setActiveId] = useState<string | null>(null)
    const [isMounted, setIsMounted] = useState(false)

    // Fix hydration mismatch: DndKit generates different IDs on server vs client
    React.useEffect(() => {
        setIsMounted(true)
    }, [])

    // 已經在導覽中的頁面 ID
    const usedPageIds = new Set(items.map(item => item.page_id))
    const availablePagesFiltered = availablePages.filter(p => !usedPageIds.has(p.id))

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
                return newItems
            })
        }
        setActiveId(null)
    }

    const updateDepth = (id: string, delta: number) => {
        setLocalNavItems(items => {
            const index = items.findIndex(i => i.id === id)
            if (index === -1) return items

            const newItems = [...items]
            const item = { ...newItems[index] }
            const newDepth = Math.min(1, Math.max(0, (item.depth || 0) + delta))

            if (index === 0 && newDepth > 0) return items

            item.depth = newDepth
            newItems[index] = item
            return newItems
        })
    }

    const saveOrder = async () => {
        setSaving(true)
        let lastRootId: string | null = null
        const payload = items.map((item, index) => {
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

        await updateNavOrder(payload)
        setSaving(false)
    }

    const addItem = async () => {
        if (!selectedPageId) return
        setAdding(true)
        const page = availablePages.find(p => p.id === selectedPageId)
        if (page) {
            await addNavItem(page.id, page.title)
            window.location.reload()
        }
        setAdding(false)
    }

    const handleRemove = async (navItemId: string) => {
        await removeNavItem(navItemId)
        setLocalNavItems(items => items.filter(item => item.id !== navItemId))
    }

    return (
        <div className="space-y-6">
            <p className="text-zinc-400">
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

            {/* DnD Context - Only render after mount to prevent hydration mismatch */}
            {isMounted ? (
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={items.map(i => i.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        <div className="space-y-2">
                            {items.length === 0 ? (
                                <div className="p-8 text-center text-zinc-500">
                                    <Menu className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                    <p>尚無導覽項目，請新增頁面</p>
                                </div>
                            ) : (
                                items.map((item) => (
                                    <div key={item.id} className="group relative">
                                        <div className="relative">
                                            <SortableItem
                                                id={item.id}
                                                item={item}
                                                onRemove={handleRemove}
                                                depth={item.depth || 0}
                                            />
                                        </div>

                                        {/* Indent Buttons (Always Visible) */}
                                        <div className="absolute right-14 top-1/2 -translate-y-1/2 flex gap-1 z-10">
                                            <button
                                                onClick={() => updateDepth(item.id, -1)}
                                                className={`p-1 rounded border transition-colors ${!item.depth || item.depth === 0
                                                    ? 'bg-zinc-900 border-zinc-800 text-zinc-700 cursor-not-allowed'
                                                    : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700 hover:text-white'
                                                    }`}
                                                disabled={!item.depth || item.depth === 0}
                                                title="減少縮排 (移出子選單)"
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
                                                title="增加縮排 (成為子選單)"
                                            >
                                                &gt;
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
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
            ) : (
                <div className="space-y-2">
                    {items.map((item) => (
                        <div key={item.id} className="p-4 flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="text-zinc-500"><GripVertical className="h-5 w-5" /></div>
                                <div>
                                    <p className="font-medium text-white">{item.title}</p>
                                    <p className="text-sm text-zinc-500">/{item.pages?.slug}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* 儲存按鈕 */}
            {items.length > 0 && (
                <div className="flex justify-end">
                    <Button onClick={saveOrder} disabled={saving}>
                        {saving ? '儲存中...' : <><Save className="h-4 w-4 mr-2" />儲存排序</>}
                    </Button>
                </div>
            )}
        </div>
    )
}
