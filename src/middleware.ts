import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export const config = {
    matcher: [
        /*
         * Match all paths except for:
         * 1. /api routes
         * 2. /_next (Next.js internals)
         * 3. /_static (inside /public)
         * 4. all root files inside /public (e.g. /favicon.ico)
         */
        "/((?!api/|_next/|_static/|[\\w-]+\\.\\w+).*)",
    ],
};

export default async function middleware(req: NextRequest) {
    const url = req.nextUrl
    const hostname = req.headers.get("host")!
    const pathname = url.pathname

    // 開發環境或 Zeabur 等平台的 root domain
    const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000'

    // 取得子域名
    let currentHost = hostname.replace(`.${rootDomain}`, "")

    // 如果是主域名（沒有子域名），使用路徑式路由
    const isMainDomain = hostname === rootDomain ||
        hostname.endsWith('.zeabur.app') ||
        hostname.endsWith('.vercel.app') ||
        !hostname.includes('.')

    let response = NextResponse.next()

    // Preliminary routing logic to determine redirect/rewrite destination
    // but distinct from the final response object construction.
    // However, to update cookies on the 'final' response, we need to know what it is?
    // Actually, updateSession takes (req, res). We can create a 'base' response
    // but if we later do `NextResponse.rewrite`, that returns a NEW response object.

    // Strategy: We will determine the logic first, create the response, THEN update session on it.

    if (isMainDomain) {
        // 路徑式路由：直接允許已知路徑
        if (pathname.startsWith('/admin') ||
            pathname.startsWith('/app') ||
            pathname.startsWith('/store') ||
            pathname.startsWith('/home') ||
            pathname.startsWith('/p') ||       // 總部自訂頁面
            pathname.startsWith('/product')) { // 總部商品頁
            response = NextResponse.next()
        }
        // 根路徑重定向到總部商店首頁
        else if (pathname === '/') {
            url.pathname = '/store/omo'
            response = NextResponse.rewrite(url)
        }
        // 結帳頁面重定向
        else if (pathname === '/checkout') {
            url.pathname = '/store/omo/checkout'
            response = NextResponse.rewrite(url)
        }
        // 其他頁面重定向到總部商店對應頁面 (e.g. /about -> /store/omo/about)
        else {
            url.pathname = `/store/omo${pathname}`
            response = NextResponse.rewrite(url)
        }
    }
    // === 子域名模式（用於自訂域名設定）===
    else if (currentHost === "app") {
        url.pathname = `/app${pathname}`
        response = NextResponse.rewrite(url)
    }
    else if (currentHost === "admin") {
        url.pathname = `/admin${pathname}`
        response = NextResponse.rewrite(url)
    }
    else if (currentHost === "www") {
        if (pathname.startsWith('/admin') || pathname.startsWith('/app')) {
            response = NextResponse.next()
        } else {
            url.pathname = `/home${pathname}`
            response = NextResponse.rewrite(url)
        }
    }
    else {
        // 4. Storefront (nike.platform.com) -> Rewrite to /store/[slug]
        url.pathname = `/store/${currentHost}${pathname}`
        response = NextResponse.rewrite(url)
    }

    // CSP Fix for ECPay
    // ECPay requires unsafe-eval and specific domains
    const csp = [
        "default-src 'self'",
        "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://payment-stage.ecpay.com.tw https://gpayment-stage.ecpay.com.tw https://payment.ecpay.com.tw https://gpayment.ecpay.com.tw https://applepay.cdn-apple.com https://googletagmanager.com https://tagmanager.google.com https://connect.facebook.net https://www.clarity.ms https://scripts.clarity.ms",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "img-src 'self' blob: data: https://* http://*",
        "font-src 'self' data: https://fonts.gstatic.com",
        "connect-src 'self' https://* http://*", // Allow connecting to ECPay APIs
        "frame-src 'self' https://payment-stage.ecpay.com.tw https://gpayment-stage.ecpay.com.tw https://payment.ecpay.com.tw https://gpayment.ecpay.com.tw",
    ].join('; ')

    response.headers.set('Content-Security-Policy', csp)

    // AWAIT the session update
    // This will refresh the token and set Set-Cookie headers on 'response'
    await updateSession(req, response)

    // === Security Hardening ===

    // 1. Security Headers
    const headers = response.headers
    headers.set('X-DNS-Prefetch-Control', 'on')
    headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')
    headers.set('X-Frame-Options', 'SAMEORIGIN') // Allow iframing on same domain (needed for some editor features?)
    headers.set('X-Content-Type-Options', 'nosniff')
    headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

    // 2. Simple Rate Limiting (In-Memory, Per-Instance)
    // Note: In serverless, this is not a perfect global rate limiter, but helps against single-instance floods.
    const ip = (req as any).ip || req.headers.get('x-forwarded-for') || '127.0.0.1'
    if (!checkRateLimit(ip)) {
        return new NextResponse('Too Many Requests', { status: 429 })
    }

    return response
}

// === Rate Limit Logic ===
const RATE_LIMIT_WINDOW_MS = 60 * 1000 // 1 Minute
const RATE_LIMIT_MAX_REQUESTS = 100 // 100 requests per minute per IP

const rateLimitMap = new Map<string, { count: number, resetTime: number }>()

function checkRateLimit(ip: string): boolean {
    const now = Date.now()
    const record = rateLimitMap.get(ip)

    if (!record) {
        rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS })
        return true
    }

    if (now > record.resetTime) {
        rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS })
        return true
    }

    if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
        return false
    }

    record.count++
    return true
}

// Clean up old entries periodically to prevent memory leak
setInterval(() => {
    const now = Date.now()
    for (const [ip, record] of rateLimitMap.entries()) {
        if (now > record.resetTime) {
            rateLimitMap.delete(ip)
        }
    }
}, RATE_LIMIT_WINDOW_MS * 5) // Run every 5 minutes
