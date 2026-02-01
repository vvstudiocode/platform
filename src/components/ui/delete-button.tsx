'use client'

import { useState } from 'react'
import { Trash2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
    itemId: string
    itemName: string
    onDelete: (id: string) => Promise<{ error?: string; success?: boolean }>
}

export function DeleteButton({ itemId, itemName, onDelete }: Props) {
    const [showConfirm, setShowConfirm] = useState(false)
    const [deleting, setDeleting] = useState(false)

    const handleDelete = async () => {
        setDeleting(true)
        await onDelete(itemId)
        setDeleting(false)
        setShowConfirm(false)
    }

    if (showConfirm) {
        return (
            <div className="flex items-center gap-1">
                <span className="text-xs text-zinc-400 mr-1">確定刪除？</span>
                <Button
                    size="sm"
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={deleting}
                    className="h-7 px-2"
                >
                    {deleting ? <Loader2 className="h-3 w-3 animate-spin" /> : '是'}
                </Button>
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowConfirm(false)}
                    className="h-7 px-2"
                >
                    否
                </Button>
            </div>
        )
    }

    return (
        <button
            onClick={() => setShowConfirm(true)}
            className="p-2 text-zinc-400 hover:text-red-400 hover:bg-zinc-700 rounded-lg"
            title={`刪除 ${itemName}`}
        >
            <Trash2 className="h-4 w-4" />
        </button>
    )
}
