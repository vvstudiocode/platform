'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Loader2, Plus, Trash2, GripVertical, Image, Type, ChevronDown, ChevronUp, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateStorePageContent } from '../actions'

interface PageComponent {
    id: string
    type: string
    props?: Record<string, any>
}

interface Props {
    storeId: string
    storeName: string
    storeSlug: string
    page: {
        id: string
        title: string
        slug: string
        is_homepage: boolean
        published: boolean
        content: PageComponent[]
    }
    updateAction: (prevState: any, formData: FormData) => Promise<{ error?: string }>
}

const componentTypes = [
    { type: 'hero', icon: Image, label: 'Hero Banner' },
    { type: 'text', icon: Type, label: '文字區塊' },
]

export function StorePageEditForm({ storeId, storeName, storeSlug, page, updateAction }: Props) {
    const [state, formAction, pending] = useActionState(updateAction, { error: '' })
    const [components, setComponents] = useState<PageComponent[]>(page.content || [])
    const [saving, setSaving] = useState(false)
    const [expandedComponent, setExpandedComponent] = useState<string | null>(null)

    const addComponent = (type: string) => {
        const newComponent: PageComponent = {
            id: `comp_${Date.now()}`,
            type,
            props: type === 'hero' ? { title: '標題', subtitle: '副標題' } : { content: '' },
        }
        setComponents([...components, newComponent])
        setExpandedComponent(newComponent.id)
    }

    const updateComponent = (id: string, props: Record<string, any>) => {
        setComponents(components.map(c => c.id === id ? { ...c, props } : c))
    }

    const removeComponent = (id: string) => {
        setComponents(components.filter(c => c.id !== id))
    }

    const moveComponent = (index: number, direction: 'up' | 'down') => {
        const newIndex = direction === 'up' ? index - 1 : index + 1
        if (newIndex < 0 || newIndex >= components.length) return
        const newComponents = [...components]
            ;[newComponents[index], newComponents[newIndex]] = [newComponents[newIndex], newComponents[index]]
        setComponents(newComponents)
    }

    const saveContent = async () => {
        setSaving(true)
        await updateStorePageContent(storeId, page.id, components)
        setSaving(false)
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href={`/admin/stores/${storeId}/pages`} className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <p className="text-sm text-zinc-500">{storeName}</p>
                        <h1 className="text-2xl font-bold text-white">編輯頁面：{page.title}</h1>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <a
                        href={`/store/${storeSlug}/page/${page.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-zinc-400 hover:text-white text-sm"
                    >
                        預覽頁面 →
                    </a>
                </div>
            </div>

            {state.error && (
                <div className="bg-red-500/20 border border-red-500 text-red-400 rounded-lg p-4">
                    {state.error}
                </div>
            )}

            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    <form action={formAction} className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 space-y-4">
                        <h2 className="text-lg font-semibold text-white">頁面設定</h2>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="title">頁面標題</Label>
                                <Input id="title" name="title" required defaultValue={page.title} />
                            </div>
                            <div>
                                <Label htmlFor="slug">頁面網址</Label>
                                <Input id="slug" name="slug" required defaultValue={page.slug} />
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                            <label className="flex items-center gap-2 text-zinc-300 cursor-pointer">
                                <input type="checkbox" name="is_homepage" defaultChecked={page.is_homepage} className="rounded bg-zinc-800 border-zinc-600" />
                                設為首頁
                            </label>
                            <label className="flex items-center gap-2 text-zinc-300 cursor-pointer">
                                <input type="checkbox" name="published" defaultChecked={page.published} className="rounded bg-zinc-800 border-zinc-600" />
                                發布
                            </label>
                        </div>
                        <Button type="submit" variant="outline" disabled={pending}>
                            {pending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            更新設定
                        </Button>
                    </form>

                    <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-white">頁面內容</h2>
                            <Button onClick={saveContent} disabled={saving} size="sm">
                                {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                                儲存內容
                            </Button>
                        </div>

                        <div className="space-y-3">
                            {components.length === 0 && (
                                <div className="text-center py-8 text-zinc-500 border-2 border-dashed border-zinc-700 rounded-lg">
                                    尚無內容，請新增元件
                                </div>
                            )}
                            {components.map((component, index) => (
                                <div key={component.id} className="bg-zinc-800 rounded-lg p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <GripVertical className="h-4 w-4 text-zinc-500" />
                                            <span className="text-white font-medium">
                                                {componentTypes.find(t => t.type === component.type)?.label || component.type}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Button variant="ghost" size="sm" onClick={() => moveComponent(index, 'up')} disabled={index === 0}>
                                                <ChevronUp className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="sm" onClick={() => moveComponent(index, 'down')} disabled={index === components.length - 1}>
                                                <ChevronDown className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="sm" onClick={() => setExpandedComponent(expandedComponent === component.id ? null : component.id)}>
                                                {expandedComponent === component.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                            </Button>
                                            <Button variant="ghost" size="sm" onClick={() => removeComponent(component.id)} className="text-red-400 hover:text-red-300">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    {expandedComponent === component.id && (
                                        <div className="mt-4 pt-4 border-t border-zinc-700 space-y-3">
                                            {component.type === 'hero' && (
                                                <>
                                                    <div>
                                                        <Label>標題</Label>
                                                        <Input
                                                            value={component.props?.title || ''}
                                                            onChange={(e) => updateComponent(component.id, { ...component.props, title: e.target.value })}
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label>副標題</Label>
                                                        <Input
                                                            value={component.props?.subtitle || ''}
                                                            onChange={(e) => updateComponent(component.id, { ...component.props, subtitle: e.target.value })}
                                                        />
                                                    </div>
                                                </>
                                            )}
                                            {component.type === 'text' && (
                                                <div>
                                                    <Label>內容</Label>
                                                    <textarea
                                                        className="w-full px-3 py-2 bg-zinc-900 border border-zinc-600 rounded-lg text-white"
                                                        rows={4}
                                                        value={component.props?.content || ''}
                                                        onChange={(e) => updateComponent(component.id, { ...component.props, content: e.target.value })}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
                        <h2 className="text-lg font-semibold text-white mb-4">新增元件</h2>
                        <div className="space-y-2">
                            {componentTypes.map((type) => (
                                <button
                                    key={type.type}
                                    onClick={() => addComponent(type.type)}
                                    className="w-full flex items-center gap-3 p-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-left transition-colors"
                                >
                                    <type.icon className="h-5 w-5 text-zinc-400" />
                                    <span className="text-white">{type.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
