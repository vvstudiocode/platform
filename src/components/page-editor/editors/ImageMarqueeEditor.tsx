
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { EditorProps } from "../shared/types"
import { SpacingControls } from "../responsive-controls"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, Image as ImageIcon, GripVertical } from "lucide-react"
import { ImageUpload } from "@/components/ui/image-upload"
import { useState } from "react"
import { uploadImage } from "@/lib/upload-utils"
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core'
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

// Define helper directly if not imported
interface Props extends EditorProps {
    tenantId?: string
}

function SortableImageItem({
    img,
    index,
    onRemove,
    onUpdate
}: {
    img: any
    index: number
    onRemove: (index: number) => void
    onUpdate: (index: number, key: string, value: string) => void
}) {
    // Generate a unique ID for the sortable item based on index or content
    // Better to use index as stable ID if list changes? No, use unique ID if possible.
    // For now, simpler to use `id - ${ index } ` but DND prefers stable IDs.
    // Since we don't have IDs on images, we might use URL+Index or just index strictly controlled.
    // Using index as ID with sortable usually requires `items` prop in SortableContext to match.
    // Let's use `img.url` as key if unique, otherwise fallback.
    // Actually, simple index-based sorting logic:
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: img.url || `img - ${index} ` })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="flex gap-3 bg-muted/40 p-3 rounded-lg border border-border group relative items-start"
        >
            <div
                {...attributes}
                {...listeners}
                className="mt-2 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
            >
                <GripVertical className="h-4 w-4" />
            </div>

            <div className="w-16 h-16 bg-muted rounded-md overflow-hidden flex-shrink-0 border border-border">
                <img src={img.url} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 space-y-2 min-w-0">
                <Input
                    value={img.alt || ''}
                    onChange={(e) => onUpdate(index, 'alt', e.target.value)}
                    placeholder="圖片描述 (Alt)"
                    className="h-7 text-xs"
                />
                <Input
                    value={img.link || ''}
                    onChange={(e) => onUpdate(index, 'link', e.target.value)}
                    placeholder="連結網址 (選填)"
                    className="h-7 text-xs"
                />
            </div>
            <button
                onClick={() => onRemove(index)}
                className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm z-10"
            >
                <Trash2 className="h-3 w-3" />
            </button>
        </div>
    )
}

export function ImageMarqueeEditor({ props, onChange, tenantId }: Props) {
    const {
        images = [],
        speed = 30,
        direction = "left",
        pauseOnHover = true,
        backgroundColor = "#ffffff",
        imageHeight = 100,
        imageGap = 32,
        paddingYDesktop = 64,
        paddingYMobile = 32
    } = props || {}

    const [uploadKey, setUploadKey] = useState(0)

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    const handleChange = (key: string, value: any) => {
        onChange({
            ...props,
            [key]: value
        })
    }

    const handleImageAdd = (url: string) => {
        const newImages = [...images, { url, alt: '', link: '' }]
        handleChange('images', newImages)
        setUploadKey(prev => prev + 1)
    }

    const handleUpload = async (formData: FormData) => {
        try {
            const file = formData.get('file') as File
            if (!file) {
                return { error: 'No file selected' }
            }

            // Use the client-side upload utility which handles RLS correctly
            const url = await uploadImage(file, {
                bucket: 'product-images',
                folder: 'content'
            })

            if (url) {
                handleImageAdd(url)
                return { url }
            }
            return { error: 'Upload failed' }
        } catch (e: any) {
            return { error: e.message || 'Upload failed' }
        }
    }

    const handleImageRemove = (index: number) => {
        const newImages = [...images]
        newImages.splice(index, 1)
        handleChange('images', newImages)
    }

    const handleImageUpdate = (index: number, key: string, value: string) => {
        const newImages = [...images]
        newImages[index] = { ...newImages[index], [key]: value }
        handleChange('images', newImages)
    }

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event

        if (over && active.id !== over.id) {
            const oldIndex = images.findIndex((img: any) => (img.url || `img - ${images.indexOf(img)} `) === active.id)
            const newIndex = images.findIndex((img: any) => (img.url || `img - ${images.indexOf(img)} `) === over.id)

            if (oldIndex !== -1 && newIndex !== -1) {
                const newImages = arrayMove(images, oldIndex, newIndex)
                handleChange('images', newImages)
            }
        }
    }

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <Label>圖片列表</Label>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                            ({images.length}/6)
                        </span>
                        {images.length < 6 ? (
                            <ImageUpload
                                key={uploadKey}
                                onUpload={handleUpload}
                            />
                        ) : (
                            <span className="text-xs text-amber-500 font-medium">包含重複效果，只需上傳6張</span>
                        )}
                    </div>
                </div>

                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={images.map((img: any, idx: number) => img.url || `img - ${idx} `)}
                        strategy={verticalListSortingStrategy}
                    >
                        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                            {images.map((img: any, index: number) => (
                                <SortableImageItem
                                    key={img.url || `img - ${index} `}
                                    img={img}
                                    index={index}
                                    onRemove={handleImageRemove}
                                    onUpdate={handleImageUpdate}
                                />
                            ))}
                            {images.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground bg-muted/20 rounded-lg border border-dashed border-border text-sm">
                                    <ImageIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                    尚無圖片，請點擊上方按鈕新增
                                </div>
                            )}
                        </div>
                    </SortableContext>
                </DndContext>
            </div>

            <SpacingControls
                paddingY={{ desktop: paddingYDesktop, mobile: paddingYMobile }}
                onChange={(updates) => {
                    const newProps = { ...props, ...updates }
                    onChange(newProps)
                }}
            />

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>背景顏色</Label>
                    <div className="flex gap-2">
                        <Input
                            type="color"
                            value={backgroundColor}
                            onChange={(e) => handleChange('backgroundColor', e.target.value)}
                            className="w-12 h-10 p-1 cursor-pointer"
                        />
                        <Input
                            type="text"
                            value={backgroundColor}
                            onChange={(e) => handleChange('backgroundColor', e.target.value)}
                            className="flex-1"
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label>圖片高度 ({imageHeight}px)</Label>
                    <Input
                        type="number"
                        min={20}
                        max={500}
                        value={imageHeight}
                        onChange={(e) => handleChange('imageHeight', Number(e.target.value))}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex justify-between">
                    <Label>捲動速度 ({speed})</Label>
                </div>
                <input
                    type="range"
                    min={1}
                    max={100}
                    step={1}
                    value={speed}
                    onChange={(e) => handleChange('speed', Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                />
            </div>

            <div className="space-y-2">
                <div className="flex justify-between">
                    <Label>圖片間距 ({imageGap}px)</Label>
                </div>
                <input
                    type="range"
                    min={0}
                    max={100}
                    step={4}
                    value={imageGap}
                    onChange={(e) => handleChange('imageGap', Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                />
            </div>

            <div className="space-y-2">
                <Label>捲動方向</Label>
                <Select value={direction} onValueChange={(val: string) => handleChange('direction', val)}>
                    <SelectTrigger>
                        <SelectValue placeholder="選擇方向" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="left">向左</SelectItem>
                        <SelectItem value="right">向右</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="flex items-center justify-between">
                <Label htmlFor="pause-hover">懸停暫停</Label>
                <div className="flex items-center h-6">
                    <input
                        id="pause-hover"
                        type="checkbox"
                        checked={pauseOnHover}
                        onChange={(e) => handleChange('pauseOnHover', e.target.checked)}
                        className="w-5 h-5 rounded border-gray-300 accent-primary"
                    />
                </div>
            </div>
        </div>
    )
}
