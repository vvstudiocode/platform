'use client'

import { useState, useRef, useEffect } from 'react'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, horizontalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Trash2, Plus, Image as ImageIcon } from 'lucide-react'

// 定義圖片項目類型：既可以是現有的 URL (string)，也可以是新上傳的檔案 (File)
export type ImageItem =
    | { type: 'url', id: string, url: string }
    | { type: 'file', id: string, file: File, preview: string }

interface Props {
    // 傳入的圖片狀態
    items: ImageItem[]
    // 當圖片列表變動時（新增、刪除、排序）
    onChange: (newItems: ImageItem[]) => void
    maxImages?: number
}

export function ProductImagesInput({ items = [], onChange, maxImages = 5 }: Props) {
    const fileInputRef = useRef<HTMLInputElement>(null)

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    // 清理預覽 URL (避免記憶體洩漏)
    useEffect(() => {
        return () => {
            items.forEach(item => {
                if (item.type === 'file') {
                    URL.revokeObjectURL(item.preview)
                }
            })
        }
    }, []) // Component unmount 時清理，但 update 時可以不清理嗎？其實最好是 track diff，這裡簡單處理。

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event

        if (over && active.id !== over.id) {
            const oldIndex = items.findIndex(item => item.id === active.id)
            const newIndex = items.findIndex(item => item.id === over.id)
            onChange(arrayMove(items, oldIndex, newIndex))
        }
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || [])
        if (files.length === 0) return

        const newItems: ImageItem[] = []

        // 限制總數
        const remainingSlots = maxImages - items.length
        const filesToProcess = files.slice(0, remainingSlots)

        filesToProcess.forEach(file => {
            // 簡單檢查
            if (!file.type.startsWith('image/')) return

            const previewUrl = URL.createObjectURL(file)
            newItems.push({
                type: 'file',
                id: `new-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                file: file,
                preview: previewUrl
            })
        })

        if (newItems.length > 0) {
            onChange([...items, ...newItems])
        }

        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const handleRemove = (id: string) => {
        const itemToRemove = items.find(i => i.id === id)
        if (itemToRemove && itemToRemove.type === 'file') {
            URL.revokeObjectURL(itemToRemove.preview)
        }
        onChange(items.filter(i => i.id !== id))
    }

    const triggerUpload = () => {
        fileInputRef.current?.click()
    }

    return (
        <div className="space-y-4">
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
            />

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={items.map(i => i.id)} strategy={horizontalListSortingStrategy}>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {items.map((item, index) => (
                            <SortableImageItem
                                key={item.id}
                                item={item}
                                index={index}
                                onRemove={() => handleRemove(item.id)}
                            />
                        ))}

                        {items.length < maxImages && (
                            <button
                                type="button"
                                onClick={triggerUpload}
                                className="aspect-square bg-muted/30 border-2 border-dashed border-border rounded-xl hover:border-primary/50 hover:bg-accent/50 transition-all flex flex-col items-center justify-center cursor-pointer group"
                            >
                                <div className="h-10 w-10 rounded-full bg-background flex items-center justify-center mb-2 shadow-sm group-hover:scale-110 transition-transform">
                                    <Plus className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                                </div>
                                <span className="text-xs font-medium text-muted-foreground group-hover:text-primary">上傳圖片</span>
                            </button>
                        )}
                    </div>
                </SortableContext>
            </DndContext>
            <p className="text-xs text-muted-foreground text-right">建議尺寸 1000x1000px (1:1), Max 5MB. 最多 {maxImages} 張。</p>
        </div>
    )
}

function SortableImageItem({ item, index, onRemove }: { item: ImageItem, index: number, onRemove: () => void }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    }

    const imageUrl = item.type === 'url' ? item.url : item.preview

    return (
        <div ref={setNodeRef} style={style} className="aspect-square relative bg-background rounded-xl border border-border overflow-hidden group touch-action-none shadow-sm">
            {/* Image Preview */}
            <img src={imageUrl} alt={`Product image ${index + 1}`} className="w-full h-full object-cover" />

            {/* Drag Handle */}
            <button
                type="button"
                {...attributes}
                {...listeners}
                className="absolute top-2 left-2 p-1.5 bg-background/80 hover:bg-background text-foreground rounded-md cursor-grab active:cursor-grabbing opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity backdrop-blur-sm shadow-sm"
            >
                <GripVertical className="h-4 w-4" />
            </button>

            {/* Remove Button */}
            <button
                type="button"
                onClick={onRemove}
                className="absolute top-2 right-2 p-1.5 bg-destructive/90 hover:bg-destructive text-destructive-foreground rounded-md opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity shadow-sm"
            >
                <Trash2 className="h-4 w-4" />
            </button>

            {/* Badge for new images */}
            {item.type === 'file' && (
                <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-blue-500/90 text-white text-[10px] rounded-full shadow-sm backdrop-blur-sm">
                    待上傳
                </div>
            )}
        </div>
    )
}


