'use client'

import React, { useState } from 'react'
import { GripVertical, Trash2, Plus, Save, Menu, CornerDownRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { addNavItem, removeNavItem, updateNavOrder } from '@/app/app/(dashboard)/navigation/actions'
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
    addAction: (pageId: string, title: string) => Promise<{ error?: string; success?: boolean }>
    removeAction: (navItemId: string) => Promise<{ error?: string; success?: boolean }>
    updateOrderAction: (items: any[]) => Promise<{ error?: string; success?: boolean }>
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
            className={`p-4 flex items-center justify-between bg-card border border-border rounded-xl mb-2 relative shadow-sm group transition-all ${isDragging ? 'opacity-50 z-50 ring-2 ring-primary bg-accent/5' : 'hover:border-primary/50'}`}
        >
            {/* Visual connector for nested items */}
            {depth > 0 && (
                <div className="absolute -left-6 top-1/2 -mt-4 text-border">
                    <CornerDownRight className="h-5 w-5" />
                </div>
            )}

            <div className="flex items-center gap-3">
                <div {...attributes} {...listeners} className="cursor-grab hover:text-primary text-muted-foreground transition-colors p-1 rounded-md hover:bg-muted">
                    <GripVertical className="h-5 w-5" />
                </div>
                <div>
                    <p className="font-medium text-foreground">{item.title}</p>
                    <p className="text-sm text-muted-foreground font-mono">/{item.pages?.slug}</p>
                </div>
            </div>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemove(id)}
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
            >
                <Trash2 className="h-4 w-4" />
            </Button>
        </div>
    )
}

export function NavigationManager({ navItems, availablePages, addAction, removeAction, updateOrderAction }: Props) {
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
            // Change max depth from 1 to 2 for 3 levels (0, 1, 2)
            const newDepth = Math.min(2, Math.max(0, (item.depth || 0) + delta))

            if (index === 0 && newDepth > 0) return items

            // Prevent indenting if previous item is not at least equal depth or 1 level deeper (parent)
            // Logic: An item at depth D can follow an item at depth >= D-1
            const prevItem = newItems[index - 1]
            if (newDepth > 0 && (!prevItem || (prevItem.depth || 0) < newDepth - 1)) {
                return items
            }

            item.depth = newDepth
            newItems[index] = item
            return newItems
        })
    }

    const saveOrder = async () => {
        setSaving(true)
        const lastIds = new Map<number, string>() // Map depth to last seen ID

        const payload = items.map((item, index) => {
            const depth = item.depth || 0
            lastIds.set(depth, item.id)

            // Parent is the last item at depth-1
            let parentId: string | null = null
            if (depth > 0) {
                parentId = lastIds.get(depth - 1) || null
            }

            return {
                id: item.id,
                position: index,
                parent_id: parentId
            }
        })

        await updateOrderAction(payload)
        setSaving(false)
    }

    const addItem = async () => {
        if (!selectedPageId) return
        setAdding(true)
        const page = availablePages.find(p => p.id === selectedPageId)
        if (page) {
            try {
                const result = await addAction(page.id, page.title)
                if (result.success) {
                    // Smooth update: add to local state with a temporary ID
                    // The real ID will come on next server fetch
                    const tempId = `temp-${Date.now()}`
                    const newItem: NavItem = {
                        id: tempId,
                        title: page.title,
                        position: items.length,
                        page_id: page.id,
                        parent_id: null,
                        pages: { title: page.title, slug: page.slug },
                        depth: 0
                    }
                    setLocalNavItems(prev => [...prev, newItem])
                    setSelectedPageId('') // Reset selection
                    // Use router.refresh() for soft reload of server data
                    if (typeof window !== 'undefined') {
                        window.history.replaceState({}, '', window.location.pathname)
                    }
                } else if (result.error) {
                    console.error("Failed to add item:", result.error)
                }
            } catch (error) {
                console.error("Failed to add item", error)
            }
        }
        setAdding(false)
    }

    const handleRemove = async (navItemId: string) => {
        try {
            await removeAction(navItemId)
            setLocalNavItems(items => items.filter(item => item.id !== navItemId))
        } catch (error) {
            console.error("Failed to remove item", error)
        }
    }

    return (
        <div className="space-y-6 w-full">
            {/* 新增項目 */}
            <div className="bg-card rounded-xl border border-border p-6 shadow-soft">
                <label className="block text-sm font-medium text-foreground mb-4">新增導覽連結</label>
                <div className="flex gap-4">
                    <div className="relative flex-1">
                        <select
                            value={selectedPageId}
                            onChange={(e) => setSelectedPageId(e.target.value)}
                            className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary focus:border-transparent appearance-none transition-shadow"
                        >
                            <option value="" className="text-muted-foreground">選擇要新增的頁面...</option>
                            {availablePagesFiltered.map(page => (
                                <option key={page.id} value={page.id}>{page.title} (/{page.slug})</option>
                            ))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                            <Plus className="h-4 w-4 rotate-45" />
                        </div>
                    </div>
                    <Button
                        onClick={addItem}
                        disabled={!selectedPageId || adding}
                        className="shadow-soft"
                    >
                        {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Plus className="h-4 w-4 mr-2" /> 新增</>}
                    </Button>
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <div className="px-1 py-2 text-sm text-muted-foreground flex items-center gap-2">
                    <span>💡 提示：拖曳可調整順序</span>
                    <span className="w-1 h-1 rounded-full bg-border"></span>
                    <span>使用 &lt; &gt; 按鈕調整縮排</span>
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
                            <div className="space-y-2 pb-20">
                                {items.length === 0 ? (
                                    <div className="bg-muted/10 border-2 border-dashed border-muted rounded-xl p-12 text-center text-muted-foreground">
                                        <Menu className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                        <p className="font-medium">導覽列目前是空的</p>
                                        <p className="text-sm mt-1">請從上方選擇頁面加入</p>
                                    </div>
                                ) : (
                                    items.map((item) => (
                                        <div key={item.id} className="group relative">
                                            <div className="relative z-0">
                                                <SortableItem
                                                    id={item.id}
                                                    item={item}
                                                    onRemove={handleRemove}
                                                    depth={item.depth || 0}
                                                />
                                            </div>

                                            {/* Indent Buttons (Floating on hover or persistent?) -> Keeping persistent/hover combination */}
                                            <div className="absolute right-14 top-1/2 -translate-y-1/2 flex gap-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-card shadow-sm rounded-md border border-border p-0.5">
                                                <button
                                                    onClick={() => updateDepth(item.id, -1)}
                                                    className={`p-1.5 rounded-sm transition-colors ${!item.depth || item.depth === 0
                                                        ? 'text-muted-foreground/30 cursor-not-allowed'
                                                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                                                        }`}
                                                    disabled={!item.depth || item.depth === 0}
                                                    title="減少縮排"
                                                >
                                                    &lt;
                                                </button>
                                                <div className="w-px bg-border my-1"></div>
                                                <button
                                                    onClick={() => updateDepth(item.id, 1)}
                                                    className={`p-1.5 rounded-sm transition-colors ${item.depth === 2
                                                        ? 'text-muted-foreground/30 cursor-not-allowed'
                                                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                                                        }`}
                                                    disabled={item.depth === 2}
                                                    title="增加縮排"
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
                                <div className="p-4 flex items-center gap-4 bg-card border border-primary rounded-xl shadow-xl ring-2 ring-primary/20">
                                    <GripVertical className="h-5 w-5 text-primary" />
                                    <span className="font-medium text-foreground">移動中...</span>
                                </div>
                            ) : null}
                        </DragOverlay>
                    </DndContext>
                ) : (
                    <div className="space-y-2">
                        <div className="p-8 text-center">
                            <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                        </div>
                    </div>
                )}
            </div>

            {/* Sticky Save Button */}
            <div className={`fixed bottom-6 right-6 transition-transform duration-300 ${items.length > 0 ? 'translate-y-0' : 'translate-y-24'}`}>
                <Button
                    onClick={saveOrder}
                    disabled={saving}
                    size="lg"
                    className="shadow-xl rounded-full px-8"
                >
                    {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                    儲存導覽排序
                </Button>
            </div>
        </div>
    )
}
