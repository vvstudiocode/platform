
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

    // 如果是 localhost，我們允許開發者透過 .env 設定 ROOT_DOMAIN
    // 否則預設 localhost:3000
    const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000'

    // 取得目前的 subdomain (e.g. "app", "www", "nike")
    // 如果 hostname 是 "app.localhost:3000"，.replace 後變成 "app"
    let currentHost = hostname.replace(`.${rootDomain}`, "")

    // Edge case: 如果在 localhost:3000 直接訪問，視為 "www"
    if (hostname === rootDomain) {
        currentHost = "www"
    }

    // 1. App Dashboard (app.platform.com) -> Rewrite to /app
    if (currentHost === "app") {
        url.pathname = `/app${url.pathname}`
        return NextResponse.rewrite(url)
    }

    // 2. Super Admin (admin.platform.com) -> Rewrite to /admin
    if (currentHost === "admin") {
        url.pathname = `/admin${url.pathname}`
        return NextResponse.rewrite(url)
    }

    // 3. Marketing Site (www.platform.com) -> Rewrite to /home
    // 但如果路徑是 /admin (為了開發方便或統一入口)，則不 rewrite 到 /home，而是保留原樣(或 rewrite 到 /admin)
    if (currentHost === "www") {
        if (url.pathname.startsWith('/admin')) {
            // 允許 localhost:3000/admin 直接訪問 src/app/admin
            // 這裡不需要 rewrite，因為原本就在 root
            return NextResponse.next()
        }
        url.pathname = `/home${url.pathname}`
        return NextResponse.rewrite(url)
    }

    // 3. Storefront (nike.platform.com) -> Rewrite to /[site]
    // 這是最關鍵的：將 "nike" 當作參數傳給 dynamic route
    url.pathname = `/${currentHost}${url.pathname}`
    return NextResponse.rewrite(url)
}
