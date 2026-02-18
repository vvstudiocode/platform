'use client'

import { Dialog, DialogPortal, DialogOverlay, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { Button } from "@/components/ui/button"
import { Check, Sparkles, Zap, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface UpsellModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    featureName?: string
}

export function UpsellModal({ open, onOpenChange, featureName = "進階互動元件" }: UpsellModalProps) {
    const features = [
        "解鎖所有互動特效元件",
        "會員分級制度",
        "LINE Bot 下單自動回覆整合",
        "自訂網域綁定",
        "1GB 儲存空間"
    ]

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogPortal>
                <DialogOverlay className="z-[210]" />
                <DialogPrimitive.Content
                    className={cn(
                        "fixed left-[50%] top-[50%] z-[211] grid w-full max-w-[425px] translate-x-[-50%] translate-y-[-50%] gap-0 border bg-background p-0 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg overflow-hidden"
                    )}
                >

                    <div className="bg-white p-6 text-center relative overflow-hidden pb-2">
                        <div className="relative z-10 flex flex-col items-center">
                            <div className="w-16 h-16 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-full flex items-center justify-center mb-4 border border-indigo-100 shadow-sm">
                                <Sparkles className="w-8 h-8 text-indigo-600" />
                            </div>
                            <DialogTitle className="text-2xl font-bold mb-2 text-slate-900">
                                升級至 Growth 方案
                            </DialogTitle>
                            <DialogDescription className="text-slate-500 text-base max-w-[280px] leading-relaxed">
                                解鎖 <span className="text-indigo-600 font-medium">{featureName}</span> 與更多強大功能
                            </DialogDescription>
                        </div>
                    </div>

                    <div className="px-6 pb-6 pt-2 space-y-6">
                        <div className="space-y-3 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                            {features.map((feature, index) => (
                                <div key={index} className="flex items-start gap-3">
                                    <div className="mt-0.5 w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                                        <Check className="w-3 h-3 text-indigo-600" />
                                    </div>
                                    <span className="text-sm text-slate-700 font-medium">{feature}</span>
                                </div>
                            ))}
                        </div>

                        <div className="flex items-center justify-between px-2">
                            <div>
                                <div className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-0.5">Growth Plan</div>
                                <div className="text-3xl font-bold text-slate-900">NT$ 299 <span className="text-sm font-normal text-slate-400">/ 月</span></div>
                            </div>
                            <div className="text-right">
                                <div className="text-xs text-slate-400 mb-1">每日不到 10 元</div>
                                <div className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-100 text-emerald-700">
                                    最熱門
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="p-6 pt-0 sm:justify-center">
                        <Button
                            className="w-full text-lg py-6 bg-slate-900 hover:bg-slate-800 text-white shadow-xl shadow-slate-200 transition-all hover:scale-[1.01]"
                            onClick={() => window.open('https://lin.ee/SdEyFVl', '_blank')}
                        >
                            <Zap className="w-5 h-5 mr-2 fill-current" />
                            立即升級
                        </Button>
                    </DialogFooter>

                    <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                        <X className="h-4 w-4 text-white" />
                        <span className="sr-only">Close</span>
                    </DialogPrimitive.Close>
                </DialogPrimitive.Content>
            </DialogPortal>
        </Dialog>
    )
}
