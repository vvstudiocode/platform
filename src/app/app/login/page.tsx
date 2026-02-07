'use client'

import { useActionState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Store, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'

export default function AppLoginPage() {
    const router = useRouter()
    const [state, formAction, pending] = useActionState(
        async (prevState: any, formData: FormData) => {
            const email = formData.get('email') as string
            const password = formData.get('password') as string

            const supabase = createClient()
            console.log('Attempting login with:', email) // Debug
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) {
                console.error('Login error:', error) // Debug
                return { error: error.message }
            }

            router.push('/app')
            return {}
        },
        {}
    )

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/10 mb-4 shadow-sm">
                        <Store className="h-8 w-8 text-accent" />
                    </div>
                    <h1 className="text-2xl font-serif font-bold text-foreground">OMO網站平台</h1>
                    <p className="text-muted-foreground mt-2">登入以管理您的商店</p>
                </div>

                {state.error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-4 mb-6 text-sm flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        {state.error}
                    </div>
                )}

                <form action={formAction} className="bg-card rounded-xl border border-border p-6 space-y-4 shadow-soft">
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-foreground">電子郵件</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            required
                            placeholder="your@email.com"
                            className="bg-muted/30 border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-accent"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-foreground">密碼</Label>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            required
                            placeholder="••••••••"
                            className="bg-muted/30 border-border text-foreground focus-visible:ring-accent"
                        />
                    </div>
                    <Button type="submit" disabled={pending} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                        {pending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        登入
                    </Button>
                </form>

                <p className="text-center text-muted-foreground text-sm mt-6">
                    如需開通商店，請聯繫管理員
                </p>
            </div>
        </div>
    )
}
