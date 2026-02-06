import { ImageResponse } from 'next/og'
import { createClient } from '@/lib/supabase/server'
import { Store as StoreIcon } from 'lucide-react'

// For admin routes, we can't easily cache by URL because the URL doesn't contain the tenant ID usually.
// However, the browser caches favicons heavily.
// Valid strategy: Check if we can get user session.
// Note: 'icon.tsx' is a Server Component/Route Handler.
// We can't use 'edge' runtime easily if we need to use cookies for Supabase Auth which might require node libs or specific setup.
// Let's try Node runtime (default) to be safe with auth.

export const size = {
    width: 32,
    height: 32,
}
export const contentType = 'image/png'

export default async function Icon() {
    const supabase = await createClient()

    // Get user and their store
    // This adds DB load on every favicon request (though cached by browser)
    // To optimization: We could accept a ?tenantId param in a manual link, but Next.js app directory handles this magic file.

    // Attempt to get user's store
    const {
        data: { user },
    } = await supabase.auth.getUser()

    let logoUrl = null

    if (user) {
        const { data: userRole } = await supabase
            .from('users_roles')
            .select('tenants:tenant_id(logo_url)')
            .eq('user_id', user.id)
            .in('role', ['store_owner', 'store_admin'])
            .maybeSingle()

        const tenant = userRole?.tenants as any
        logoUrl = tenant?.logo_url
    }

    if (logoUrl) {
        return new ImageResponse(
            (
                <div
                    style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'transparent',
                    }}
                >
                    <img
                        src={logoUrl}
                        width="32"
                        height="32"
                        style={{ objectFit: 'contain', borderRadius: '4px' }}
                    />
                </div>
            ),
            { ...size }
        )
    }

    // Fallback Icon for Admin
    return new ImageResponse(
        (
            <div
                style={{
                    fontSize: 20,
                    background: '#18181b', // zinc-900
                    color: 'white',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '6px',
                    fontWeight: 'bold',
                }}
            >
                M
            </div>
        ),
        { ...size }
    )
}
