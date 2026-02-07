'use client'

import { useActionState } from 'react'
import { createPage } from '../actions'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const initialState = { error: '' }

export default function NewPagePage() {
    const [state, formAction, pending] = useActionState(createPage, initialState)

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/app/pages" className="p-2 hover:bg-accent rounded-lg text-muted-foreground hover:text-foreground transition-colors">
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <h1 className="text-2xl font-bold text-foreground">新增頁面</h1>
            </div>

            {state.error && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-lg p-4">
                    {state.error}
                </div>
            )}

            <form action={formAction} className="bg-card rounded-xl border border-border p-6 space-y-6 shadow-soft">
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="title">頁面標題 *</Label>
                        <Input id="title" name="title" required placeholder="例：關於我們" className="mt-1.5" />
                    </div>

                    <div>
                        <Label htmlFor="slug">頁面網址 *</Label>
                        <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-muted-foreground">/</span>
                            <Input id="slug" name="slug" required placeholder="about-us" />
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">只能使用小寫英文字母、數字和連字符</p>
                    </div>
                </div>

                <div className="space-y-4 border-t border-border pt-6">
                    <h2 className="text-lg font-semibold text-foreground">頁面設定</h2>
                    <div className="flex items-center gap-6">
                        <label className="flex items-center gap-2 text-foreground cursor-pointer select-none">
                            <input type="checkbox" name="is_homepage" className="rounded border-input bg-background text-primary focus:ring-ring" />
                            設為首頁
                        </label>
                        <label className="flex items-center gap-2 text-foreground cursor-pointer select-none">
                            <input type="checkbox" name="published" className="rounded border-input bg-background text-primary focus:ring-ring" />
                            立即發布
                        </label>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                    <Link href="/app/pages">
                        <Button type="button" variant="outline">取消</Button>
                    </Link>
                    <Button type="submit" disabled={pending} className="bg-foreground text-background hover:bg-foreground/90 shadow-soft">
                        {pending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        建立頁面
                    </Button>
                </div>
            </form>
        </div>
    )
}
