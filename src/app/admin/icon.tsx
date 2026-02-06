import { ImageResponse } from 'next/og'
import { createClient } from '@/lib/supabase/server'

export const revalidate = 60


export const size = {
    width: 32,
    height: 32,
}
export const contentType = 'image/png'

export default async function Icon() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    let logoUrl = null

    if (user) {
        // Find HQ tenant (managed_by user)
        const { data: hqStore } = await supabase
            .from('tenants')
            .select('logo_url')
            .eq('managed_by', user.id)
            .order('created_at', { ascending: true })
            .limit(1)
            .maybeSingle()

        logoUrl = hqStore?.logo_url
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

    // Fallback Icon for HQ
    return new ImageResponse(
        (
            <div
                style={{
                    fontSize: 20,
                    background: '#09090b', // zinc-950
                    color: '#e11d48', // rose-600
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '6px',
                    fontWeight: 'bold',
                    border: '2px solid #e11d48'
                }}
            >
                H
            </div>
        ),
        { ...size }
    )
}
