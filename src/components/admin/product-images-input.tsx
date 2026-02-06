'use client'

import { useState, useRef } from 'react'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, horizontalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Trash2, Loader2, Plus } from 'lucide-react'
import { uploadImage } from '@/lib/upload-utils'

interface Props {
    images: string[]
    onChange: (images: string[]) => void
    maxImages?: number
}

export function ProductImagesInput({ images = [], onChange, maxImages = 5 }: Props) {
    const [uploading, setUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event

        if (over && active.id !== over.id) {
            const oldIndex = images.indexOf(active.id as string)
            const newIndex = images.indexOf(over.id as string)
            onChange(arrayMove(images, oldIndex, newIndex))
        }
    }

    const updateImage = (index: number, newUrl: string) => {
        if (!newUrl) {
            // Remove image
            const newImages = images.filter((_, i) => i !== index)
            onChange(newImages)
        } else {
            // Update image
            const newImages = [...images]
            newImages[index] = newUrl
            onChange(newImages)
        }
    }

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)
        try {
            const url = await uploadImage(file, { bucket: 'product-images', folder: 'content' })
            if (url) {
                onChange([...images, url])
            }
        } catch (err) {
            console.error('Upload failed:', err)
            alert('圖片上傳失敗，請重試')
        } finally {
            setUploading(false)
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
        }
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
                onChange={handleUpload}
                disabled={uploading}
            />

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={images} strategy={horizontalListSortingStrategy}>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {images.map((url, index) => (
                            <SortableImageItem
                                key={url}
                                url={url}
                                index={index}
                                onChange={(val) => updateImage(index, val)}
                                onRemove={() => updateImage(index, '')}
                            />
                        ))}

                        {images.length < maxImages && (
                            <button
                                type="button"
                                onClick={triggerUpload}
                                disabled={uploading}
                                className="aspect-square bg-zinc-800 border-2 border-dashed border-zinc-700 rounded-lg hover:border-zinc-500 hover:bg-zinc-700/50 transition-colors flex flex-col items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {uploading ? (
                                    <Loader2 className="h-6 w-6 text-zinc-400 animate-spin" />
                                ) : (
                                    <>
                                        <Plus className="h-8 w-8 text-zinc-500 mb-2" />
                                        <span className="text-xs text-zinc-400">新增圖片</span>
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </SortableContext>
            </DndContext>
            <p className="text-xs text-zinc-500 text-right">建議尺寸 1000x1000px (1:1), Max 500KB. 最多 {maxImages} 張。</p>
        </div>
    )
}

function SortableImageItem({ url, index, onChange, onRemove }: { url: string, index: number, onChange: (val: string) => void, onRemove: () => void }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: url })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    }

    return (
        <div ref={setNodeRef} style={style} className="aspect-square relative bg-zinc-800 rounded-lg border border-zinc-700 overflow-hidden group touch-action-none">
            {/* Image Preview */}
            <img src={url} alt={`Product image ${index + 1}`} className="w-full h-full object-cover" />

            {/* Drag Handle */}
            <button
                type="button"
                {...attributes}
                {...listeners}
                className="absolute top-2 left-2 p-1.5 bg-black/50 hover:bg-black/70 text-white rounded cursor-grab active:cursor-grabbing opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
            >
                <GripVertical className="h-4 w-4" />
            </button>

            {/* Remove Button */}
            <button
                type="button"
                onClick={onRemove}
                className="absolute top-2 right-2 p-1.5 bg-red-500/80 hover:bg-red-600 text-white rounded opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
            >
                <Trash2 className="h-4 w-4" />
            </button>
        </div>
    )
}

