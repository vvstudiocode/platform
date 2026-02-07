'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { bindCustomDomain, removeCustomDomain } from './actions'
import { Loader2, Globe, CheckCircle, AlertCircle, Trash2 } from 'lucide-react'

interface Props {
    currentDomain?: string | null
}

export function DomainSettingsClient({ currentDomain }: Props) {
    const [domain, setDomain] = useState('')
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [dnsRecords, setDnsRecords] = useState<any[]>([])

    const handleSubmit = () => {
        if (!domain) return
        setError('')
        setSuccess('')
        setDnsRecords([])

        startTransition(async () => {
            const res = await bindCustomDomain(domain)
            if (res.error) {
                setError(res.error)
            } else {
                setSuccess('網域設定成功！請依照下方指示設定 DNS。')
                setDnsRecords(res.dnsRecords || [])
                setDomain('')
            }
        })
    }

    const handleRemove = () => {
        if (!confirm('確定要移除自訂網域嗎？您的網站將無法透過此網址存取。')) return
        startTransition(async () => {
            await removeCustomDomain()
        })
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-semibold text-foreground mb-2">自訂網域</h2>
                <p className="text-muted-foreground">設定您的專屬品牌網址 (Custom Domain)。</p>
            </div>

            {/* Current Domain Status */}
            <Card className="bg-card border-border shadow-soft">
                <CardHeader>
                    <CardTitle className="text-foreground">目前網域</CardTitle>
                </CardHeader>
                <CardContent>
                    {currentDomain ? (
                        <div className="flex items-center justify-between p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                            <div className="flex items-center gap-3">
                                <Globe className="h-5 w-5 text-emerald-600" />
                                <span className="text-emerald-700 dark:text-emerald-400 font-medium text-lg">{currentDomain}</span>
                                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs rounded-full">已連結</span>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-muted-foreground hover:text-destructive"
                                onClick={handleRemove}
                                disabled={isPending}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ) : (
                        <p className="text-muted-foreground">尚未設定自訂網域，目前使用系統預設網址。</p>
                    )}
                </CardContent>
            </Card>

            {/* Bind New Domain */}
            <Card className="bg-card border-border shadow-soft">
                <CardHeader>
                    <CardTitle className="text-foreground">新增網域</CardTitle>
                    <CardDescription>輸入您擁有的網域名稱 (例如: shop.mybrand.com)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-4">
                        <Input
                            placeholder="例如：shop.example.com"
                            value={domain}
                            onChange={(e) => setDomain(e.target.value)}
                            className="bg-background border-input text-foreground"
                        />
                        <Button
                            onClick={handleSubmit}
                            disabled={!domain || isPending}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
                        >
                            {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            設定網域
                        </Button>
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/5 p-3 rounded-md border border-destructive/10">
                            <AlertCircle className="h-4 w-4" />
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                            <div className="flex items-center gap-2 text-emerald-600 text-sm bg-emerald-50 p-3 rounded-md border border-emerald-200">
                                <CheckCircle className="h-4 w-4" />
                                {success}
                            </div>

                            {/* DNS Records Table */}
                            {dnsRecords.length > 0 && (
                                <div className="bg-card rounded-lg border border-border overflow-hidden shadow-sm">
                                    <div className="p-3 bg-muted/50 border-b border-border text-sm font-medium text-foreground">
                                        請至您的網域註冊商新增以下記錄：
                                    </div>
                                    <div className="p-4 overflow-x-auto">
                                        <table className="w-full text-sm text-left">
                                            <thead>
                                                <tr className="text-muted-foreground border-b border-border">
                                                    <th className="pb-2 font-medium">類型 (Type)</th>
                                                    <th className="pb-2 font-medium">名稱 (Name)</th>
                                                    <th className="pb-2 font-medium">值 (Value)</th>
                                                </tr>
                                            </thead>
                                            <tbody className="text-foreground">
                                                {dnsRecords.map((record, i) => (
                                                    <tr key={i} className="border-b border-border/50 last:border-0 hover:bg-muted/10">
                                                        <td className="py-2">{record.recordType}</td>
                                                        <td className="py-2 font-mono text-muted-foreground">{record.recordName}</td>
                                                        <td className="py-2 font-mono text-primary select-all">{record.recordValue}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Fallback Instruction if no records but success (shouldn't happen with new logic but good for safety) */}
                    {!success && !dnsRecords.length && (
                        <div className="bg-muted/30 p-4 rounded-lg border border-border text-sm space-y-3 mt-4">
                            <p className="text-foreground font-medium">DNS 設定說明：</p>
                            <ul className="text-muted-foreground list-disc list-inside space-y-1">
                                <li>點擊設定後，我們會提供您需要設定的 DNS 紀錄。</li>
                                <li>請至您的網域註冊商 (Godaddy, Namecheap, Cloudflare 等) 管理後台操作。</li>
                                <li>設定完成後，全球 DNS 解析可能需要 10分鐘 ~ 24小時 生效。</li>
                            </ul>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
