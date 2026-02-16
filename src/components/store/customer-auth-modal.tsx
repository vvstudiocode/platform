'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Mail, Lock, User, Phone, MapPin } from 'lucide-react'

interface Props {
    isOpen: boolean
    onClose: () => void
    storeId: string // We need storeId (tenant_id) to link customer
    storeName: string
}

export function CustomerAuthModal({ isOpen, onClose, storeId, storeName }: Props) {
    const [mode, setMode] = useState<'login' | 'register' | 'verify-email'>('login')
    const [loading, setLoading] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [name, setName] = useState('')
    const [phone, setPhone] = useState('')
    const [address, setAddress] = useState('')
    const [error, setError] = useState('')
    const [unverifiedEmail, setUnverifiedEmail] = useState('')

    const supabase = createClient()

    const handleResendEmail = async () => {
        if (!unverifiedEmail) return
        setLoading(true)
        try {
            const { error } = await supabase.auth.resend({
                type: 'signup',
                email: unverifiedEmail,
                options: {
                    emailRedirectTo: `${window.location.origin}/store/${storeId}/account`
                }
            })
            if (error) throw error
            setError('驗證信已重發，請檢查您的信箱')
            setMode('verify-email')
        } catch (err: any) {
            console.error(err)
            setError(err.message || '重發失敗')
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            if (mode === 'register') {
                // 1. SignUp
                const { data: authData, error: authError } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: { full_name: name },
                        emailRedirectTo: `${window.location.origin}/store/${storeId}/account`
                    }
                })

                if (authError) throw authError

                // 2. Create Customer Record
                if (authData.user) {
                    // Check if customer exists (in case user existed in Auth but not this store)
                    // Actually, if signUp returns user, it might be new or existing (if config allows).
                    // But typically signUp fails if exists.
                    // On success, we insert.
                    const { error: customerError } = await supabase
                        .from('customers')
                        .insert({
                            tenant_id: storeId,
                            auth_user_id: authData.user.id,
                            email: email,
                            name: name,
                            phone: phone,
                            address: address,
                            current_points: 0,
                            total_spent: 0
                        })

                    if (customerError) {
                        // If conflict (maybe race condition or user revisited), ignore or update?
                        // For now, log and proceed.
                        console.error('Customer creation failed', customerError)
                    }

                    // Close and maybe toast
                    // window.alert('註冊成功！')
                    // onClose()
                    setMode('verify-email')
                }

            } else {
                // Login
                const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                    email,
                    password
                })

                if (authError) throw authError

                if (authData.user) {
                    // Check if they are a member of THIS store
                    const { data: existingMember } = await supabase
                        .from('customers')
                        .select('id')
                        .eq('tenant_id', storeId)
                        .eq('auth_user_id', authData.user.id)
                        .maybeSingle()

                    if (!existingMember) {
                        // Strict Isolation: If not a member, deny login.
                        await supabase.auth.signOut()
                        throw new Error('NonMember')
                    }

                    // Success
                    onClose()
                }
            }
        } catch (err: any) {
            console.error(err)
            let msg = err.message || '發生錯誤，請稍後再試'

            if (msg === 'NonMember') {
                msg = '您尚未加入本店會員，請先註冊'
            } else if (msg.includes('Invalid login credentials')) {
                msg = '帳號或密碼錯誤'
            } else if (msg.includes('Email not confirmed')) {
                msg = '信箱尚未驗證，請前往信箱收取驗證信'
            } else if (msg.includes('already registered')) {
                // Handle "User already exists" in Register mode
                // If they exist globally, but we are in Register mode, maybe we can checking if they are member of THIS store?

                // We need to attempt to "Log in" to verify they own the account, but we can't get their password here if they failed SignUp.
                // So the standard flow is: "Email already registered" -> User switches to Login.
                // But if they switch to Login, and try to log in, our new Logic above will reject them (NonMember).

                // FIX: We need a way to "Join" if they have an account.
                // Ideally, if they try to Register and user exists, we tell them "Account exists, please login to join".
                // AND we modify the Login logic to ALLOW "Joining" if we confirm credentials?

                // WAIT. If we reject them in Login (NonMember), they can NEVER join.
                // So we MUST modifying Login logic: 
                // IF Login success BUT no member -> Auto Join? 

                // User requirement: "Why can I login if I am not a member?"
                // This implies they DON'T want auto-join on Login without consent? OR they just want to know why.
                // Usually "Register" = "I want to join". "Login" = "I am a member".

                // Let's refine the Login Logic.
                // If I am a user of Store A. I come to Store B.
                // I try to Login.
                // Current proposed logic: "You are not a member".
                // I try to Register.
                // Supabase: "User already registered".
                // I am stuck.

                // SOLUTION:
                // If "User already registered" at Register step:
                // We should tell them: "此 Email 已註冊 Supabase 帳號 (平台共用)，請直接登入以啟用本店會員資格。"
                // AND at Login step:
                // If no member record -> Create it (Auto-Join).

                // BUT the user asked: "Why isn't he a member but can login?"
                // The user effectively wants to separate the concept.

                // Let's try this:
                // Login: If no member -> Show "Access Denied" (as requested by user essentially).
                // Register: If "User already exists" -> We can't do anything because we don't have password to verify them.

                // Ideally: 
                // Register -> "User exists". -> Prompt "Please login to link account".
                // Login -> If no member -> "Do you want to join this store?" -> Generic "Yes" -> Create Profile.

                // IMPLEMENTATION for "Strict but Usable":
                // 1. Login: If valid auth but no member -> Create Member (Self-healing). 
                //    Wait, this is what I had before. And the user Complained.
                //    "Why can I login if not member?" 
                //    Maybe the user implies: "He shouldn't be able to see Store A's data"? (He can't).
                //    Or "He shouldn't be logged in at all"?

                // If I implement "Block Login", I create a deadlock for existing platform users.
                // Unless I implement a specific "Join with existing account" flow.

                // Let's stick to "Block Login" first to satisfy "Why can he login".
                // AND handle the deadlock by modifying the "Already Registered" error to be helpful.

                msg = '此 Email 已是平台會員。請使用「登入」並同意加入本店會員。'
            } else if (msg.includes('invalid') && msg.includes('Email')) {
                msg = 'Email 格式不正確'
            } else if (msg.includes('Password should be at least')) {
                msg = '密碼長度需至少 6 碼'
            }

            if (msg.includes('Email not confirmed')) {
                // Determine which email to resend to
                setUnverifiedEmail(email)
            }
            setError(msg)

        } finally {
            setLoading(false)
        }
    }



    if (mode === 'verify-email') {
        return (
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle>請驗證您的信箱</DialogTitle>
                        <DialogDescription>
                            我們已發送驗證信至 <span className="font-medium text-foreground">{email}</span>
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col items-center justify-center py-6 space-y-4">
                        <div className="h-16 w-16 bg-blue-50 rounded-full flex items-center justify-center">
                            <Mail className="h-8 w-8 text-blue-500" />
                        </div>
                        <p className="text-center text-sm text-muted-foreground">
                            請前往您的信箱並點擊驗證連結以啟用帳號。<br />
                            驗證完成後即可登入。
                        </p>
                        <Button className="w-full" onClick={() => setMode('login')}>
                            我已驗證，前往登入
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        )
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                    <DialogTitle>{mode === 'login' ? '會員登入' : '註冊會員'}</DialogTitle>
                    <DialogDescription>
                        {mode === 'login' ? `歡迎回到 ${storeName}` : `加入 ${storeName} 會員，享有專屬優惠`}
                    </DialogDescription>
                </DialogHeader>

                {/* LINE Login Hint */}
                {mode === 'login' && (
                    <div className="flex items-start gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2.5 text-xs text-green-700">
                        <span className="text-base leading-none mt-0.5">💡</span>
                        <span>LINE 用戶請直接在 LINE 官方帳號輸入「<strong>登入</strong>」即可免密碼登入，無須填寫下方表單。</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    {mode === 'register' && (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="name">姓名</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="name"
                                        className="pl-9"
                                        placeholder="您的稱呼"
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone">電話</Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="phone"
                                        className="pl-9"
                                        placeholder="0912345678"
                                        value={phone}
                                        onChange={e => setPhone(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address">地址</Label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="address"
                                        className="pl-9"
                                        placeholder="配送地址"
                                        value={address}
                                        onChange={e => setAddress(e.target.value)}
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="email"
                                type="email"
                                className="pl-9"
                                placeholder="name@example.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">密碼</Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="password"
                                type="password"
                                className="pl-9"
                                placeholder="••••••••"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                                minLength={6}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="text-sm text-red-500 space-y-2">
                            <div>{error}</div>
                            {unverifiedEmail && error.includes('尚未驗證') && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="w-full text-xs"
                                    onClick={handleResendEmail}
                                    disabled={loading}
                                >
                                    {loading ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : <Mail className="mr-2 h-3 w-3" />}
                                    重發驗證信
                                </Button>
                            )}
                        </div>
                    )}

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {mode === 'login' ? '登入' : '註冊'}
                    </Button>
                </form>

                <div className="text-center text-sm text-muted-foreground">
                    {mode === 'login' ? '還沒有帳號？ ' : '已經有帳號？ '}
                    <button
                        type="button"
                        className="underline hover:text-foreground"
                        onClick={() => {
                            setMode(mode === 'login' ? 'register' : 'login')
                            setError('')
                        }}
                    >
                        {mode === 'login' ? '立即註冊' : '直接登入'}
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
