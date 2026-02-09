'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Mail, Key, Loader2, UserPlus, Check, AlertCircle } from 'lucide-react'
import { createOwnerAccount, resetOwnerPassword } from './actions'

interface Props {
    storeId: string
    hasOwner: boolean
}

export function OwnerAccountManager({ storeId, hasOwner }: Props) {
    const [mode, setMode] = useState<'view' | 'create' | 'reset'>('view')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

    const handleCreate = async (formData: FormData) => {
        setLoading(true)
        setMessage(null)
        const result = await createOwnerAccount(storeId, formData)
        setLoading(false)

        if (result.error) {
            setMessage({ type: 'error', text: result.error })
        } else {
            setMessage({ type: 'success', text: '帳號建立成功！' })
            setMode('view')
        }
    }

    const handleReset = async (formData: FormData) => {
        setLoading(true)
        setMessage(null)
        const result = await resetOwnerPassword(storeId, formData)
        setLoading(false)

        if (result.error) {
            setMessage({ type: 'error', text: result.error })
        } else {
            setMessage({ type: 'success', text: '密碼重設成功！' })
            setMode('view')
        }
    }

    if (mode === 'view') {
        return (
            <div className="space-y-4">
                {message && (
                    <div className={`flex items-center gap-2 p-3 rounded-lg ${message.type === 'success'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                        {message.type === 'success' ? <Check className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                        {message.text}
                    </div>
                )}

                {hasOwner ? (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-emerald-600">
                            <Check className="h-4 w-4" />
                            <span>已建立擁有者帳號</span>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => setMode('reset')}>
                                <Key className="h-4 w-4 mr-2" />
                                重設密碼
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <AlertCircle className="h-4 w-4" />
                            <span>尚未建立擁有者帳號</span>
                        </div>
                        <Button onClick={() => setMode('create')}>
                            <UserPlus className="h-4 w-4 mr-2" />
                            建立擁有者帳號
                        </Button>
                    </div>
                )}
            </div>
        )
    }

    if (mode === 'create') {
        return (
            <form action={handleCreate} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="email">
                            <Mail className="inline h-4 w-4 mr-1" />
                            Email
                        </Label>
                        <Input id="email" name="email" type="email" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">
                            <Key className="inline h-4 w-4 mr-1" />
                            密碼
                        </Label>
                        <Input id="password" name="password" type="password" required minLength={6} />
                    </div>
                </div>

                {message?.type === 'error' && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 text-red-700 border border-red-200">
                        <AlertCircle className="h-4 w-4" />
                        {message.text}
                    </div>
                )}

                <div className="flex gap-2">
                    <Button type="submit" disabled={loading}>
                        {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        建立帳號
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setMode('view')}>
                        取消
                    </Button>
                </div>
            </form>
        )
    }

    if (mode === 'reset') {
        return (
            <form action={handleReset} className="space-y-4">
                <div className="space-y-2 max-w-sm">
                    <Label htmlFor="new_password">
                        <Key className="inline h-4 w-4 mr-1" />
                        新密碼
                    </Label>
                    <Input id="new_password" name="new_password" type="password" required minLength={6} />
                    <p className="text-xs text-muted-foreground">至少 6 個字元</p>
                </div>

                {message?.type === 'error' && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 text-red-700 border border-red-200">
                        <AlertCircle className="h-4 w-4" />
                        {message.text}
                    </div>
                )}

                <div className="flex gap-2">
                    <Button type="submit" disabled={loading}>
                        {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        重設密碼
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setMode('view')}>
                        取消
                    </Button>
                </div>
            </form>
        )
    }

    return null
}

