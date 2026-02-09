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

    return response
}
