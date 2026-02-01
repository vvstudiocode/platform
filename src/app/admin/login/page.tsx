'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useSearchParams } from 'next/navigation'
import { useActionState } from 'react'
import { login } from './actions'
import { Store, Loader2, AlertCircle } from 'lucide-react'
import { Suspense } from 'react'

const initialState = { error: '' }

function LoginForm() {
    const searchParams = useSearchParams()
    const error = searchParams.get('error')
    const [state, formAction, pending] = useActionState(login, initialState)

    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-4">
            <Card className="w-full max-w-md border-zinc-800 bg-zinc-900">
                <CardHeader className="text-center">
                    <div className="mx-auto w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center mb-4">
                        <Store className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-2xl text-white">總部管理後台</CardTitle>
                    <CardDescription className="text-zinc-400">
                        登入以管理您的平台
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={formAction} className="grid gap-4">
                        {(error || state?.error) && (
                            <div className="flex items-center gap-2 text-sm text-red-400 bg-red-950/50 border border-red-900 p-3 rounded-lg">
                                <AlertCircle className="h-4 w-4 shrink-0" />
                                {error || state.error}
                            </div>
                        )}

                        <div className="grid gap-2">
                            <Label htmlFor="email" className="text-zinc-300">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="admin@example.com"
                                required
                                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password" className="text-zinc-300">密碼</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="bg-zinc-800 border-zinc-700 text-white"
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={pending}
                            className="w-full bg-white text-black hover:bg-zinc-200 disabled:opacity-50"
                        >
                            {pending ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    登入中...
                                </>
                            ) : (
                                '登入'
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

export default function AdminLoginPage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen items-center justify-center bg-zinc-950">
                <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
            </div>
        }>
            <LoginForm />
        </Suspense>
    )
}
