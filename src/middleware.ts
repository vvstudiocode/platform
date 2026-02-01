import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

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

    if (isMainDomain) {
        // 路徑式路由：直接允許已知路徑
        if (pathname.startsWith('/admin') ||
            pathname.startsWith('/app') ||
            pathname.startsWith('/store') ||
            pathname.startsWith('/home') ||
            pathname.startsWith('/p') ||       // 總部自訂頁面
            pathname.startsWith('/product')) { // 總部商品頁
            return NextResponse.next()
        }

        // 根路徑重定向到 /home
        if (pathname === '/') {
            url.pathname = '/home'
            return NextResponse.rewrite(url)
        }

        // 其他路徑也重定向到 /home 下
        url.pathname = `/home${pathname}`
        return NextResponse.rewrite(url)
    }

    // === 子域名模式（用於自訂域名設定）===

    // 1. App Dashboard (app.platform.com) -> Rewrite to /app
    if (currentHost === "app") {
        url.pathname = `/app${pathname}`
        return NextResponse.rewrite(url)
    }

    // 2. Super Admin (admin.platform.com) -> Rewrite to /admin
    if (currentHost === "admin") {
        url.pathname = `/admin${pathname}`
        return NextResponse.rewrite(url)
    }

    // 3. Marketing Site (www.platform.com)
    if (currentHost === "www") {
        if (pathname.startsWith('/admin') || pathname.startsWith('/app')) {
            return NextResponse.next()
        }
        url.pathname = `/home${pathname}`
        return NextResponse.rewrite(url)
    }

    // 4. Storefront (nike.platform.com) -> Rewrite to /store/[slug]
    url.pathname = `/store/${currentHost}${pathname}`
    return NextResponse.rewrite(url)
}
