import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'

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
        const actionLink = new URL(linkData.properties.action_link)
        const tokenHash = actionLink.searchParams.get('token_hash') || actionLink.searchParams.get('token')
        const type = actionLink.searchParams.get('type') || 'magiclink'

        if (!tokenHash) {
            console.error('[Magic Login] No token_hash in generated link:', linkData.properties.action_link)
            return NextResponse.json({ error: 'Failed to extract token' }, { status: 500 })
        }

        // 5. Create server client and verify OTP (sets cookies)
        const supabase = await createServerClient()

        // Sign out previous user first
        await supabase.auth.signOut()

        const { data: sessionData, error: sessionError } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: type as any,
        })

        if (sessionError || !sessionData?.session) {
            console.error('[Magic Login] Failed to verify OTP:', sessionError)
            return NextResponse.json({ error: 'Failed to verify session' }, { status: 500 })
        }

        console.log('[Magic Login] Session created successfully for user:', userId)

        // 6. Get tenant slug for redirect
        const { data: tenant } = await adminClient
            .from('tenants')
            .select('slug')
            .eq('id', tenantId)
            .single()

        const storeSlug = tenant?.slug || 'omo'

        // 7. Redirect based on query parameter
        const redirectParam = request.nextUrl.searchParams.get('redirect')
        // Use the origin from the request to ensure we stay on the same domain (subdomain)
        // This is critical because the cookie is set on the current domain
        const origin = request.nextUrl.origin

        let redirectUrl: string
        if (redirectParam === 'account') {
            // Login keyword → go to account page
            // If we are on a subdomain (store.omo...), path is /account (middleware handles rewrite?)
            // Wait, middleware rewrites subdomain to /store/[slug].
            // BUT browser URL shows /.
            // So if I am on store.omo..., I should redirect to /account.
            // If I am on omo..., I should redirect to /store/[slug]/account.

            // However, to be safe and consistent with how middleware expects paths:
            // If unrewritten (browser side), /account on subdomain maps to /store/[slug]/account.
            // So redirecting to /account on subdomain is correct.

            // Let's check if we are on main domain or subdomain.
            const hostname = request.headers.get('host') || ''
            const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'omoselect.shop'
            const isSubdomain = hostname.endsWith(`.${rootDomain}`) && hostname !== `www.${rootDomain}`

            if (isSubdomain) {
                redirectUrl = `${origin}/account`
            } else {
                redirectUrl = `${origin}/store/${storeSlug}/account`
            }
        } else {
            // Default: go to LINE cart hydration page
            // Similar logic: /line-cart on subdomain, /store/[slug]/line-cart on main
            const hostname = request.headers.get('host') || ''
            const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'omoselect.shop'
            const isSubdomain = hostname.endsWith(`.${rootDomain}`) && hostname !== `www.${rootDomain}`

            if (isSubdomain) {
                console.log('[Magic Login] Redirecting to subdomain path:', `/line-cart`)
                redirectUrl = `${origin}/line-cart?tenant_id=${tenantId}&user_id=${userId}`
            } else {
                console.log('[Magic Login] Redirecting to main domain path:', `/store/${storeSlug}/line-cart`)
                redirectUrl = `${origin}/store/${storeSlug}/line-cart?tenant_id=${tenantId}&user_id=${userId}`
            }
        }

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
