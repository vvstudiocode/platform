import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { EditorProps } from "../shared/types"
import { SpacingControls } from "../responsive-controls"
import { ImageInput } from "../image-input" // Import ImageInput
import { useListEditor } from "../shared/useListEditor" // Import useListEditor
import { Button } from "@/components/ui/button"
import { Plus, Trash2, Image as ImageIcon, GripVertical } from "lucide-react"
import { useState } from "react"
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
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: img.url || `img-${index}` })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="flex gap-2 items-start bg-muted/30 p-2 rounded-lg relative group"
        >
            <div
                {...attributes}
                {...listeners}
                className="mt-3 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
            >
                <GripVertical className="h-4 w-4" />
            </div>

            <div className="flex-1 space-y-1">
                <ImageInput
                    value={img.url}
                    onChange={(value) => onUpdate(index, 'url', value)}
                    placeholder="圖片網址"
                />
                <Input
                    placeholder="替代文字 (選填)"
                    value={img.alt || ''}
                    onChange={(e) => onUpdate(index, 'alt', e.target.value)}
                    className="h-8 text-sm"
                />
                <Input
                    placeholder="連結網址 (選填)"
                    value={img.link || ''}
                    onChange={(e) => onUpdate(index, 'link', e.target.value)}
                    className="h-8 text-sm"
                />
            </div>

            <button
                type="button"
                onClick={() => onRemove(index)}
                className="p-1.5 text-muted-foreground hover:text-destructive mt-1"
            >
                <Trash2 className="h-4 w-4" />
            </button>
        </div>
    )
}

export function ImageMarqueeEditor({ props, onChange, tenantId }: Props) {
    const {
        speed = 30,
        direction = "left",
        pauseOnHover = true,
        backgroundColor = "#ffffff",
        imageHeight = 100,
        imageGap = 32,
        paddingYDesktop = 64,
        paddingYMobile = 32
    } = props || {}

    // Use useListEditor for image management
    const { add, remove, update, move, items: images } = useListEditor(
        props.images || [],
        'images',
        onChange
    )

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

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event

        if (over && active.id !== over.id) {
            const oldIndex = images.findIndex((img: any) => (img.url || `img-${images.indexOf(img)}`) === active.id)
            const newIndex = images.findIndex((img: any) => (img.url || `img-${images.indexOf(img)}`) === over.id)

            if (oldIndex !== -1 && newIndex !== -1) {
                // Use move from useListEditor
                move(oldIndex, newIndex)
            }
        }
    }

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <Label>圖片列表</Label>
                    <span className="text-xs text-muted-foreground">
                        ({images.length}/6)
                    </span>
                </div>

                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={images.map((img: any, idx: number) => img.url || `img-${idx}`)}
                        strategy={verticalListSortingStrategy}
                    >
                        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                            {images.map((img: any, index: number) => (
                                <SortableImageItem
                                    key={img.url || `img-${index}`}
                                    img={img}
                                    index={index}
                                    onRemove={remove}
                                    onUpdate={update}
                                />
                            ))}
                            {images.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground bg-muted/20 rounded-lg border border-dashed border-border text-sm">
                                    <ImageIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                    尚無圖片，請點擊下方按鈕新增
                                </div>
                            )}
                        </div>
                    </SortableContext>
                </DndContext>

                {images.length < 6 ? (
                    <button
                        type="button"
                        onClick={() => add({ url: '', alt: '', link: '' })}
                        className="w-full py-2 border-2 border-dashed border-input rounded-lg text-muted-foreground hover:text-foreground hover:border-accent transition-colors flex items-center justify-center gap-2"
                    >
                        <Plus className="h-4 w-4" />
                        新增圖片
                    </button>
                ) : (
                    <div className="text-center text-xs text-amber-500 font-medium py-2">
                        已達圖片上限 (6張)
                    </div>
                )}
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
                        <SelectItem value="up">向上</SelectItem>
                        <SelectItem value="down">向下</SelectItem>
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

            <div className="flex items-center justify-between">
                <Label htmlFor="fade-out">邊緣淡出效果</Label>
                <div className="flex items-center h-6">
                    <input
                        id="fade-out"
                        type="checkbox"
                        checked={props.fadeOut ?? false}
                        onChange={(e) => handleChange('fadeOut', e.target.checked)}
                        className="w-5 h-5 rounded border-gray-300 accent-primary"
                    />
                </div>
            </div>

            <div className="flex items-center justify-between">
                <Label htmlFor="scale-hover">懸停縮放效果</Label>
                <div className="flex items-center h-6">
                    <input
                        id="scale-hover"
                        type="checkbox"
                        checked={props.scaleOnHover ?? false}
                        onChange={(e) => handleChange('scaleOnHover', e.target.checked)}
                        className="w-5 h-5 rounded border-gray-300 accent-primary"
                    />
                </div>
            </div>
        </div>
    )
}
