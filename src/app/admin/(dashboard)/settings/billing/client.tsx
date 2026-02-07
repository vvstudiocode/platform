'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CreditCard, Check, Loader2, History, AlertCircle } from 'lucide-react'
import { updateSubscription, bindCreditCard, unbindCreditCard } from './actions'

interface Props {
    tenant: any
    plans: any[]
    history: any[]
}

export function BillingSettingsClient({ tenant, plans, history }: Props) {
    const [isPending, startTransition] = useTransition()
    const [bindingCard, setBindingCard] = useState(false)
    const [error, setError] = useState('')

    const currentPlan = plans.find(p => p.id === tenant.plan_id) || plans[0]

    const submitEcpayForm = (params: Record<string, string>, targetUrl: string) => {
        const form = document.createElement('form')
        form.method = 'POST'
        form.action = targetUrl
        form.style.display = 'none'

        Object.entries(params).forEach(([key, value]) => {
            const input = document.createElement('input')
            input.type = 'hidden'
            input.name = key
            input.value = value as string
            form.appendChild(input)
        })

        document.body.appendChild(form)
        form.submit()
    }

    const handleUpgrade = (planId: string) => {
        if (!tenant.ecpay_card_id && planId !== 'free') {
            setError('請先綁定信用卡才能升級付費方案')
            return
        }

        setError('')

        // Case: Has Card -> Warn about charge
        if (tenant.ecpay_card_id && planId !== 'free') {
            const plan = plans.find(p => p.id === planId)
            if (!confirm(`確定要變更為 ${plan?.name} 嗎？\n系統將立即使用綁定的信用卡扣款 NT$ ${plan?.price_monthly}。`)) {
                return
            }
        } else {
            if (!confirm('確定要變更方案嗎？')) return
        }

        startTransition(async () => {
            const res = await updateSubscription(tenant.id, planId)
            if (res?.error) {
                setError(res.error)
            } else if (res?.requiresBinding && res?.ecpayParams && res?.ecpayUrl) {
                // Redirect to ECPay for binding + auto-upgrade
                submitEcpayForm(res.ecpayParams, res.ecpayUrl)
            } else if (res?.success) {
                // Success (Immediate)
                alert('方案已成功變更！')
            }
        })
    }

    const handleBindCard = async () => {
        setError('')
        setBindingCard(true)
        const formData = new FormData()

        try {
            const res = await bindCreditCard(tenant.id, null, formData)
            if (res.error) {
                setError(res.error)
                setBindingCard(false)
            } else if (res.ecpayParams && res.ecpayUrl) {
                // Auto-submit form to ECPay
                submitEcpayForm(res.ecpayParams, res.ecpayUrl)
                // Don't setBindingCard(false) here, wait for redirect
            }
        } catch (e) {
            setError('發生錯誤')
            setBindingCard(false)
        }
    }

    const handleUnbindCard = async () => {
        if (!confirm('確定要移除信用卡嗎？\n移除後將無法自動續約，可能導致服務中斷。')) return
        setError('')
        startTransition(async () => {
            await unbindCreditCard(tenant.id)
        })
    }

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-xl font-semibold text-foreground mb-2">訂閱與帳單</h2>
                <p className="text-muted-foreground">管理您的商店方案與付款方式。</p>
            </div>

            {error && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    {error}
                </div>
            )}

            {/* Current Status */}
            <div className="grid gap-6 md:grid-cols-2">
                <Card className="bg-card border-border shadow-soft">
                    <CardHeader>
                        <CardTitle className="text-foreground">目前方案</CardTitle>
                        <CardDescription>您的商店目前正在使用的方案。</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h3 className="text-2xl font-bold text-foreground">{currentPlan?.name}</h3>
                                <p className="text-muted-foreground">
                                    {currentPlan?.price_monthly === 0 ? '免費' : `NT$ ${currentPlan?.price_monthly} / 月`}
                                </p>
                            </div>
                            <Badge variant={tenant.subscription_status === 'active' ? 'default' : 'destructive'} className="shadow-none">
                                {tenant.subscription_status === 'active' ? '使用中' : '已暫停'}
                            </Badge>
                        </div>
                        <div className="space-y-2 text-sm text-muted-foreground">
                            <div className="flex justify-between">
                                <span>儲存空間使用量</span>
                                <span>{tenant.storage_usage_mb?.toFixed(1)} / {currentPlan?.storage_limit_mb} MB</span>
                            </div>
                            <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                                <div
                                    className="bg-primary h-full"
                                    style={{ width: `${Math.min(((tenant.storage_usage_mb || 0) / (currentPlan?.storage_limit_mb || 1)) * 100, 100)}%` }}
                                />
                            </div>
                            {tenant.next_billing_at && (
                                <p className="pt-2 text-xs">下次扣款日: {new Date(tenant.next_billing_at).toLocaleDateString()}</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-card border-border shadow-soft">
                    <CardHeader>
                        <CardTitle className="text-foreground">付款方式</CardTitle>
                        <CardDescription>管理您的信用卡資訊 (由綠界科技安全儲存)。</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {tenant.ecpay_card_id ? (
                            <div className="flex items-center gap-4 p-4 border border-border rounded-lg bg-muted/20">
                                <div className="p-2 bg-background border border-border rounded-full">
                                    <CreditCard className="h-6 w-6 text-foreground" />
                                </div>
                                <div>
                                    <p className="text-foreground font-medium">已綁定信用卡</p>
                                    <p className="text-sm text-muted-foreground">Card ID: {tenant.ecpay_card_id}</p>
                                </div>
                                <div className="ml-auto flex flex-col gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-primary hover:text-primary/80 hover:bg-primary/10"
                                        onClick={handleBindCard}
                                        disabled={bindingCard || isPending}
                                    >
                                        變更
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                                        onClick={handleUnbindCard}
                                        disabled={bindingCard || isPending}
                                    >
                                        移除
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-6">
                                <p className="text-muted-foreground mb-4">尚未綁定任何付款方式</p>
                                <Button onClick={handleBindCard} disabled={bindingCard} className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-soft">
                                    {bindingCard && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                    立即綁定信用卡
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Plans List */}
            <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">變更方案</h3>
                <div className="grid gap-6 md:grid-cols-4">
                    {plans.map(plan => {
                        const isCurrent = plan.id === tenant.plan_id
                        return (
                            <Card key={plan.id} className={`flex flex-col border transition-all duration-200 ${isCurrent
                                ? 'bg-card border-primary ring-1 ring-primary shadow-soft'
                                : 'bg-card border-border hover:border-primary/50 shadow-sm hover:shadow-md'
                                }`}>
                                <CardHeader>
                                    <CardTitle className="text-foreground">{plan.name}</CardTitle>
                                    <div className="text-2xl font-bold text-foreground mt-2">
                                        NT$ {plan.price_monthly} <span className="text-sm font-normal text-muted-foreground">/月</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">+{plan.transaction_fee_percent}% 手續費</p>
                                </CardHeader>
                                <CardContent className="flex-1 space-y-3">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Check className="h-4 w-4 text-primary" />
                                        <span>{plan.storage_limit_mb >= 1024 ? `${plan.storage_limit_mb / 1024} GB` : `${plan.storage_limit_mb} MB`} 儲存空間</span>
                                    </div>
                                    {/* Feature mapping could be added here */}
                                </CardContent>
                                <CardFooter>
                                    <Button
                                        className="w-full shadow-soft"
                                        variant={isCurrent ? "secondary" : "default"}
                                        disabled={isCurrent || isPending}
                                        onClick={() => handleUpgrade(plan.id)}
                                    >
                                        {isCurrent ? '目前方案' : '選擇此方案'}
                                    </Button>
                                </CardFooter>
                            </Card>
                        )
                    })}
                </div>
            </div>

            {/* Invoice History */}
            <Card className="bg-card border-border shadow-soft">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <History className="h-5 w-5 text-muted-foreground" />
                        <CardTitle className="text-foreground">帳單紀錄</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    {history.length > 0 ? (
                        <div className="relative overflow-x-auto">
                            <table className="w-full text-sm text-left text-muted-foreground">
                                <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
                                    <tr>
                                        <th className="px-6 py-3 font-medium">日期</th>
                                        <th className="px-6 py-3 font-medium">項目</th>
                                        <th className="px-6 py-3 font-medium">金額</th>
                                        <th className="px-6 py-3 font-medium">狀態</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {history.map((tx) => (
                                        <tr key={tx.id} className="hover:bg-muted/20 transition-colors">
                                            <td className="px-6 py-4">{new Date(tx.occurred_at).toLocaleDateString()}</td>
                                            <td className="px-6 py-4">{tx.description || tx.transaction_type}</td>
                                            <td className="px-6 py-4">NT$ {tx.amount}</td>
                                            <td className="px-6 py-4">
                                                <Badge variant="outline" className="border-emerald-500/30 text-emerald-600 bg-emerald-500/10">成功</Badge>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-muted-foreground text-center py-8">尚無帳單紀錄</p>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
