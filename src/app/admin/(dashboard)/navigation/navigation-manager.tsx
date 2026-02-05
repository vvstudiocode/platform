'use client'

import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import { GripVertical, Trash2, Plus, Save, Menu, X, ArrowRight, CornerDownRight } from 'lucide-react'
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
    defaultDropAnimationSideEffects,
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
    const initialTree = useMemo(() => buildTree(navItems), [navItems])

    const [items, setLocalNavItems] = useState<NavItem[]>(() => {
        const sorted = [...navItems].sort((a, b) => a.position - b.position)
        return flattenTree(buildTree(sorted))
    })

    const [saving, setSaving] = useState(false)
    const [showPagePicker, setShowPagePicker] = useState(false)
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

    const handleAddPage = async (page: Page) => {
        const result = await addNavItem(page.id, page.title)
        if (result.success) {
            setShowPagePicker(false)
            window.location.reload()
        } else {
            alert(result.error)
        }
    }

    const handleRemove = async (navItemId: string) => {
        const result = await removeNavItem(navItemId)
        if (result.success) {
            setLocalNavItems(items => items.filter(item => item.id !== navItemId))
        }
    }

    // Filter available pages
    const usedPageIds = new Set(items.map(item => item.page_id))
    const addablePages = availablePages.filter(p => !usedPageIds.has(p.id))

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white">導覽目錄管理</h1>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setShowPagePicker(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        新增頁面
                    </Button>
                    <Button onClick={saveOrder} disabled={saving}>
                        {saving ? '儲存中...' : '儲存排序'}
                    </Button>
                </div>
            </div>

            <p className="text-zinc-400">
                提示：拖曳調整順序，使用 &gt; 按鈕將項目向右縮排成為子選單（目前支援兩層結構）。
            </p>

            {/* DnD Context */}
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
                            <div className="p-12 text-center text-zinc-500 bg-zinc-900 border border-zinc-800 rounded-xl">
                                <p>目前沒有導覽項目</p>
                                <p className="text-sm mt-1">點擊「新增頁面」來加入導覽</p>
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

            {/* Page Picker Modal */}
            {showPagePicker && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-zinc-900 rounded-xl border border-zinc-800 w-full max-w-md max-h-[80vh] overflow-hidden">
                        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
                            <h2 className="text-lg font-semibold text-white">選擇頁面</h2>
                            <button
                                onClick={() => setShowPagePicker(false)}
                                className="p-2 text-zinc-400 hover:text-white"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="overflow-y-auto max-h-[60vh] divide-y divide-zinc-800">
                            {addablePages.length === 0 ? (
                                <div className="p-8 text-center text-zinc-500">
                                    所有頁面都已在導覽中
                                </div>
                            ) : (
                                addablePages.map(page => (
                                    <button
                                        key={page.id}
                                        onClick={() => handleAddPage(page)}
                                        className="w-full p-4 text-left hover:bg-zinc-800 transition"
                                    >
                                        <p className="font-medium text-white">{page.title}</p>
                                        <p className="text-sm text-zinc-500">/p/{page.slug}</p>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
