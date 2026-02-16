'use client'

import { useActionState, useState } from 'react'
import { Loader2, Check, Eye, EyeOff, Copy, ExternalLink, MessageSquare, AlertTriangle, CheckCircle2, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { deleteLineSettings } from '@/features/line/actions'

interface Props {
    tenantId: string
    isHQ: boolean
    webhookUrl: string
    currentSettings: {
        channelAccessToken: string
        channelSecret: string
        isConfigured: boolean
    }
    welcomeMessage: string
    groupOrderingEnabled: boolean
    notifyShipped: boolean
    notifyCompleted: boolean
    shippedMessage: string
    completedMessage: string
    saveLineAction: (prevState: any, formData: FormData) => Promise<any>
    saveWelcomeAction: (prevState: any, formData: FormData) => Promise<any>
}

export function LineSettingsForm({
    tenantId,
    isHQ,
    webhookUrl,
    currentSettings,
    welcomeMessage,
    groupOrderingEnabled,
    notifyShipped,
    notifyCompleted,
    shippedMessage,
    completedMessage,
    saveLineAction,
    saveWelcomeAction,
}: Props) {
    const [credState, credFormAction, credPending] = useActionState(saveLineAction, {})
    const [msgState, msgFormAction, msgPending] = useActionState(saveWelcomeAction, {})
    const [showToken, setShowToken] = useState(false)
    const [showSecret, setShowSecret] = useState(false)
    const [copied, setCopied] = useState(false)
    const [deleting, setDeleting] = useState(false)

    const copyWebhook = () => {
        navigator.clipboard.writeText(webhookUrl)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const handleDelete = async () => {
        if (!confirm('確定要解除 LINE 連接嗎？這將移除所有已儲存的金鑰。')) return
        setDeleting(true)
        await deleteLineSettings(tenantId, isHQ)
        setDeleting(false)
        window.location.reload()
    }

    return (
        <div className="space-y-6">
            {/* Connection Status */}
            <div className={`rounded-xl border p-4 flex items-center gap-3 ${currentSettings.isConfigured
                ? 'border-emerald-500/30 bg-emerald-500/5'
                : 'border-amber-500/30 bg-amber-500/5'
                }`}>
                {currentSettings.isConfigured ? (
                    <>
                        <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                        <div>
                            <p className="font-medium text-emerald-700 dark:text-emerald-400">LINE Bot 已連接</p>
                            <p className="text-sm text-muted-foreground">您的 LINE 官方帳號已成功串接。</p>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleDelete}
                            disabled={deleting}
                            className="ml-auto text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                            {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        </Button>
                    </>
                ) : (
                    <>
                        <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
                        <div>
                            <p className="font-medium text-amber-700 dark:text-amber-400">尚未連接 LINE Bot</p>
                            <p className="text-sm text-muted-foreground">請依照下方教學設定。</p>
                        </div>
                    </>
                )}
            </div>

            {/* Step-by-Step Tutorial */}
            <div className="bg-card rounded-xl border border-border shadow-soft overflow-hidden">
                <div className="px-6 py-4 border-b border-border">
                    <h2 className="text-lg font-semibold text-foreground">設定教學</h2>
                    <p className="text-sm text-muted-foreground mt-1">請依照以下步驟完成 LINE Bot 串接</p>
                </div>
                <div className="p-6 space-y-6">
                    {/* Step 1 */}
                    <div className="flex gap-4">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold shrink-0">1</div>
                        <div>
                            <p className="font-medium text-foreground">前往 LINE Developers Console</p>
                            <p className="text-sm text-muted-foreground mt-1">
                                登入您的 LINE 帳號，選擇或建立一個 Provider。
                            </p>
                            <a
                                href="https://developers.line.biz/console/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-2"
                            >
                                開啟 LINE Developers <ExternalLink className="h-3 w-3" />
                            </a>
                        </div>
                    </div>

                    {/* Step 2 */}
                    <div className="flex gap-4">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold shrink-0">2</div>
                        <div>
                            <p className="font-medium text-foreground">建立 Messaging API Channel</p>
                            <p className="text-sm text-muted-foreground mt-1">
                                在 Provider 下建立一個 <strong>Messaging API</strong> 類型的 Channel。
                                填寫 Channel 名稱 (即 Bot 名稱) 與其他基本資訊。
                            </p>
                        </div>
                    </div>

                    {/* Step 3 */}
                    <div className="flex gap-4">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold shrink-0">3</div>
                        <div>
                            <p className="font-medium text-foreground">複製金鑰</p>
                            <p className="text-sm text-muted-foreground mt-1">
                                在 Channel 的 <strong>Basic settings</strong> 頁面找到 <code className="bg-muted px-1.5 py-0.5 rounded text-xs">Channel secret</code>。
                                在 <strong>Messaging API</strong> 頁面最下方找到 <code className="bg-muted px-1.5 py-0.5 rounded text-xs">Channel access token (long-lived)</code>，按 Issue 產生。
                            </p>
                        </div>
                    </div>

                    {/* Step 4 */}
                    <div className="flex gap-4">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold shrink-0">4</div>
                        <div>
                            <p className="font-medium text-foreground">貼上金鑰到下方表單</p>
                            <p className="text-sm text-muted-foreground mt-1">
                                將 Channel Access Token 與 Channel Secret 貼到下方欄位並儲存。
                                系統會自動驗證金鑰是否有效。
                            </p>
                        </div>
                    </div>

                    {/* Step 5 - Webhook URL */}
                    <div className="flex gap-4">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold shrink-0">5</div>
                        <div className="flex-1">
                            <p className="font-medium text-foreground">設定 Webhook URL</p>
                            <p className="text-sm text-muted-foreground mt-1">
                                回到 LINE Developers Console → Messaging API 頁面，
                                將下方的 Webhook URL 貼上並 <strong>開啟 Use webhook</strong>。
                            </p>
                            <div className="mt-3 flex items-center gap-2">
                                <code className="flex-1 bg-muted px-3 py-2 rounded-lg text-xs font-mono text-foreground break-all">
                                    {webhookUrl}
                                </code>
                                <Button variant="outline" size="sm" onClick={copyWebhook} className="shrink-0">
                                    {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Step 6 */}
                    <div className="flex gap-4">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold shrink-0">6</div>
                        <div>
                            <p className="font-medium text-foreground">關閉自動回應</p>
                            <p className="text-sm text-muted-foreground mt-1">
                                在 LINE Official Account Manager 中，前往 <strong>回應設定</strong>，
                                將「自動回應訊息」關閉，否則會和我們的 Bot 衝突。
                            </p>
                            <a
                                href="https://manager.line.biz/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-2"
                            >
                                開啟 LINE OA Manager <ExternalLink className="h-3 w-3" />
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Credentials Form */}
            <form action={credFormAction}>
                <div className="bg-card rounded-xl border border-border shadow-soft overflow-hidden">
                    <div className="px-6 py-4 border-b border-border">
                        <h2 className="text-lg font-semibold text-foreground">🔑 金鑰設定</h2>
                        <p className="text-sm text-muted-foreground mt-1">您的金鑰將以 AES-256 加密儲存，安全無虞。</p>
                    </div>
                    <div className="p-6 space-y-4">
                        {credState?.error && (
                            <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-lg p-3 text-sm">
                                {credState.error}
                            </div>
                        )}
                        {credState?.success && (
                            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-lg p-3 text-sm flex items-center gap-2">
                                <Check className="h-4 w-4" />
                                {credState.message}
                            </div>
                        )}

                        <div>
                            <Label htmlFor="channelAccessToken">Channel Access Token</Label>
                            <div className="relative mt-1">
                                <Input
                                    id="channelAccessToken"
                                    name="channelAccessToken"
                                    type={showToken ? 'text' : 'password'}
                                    placeholder={currentSettings.isConfigured ? currentSettings.channelAccessToken : '貼上您的 Channel Access Token'}
                                    className="bg-background pr-10 font-mono text-sm"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowToken(!showToken)}
                                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                                >
                                    {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="channelSecret">Channel Secret</Label>
                            <div className="relative mt-1">
                                <Input
                                    id="channelSecret"
                                    name="channelSecret"
                                    type={showSecret ? 'text' : 'password'}
                                    placeholder={currentSettings.isConfigured ? currentSettings.channelSecret : '貼上您的 Channel Secret'}
                                    className="bg-background pr-10 font-mono text-sm"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowSecret(!showSecret)}
                                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                                >
                                    {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        <div className="flex justify-end pt-2">
                            <Button type="submit" disabled={credPending}>
                                {credPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        驗證中...
                                    </>
                                ) : (
                                    '驗證並儲存金鑰'
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </form>

            {/* Welcome Message & Bot Settings */}
            <form action={msgFormAction}>
                <div className="bg-card rounded-xl border border-border shadow-soft overflow-hidden">
                    <div className="px-6 py-4 border-b border-border">
                        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                            <MessageSquare className="h-5 w-5" />
                            Bot 設定
                        </h2>
                    </div>
                    <div className="p-6 space-y-4">
                        {msgState?.error && (
                            <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-lg p-3 text-sm">
                                {msgState.error}
                            </div>
                        )}
                        {msgState?.success && (
                            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-lg p-3 text-sm flex items-center gap-2">
                                <Check className="h-4 w-4" />
                                {msgState.message}
                            </div>
                        )}

                        <div>
                            <Label htmlFor="welcomeMessage">歡迎訊息</Label>
                            <p className="text-xs text-muted-foreground mb-2">
                                當有人加入您的 LINE 好友時，機器人會自動發送這段訊息。
                            </p>
                            <textarea
                                id="welcomeMessage"
                                name="welcomeMessage"
                                rows={4}
                                defaultValue={welcomeMessage}
                                className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-sm"
                                placeholder="歡迎光臨！請先點擊下方選單綁定會員，即可享受 LINE 下單的便利服務 🎉"
                            />
                        </div>

                        <div className="rounded-lg border border-border overflow-hidden">
                            <div className="flex items-center justify-between p-4 bg-muted/20">
                                <div>
                                    <p className="font-medium text-foreground">群組喊單功能 (+1)</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">啟用後，客人在 LINE 群組中輸入商品編號+數量即可加入購物車。</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="groupOrderingEnabled"
                                        defaultChecked={groupOrderingEnabled}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                                </label>
                            </div>

                            {/* Usage Examples */}
                            <div className="p-4 border-t border-border space-y-3">
                                <p className="text-sm font-medium text-foreground">使用方式</p>
                                <p className="text-sm text-muted-foreground">
                                    客人在 LINE 群組中，輸入<strong>「商品編號 + 數量」</strong>即可將商品加入購物車。
                                    系統會使用後台的商品編號（如 <code className="bg-muted px-1.5 py-0.5 rounded text-xs">p000001</code>）自動比對。
                                </p>

                                <div className="bg-muted/30 rounded-lg p-3 space-y-2">
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">範例指令</p>
                                    <div className="space-y-1.5">
                                        <div className="flex items-center gap-2">
                                            <code className="bg-background border border-border px-2 py-1 rounded text-sm font-mono">p000001+1</code>
                                            <span className="text-xs text-muted-foreground">→ 商品 p000001 加入 1 件</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <code className="bg-background border border-border px-2 py-1 rounded text-sm font-mono">p000003+2</code>
                                            <span className="text-xs text-muted-foreground">→ 商品 p000003 加入 2 件</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <code className="bg-background border border-border px-2 py-1 rounded text-sm font-mono">p000010*3</code>
                                            <span className="text-xs text-muted-foreground">→ 商品 p000010 加入 3 件</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-muted/30 rounded-lg p-3 space-y-2">
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">流程說明</p>
                                    <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                                        <li>客人在群組輸入 <code className="bg-muted px-1 py-0.5 rounded text-xs">p000001+1</code></li>
                                        <li>Bot 自動比對商品編號，找到對應商品</li>
                                        <li>若商品<strong>無規格</strong>→ 直接加入購物車，Bot 回覆確認</li>
                                        <li>若商品<strong>有規格</strong>（顏色/尺寸）→ Bot 送出互動卡片讓客人選擇</li>
                                        <li>客人到網站購物車完成結帳</li>
                                    </ol>
                                </div>

                                <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-3">
                                    <p className="text-xs text-amber-700 dark:text-amber-400">
                                        ⚠️ <strong>注意：</strong>客人需先綁定 LINE 帳號與會員帳號，才能使用喊單功能。未綁定的客人輸入指令時，Bot 會提示綁定。
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* LINE Order Notification Toggles */}
                        <div className="rounded-lg border border-border overflow-hidden">
                            <div className="px-4 py-3 bg-muted/20 border-b border-border">
                                <p className="font-medium text-foreground">訂單狀態通知</p>
                                <p className="text-xs text-muted-foreground mt-0.5">訂單狀態改變時，自動透過 LINE 推播通知客人。</p>
                            </div>

                            <div className="divide-y divide-border">
                                {/* Notify Shipped */}
                                <div className="p-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-foreground">已出貨通知</p>
                                            <p className="text-xs text-muted-foreground mt-0.5">訂單狀態改為「已出貨」時，推播通知客人。</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                name="notifyShipped"
                                                defaultChecked={notifyShipped}
                                                className="sr-only peer"
                                                onChange={(e) => {
                                                    const textarea = document.getElementById('shipped-msg-area');
                                                    if (textarea) textarea.style.display = e.target.checked ? 'block' : 'none';
                                                }}
                                            />
                                            <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                                        </label>
                                    </div>
                                    <div id="shipped-msg-area" style={{ display: notifyShipped ? 'block' : 'none' }}>
                                        <label className="text-xs font-medium mb-1.5 block text-muted-foreground">自訂通知內容</label>
                                        <Textarea
                                            name="shippedMessage"
                                            defaultValue={shippedMessage}
                                            placeholder="請輸入通知內容..."
                                            rows={4}
                                            className="text-sm"
                                        />
                                        <p className="text-[10px] text-muted-foreground mt-1.5">
                                            可用變數：<code>{'{{customer}}'}</code> 顧客名稱, <code>{'{{order_number}}'}</code> 訂單編號, <code>{'{{total_amount}}'}</code> 總金額
                                        </p>
                                        <div className="mt-2 bg-muted/30 rounded-lg p-3 space-y-1">
                                            <p className="text-[10px] font-medium text-muted-foreground">範例</p>
                                            <p className="text-xs text-muted-foreground whitespace-pre-line leading-relaxed">
                                                {'出貨通知\n\n{{customer}} 您好！\n您的訂單 #{{order_number}} 已出貨 🚚\n\n訂單金額：NT${{total_amount}}\n\n感謝您的購買！如有問題請隨時聯繫我們 💕'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Notify Completed */}
                                <div className="p-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-foreground">已完成通知</p>
                                            <p className="text-xs text-muted-foreground mt-0.5">訂單狀態改為「已完成」時，推播通知客人。</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                name="notifyCompleted"
                                                defaultChecked={notifyCompleted}
                                                className="sr-only peer"
                                                onChange={(e) => {
                                                    const textarea = document.getElementById('completed-msg-area');
                                                    if (textarea) textarea.style.display = e.target.checked ? 'block' : 'none';
                                                }}
                                            />
                                            <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                                        </label>
                                    </div>
                                    <div id="completed-msg-area" style={{ display: notifyCompleted ? 'block' : 'none' }}>
                                        <label className="text-xs font-medium mb-1.5 block text-muted-foreground">自訂通知內容</label>
                                        <Textarea
                                            name="completedMessage"
                                            defaultValue={completedMessage}
                                            placeholder="請輸入通知內容..."
                                            rows={4}
                                            className="text-sm"
                                        />
                                        <p className="text-[10px] text-muted-foreground mt-1.5">
                                            可用變數：<code>{'{{customer}}'}</code> 顧客名稱, <code>{'{{order_number}}'}</code> 訂單編號, <code>{'{{total_amount}}'}</code> 總金額
                                        </p>
                                        <div className="mt-2 bg-muted/30 rounded-lg p-3 space-y-1">
                                            <p className="text-[10px] font-medium text-muted-foreground">範例</p>
                                            <p className="text-xs text-muted-foreground whitespace-pre-line leading-relaxed">
                                                {'訂單完成通知\n\n{{customer}} 您好！\n您的訂單 #{{order_number}} 已完成 🎉\n\n訂單金額：NT${{total_amount}}\n\n感謝您的支持！期待您再次光臨 💕'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Quota Warning */}
                            <div className="p-4 border-t border-border">
                                <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-3">
                                    <p className="text-xs text-amber-700 dark:text-amber-400">
                                        💡 <strong>額度提醒：</strong>訂單通知使用 LINE 推播訊息（Push Message），會消耗您 LINE 官方帳號的每月免費訊息額度（免費方案 200 則/月）。回覆訊息（Reply Message）不計額度。
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-2">
                            <Button type="submit" disabled={msgPending}>
                                {msgPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        儲存中...
                                    </>
                                ) : (
                                    '儲存 Bot 設定'
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    )
}
