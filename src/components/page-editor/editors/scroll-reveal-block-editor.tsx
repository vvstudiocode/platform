import { EditorProps } from '../shared/types'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Plus, Trash2, GripVertical } from 'lucide-react'
import { ImageInput } from '../image-input'
import { SpacingControls } from '../responsive-controls'
import { useState } from 'react'

export function ScrollRevealBlockEditor({ props, onChange }: EditorProps) {
    const items = props.items || []

    const addItem = () => {
        const newItem = {
            id: crypto.randomUUID(),
            title: 'New Section',
            description: 'Enter description here...',
            image: 'https://images.unsplash.com/photo-1760286159549-4413b0063baf?w=800&q=80',
            backgroundColor: '#ffffff'
        }
        onChange({ items: [...items, newItem] })
    }

    const updateItem = (index: number, updates: any) => {
        const newItems = [...items]
        newItems[index] = { ...newItems[index], ...updates }
        onChange({ items: newItems })
    }

    const removeItem = (index: number) => {
        const newItems = items.filter((_: any, i: number) => i !== index)
        onChange({ items: newItems })
    }

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                {items.map((item: any, index: number) => (
                    <div key={item.id || index} className="border border-zinc-200 rounded-lg p-4 bg-white/50">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-2">
                                <span className="bg-zinc-100 text-xs px-2 py-1 rounded text-zinc-600 font-medium">Section {index + 1}</span>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeItem(index)}
                                className="text-red-400 hover:text-red-500 hover:bg-red-50"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <Label className="text-xs text-zinc-500 mb-1.5 block">Title</Label>
                                <Input
                                    value={item.title}
                                    onChange={(e) => updateItem(index, { title: e.target.value })}
                                    className="bg-white border-zinc-200 focus:border-zinc-400"
                                />
                            </div>

                            <div>
                                <Label className="text-xs text-zinc-500 mb-1.5 block">Description</Label>
                                <Textarea
                                    value={item.description}
                                    onChange={(e) => updateItem(index, { description: e.target.value })}
                                    className="bg-white border-zinc-200 focus:border-zinc-400 min-h-[80px]"
                                />
                            </div>

                            <div>
                                <Label className="text-xs text-zinc-500 mb-1.5 block">Background Color</Label>
                                <div className="flex gap-2">
                                    <Input
                                        type="color"
                                        value={item.backgroundColor}
                                        onChange={(e) => updateItem(index, { backgroundColor: e.target.value })}
                                        className="w-10 h-10 p-1 bg-white border-zinc-200 cursor-pointer"
                                    />
                                    <Input
                                        value={item.backgroundColor}
                                        onChange={(e) => updateItem(index, { backgroundColor: e.target.value })}
                                        className="flex-1 bg-white border-zinc-200 focus:border-zinc-400"
                                    />
                                </div>
                            </div>

                            <div>
                                <Label className="text-xs text-zinc-500 mb-1.5 block">Image</Label>
                                <ImageInput
                                    value={item.image}
                                    onChange={(url) => updateItem(index, { image: url })}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <Button onClick={addItem} className="w-full" variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Section
            </Button>

            <div className="space-y-2">
                <Label>Block Background Color</Label>
                <div className="flex gap-2">
                    <Input
                        type="color"
                        value={props.backgroundColor || '#ffffff'}
                        onChange={(e) => onChange({ backgroundColor: e.target.value })}
                        className="w-12 h-9 p-1 cursor-pointer"
                    />
                    <Input
                        type="text"
                        value={props.backgroundColor || ''}
                        onChange={(e) => onChange({ backgroundColor: e.target.value })}
                        placeholder="#ffffff"
                        className="flex-1"
                    />
                </div>
            </div>

            <SpacingControls

                paddingY={{
                    desktop: props.paddingYDesktop ?? 0,
                    mobile: props.paddingYMobile ?? 0
                }}
                onChange={onChange}
            />
        </div>
    )
}
