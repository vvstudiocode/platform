'use client'

import { useActionState, useState } from 'react'
import { ArrowLeft, Loader2, Trash2, GripVertical, Type, Image, LayoutGrid, MessageSquare } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updatePageContent } from '../actions'

interface PageComponent {
    id: string
    type: string
    props: Record<string, any>
}

interface Props {
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
    { type: 'features', icon: LayoutGrid, label: '特色區塊' },
    { type: 'faq', icon: MessageSquare, label: 'FAQ 問答' },
]

export function PageEditForm({ page, updateAction }: Props) {
    const [state, formAction, pending] = useActionState(updateAction, { error: '' })
    const [components, setComponents] = useState<PageComponent[]>(page.content || [])
    const [saving, setSaving] = useState(false)

    const addComponent = (type: string) => {
        const newComponent: PageComponent = {
            id: crypto.randomUUID(),
            type,
            props: getDefaultProps(type),
        }
        setComponents([...components, newComponent])
    }

    const removeComponent = (id: string) => {
        setComponents(components.filter(c => c.id !== id))
    }

    const updateComponent = (id: string, props: Record<string, any>) => {
        setComponents(components.map(c =>
            c.id === id ? { ...c, props: { ...c.props, ...props } } : c
        ))
    }

    const saveContent = async () => {
        setSaving(true)
        await updatePageContent(page.id, components)
        setSaving(false)
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/app/pages" className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <h1 className="text-2xl font-bold text-white">編輯頁面</h1>
                </div>
                <Button onClick={saveContent} disabled={saving}>
                    {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    儲存內容
                </Button>
            </div>

            {state.error && (
                <div className="bg-red-500/20 border border-red-500 text-red-400 rounded-lg p-4">
                    {state.error}
                </div>
            )}

            <form action={formAction} className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 space-y-4">
                <h2 className="text-lg font-semibold text-white">頁面設定</h2>
                <div className="grid gap-4 sm:grid-cols-2">
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
                        <input type="checkbox" name="is_homepage" defaultChecked={page.is_homepage} className="rounded" />
                        設為首頁
                    </label>
                    <label className="flex items-center gap-2 text-zinc-300 cursor-pointer">
                        <input type="checkbox" name="published" defaultChecked={page.published} className="rounded" />
                        發布
                    </label>
                </div>
                <Button type="submit" variant="outline" disabled={pending}>
                    {pending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    更新設定
                </Button>
            </form>

            <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 space-y-4">
                <h2 className="text-lg font-semibold text-white">頁面內容</h2>

                <div className="space-y-4">
                    {components.length === 0 && (
                        <div className="text-center py-8 text-zinc-500">
                            尚無內容，請新增元件
                        </div>
                    )}
                    {components.map((component) => (
                        <div key={component.id} className="bg-zinc-800 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <GripVertical className="h-4 w-4 text-zinc-500 cursor-move" />
                                    <span className="font-medium text-white capitalize">{component.type}</span>
                                </div>
                                <button
                                    onClick={() => removeComponent(component.id)}
                                    className="p-1 text-zinc-500 hover:text-red-400"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                            <ComponentEditor
                                type={component.type}
                                props={component.props}
                                onChange={(props) => updateComponent(component.id, props)}
                            />
                        </div>
                    ))}
                </div>

                <div className="border-t border-zinc-700 pt-4">
                    <p className="text-sm text-zinc-500 mb-3">新增元件</p>
                    <div className="flex flex-wrap gap-2">
                        {componentTypes.map((ct) => (
                            <button
                                key={ct.type}
                                onClick={() => addComponent(ct.type)}
                                className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-300"
                            >
                                <ct.icon className="h-4 w-4" />
                                {ct.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

function getDefaultProps(type: string): Record<string, any> {
    switch (type) {
        case 'hero':
            return { title: '歡迎', subtitle: '這是副標題', backgroundUrl: '', buttonText: '了解更多', buttonUrl: '' }
        case 'text':
            return { content: '請輸入內容...' }
        case 'features':
            return { title: '我們的特色', items: [{ icon: '⭐', title: '特色一', description: '說明' }] }
        case 'faq':
            return { title: '常見問題', items: [{ question: '問題？', answer: '答案' }] }
        default:
            return {}
    }
}

function ComponentEditor({ type, props, onChange }: { type: string; props: Record<string, any>; onChange: (props: Record<string, any>) => void }) {
    switch (type) {
        case 'hero':
            return (
                <div className="space-y-3">
                    <Input placeholder="標題" value={props.title || ''} onChange={(e) => onChange({ title: e.target.value })} />
                    <Input placeholder="副標題" value={props.subtitle || ''} onChange={(e) => onChange({ subtitle: e.target.value })} />
                    <Input placeholder="背景圖片網址" value={props.backgroundUrl || ''} onChange={(e) => onChange({ backgroundUrl: e.target.value })} />
                </div>
            )
        case 'text':
            return (
                <textarea
                    className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white"
                    rows={4}
                    placeholder="輸入內容..."
                    value={props.content || ''}
                    onChange={(e) => onChange({ content: e.target.value })}
                />
            )
        default:
            return (
                <div className="text-zinc-500 text-sm">
                    此元件類型的編輯器開發中
                </div>
            )
    }
}
