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
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md border-border bg-card shadow-soft">
                <CardHeader className="text-center">
                    <div className="mx-auto w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                        <Store className="h-6 w-6 text-accent" />
                    </div>
                    <CardTitle className="text-2xl font-serif text-foreground">總部管理後台</CardTitle>
                    <CardDescription className="text-muted-foreground">
                        登入以管理您的平台
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={formAction} className="grid gap-4">
                        {(error || state?.error) && (
                            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 p-3 rounded-lg">
                                <AlertCircle className="h-4 w-4 shrink-0" />
                                {error || state.error}
                            </div>
                        )}

                        <div className="grid gap-2">
                            <Label htmlFor="email" className="text-foreground">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="admin@example.com"
                                required
                                className="bg-muted/30 border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-accent"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password" className="text-foreground">密碼</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="bg-muted/30 border-border text-foreground focus-visible:ring-accent"
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={pending}
                            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
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

function LoadingState() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
    )
}

export default function AdminLoginPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <LoginForm />
        </Suspense>
    )
}
