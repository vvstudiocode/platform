'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Edit, Check, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Item {
    id: string
    name: string
}

interface Props {
    type: 'brand' | 'category'
    items: Item[]
    tenantId: string
    createAction: (tenantId: string, name: string) => Promise<{ error?: string; success?: boolean }>
    updateAction: (id: string, name: string) => Promise<{ error?: string; success?: boolean }>
    deleteAction: (id: string) => Promise<{ error?: string; success?: boolean }>
}

export function BrandCategoryManager({ type, items, tenantId, createAction, updateAction, deleteAction }: Props) {
    const router = useRouter()
    const [newName, setNewName] = useState('')
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editingName, setEditingName] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const label = type === 'brand' ? '品牌' : '分類'

    const handleCreate = async () => {
        if (!newName.trim()) return
        setLoading(true)
        setError('')

        const result = await createAction(tenantId, newName)
        if (result.error) {
            setError(result.error)
        } else {
            setNewName('')
            router.refresh()
        }
        setLoading(false)
    }

    const handleUpdate = async (id: string) => {
        if (!editingName.trim()) return
        setLoading(true)
        setError('')

        const result = await updateAction(id, editingName)
        if (result.error) {
            setError(result.error)
        } else {
            setEditingId(null)
            router.refresh()
        }
        setLoading(false)
    }

    const handleDelete = async (id: string) => {
        if (!confirm(`確定要刪除此${label}嗎？`)) return
        setLoading(true)

        const result = await deleteAction(id)
        if (result.error) {
            setError(result.error)
        } else {
            router.refresh()
        }
        setLoading(false)
    }

    const startEdit = (item: Item) => {
        setEditingId(item.id)
        setEditingName(item.name)
    }

    return (
        <div className="space-y-4">
            {error && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-lg p-3 text-sm">
                    {error}
                </div>
            )}

            {/* Add new item */}
            <div className="flex gap-2">
                <Input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder={`輸入新${label}名稱...`}
                    className="bg-background"
                    onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                />
                <Button onClick={handleCreate} disabled={loading || !newName.trim()} className="shadow-soft">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4 mr-1" />}
                    新增
                </Button>
            </div>

            {/* List */}
            <div className="bg-card rounded-xl border border-border divide-y divide-border shadow-soft">
                {items.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                        尚無{label}，點擊上方按鈕新增
                    </div>
                ) : (
                    items.map((item) => (
                        <div key={item.id} className="p-4 flex items-center justify-between">
                            {editingId === item.id ? (
                                <div className="flex-1 flex gap-2">
                                    <Input
                                        value={editingName}
                                        onChange={(e) => setEditingName(e.target.value)}
                                        className="bg-background"
                                        onKeyDown={(e) => e.key === 'Enter' && handleUpdate(item.id)}
                                        autoFocus
                                    />
                                    <Button size="icon" variant="ghost" onClick={() => handleUpdate(item.id)} disabled={loading}>
                                        <Check className="h-4 w-4 text-emerald-500" />
                                    </Button>
                                    <Button size="icon" variant="ghost" onClick={() => setEditingId(null)}>
                                        <X className="h-4 w-4 text-muted-foreground" />
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    <span className="text-foreground font-medium">{item.name}</span>
                                    <div className="flex gap-1">
                                        <Button size="icon" variant="ghost" onClick={() => startEdit(item)}>
                                            <Edit className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                                        </Button>
                                        <Button size="icon" variant="ghost" onClick={() => handleDelete(item.id)} disabled={loading}>
                                            <Trash2 className="h-4 w-4 text-destructive hover:text-destructive/80" />
                                        </Button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
