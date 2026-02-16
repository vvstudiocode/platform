'use client'

import { Dialog, DialogPortal, DialogOverlay, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { Button } from "@/components/ui/button"
import { X, Smartphone, Monitor } from "lucide-react"
import { cn } from "@/lib/utils"
import { PageContentRenderer } from "@/components/store/page-content-renderer"
import { getComponentConfig, getDefaultProps as getRegistryDefaultProps } from "@/components/page-editor/registry"
import { CartProvider } from "@/lib/cart-context"
import { useState } from "react"

interface PageComponent {
    id: string
    type: string
    props: Record<string, any>
}

interface PreviewModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    componentType: string | null
    storeSlug?: string
    tenantId?: string
}

export function PreviewModal({ open, onOpenChange, componentType, storeSlug, tenantId }: PreviewModalProps) {
    const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop')

    if (!componentType) return null

    const config = getComponentConfig(componentType)
    const label = config?.label || componentType

    // Construct a temporary component object for rendering
    const previewComponent: PageComponent = {
        id: 'preview-component',
        type: componentType,
        props: getRegistryDefaultProps(componentType),
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogPortal>
                <DialogOverlay className="z-[220] bg-black/60 backdrop-blur-sm" />
                <DialogPrimitive.Content
                    className={cn(
                        "fixed left-[50%] top-[50%] z-[221] grid w-[95vw] h-[90vh] max-w-6xl translate-x-[-50%] translate-y-[-50%] gap-0 border bg-background p-0 shadow-2xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-xl overflow-hidden flex flex-col"
                    )}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
                        <div className="flex items-center gap-3">
                            <div>
                                <DialogTitle className="text-lg font-bold text-foreground">
                                    {label}
                                </DialogTitle>
                                <DialogDescription className="text-sm text-muted-foreground">
                                    即時預覽元件效果
                                </DialogDescription>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Device Switcher */}
                            <div className="flex items-center bg-muted/50 rounded-lg p-1 border border-border">
                                <button
                                    onClick={() => setPreviewDevice('desktop')}
                                    className={cn(
                                        "p-2 rounded-md transition-all",
                                        previewDevice === 'desktop'
                                            ? "bg-white text-primary shadow-sm"
                                            : "text-muted-foreground hover:text-foreground"
                                    )}
                                    title="桌面預覽"
                                >
                                    <Monitor className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setPreviewDevice('mobile')}
                                    className={cn(
                                        "p-2 rounded-md transition-all",
                                        previewDevice === 'mobile'
                                            ? "bg-white text-primary shadow-sm"
                                            : "text-muted-foreground hover:text-foreground"
                                    )}
                                    title="手機預覽"
                                >
                                    <Smartphone className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="h-6 w-[1px] bg-border mx-2"></div>

                            <button
                                onClick={() => onOpenChange(false)}
                                className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Preview Area */}
                    <div className="flex-1 bg-slate-50 relative overflow-hidden flex items-center justify-center p-8">
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

                        <div
                            className={cn(
                                "bg-white shadow-xl transition-all duration-500 ease-in-out overflow-y-auto scrollbar-hide flex flex-col relative",
                                previewDevice === 'mobile'
                                    ? "w-[375px] h-[667px] rounded-[3rem] border-[8px] border-slate-900 ring-1 ring-slate-900/50"
                                    : "w-full h-full rounded-lg border border-border/40"
                            )}
                        >
                            {/* Mobile Notch (Visual Only) */}
                            {previewDevice === 'mobile' && (
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120px] h-[25px] bg-slate-900 rounded-b-[1rem] z-50"></div>
                            )}

                            <CartProvider>
                                <div className={cn(
                                    "min-h-full",
                                    previewDevice === 'mobile' ? "pt-[40px] pb-[20px]" : ""
                                )}>
                                    <PageContentRenderer
                                        content={[previewComponent]}
                                        storeSlug={storeSlug || ''}
                                        tenantId={tenantId}
                                        preview={true}
                                        previewDevice={previewDevice}
                                        backgroundColor="#ffffff"
                                    />
                                </div>
                            </CartProvider>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-border bg-card flex justify-end gap-3">
                        <Button variant="outline" onClick={() => onOpenChange(false)}>
                            關閉預覽
                        </Button>
                        <Button onClick={() => {
                            // Close modal
                            onOpenChange(false)
                            // The parent component should handle the actual addition
                            const addBtn = document.getElementById(`add-btn-${componentType}`)
                            if (addBtn) addBtn.click()
                        }}>
                            加入此元件
                        </Button>
                    </div>
                </DialogPrimitive.Content>
            </DialogPortal>
        </Dialog>
    )
}
