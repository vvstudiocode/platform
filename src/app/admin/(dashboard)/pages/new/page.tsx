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
                <Link href="/admin/pages" className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white">
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <h1 className="text-2xl font-bold text-white">新增頁面</h1>
            </div>

            {state.error && (
                <div className="bg-red-500/20 border border-red-500 text-red-400 rounded-lg p-4">
                    {state.error}
                </div>
            )}

            <form action={formAction} className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 space-y-6">
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="title">頁面標題 *</Label>
                        <Input id="title" name="title" required placeholder="例：關於我們" />
                    </div>

                    <div>
                        <Label htmlFor="slug">頁面網址 *</Label>
                        <div className="flex items-center gap-2">
                            <span className="text-zinc-500">/</span>
                            <Input id="slug" name="slug" required placeholder="about-us" />
                        </div>
                        <p className="text-sm text-zinc-500 mt-1">只能使用小寫英文字母、數字和連字符</p>
                    </div>
                </div>

                <div className="space-y-4 border-t border-zinc-800 pt-6">
                    <h2 className="text-lg font-semibold text-white">SEO 設定</h2>

                    <div>
                        <Label htmlFor="meta_title">Meta 標題</Label>
                        <Input id="meta_title" name="meta_title" placeholder="搜尋引擎顯示的標題" />
                    </div>

                    <div>
                        <Label htmlFor="meta_description">Meta 描述</Label>
                        <textarea
                            id="meta_description"
                            name="meta_description"
                            rows={3}
                            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="搜尋引擎顯示的描述"
                        />
                    </div>
                </div>

                <div className="space-y-4 border-t border-zinc-800 pt-6">
                    <h2 className="text-lg font-semibold text-white">頁面設定</h2>

                    <div className="flex items-center gap-6">
                        <label className="flex items-center gap-2 text-zinc-300 cursor-pointer">
                            <input type="checkbox" name="is_homepage" className="rounded border-zinc-700 bg-zinc-800" />
                            設為首頁
                        </label>
                        <label className="flex items-center gap-2 text-zinc-300 cursor-pointer">
                            <input type="checkbox" name="published" className="rounded border-zinc-700 bg-zinc-800" />
                            立即發布
                        </label>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
                    <Link href="/admin/pages">
                        <Button type="button" variant="outline">取消</Button>
                    </Link>
                    <Button type="submit" disabled={pending}>
                        {pending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        建立頁面
                    </Button>
                </div>
            </form>
        </div>
    )
}
