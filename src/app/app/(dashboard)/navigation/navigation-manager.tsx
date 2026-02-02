'use client'

import { useState } from 'react'
import { GripVertical, Trash2, Plus, Save, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { addNavItem, removeNavItem, updateNavOrder } from './actions'

interface NavItem {
    id: string
    title: string
    position: number
    page_id: string
    pages?: {
        title: string
        slug: string
    } | null
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

export function NavigationManager({ navItems, availablePages }: Props) {
    const [items, setItems] = useState<NavItem[]>(navItems)
    const [saving, setSaving] = useState(false)
    const [adding, setAdding] = useState(false)
    const [selectedPageId, setSelectedPageId] = useState<string>('')
    const [dragIndex, setDragIndex] = useState<number | null>(null)

    // 已經在導覽中的頁面 ID
    const usedPageIds = new Set(items.map(item => item.page_id))
    const availablePagesFiltered = availablePages.filter(p => !usedPageIds.has(p.id))

    const handleDragStart = (index: number) => {
        setDragIndex(index)
    }

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault()
        if (dragIndex === null || dragIndex === index) return

        const newItems = [...items]
        const draggedItem = newItems[dragIndex]
        newItems.splice(dragIndex, 1)
        newItems.splice(index, 0, draggedItem)
        setItems(newItems)
        setDragIndex(index)
    }

    const handleDragEnd = () => {
        setDragIndex(null)
    }

    const saveOrder = async () => {
        setSaving(true)
        const orderData = items.map((item, index) => ({
            id: item.id,
            position: index,
        }))
        await updateNavOrder(orderData)
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

    const removeItem = async (navItemId: string) => {
        await removeNavItem(navItemId)
        setItems(items.filter(item => item.id !== navItemId))
    }

    return (
        <div className="space-y-6">
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

            {/* 導覽項目列表 */}
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 divide-y divide-zinc-800">
                {items.length === 0 ? (
                    <div className="p-8 text-center text-zinc-500">
                        <Menu className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>尚無導覽項目，請新增頁面</p>
                    </div>
                ) : (
                    items.map((item, index) => (
                        <div
                            key={item.id}
                            draggable
                            onDragStart={() => handleDragStart(index)}
                            onDragOver={(e) => handleDragOver(e, index)}
                            onDragEnd={handleDragEnd}
                            className={`p-4 flex items-center justify-between cursor-move hover:bg-zinc-800/50 transition-colors ${dragIndex === index ? 'opacity-50 bg-zinc-800' : ''}`}
                        >
                            <div className="flex items-center gap-3">
                                <GripVertical className="h-5 w-5 text-zinc-500" />
                                <div>
                                    <p className="font-medium text-white">{item.title}</p>
                                    <p className="text-sm text-zinc-500">/{item.pages?.slug}</p>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeItem(item.id)}
                                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))
                )}
            </div>

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
