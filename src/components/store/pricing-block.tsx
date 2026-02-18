"use client";

import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Check, Star } from "lucide-react";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import confetti from "canvas-confetti";
import NumberFlow from "@number-flow/react";

interface PricingPlan {
    name: string;
    price: string;
    yearlyPrice: string;
    period: string;
    features: string[];
    description: string;
    buttonText: string;
    href: string;
    isPopular: boolean;
}

interface PricingBlockProps {
    plans?: PricingPlan[];
    title?: string;
    description?: string;
    primaryColor?: string;
    backgroundColor?: string;
    textColor?: string;
    paddingYDesktop?: number;
    paddingYMobile?: number;
    isMobile?: boolean;
    showAnnualToggle?: boolean;
    annualToggleText?: string;
    currencySymbol?: string;
    monthlyLabel?: string;
    yearlyLabel?: string;
}

export function PricingBlock({
    plans = [],
    title = "方案價格",
    description = "選擇最適合您的方案\n所有方案皆包含平台存取權限、客戶開發工具及專屬客服支援。",
    primaryColor,
    backgroundColor,
    textColor,
    paddingYDesktop = 64,
    paddingYMobile = 32,
    isMobile = false,
    showAnnualToggle = true,
    annualToggleText = "年繳方案（省 20%）",
    currencySymbol = "NT$",
    monthlyLabel = "按月計費",
    yearlyLabel = "按年計費",
}: PricingBlockProps) {
    const [isMonthly, setIsMonthly] = useState(true);
    const switchRef = useRef<HTMLButtonElement>(null);
    const [isDesktop, setIsDesktop] = useState(false);

    useEffect(() => {
        const media = window.matchMedia("(min-width: 768px)");
        setIsDesktop(media.matches);
        const listener = () => setIsDesktop(media.matches);
        media.addEventListener("change", listener);
        return () => media.removeEventListener("change", listener);
    }, []);

    const handleToggle = (checked: boolean) => {
        setIsMonthly(!checked);
        if (checked && switchRef.current) {
            const rect = switchRef.current.getBoundingClientRect();
            const x = rect.left + rect.width / 2;
            const y = rect.top + rect.height / 2;

            confetti({
                particleCount: 50,
                spread: 60,
                origin: {
                    x: x / window.innerWidth,
                    y: y / window.innerHeight,
                },
                colors: [
                    primaryColor || "#6366f1",
                    "#f59e0b",
                    "#10b981",
                    "#8b5cf6",
                ],
                ticks: 200,
                gravity: 1.2,
                decay: 0.94,
                startVelocity: 30,
                shapes: ["circle"],
            });
        }
    };

    // Use default plans if none provided
    const displayPlans = plans.length > 0 ? plans : [
        {
            name: "入門方案",
            price: "50",
            yearlyPrice: "40",
            period: "每月",
            features: ["最多 10 個專案", "基礎分析報表", "48 小時內回覆", "有限 API 存取", "社群支援"],
            description: "適合個人與小型專案",
            buttonText: "免費試用",
            href: "#",
            isPopular: false,
        },
        {
            name: "專業方案",
            price: "99",
            yearlyPrice: "79",
            period: "每月",
            features: ["無限專案數量", "進階分析報表", "24 小時內回覆", "完整 API 存取", "優先客服支援", "團隊協作功能", "自訂整合"],
            description: "適合成長中的團隊與企業",
            buttonText: "立即開始",
            href: "#",
            isPopular: true,
        },
        {
            name: "企業方案",
            price: "299",
            yearlyPrice: "239",
            period: "每月",
            features: ["包含專業方案所有功能", "客製化解決方案", "專屬客戶經理", "1 小時內回覆", "SSO 單一登入", "進階安全防護", "客製合約", "SLA 服務保證"],
            description: "適合有特殊需求的大型組織",
            buttonText: "聯繫業務",
            href: "#",
            isPopular: false,
        },
    ];

    const effectiveIsMobile = isMobile || !isDesktop;

    return (
        <section
            className="w-full transition-colors duration-300"
            style={{
                backgroundColor: backgroundColor || undefined,
                color: textColor || undefined,
                paddingTop: isMobile ? paddingYMobile : paddingYDesktop,
                paddingBottom: isMobile ? paddingYMobile : paddingYDesktop,
            }}
        >
            <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center space-y-4 mb-12">
                    <h2
                        className="text-4xl font-bold tracking-tight sm:text-5xl"
                        style={{ color: textColor || undefined }}
                    >
                        {title}
                    </h2>
                    <p
                        className="text-lg whitespace-pre-line opacity-70 max-w-2xl mx-auto"
                        style={{ color: textColor || undefined }}
                    >
                        {description}
                    </p>
                </div>

                {showAnnualToggle && (
                    <div className="flex justify-center items-center mb-10">
                        <label className="relative inline-flex items-center cursor-pointer">
                            <Label>
                                <Switch
                                    ref={switchRef as any}
                                    checked={!isMonthly}
                                    onCheckedChange={handleToggle}
                                    className="relative"
                                />
                            </Label>
                        </label>
                        <span className="ml-2 font-semibold">
                            {annualToggleText}
                        </span>
                    </div>
                )}

                <div
                    className={cn(
                        "grid gap-4",
                        effectiveIsMobile ? "grid-cols-1" : "grid-cols-1 md:grid-cols-3"
                    )}
                >
                    {displayPlans.map((plan, index) => (
                        <motion.div
                            key={index}
                            initial={{ y: 50, opacity: 0 }}
                            whileInView={
                                !effectiveIsMobile
                                    ? {
                                        y: plan.isPopular ? -20 : 0,
                                        opacity: 1,
                                        x: index === 2 ? -30 : index === 0 ? 30 : 0,
                                        scale: index === 0 || index === 2 ? 0.94 : 1.0,
                                    }
                                    : { y: 0, opacity: 1 }
                            }
                            viewport={{ once: true }}
                            transition={{
                                duration: 1.6,
                                type: "spring",
                                stiffness: 100,
                                damping: 30,
                                delay: 0.4,
                                opacity: { duration: 0.5 },
                            }}
                            className={cn(
                                `rounded-2xl border p-6 text-center lg:flex lg:flex-col lg:justify-center relative`,
                                plan.isPopular
                                    ? "border-2 shadow-lg"
                                    : "border-gray-200",
                                "flex flex-col",
                                !plan.isPopular && "mt-5",
                                !effectiveIsMobile &&
                                (index === 0 || index === 2
                                    ? "z-0"
                                    : "z-10"),
                                !effectiveIsMobile && index === 0 && "origin-right",
                                !effectiveIsMobile && index === 2 && "origin-left"
                            )}
                            style={{
                                backgroundColor: backgroundColor || "#ffffff",
                                borderColor: plan.isPopular
                                    ? primaryColor || "#6366f1"
                                    : undefined,
                            }}
                        >
                            {plan.isPopular && (
                                <div
                                    className="absolute top-0 right-0 py-0.5 px-2 rounded-bl-xl rounded-tr-xl flex items-center"
                                    style={{
                                        backgroundColor: primaryColor || "#6366f1",
                                    }}
                                >
                                    <Star className="text-white h-4 w-4 fill-current" />
                                    <span className="text-white ml-1 font-sans font-semibold text-sm">
                                        熱門
                                    </span>
                                </div>
                            )}
                            <div className="flex-1 flex flex-col">
                                <p
                                    className="text-base font-semibold opacity-70"
                                    style={{ color: textColor || undefined }}
                                >
                                    {plan.name}
                                </p>
                                <div className="mt-6 flex items-center justify-center gap-x-2">
                                    <span
                                        className="text-5xl font-bold tracking-tight"
                                        style={{ color: textColor || undefined }}
                                    >
                                        {currencySymbol}
                                        <NumberFlow
                                            value={
                                                isMonthly
                                                    ? Number(plan.price)
                                                    : Number(plan.yearlyPrice)
                                            }
                                            format={{
                                                minimumFractionDigits: 0,
                                                maximumFractionDigits: 0,
                                            }}
                                            transformTiming={{
                                                duration: 500,
                                                easing: "ease-out",
                                            }}
                                            willChange
                                        />
                                    </span>
                                    {plan.period !== "Next 3 months" && (
                                        <span className="text-sm font-semibold leading-6 tracking-wide opacity-60">
                                            / {plan.period}
                                        </span>
                                    )}
                                </div>

                                <p className="text-xs leading-5 opacity-60 mt-1">
                                    {isMonthly ? monthlyLabel : yearlyLabel}
                                </p>

                                <ul className="mt-5 gap-2 flex flex-col">
                                    {plan.features.map((feature, idx) => (
                                        <li key={idx} className="flex items-start gap-2">
                                            <Check
                                                className="h-4 w-4 mt-1 flex-shrink-0"
                                                style={{ color: primaryColor || "#6366f1" }}
                                            />
                                            <span className="text-left text-sm">{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <hr className="w-full my-4 opacity-20" />

                                <Link
                                    href={plan.href}
                                    className={cn(
                                        buttonVariants({
                                            variant: "outline",
                                        }),
                                        "group relative w-full gap-2 overflow-hidden text-lg font-semibold tracking-tighter",
                                        "transform-gpu ring-offset-current transition-all duration-300 ease-out hover:ring-2 hover:ring-offset-1",
                                        plan.isPopular ? "text-white" : ""
                                    )}
                                    style={{
                                        backgroundColor: plan.isPopular
                                            ? primaryColor || "#6366f1"
                                            : "transparent",
                                        borderColor: plan.isPopular
                                            ? primaryColor || "#6366f1"
                                            : textColor || "#333",
                                        color: plan.isPopular
                                            ? "#ffffff"
                                            : textColor || "#333",
                                    }}
                                >
                                    {plan.buttonText}
                                </Link>
                                <p className="mt-6 text-xs leading-5 opacity-60">
                                    {plan.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
