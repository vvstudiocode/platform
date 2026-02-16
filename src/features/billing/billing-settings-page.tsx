'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, History, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TenantContext } from '@/lib/tenant'

interface Props {
    tenant: TenantContext & {
        storage_usage_mb?: number
        ecpay_card_id?: string | null
        next_billing_at?: string | null
        subscription_status?: string
    }
    plans: any[]
    history: any[]
}

export function BillingSettingsPage({ tenant, plans, history }: Props) {
    const currentPlan = plans.find(p => p.id === tenant.plan_id) || plans[0]

    const handleContact = () => {
        // You can replace this with a specific Line URL or contact form
        window.open('mailto:support@omoselect.shop?subject=詢問方案升級', '_blank')
    }

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-xl font-semibold text-foreground mb-2">訂閱與帳單</h2>
                <p className="text-muted-foreground">檢視您的商店方案與使用狀況。</p>
            </div>

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
                            <Badge variant={tenant.subscription_status === 'active' ? 'default' : 'secondary'} className="shadow-none">
                                {tenant.subscription_status === 'active' ? '使用中' :
                                    tenant.subscription_status === 'past_due' ? '逾期' :
                                        tenant.subscription_status === 'canceled' ? '已取消' :
                                            tenant.subscription_status === 'trialing' ? '試用中' : '未知狀態'}
                            </Badge>
                        </div>
                        <div className="space-y-2 text-sm text-muted-foreground">
                            <div className="flex justify-between">
                                <span>儲存空間使用量</span>
                                <span>{(tenant.storage_usage_mb || 0).toFixed(1)} / {currentPlan?.storage_limit_mb} MB</span>
                            </div>
                            <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                                <div
                                    className="bg-primary h-full"
                                    style={{ width: `${Math.min(((tenant.storage_usage_mb || 0) / (currentPlan?.storage_limit_mb || 1)) * 100, 100)}%` }}
                                />
                            </div>
                            {tenant.next_billing_at && (
                                <div className="pt-4 flex items-center justify-between text-xs text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <span>到期日</span>
                                    </div>
                                    <span className="text-foreground font-mono text-sm">
                                        {new Date(tenant.next_billing_at).toLocaleDateString()}
                                    </span>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-card border-border shadow-soft flex flex-col justify-center items-center text-center p-6">
                    <div className="p-4 bg-primary/10 rounded-full mb-4">
                        <Mail className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">需要協助或變更方案？</h3>
                    <p className="text-sm text-muted-foreground mb-6">
                        如需升級方案、續約或有任何帳務問題，請直接聯繫我們的客服團隊。
                    </p>
                    <Button onClick={handleContact} className="shadow-soft">
                        聯絡客服
                    </Button>
                </Card>
            </div>

            {/* Plans List */}
            <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">方案介紹</h3>
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
                                        {plan.price_monthly === -1 ? (
                                            <span className="text-muted-foreground text-xl">敬請期待</span>
                                        ) : (
                                            <>NT$ {plan.price_monthly} <span className="text-sm font-normal text-muted-foreground">/月</span></>
                                        )}
                                    </div>
                                    <p className="text-sm text-muted-foreground">{plan.transaction_fee_percent > 0 ? '+' : ''}{plan.transaction_fee_percent}% 手續費</p>
                                </CardHeader>
                                <CardContent className="flex-1 space-y-4">
                                    <div className="space-y-2 text-sm text-muted-foreground">
                                        {plan.name === 'Starter 入門版' && (
                                            <>
                                                <div className="flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" /> 無限商品上架</div>
                                                <div className="flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" /> {plan.storage_limit_mb} MB 儲存空間</div>
                                                <div className="flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" /> 基礎網站元件</div>
                                                <div className="flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" /> 基礎銷售報表</div>
                                            </>
                                        )}
                                        {plan.name === 'Growth 進階版' && (
                                            <>
                                                <div className="flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" /> 無限商品上架</div>
                                                <div className="flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" /> 解鎖互動特效元件</div>
                                                <div className="flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" /> 會員分級制度</div>
                                                <div className="flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" /> LINE Bot 下單自動回覆整合</div>
                                                <div className="flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" /> 自訂網域綁定</div>
                                                <div className="flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" /> {plan.storage_limit_mb >= 1024 ? `${plan.storage_limit_mb / 1024} GB` : `${plan.storage_limit_mb} MB`} 儲存空間</div>
                                            </>
                                        )}
                                        {plan.name === 'Roadmap 未來擴充' && (
                                            <>
                                                <div className="flex items-center gap-2 text-muted-foreground"><Check className="h-4 w-4 text-muted-foreground shrink-0" /> 自動化金流 (ECPay / LINE Pay)</div>
                                                <div className="flex items-center gap-2 text-muted-foreground"><Check className="h-4 w-4 text-muted-foreground shrink-0" /> 超商物流整合 (7-11 / 全家)</div>
                                                <div className="flex items-center gap-2 text-muted-foreground"><Check className="h-4 w-4 text-muted-foreground shrink-0" /> 行銷模組（GA4/GSC）</div>
                                            </>
                                        )}
                                        {!['Starter 入門版', 'Growth 進階版', 'Roadmap 未來擴充'].includes(plan.name) && (
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Check className="h-4 w-4 text-primary shrink-0" />
                                                <span>{plan.storage_limit_mb >= 1024 ? `${plan.storage_limit_mb / 1024} GB` : `${plan.storage_limit_mb} MB`} 儲存空間</span>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button
                                        className="w-full shadow-soft"
                                        variant={isCurrent ? "secondary" : "default"}
                                        disabled={isCurrent}
                                        onClick={handleContact}
                                    >
                                        {isCurrent ? '目前方案' : '聯絡我們'}
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
                                    {history.map((tx: any) => (
                                        <tr key={tx.id} className="hover:bg-muted/20 transition-colors">
                                            <td className="px-6 py-4 font-medium text-foreground">
                                                {new Date(tx.occurred_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                {tx.description ? tx.description :
                                                    tx.transaction_type === 'subscription_charge' ? '訂閱費' : tx.transaction_type}
                                            </td>
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
