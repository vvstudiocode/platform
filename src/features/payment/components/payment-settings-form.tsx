'use client'

import { useActionState, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { savePaymentSettings, deletePaymentSettings } from '../actions'
import { CreditCard, Eye, EyeOff, CheckCircle2, AlertTriangle, ExternalLink, Trash2 } from 'lucide-react'

interface PaymentSettingsFormProps {
    tenantId: string
    isHQ: boolean
    initialSettings: {
        merchantId: string
        hashKey: string
        hashIV: string
        isConfigured: boolean
    }
}

type FormState = {
    success?: boolean
    message?: string
    error?: string
}

export function PaymentSettingsForm({ tenantId, isHQ, initialSettings }: PaymentSettingsFormProps) {
    const [showKeys, setShowKeys] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    const saveAction = savePaymentSettings.bind(null, tenantId, isHQ)
    const [state, formAction, pending] = useActionState<FormState, FormData>(saveAction, {})

    const handleDelete = async () => {
        if (!confirm('確定要刪除收款設定嗎？刪除後將無法接受線上付款。')) return
        setIsDeleting(true)
        await deletePaymentSettings(tenantId, isHQ)
        setIsDeleting(false)
        window.location.reload()
    }

    return (
        <div className="space-y-6">
            {/* ECPay Setup Instructions */}
            <Alert className="border-blue-500/50 bg-blue-500/10">
                <CreditCard className="h-4 w-4" />
                <AlertTitle>綠界 ECPay 設定教學</AlertTitle>
                <AlertDescription className="mt-2 space-y-2 text-sm">
                    <p>請依照以下步驟取得您的收款金鑰：</p>
                    <ol className="list-decimal list-inside space-y-1 ml-2">
                        <li>登入 <a href="https://vendor.ecpay.com.tw" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline inline-flex items-center gap-1">綠界廠商後台 <ExternalLink className="h-3 w-3" /></a></li>
                        <li>點選「系統開發管理」→「系統介接設定」</li>
                        <li>複製「特店編號 (MerchantID)」</li>
                        <li>複製「HashKey」和「HashIV」</li>
                        <li>將上述資訊貼到下方表單</li>
                    </ol>
                    <p className="text-muted-foreground mt-2">
                        <strong>測試環境：</strong>可使用測試特店編號 <code className="bg-muted px-1 rounded">3002607</code>
                    </p>
                </AlertDescription>
            </Alert>

            {/* Status Indicator */}
            {initialSettings.isConfigured && (
                <Alert className="border-green-500/50 bg-green-500/10">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <AlertTitle>收款設定已完成</AlertTitle>
                    <AlertDescription>
                        您的商店已可以接受線上付款。如需更新金鑰，請在下方重新輸入。
                    </AlertDescription>
                </Alert>
            )}

            {!initialSettings.isConfigured && (
                <Alert className="border-yellow-500/50 bg-yellow-500/10">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    <AlertTitle>尚未設定收款</AlertTitle>
                    <AlertDescription>
                        請完成設定後，您的商店才能接受信用卡付款。
                    </AlertDescription>
                </Alert>
            )}

            {/* Settings Form */}
            <Card>
                <CardHeader>
                    <CardTitle>ECPay 金流設定</CardTitle>
                    <CardDescription>
                        輸入您的綠界收款金鑰。這些資訊將被加密儲存。
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={formAction} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="merchantId">特店編號 (Merchant ID)</Label>
                            <Input
                                id="merchantId"
                                name="merchantId"
                                defaultValue={initialSettings.merchantId}
                                placeholder="例如：3002607"
                                className="font-mono"
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="hashKey">HashKey</Label>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowKeys(!showKeys)}
                                    className="h-6 text-xs"
                                >
                                    {showKeys ? <EyeOff className="h-3 w-3 mr-1" /> : <Eye className="h-3 w-3 mr-1" />}
                                    {showKeys ? '隱藏' : '顯示'}
                                </Button>
                            </div>
                            <Input
                                id="hashKey"
                                name="hashKey"
                                type={showKeys ? 'text' : 'password'}
                                placeholder={initialSettings.hashKey || '輸入您的 HashKey'}
                                className="font-mono"
                            />
                            {initialSettings.hashKey && (
                                <p className="text-xs text-muted-foreground">目前設定：{initialSettings.hashKey}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="hashIV">HashIV</Label>
                            <Input
                                id="hashIV"
                                name="hashIV"
                                type={showKeys ? 'text' : 'password'}
                                placeholder={initialSettings.hashIV || '輸入您的 HashIV'}
                                className="font-mono"
                            />
                            {initialSettings.hashIV && (
                                <p className="text-xs text-muted-foreground">目前設定：{initialSettings.hashIV}</p>
                            )}
                        </div>

                        {state?.error && (
                            <Alert variant="destructive">
                                <AlertDescription>{state.error}</AlertDescription>
                            </Alert>
                        )}

                        {state?.success && (
                            <Alert className="border-green-500/50 bg-green-500/10">
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                <AlertDescription>收款設定已儲存成功！</AlertDescription>
                            </Alert>
                        )}

                        <div className="flex items-center justify-between pt-4">
                            <Button type="submit" disabled={pending}>
                                {pending ? '儲存中...' : '儲存設定'}
                            </Button>

                            {initialSettings.isConfigured && (
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                >
                                    <Trash2 className="h-4 w-4 mr-1" />
                                    {isDeleting ? '刪除中...' : '刪除設定'}
                                </Button>
                            )}
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
