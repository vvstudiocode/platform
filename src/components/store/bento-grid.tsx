import React from 'react';
import { cn } from '@/lib/utils';
import { Fingerprint, Download, TrendingUp, Users } from 'lucide-react';

interface BentoGridProps {
    // Block 1: 100% Customizable
    title1?: string;
    value1?: string; // e.g. "100%"

    // Block 2: Secure
    title2?: string;
    desc2?: string;
    icon2?: string; // Replaces Fingerprint

    // Block 3: Faster
    title3?: string;
    desc3?: string;
    graphic3?: string; // Replaces top graphic

    // Block 4: Analytics
    title4?: string;
    desc4?: string;
    icon4?: string; // Replaces TrendingUp
    chart4?: string; // Replaces SVG Chart

    // Block 5: Social
    title5?: string;
    desc5?: string;
    icon5?: string; // Replaces Users
    // Avatars
    avatar1Name?: string;
    avatar1Image?: string;
    avatar2Name?: string;
    avatar2Image?: string;
    avatar3Name?: string;
    avatar3Image?: string;

    paddingYDesktop?: number;
    paddingYMobile?: number;
    isMobile?: boolean;
}

export const BentoGrid: React.FC<BentoGridProps> = ({
    title1,
    value1,
    title2,
    desc2,
    icon2,
    title3,
    desc3,
    graphic3,
    title4,
    desc4,
    icon4,
    chart4,
    title5,
    desc5,
    icon5,
    avatar1Name,
    avatar1Image,
    avatar2Name,
    avatar2Image,
    avatar3Name,
    avatar3Image,
    paddingYDesktop = 64,
    paddingYMobile = 32,
    isMobile = false,
}) => {
    return (
        <section
            className="px-4 md:px-8 bg-background transition-colors duration-300"
            style={{
                paddingTop: `${isMobile ? paddingYMobile : paddingYDesktop}px`,
                paddingBottom: `${isMobile ? paddingYMobile : paddingYDesktop}px`,
            }}
        >
            <div className="max-w-7xl mx-auto w-full">
                <div className={cn(
                    "grid gap-6",
                    isMobile ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-3 lg:gap-8"
                )}>

                    {/* Card 1: 100% Customizable */}
                    <div className="group relative flex flex-col items-center justify-center p-8 bg-white dark:bg-black border border-gray-200 dark:border-neutral-800 rounded-2xl md:rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 min-h-[300px] overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-gray-100/30 dark:to-neutral-800/20 opacity-100 dark:opacity-50"></div>
                        <div className="relative z-10 flex flex-col items-center">
                            <div className="relative mb-6 group-hover:scale-105 transition-transform duration-500">
                                {/* Decorative Swoosh */}
                                <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 dark:from-blue-500/10 dark:to-purple-500/10 blur-xl rounded-full opacity-70"></div>
                                <div className="relative border border-gray-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm rounded-full px-6 py-2 shadow-sm">
                                    <div className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50"></div>
                                    <span className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-gray-900 to-gray-600 dark:from-white dark:to-neutral-400 tracking-tighter">
                                        {value1 || '100%'}
                                    </span>
                                </div>
                            </div>
                            <h3 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-2 text-center">
                                {title1 || '高度客製化'}
                            </h3>
                        </div>
                    </div>

                    {/* Card 2: Secure by default */}
                    <div className="group relative flex flex-col items-center text-center p-6 md:p-8 bg-white dark:bg-black border border-gray-200 dark:border-neutral-800 rounded-2xl md:rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 min-h-[300px] overflow-hidden">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-50/50 via-transparent to-transparent dark:from-neutral-900/50 dark:via-transparent dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="mb-6 relative w-20 h-20 flex items-center justify-center rounded-2xl bg-gray-100/50 dark:bg-neutral-900/50 border border-gray-200/50 dark:border-neutral-800/50 group-hover:-translate-y-2 transition-transform duration-300 overflow-hidden">
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-50"></div>
                            {icon2 ? (
                                <img src={icon2} alt="Security Icon" className="w-10 h-10 object-contain relative z-10" />
                            ) : (
                                <Fingerprint className="w-10 h-10 text-gray-700 dark:text-neutral-300 relative z-10" strokeWidth={1.5} />
                            )}
                            <div className="absolute -bottom-2 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                            {title2 || '預設安全防護'}
                        </h3>
                        {desc2 && (
                            <p className="text-gray-500 dark:text-neutral-400 text-sm leading-relaxed max-w-[250px]">
                                {desc2}
                            </p>
                        )}
                    </div>

                    {/* Card 3: Faster than light */}
                    <div className="group relative flex flex-col items-center text-center p-6 md:p-8 bg-white dark:bg-black border border-gray-200 dark:border-neutral-800 rounded-2xl md:rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 min-h-[300px] overflow-hidden">
                        <div className="w-full h-24 mb-6 relative flex items-end justify-center rounded-xl bg-gray-50 dark:bg-neutral-900/30 overflow-hidden border border-gray-100 dark:border-neutral-800/50">
                            {graphic3 ? (
                                <img src={graphic3} alt="Graphic" className="w-full h-full object-cover" />
                            ) : (
                                <>
                                    <div className="absolute top-3 left-3 right-3 flex justify-between items-center z-10">
                                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/80 dark:bg-black/50 backdrop-blur-[2px] border border-gray-100 dark:border-neutral-800">
                                            <Download className="w-3 h-3 text-gray-500 dark:text-neutral-400" />
                                            <span className="text-[10px] font-medium text-gray-600 dark:text-neutral-300 uppercase tracking-wide">Download</span>
                                        </div>
                                        <span className="text-[10px] font-mono text-gray-500 dark:text-neutral-400">14.34 mbps</span>
                                    </div>

                                    {/* Wave Animation */}
                                    <div className="absolute inset-x-0 bottom-0 h-16 flex items-end">
                                        <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                                            <path d="M0,40 L0,20 C10,20 15,30 25,25 C35,20 40,10 50,15 C60,20 65,30 75,28 C85,26 90,15 100,20 L100,40 Z" fill="currentColor" className="text-blue-500/10 dark:text-blue-500/20" />
                                            <path d="M0,20 C10,20 15,30 25,25 C35,20 40,10 50,15 C60,20 65,30 75,28 C85,26 90,15 100,20" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-blue-500 dark:text-blue-400" vectorEffect="non-scaling-stroke" />
                                        </svg>
                                    </div>
                                </>
                            )}
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                            {title3 || '極速效能體驗'}
                        </h3>
                        {desc3 && (
                            <p className="text-gray-500 dark:text-neutral-400 text-sm leading-relaxed max-w-[250px]">
                                {desc3}
                            </p>
                        )}
                    </div>

                    {/* Card 4: Analytics */}
                    <div className={cn(
                        "group relative flex transition-all duration-300 min-h-[300px] overflow-hidden bg-white dark:bg-black border border-gray-200 dark:border-neutral-800 rounded-2xl md:rounded-3xl shadow-sm hover:shadow-md",
                        isMobile ? "flex-col" : "lg:col-span-2 flex-col md:flex-row"
                    )}>
                        {/* Text Content */}
                        <div className="flex-1 p-6 md:p-10 flex flex-col justify-center relative z-10">
                            <div className="w-10 h-10 rounded-lg border border-gray-200 dark:border-neutral-800 flex items-center justify-center mb-6 bg-gray-50 dark:bg-neutral-900/50">
                                {icon4 ? (
                                    <img src={icon4} alt="Icon" className="w-5 h-5 object-contain" />
                                ) : (
                                    <TrendingUp className="w-5 h-5 text-gray-700 dark:text-neutral-300" />
                                )}
                            </div>
                            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                                {title4 || '數據洞察與分析'}
                            </h3>
                            {desc4 && (
                                <p className="text-gray-500 dark:text-neutral-400 text-sm leading-relaxed max-w-sm">
                                    {desc4}
                                </p>
                            )}
                        </div>

                        {/* Chart Graphic */}
                        <div className={cn(
                            "relative bg-gray-50/50 dark:bg-neutral-900/10 border-gray-200 dark:border-neutral-800",
                            isMobile ? "w-full h-64 border-t" : "flex-1 min-h-[200px] md:min-h-full border-t md:border-t-0 md:border-l"
                        )}>
                            {chart4 ? (
                                <img src={chart4} alt="Chart" className="w-full h-full object-cover" />
                            ) : (
                                <div className="absolute inset-0 p-8 flex items-center justify-center">
                                    <div className="w-full h-full relative">
                                        {/* Grid Lines */}
                                        <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 gap-4 opacity-10">
                                            {Array.from({ length: 16 }).map((_, i) => (
                                                <div key={i} className="border border-gray-400 dark:border-neutral-500 rounded-sm"></div>
                                            ))}
                                        </div>

                                        {/* Line Chart */}
                                        <svg className="w-full h-full overflow-visible drop-shadow-sm" viewBox="0 0 200 100" preserveAspectRatio="none">
                                            <defs>
                                                <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="0.1" />
                                                    <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity="0.0" />
                                                </linearGradient>
                                            </defs>
                                            <path d="M0,80 L20,70 L40,85 L60,50 L80,65 L100,40 L120,55 L140,30 L160,45 L180,20 L200,10"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                className="text-gray-900 dark:text-white"
                                                vectorEffect="non-scaling-stroke"
                                            />
                                            <path d="M0,80 L20,70 L40,85 L60,50 L80,65 L100,40 L120,55 L140,30 L160,45 L180,20 L200,10 V100 H0 Z"
                                                fill="url(#chartFill)"
                                            />
                                        </svg>

                                        {/* Dots */}
                                        <div className="absolute top-[20%] right-[10%] w-3 h-3 rounded-full bg-white dark:bg-black border-2 border-gray-900 dark:border-white z-10 shadow-sm"></div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Card 5: Social Proof */}
                    <div className="lg:col-span-1 group relative flex flex-col justify-between p-6 md:p-8 bg-white dark:bg-black border border-gray-200 dark:border-neutral-800 rounded-2xl md:rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 min-h-[300px] overflow-hidden">

                        {/* Floating Avatars Container */}
                        <div className="relative w-full h-40 mb-6 bg-gray-50/50 dark:bg-neutral-900/20 rounded-xl overflow-hidden border border-gray-100 dark:border-neutral-800/50">
                            {/* Avatar 1 */}
                            <div className="absolute top-4 right-4 bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-700 rounded-full py-1.5 px-3 flex items-center gap-2 shadow-sm animate-float-slow">
                                <span className="text-[10px] font-medium text-gray-600 dark:text-neutral-300">{avatar1Name || 'Likeur'}</span>
                                <div className="w-5 h-5 rounded-full bg-gray-200 dark:bg-neutral-800 overflow-hidden">
                                    <img src={avatar1Image || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"} alt="User" className="w-full h-full opacity-80" />
                                </div>
                            </div>
                            {/* Avatar 2 */}
                            <div className="absolute top-16 right-10 bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-700 rounded-full py-1.5 px-3 flex items-center gap-2 shadow-sm animate-float-medium" style={{ animationDelay: '1s' }}>
                                <div className="w-5 h-5 rounded-full bg-gray-200 dark:bg-neutral-800 overflow-hidden">
                                    <img src={avatar2Image || "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka"} alt="User" className="w-full h-full opacity-80" />
                                </div>
                                <span className="text-[10px] font-medium text-gray-600 dark:text-neutral-300">{avatar2Name || 'M. Irung'}</span>
                            </div>
                            {/* Avatar 3 */}
                            <div className="absolute top-28 right-4 bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-700 rounded-full py-1.5 px-3 flex items-center gap-2 shadow-sm animate-float-fast" style={{ animationDelay: '2s' }}>
                                <span className="text-[10px] font-medium text-gray-600 dark:text-neutral-300">{avatar3Name || 'B. Ng'}</span>
                                <div className="w-5 h-5 rounded-full bg-gray-200 dark:bg-neutral-800 overflow-hidden">
                                    <img src={avatar3Image || "https://api.dicebear.com/7.x/avataaars/svg?seed=Destiny"} alt="User" className="w-full h-full opacity-80" />
                                </div>
                            </div>
                        </div>

                        <div className="mt-auto relative z-10">
                            <div className="w-10 h-10 rounded-lg border border-gray-200 dark:border-neutral-800 flex items-center justify-center mb-4 bg-gray-50 dark:bg-neutral-900/50">
                                {icon5 ? (
                                    <img src={icon5} alt="Icon" className="w-5 h-5 object-contain" />
                                ) : (
                                    <Users className="w-5 h-5 text-gray-700 dark:text-neutral-300" />
                                )}
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                {title5 || '守護您的摯愛'}
                            </h3>
                            {desc5 && (
                                <p className="text-gray-500 dark:text-neutral-400 text-sm leading-relaxed">
                                    {desc5}
                                </p>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};
