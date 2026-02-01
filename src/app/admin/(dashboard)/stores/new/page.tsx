'use client'

import { useActionState } from 'react'
import { createStore } from './actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Loader2, Store, User, Mail, Key } from 'lucide-react'
import Link from 'next/link'

const initialState = { error: '' }

export default function NewStorePage() {
    const [state, formAction, pending] = useActionState(createStore, initialState)

    return (
        <div className="max-w-2xl">
            <Link
                href="/admin/stores"
                className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white mb-6"
            >
                <ArrowLeft className="h-4 w-4" />
                返回商店列表
            </Link>

            <form action={formAction} className="space-y-6">
                {/* 商店資訊 */}
                <Card className="border-zinc-800 bg-zinc-900">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <Store className="h-5 w-5 text-blue-400" />
                            <div>
                                <CardTitle className="text-white">商店資訊</CardTitle>
                                <CardDescription className="text-zinc-400">
                                    設定新商店的基本資訊
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="name">商店名稱 *</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    placeholder="我的網路商店"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="slug">網址代號 *</Label>
                                <Input
                                    id="slug"
                                    name="slug"
                                    placeholder="my-shop"
                                    required
                                />
                                <p className="text-xs text-zinc-500">
                                    只能使用小寫英文字母、數字和連字符
                                </p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">商店描述</Label>
                            <textarea
                                id="description"
                                name="description"
                                rows={3}
                                placeholder="商店的簡短介紹..."
                                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* 擁有者帳號 */}
                <Card className="border-zinc-800 bg-zinc-900">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <User className="h-5 w-5 text-emerald-400" />
                            <div>
                                <CardTitle className="text-white">擁有者帳號</CardTitle>
                                <CardDescription className="text-zinc-400">
                                    建立商店擁有者的登入帳號（可選）
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="create_owner"
                                    defaultChecked
                                    className="rounded bg-zinc-700 border-zinc-600 text-blue-500"
                                />
                                <div>
                                    <p className="text-white font-medium">建立擁有者帳號</p>
                                    <p className="text-sm text-zinc-400">擁有者可以登入管理自己的商店</p>
                                </div>
                            </label>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="owner_email">
                                    <Mail className="inline h-4 w-4 mr-1" />
                                    擁有者 Email
                                </Label>
                                <Input
                                    id="owner_email"
                                    name="owner_email"
                                    type="email"
                                    placeholder="owner@example.com"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="owner_password">
                                    <Key className="inline h-4 w-4 mr-1" />
                                    初始密碼
                                </Label>
                                <Input
                                    id="owner_password"
                                    name="owner_password"
                                    type="password"
                                    placeholder="至少 6 個字元"
                                />
                            </div>
                        </div>
                        <p className="text-xs text-zinc-500">
                            密碼建議包含英文字母和數字。擁有者登入後可自行修改密碼。
                        </p>
                    </CardContent>
                </Card>

                {state?.error && (
                    <div className="text-sm text-red-400 font-medium bg-red-950/50 border border-red-900 p-4 rounded-lg">
                        {state.error}
                    </div>
                )}

                <div className="flex gap-3">
                    <Link href="/admin/stores" className="flex-1">
                        <Button type="button" variant="outline" className="w-full">
                            取消
                        </Button>
                    </Link>
                    <Button
                        type="submit"
                        disabled={pending}
                        className="flex-1 bg-white text-black hover:bg-zinc-200"
                    >
                        {pending ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                建立中...
                            </>
                        ) : (
                            '建立商店'
                        )}
                    </Button>
                </div>
            </form>
        </div>
    )
}
