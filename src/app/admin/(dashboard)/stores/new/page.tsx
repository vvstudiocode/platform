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
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
            >
                <ArrowLeft className="h-4 w-4" />
                返回商店列表
            </Link>

            <form action={formAction} className="space-y-6">
                {/* 商店資訊 */}
                <Card className="border-border bg-card">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <Store className="h-5 w-5 text-blue-600" />
                            <div>
                                <CardTitle className="text-foreground">商店資訊</CardTitle>
                                <CardDescription className="text-muted-foreground">
                                    設定新商店的基本資訊
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-foreground">商店名稱 *</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    placeholder="我的網路商店"
                                    required
                                    className="bg-background border-input text-foreground"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="slug" className="text-foreground">網址代號 *</Label>
                                <Input
                                    id="slug"
                                    name="slug"
                                    placeholder="my-shop"
                                    required
                                    className="bg-background border-input text-foreground"
                                />
                                <p className="text-xs text-muted-foreground">
                                    只能使用小寫英文字母、數字和連字符
                                </p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description" className="text-foreground">商店描述</Label>
                            <textarea
                                id="description"
                                name="description"
                                rows={3}
                                placeholder="商店的簡短介紹..."
                                className="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* 擁有者帳號 */}
                <Card className="border-border bg-card">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <User className="h-5 w-5 text-emerald-600" />
                            <div>
                                <CardTitle className="text-foreground">擁有者帳號</CardTitle>
                                <CardDescription className="text-muted-foreground">
                                    建立商店擁有者的登入帳號（可選）
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="bg-muted/50 border border-border rounded-lg p-4">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="create_owner"
                                    defaultChecked
                                    className="rounded border-input text-primary focus:ring-ring"
                                />
                                <div>
                                    <p className="text-foreground font-medium">建立擁有者帳號</p>
                                    <p className="text-sm text-muted-foreground">擁有者可以登入管理自己的商店</p>
                                </div>
                            </label>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="owner_email" className="text-foreground">
                                    <Mail className="inline h-4 w-4 mr-1" />
                                    擁有者 Email
                                </Label>
                                <Input
                                    id="owner_email"
                                    name="owner_email"
                                    type="email"
                                    placeholder="owner@example.com"
                                    className="bg-background border-input text-foreground"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="owner_password" className="text-foreground">
                                    <Key className="inline h-4 w-4 mr-1" />
                                    初始密碼
                                </Label>
                                <Input
                                    id="owner_password"
                                    name="owner_password"
                                    type="password"
                                    placeholder="至少 6 個字元"
                                    className="bg-background border-input text-foreground"
                                />
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            密碼建議包含英文字母和數字。擁有者登入後可自行修改密碼。
                        </p>
                    </CardContent>
                </Card>

                {state?.error && (
                    <div className="text-sm text-destructive font-medium bg-destructive/10 border border-destructive/20 p-4 rounded-lg">
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
                        className="flex-1"
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
