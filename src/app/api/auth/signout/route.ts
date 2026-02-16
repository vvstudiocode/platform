import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    const supabase = await createClient()

    await supabase.auth.signOut()

    // 根據來源頁面判斷重定向目標
    const referer = request.headers.get('referer') || ''
    const baseUrl = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    // 如果來自 /app (子網站後台)，重定向到 /app/login
    // 否則重定向到 /admin/login (總部管理後台)
    const redirectPath = referer.includes('/app') ? '/app/login' : '/admin/login'

    return NextResponse.redirect(new URL(redirectPath, baseUrl))
}

