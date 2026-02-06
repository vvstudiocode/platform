import { ImageResponse } from 'next/og'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'edge'
export const revalidate = 86400 // Cache for 24 hours to reduce DB/Server costs

export const size = {
    width: 32,
    height: 32,
}
export const contentType = 'image/png'

export default async function Icon({ params }: { params: { slug: string } }) {
    const slug = (await params).slug

    // Create a direct client for Edge environment
    // We can use the public anon key for simple reads if RLS allows
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // 1. Fetch Tenant Logo
    const { data: tenant } = await supabase
        .from('tenants')
        .select('logo_url, name')
        .eq('slug', slug)
        .single()

    // 2. If Logo exists, fetch and render, otherwise render default
    if (tenant?.logo_url) {
        // Use the logo
        // Note: For best results in ImageResponse, we might want to just render an <img> tag 
        // referencing the URL if we were doing OG, but for Icon we need to return the image data.
        // We can fetch the image buffer and return it, or use inclusion.
        // Simpler: Draw the image using an img tag. ImageResponse handles fetching.
        return new ImageResponse(
            (
                <div
                    style={{
                        fontSize: 24,
                        background: 'transparent',
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <img
                        src={tenant.logo_url}
                        alt={tenant.name || 'Icon'}
                        width="32"
                        height="32"
                        style={{ objectFit: 'contain', borderRadius: '4px' }}
                    />
                </div>
            ),
            { ...size }
        )
    }

    // 3. Fallback: First letter of store name
    const letter = tenant?.name ? tenant.name[0].toUpperCase() : 'S'

    return new ImageResponse(
        (
            <div
                style={{
                    fontSize: 22,
                    background: '#e11d48', // Rose-600
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
                {letter}
            </div>
        ),
        { ...size }
    )
}
