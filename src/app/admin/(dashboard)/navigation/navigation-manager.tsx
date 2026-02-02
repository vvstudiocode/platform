'use client'

import { useState } from 'react'
import { GripVertical, Plus, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { removeNavItem, updateNavOrder, addNavItem } from './actions'

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

export function NavigationManager({ navItems: initialItems, availablePages }: Props) {
    const [items, setItems] = useState<NavItem[]>(initialItems)
    const [dragIndex, setDragIndex] = useState<number | null>(null)
    const [showPagePicker, setShowPagePicker] = useState(false)
    const [saving, setSaving] = useState(false)

    // 拖拉開始
    const handleDragStart = (index: number) => {
        setDragIndex(index)
    }

    // 拖拉結束
    const handleDragEnd = () => {
        setDragIndex(null)
    }

    // 拖拉進入
    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault()
        if (dragIndex === null || dragIndex === index) return

        const newItems = [...items]
        const draggedItem = newItems[dragIndex]
        newItems.splice(dragIndex, 1)
        newItems.splice(index, 0, draggedItem)

        // 更新 position
        newItems.forEach((item, i) => {
            item.position = i
        })

        setItems(newItems)
        setDragIndex(index)
    }

    // 儲存排序
    const handleSaveOrder = async () => {
        setSaving(true)
        await updateNavOrder(items.map((item, index) => ({
            id: item.id,
            position: index,
        })))
        setSaving(false)
    }

    // 刪除項目
    const handleRemove = async (navItemId: string) => {
        const result = await removeNavItem(navItemId)
        if (result.success) {
            setItems(items.filter(item => item.id !== navItemId))
        }
    }

    // 新增頁面
    const handleAddPage = async (page: Page) => {
        const result = await addNavItem(page.id, page.title)
        if (result.success) {
            setShowPagePicker(false)
            // 重新載入 - 簡單方式是 reload
            window.location.reload()
        } else {
            alert(result.error)
        }
    }

    // 計算可新增的頁面（排除已在導覽的）
    const addablePages = availablePages.filter(
        page => !items.some(item => item.page_id === page.id)
    )

    return (
        <div className="space-y-6">
            {/* 標題列 */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white">導覽目錄管理</h1>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setShowPagePicker(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        新增頁面
                    </Button>
                    {items.length > 0 && (
                        <Button onClick={handleSaveOrder} disabled={saving}>
                            {saving ? '儲存中...' : '儲存排序'}
                        </Button>
                    )}
                </div>
            </div>

            <p className="text-zinc-400">
                拖拉項目來調整順序，新增的頁面會顯示在網站導覽列中
            </p>

            {/* 導覽項目列表 */}
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 divide-y divide-zinc-800">
                {items.length === 0 ? (
                    <div className="p-12 text-center text-zinc-500">
                        <p>目前沒有導覽項目</p>
                        <p className="text-sm mt-1">點擊「新增頁面」來加入導覽</p>
                    </div>
                ) : (
                    items.map((item, index) => (
                        <div
                            key={item.id}
                            draggable
                            onDragStart={() => handleDragStart(index)}
                            onDragEnd={handleDragEnd}
                            onDragOver={(e) => handleDragOver(e, index)}
                            className={`flex items-center gap-4 p-4 cursor-move transition-all ${dragIndex === index ? 'bg-zinc-700 opacity-75' : 'hover:bg-zinc-800'
                                }`}
                        >
                            <GripVertical className="h-5 w-5 text-zinc-500" />
                            <div className="flex-1">
                                <p className="font-medium text-white">{item.title}</p>
                                <p className="text-sm text-zinc-500">/p/{item.pages?.slug}</p>
                            </div>
                            <button
                                onClick={() => handleRemove(item.id)}
                                className="p-2 text-zinc-400 hover:text-red-500 hover:bg-zinc-700 rounded-lg transition"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* 頁面選擇器 Modal */}
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
