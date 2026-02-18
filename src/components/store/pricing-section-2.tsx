"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { CheckCircleIcon, StarIcon } from "lucide-react";
import { motion, type Transition } from "framer-motion";

// ─── Types ───────────────────────────────────────────────────────────────────

type FREQUENCY = "monthly" | "yearly";
const frequencies: FREQUENCY[] = ["monthly", "yearly"];

interface PricingPlan {
    name: string;
    description: string;
    /** 月繳價格（字串或數字） */
    price: string | number;
    /** 年繳價格（字串或數字） */
    yearlyPrice: string | number;
    buttonText: string;
    buttonHref?: string;
    buttonVariant?: "outline" | "default";
    popular?: boolean;
    /** 功能列表，每個項目可帶 tooltip */
    features?: { text: string; tooltip?: string }[];
    /** 舊版相容：純字串功能列表 */
    includes?: string[];
}

interface PricingSection2BlockProps {
    title?: string;
    description?: string;
    plans?: PricingPlan[];
    primaryColor?: string;
    backgroundColor?: string;
    textColor?: string;
    /** 切換按鈕選中背景色（預設跟主色調） */
    toggleColor?: string;
    /** 切換按鈕選中文字色 */
    toggleTextColor?: string;
    paddingYDesktop?: number;
    paddingYMobile?: number;
    isMobile?: boolean;
    showAnnualToggle?: boolean;
    monthlyLabel?: string;
    yearlyLabel?: string;
    currencySymbol?: string;
}

// ─── Default Data ─────────────────────────────────────────────────────────────

const defaultPlans: PricingPlan[] = [
    {
        name: "入門方案",
        description: "適合個人與小型專案的基礎方案",
        price: 50,
        yearlyPrice: 480,
        buttonText: "立即開始",
        buttonHref: "#",
        buttonVariant: "outline",
        features: [
            { text: "無限卡片" },
            { text: "自訂背景與貼圖" },
            { text: "雙重驗證", tooltip: "透過雙重驗證保護您的帳號安全" },
            { text: "基礎客服支援" },
        ],
    },
    {
        name: "專業方案",
        description: "最適合成長中團隊的進階功能",
        price: 99,
        yearlyPrice: 990,
        buttonText: "立即開始",
        buttonHref: "#",
        buttonVariant: "default",
        popular: true,
        features: [
            { text: "包含入門方案所有功能" },
            { text: "進階清單管理" },
            { text: "自訂欄位" },
            { text: "雲端功能", tooltip: "自動備份至雲端" },
            { text: "優先客服支援", tooltip: "24/7 即時支援" },
        ],
    },
    {
        name: "企業方案",
        description: "大型團隊專屬的完整方案",
        price: 299,
        yearlyPrice: 2990,
        buttonText: "聯絡我們",
        buttonHref: "#",
        buttonVariant: "outline",
        features: [
            { text: "包含專業方案所有功能" },
            { text: "多板管理" },
            { text: "多板訪客" },
            { text: "附件權限管理" },
            { text: "專屬客戶成功經理" },
        ],
    },
];

// ─── BorderTrail ──────────────────────────────────────────────────────────────

type BorderTrailProps = {
    className?: string;
    size?: number;
    transition?: Transition;
    delay?: number;
    onAnimationComplete?: () => void;
    style?: React.CSSProperties;
};

function BorderTrail({
    className,
    size = 60,
    transition,
    delay,
    onAnimationComplete,
    style,
}: BorderTrailProps) {
    const BASE_TRANSITION = {
        repeat: Infinity,
        duration: 5,
        ease: "linear" as const,
    };

    return (
        <div className="pointer-events-none absolute inset-0 rounded-[inherit] border border-transparent [mask-clip:padding-box,border-box] [mask-composite:intersect] [mask-image:linear-gradient(transparent,transparent),linear-gradient(#000,#000)]">
            <motion.div
                className={cn("absolute aspect-square bg-zinc-400", className)}
                style={{
                    width: size,
                    offsetPath: `rect(0 auto auto 0 round ${size}px)`,
                    ...style,
                }}
                animate={{ offsetDistance: ["0%", "100%"] }}
                transition={{
                    ...(transition ?? BASE_TRANSITION),
                    delay: delay,
                }}
                onAnimationComplete={onAnimationComplete}
            />
        </div>
    );
}

// ─── Frequency Toggle ─────────────────────────────────────────────────────────

function PricingFrequencyToggle({
    frequency,
    setFrequency,
    monthlyLabel,
    yearlyLabel,
    toggleColor,
    toggleTextColor,
}: {
    frequency: FREQUENCY;
    setFrequency: React.Dispatch<React.SetStateAction<FREQUENCY>>;
    monthlyLabel: string;
    yearlyLabel: string;
    toggleColor?: string;
    toggleTextColor?: string;
}) {
    const labels: Record<FREQUENCY, string> = {
        monthly: monthlyLabel,
        yearly: yearlyLabel,
    };

    const activeColor = toggleColor || "#6366f1";
    const activeText = toggleTextColor || "#ffffff";

    return (
        <div className="mx-auto flex w-fit rounded-full border bg-muted/30 p-1">
            {frequencies.map((freq) => (
                <button
                    key={freq}
                    onClick={() => setFrequency(freq)}
                    className="relative px-5 py-1.5 text-sm font-medium transition-colors rounded-full"
                    style={{
                        color: frequency === freq ? activeText : undefined,
                        zIndex: 1,
                    }}
                >
                    <span className="relative z-10">{labels[freq]}</span>
                    {frequency === freq && (
                        <motion.span
                            layoutId="pricing2-freq-toggle"
                            transition={{ type: "spring", duration: 0.4 }}
                            className="absolute inset-0 z-0 rounded-full"
                            style={{ backgroundColor: activeColor }}
                        />
                    )}
                </button>
            ))}
        </div>
    );
}

// ─── Pricing Card ─────────────────────────────────────────────────────────────

function PricingCard({
    plan,
    frequency,
    currencySymbol,
    monthlyLabel,
    yearlyLabel,
    primaryColor,
    textColor,
}: {
    plan: PricingPlan;
    frequency: FREQUENCY;
    currencySymbol: string;
    monthlyLabel: string;
    yearlyLabel: string;
    primaryColor?: string;
    textColor?: string;
}) {
    const [hovered, setHovered] = React.useState(false);
    // 統一轉成數字
    const monthlyPrice = Number(plan.price) || 0;
    const annualPrice = Number(plan.yearlyPrice) || 0;
    const currentPrice = frequency === "monthly" ? monthlyPrice : annualPrice;

    // 計算折扣百分比
    const discountPct =
        frequency === "yearly" && monthlyPrice > 0
            ? Math.round(
                ((monthlyPrice * 12 - annualPrice) / (monthlyPrice * 12)) * 100
            )
            : 0;

    // 功能列表：優先用 features，否則把 includes 轉換
    const featureList: { text: string; tooltip?: string }[] =
        plan.features && plan.features.length > 0
            ? plan.features
            : (plan.includes || []).map((item) => ({ text: item }));

    const accentColor = primaryColor || "#000000";

    return (
        <div
            className={cn(
                "relative flex w-full flex-col rounded-xl border transition-shadow duration-300",
                plan.popular
                    ? "shadow-lg"
                    : "hover:shadow-md"
            )}
            style={
                plan.popular
                    ? { borderColor: accentColor, boxShadow: `0 0 0 1px ${accentColor}40` }
                    : {}
            }
        >
            {/* BorderTrail for popular plan */}
            {plan.popular && (
                <BorderTrail
                    size={80}
                    style={{
                        boxShadow: `0px 0px 40px 20px ${accentColor}80`,
                    }}
                />
            )}

            {/* Card Header */}
            <div
                className={cn(
                    "rounded-t-xl border-b p-5 bg-muted/20",
                    plan.popular && "bg-muted/40"
                )}
            >
                {/* Badges */}
                <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
                    {plan.popular && (
                        <span className="flex items-center gap-1 rounded-md border bg-background px-2 py-0.5 text-xs font-medium">
                            <StarIcon className="h-3 w-3 fill-current" />
                            熱門
                        </span>
                    )}
                    {discountPct > 0 && (
                        <span
                            className="flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium text-white"
                            style={{ backgroundColor: accentColor }}
                        >
                            省 {discountPct}%
                        </span>
                    )}
                </div>

                <div className="text-lg font-semibold">{plan.name}</div>
                <p className="mt-0.5 text-sm text-muted-foreground">{plan.description}</p>

                <div className="mt-3 flex items-end gap-1">
                    <span className="text-3xl font-bold">
                        {currencySymbol}
                        <motion.span
                            key={`${plan.name}-${frequency}`}
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.25 }}
                            className="inline-block"
                        >
                            {currentPrice.toLocaleString()}
                        </motion.span>
                    </span>
                    <span className="mb-0.5 text-sm text-muted-foreground">
                        /{frequency === "monthly" ? monthlyLabel : yearlyLabel}
                    </span>
                </div>
            </div>

            {/* Features */}
            <div
                className={cn(
                    "flex-1 space-y-3 px-5 py-5 text-sm text-muted-foreground",
                    plan.popular && "bg-muted/10"
                )}
            >
                {featureList.map((feature, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                        <CheckCircleIcon
                            className="mt-0.5 h-4 w-4 shrink-0"
                            style={{ color: accentColor }}
                        />
                        <TooltipProvider>
                            <Tooltip delayDuration={0}>
                                <TooltipTrigger asChild>
                                    <p
                                        className={cn(
                                            "leading-snug",
                                            feature.tooltip &&
                                            "cursor-pointer border-b border-dashed border-muted-foreground/50"
                                        )}
                                    >
                                        {feature.text}
                                    </p>
                                </TooltipTrigger>
                                {feature.tooltip && (
                                    <TooltipContent>
                                        <p>{feature.tooltip}</p>
                                    </TooltipContent>
                                )}
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                ))}
            </div>

            {/* CTA Button */}
            <div
                className={cn(
                    "mt-auto border-t p-4",
                    plan.popular && "bg-muted/40"
                )}
            >
                <a
                    href={plan.buttonHref || "#"}
                    onMouseEnter={() => setHovered(true)}
                    onMouseLeave={() => setHovered(false)}
                    className="flex w-full items-center justify-center rounded-md border px-4 py-2 text-sm font-medium transition-all duration-200"
                    style={{
                        backgroundColor: plan.popular
                            ? hovered ? `${accentColor}cc` : accentColor
                            : hovered ? `${accentColor}15` : "transparent",
                        borderColor: plan.popular ? accentColor : hovered ? accentColor : undefined,
                        color: plan.popular ? "#ffffff" : hovered ? accentColor : undefined,
                    }}
                >
                    {plan.buttonText}
                </a>
            </div>
        </div>
    );
}

// ─── Main Block ───────────────────────────────────────────────────────────────

export function PricingSection2Block({
    title = "選擇最適合您的方案",
    description = "受到數百萬人信賴，我們為全球團隊提供服務，探索最適合您的選項。",
    plans,
    primaryColor,
    backgroundColor,
    textColor,
    toggleColor,
    toggleTextColor,
    paddingYDesktop = 64,
    paddingYMobile = 40,
    isMobile = false,
    showAnnualToggle = true,
    monthlyLabel = "月繳",
    yearlyLabel = "年繳",
    currencySymbol = "NT$",
}: PricingSection2BlockProps) {
    const [frequency, setFrequency] = React.useState<FREQUENCY>("monthly");

    const displayPlans = plans && plans.length > 0 ? plans : defaultPlans;
    const accentColor = primaryColor || "#000000";

    return (
        <div
            className="w-full"
            style={{
                backgroundColor: backgroundColor || "#ffffff",
                color: textColor || "inherit",
                paddingTop: isMobile ? `${paddingYMobile}px` : `${paddingYDesktop}px`,
                paddingBottom: isMobile ? `${paddingYMobile}px` : `${paddingYDesktop}px`,
            }}
        >
            <div className="mx-auto flex w-full max-w-5xl flex-col items-center space-y-8 px-4">
                {/* Heading */}
                <div className="mx-auto max-w-2xl space-y-3 text-center">
                    <motion.h2
                        className="text-2xl font-bold tracking-tight md:text-3xl lg:text-4xl"
                        style={{ color: textColor || "inherit" }}
                        initial={{ opacity: 0, y: -12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.5 }}
                    >
                        {title}
                    </motion.h2>
                    {description && (
                        <motion.p
                            className="text-sm text-muted-foreground md:text-base"
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true, amount: 0.2 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                        >
                            {description}
                        </motion.p>
                    )}
                </div>

                {/* Toggle */}
                {showAnnualToggle && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.4, delay: 0.15 }}
                    >
                        <PricingFrequencyToggle
                            frequency={frequency}
                            setFrequency={setFrequency}
                            monthlyLabel={monthlyLabel}
                            yearlyLabel={yearlyLabel}
                            toggleColor={toggleColor || accentColor}
                            toggleTextColor={toggleTextColor}
                        />
                    </motion.div>
                )}

                {/* Cards Grid */}
                <div
                    className={cn(
                        "grid w-full gap-5",
                        isMobile
                            ? "grid-cols-1 max-w-sm"
                            : "grid-cols-1 md:grid-cols-3"
                    )}
                >
                    {displayPlans.map((plan, index) => (
                        <motion.div
                            key={plan.name}
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.1 }}
                            transition={{ duration: 0.45, delay: index * 0.1 }}
                        >
                            <PricingCard
                                plan={plan}
                                frequency={frequency}
                                currencySymbol={currencySymbol}
                                monthlyLabel={monthlyLabel}
                                yearlyLabel={yearlyLabel}
                                primaryColor={accentColor}
                                textColor={textColor}
                            />
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
