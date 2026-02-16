import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

// ============================================================
// LINE Magic Login
// Verifies a signed JWT token and creates a Supabase session
// for the associated user, then redirects to checkout.
// ============================================================

export const dynamic = 'force-dynamic'

function getAdminClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
    )
}

export async function GET(request: NextRequest) {
    const token = request.nextUrl.searchParams.get('token')

    if (!token) {
        return NextResponse.json({ error: 'Missing token' }, { status: 400 })
    }

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceRoleKey) {
        console.error('[Magic Login] SUPABASE_SERVICE_ROLE_KEY is missing')
        return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    try {
        // 1. Verify the JWT token
        const secret = new TextEncoder().encode(serviceRoleKey)
        const { payload } = await jwtVerify(token, secret, {
            algorithms: ['HS256'],
        })

        const userId = payload.sub as string
        const tenantId = payload.tenant_id as string

        if (!userId || !tenantId) {
            return NextResponse.json({ error: 'Invalid token payload' }, { status: 400 })
        }

        console.log('[Magic Login] Token verified for user:', userId, 'tenant:', tenantId)

        // 2. Get admin client and fetch user email
        const adminClient = getAdminClient()

        const { data: userData, error: userError } = await adminClient.auth.admin.getUserById(userId)
        if (userError || !userData?.user) {
            console.error('[Magic Login] User not found:', userError)
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // 3. Generate a magic link to create a session
        const { data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
            type: 'magiclink',
            email: userData.user.email!,
        })

        if (linkError || !linkData) {
            console.error('[Magic Login] Failed to generate link:', linkError)
            return NextResponse.json({ error: 'Failed to create session' }, { status: 500 })
        }

        // 4. Extract the hashed_token from the generated link
        // The link contains a token_hash we can use to verify the OTP
        const actionLink = new URL(linkData.properties.action_link)
        const tokenHash = actionLink.searchParams.get('token_hash') || actionLink.searchParams.get('token')
        const type = actionLink.searchParams.get('type') || 'magiclink'

        if (!tokenHash) {
            console.error('[Magic Login] No token_hash in generated link:', linkData.properties.action_link)
            return NextResponse.json({ error: 'Failed to extract token' }, { status: 500 })
        }

        // 5. Verify the OTP to create a session
        const { data: sessionData, error: sessionError } = await adminClient.auth.verifyOtp({
            token_hash: tokenHash,
            type: type as any,
        })

        if (sessionError || !sessionData?.session) {
            console.error('[Magic Login] Failed to verify OTP:', sessionError)
            return NextResponse.json({ error: 'Failed to create session' }, { status: 500 })
        }

        console.log('[Magic Login] Session created successfully for user:', userId)

        // 6. Get tenant slug for redirect
        const { data: tenant } = await adminClient
            .from('tenants')
            .select('slug')
            .eq('id', tenantId)
            .single()

        const storeSlug = tenant?.slug || 'omo'

        // 7. Set session cookies
        const cookieStore = await cookies()
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
        // Extract project ref from URL (e.g., "xgzhsvneffvpbppkojfo" from "https://xgzhsvneffvpbppkojfo.supabase.co")
        const projectRef = new URL(supabaseUrl).hostname.split('.')[0]

        // Set the Supabase auth cookies
        const session = sessionData.session
        const cookieOptions = {
            path: '/',
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax' as const,
            maxAge: 60 * 60 * 24 * 7, // 7 days
        }

        // Supabase stores auth as a single base64 JSON cookie
        const authCookieValue = JSON.stringify({
            access_token: session.access_token,
            refresh_token: session.refresh_token,
            expires_in: session.expires_in,
            expires_at: session.expires_at,
            token_type: session.token_type,
            user: session.user,
        })

        // Set as chunked cookies (Supabase SSR pattern)
        const cookieName = `sb-${projectRef}-auth-token`
        const chunkSize = 3500 // Cookie max ~4KB, leave room for metadata

        if (authCookieValue.length <= chunkSize) {
            cookieStore.set(cookieName, authCookieValue, cookieOptions)
        } else {
            // Chunk the cookie for large payloads
            const chunks = Math.ceil(authCookieValue.length / chunkSize)
            for (let i = 0; i < chunks; i++) {
                const chunk = authCookieValue.slice(i * chunkSize, (i + 1) * chunkSize)
                cookieStore.set(`${cookieName}.${i}`, chunk, cookieOptions)
            }
        }

        console.log('[Magic Login] Cookies set, redirecting to cart hydration:', `/store/${storeSlug}/line-cart`)

        // 8. Redirect to cart hydration page (bridges DB cart → localStorage → checkout)
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || `http://localhost:3000`
        const redirectUrl = `${siteUrl}/store/${storeSlug}/line-cart?tenant_id=${tenantId}&user_id=${userId}`

        return NextResponse.redirect(redirectUrl)

    } catch (error: any) {
        if (error.code === 'ERR_JWT_EXPIRED') {
            console.warn('[Magic Login] Token expired')
            return NextResponse.json(
                { error: '連結已過期，請在 LINE 群組重新下單。' },
                { status: 401 }
            )
        }

        if (error.code === 'ERR_JWS_SIGNATURE_VERIFICATION_FAILED') {
            console.warn('[Magic Login] Invalid token signature')
            return NextResponse.json(
                { error: '連結無效' },
                { status: 401 }
            )
        }

        console.error('[Magic Login] Unexpected error:', error)
        return NextResponse.json(
            { error: '登入失敗，請稍後再試。' },
            { status: 500 }
        )
    }
}
