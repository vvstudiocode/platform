import { Settings, Bell, Shield, Database } from 'lucide-react'

export default function SettingsPage() {
    const settingSections = [
        {
            icon: Settings,
            title: '一般設定',
            description: '平台基本設定與配置',
            status: '即將推出',
        },
        {
            icon: Bell,
            title: '通知設定',
            description: '設定 Email 與推播通知',
            status: '即將推出',
        },
        {
            icon: Shield,
            title: '安全設定',
            description: '密碼、雙因素驗證等',
            status: '即將推出',
        },
        {
            icon: Database,
            title: '資料庫管理',
            description: '資料備份與匯出',
            status: '即將推出',
        },
    ]

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-white">系統設定</h1>
                <p className="text-zinc-400 mt-1">管理平台的全域設定</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {settingSections.map((section) => (
                    <div
                        key={section.title}
                        className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 opacity-60"
                    >
                        <div className="flex items-start justify-between">
                            <section.icon className="h-6 w-6 text-zinc-400" />
                            <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-1 rounded">
                                {section.status}
                            </span>
                        </div>
                        <h3 className="font-semibold text-white mt-4">{section.title}</h3>
                        <p className="text-sm text-zinc-500 mt-1">{section.description}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}
