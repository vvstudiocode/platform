import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { CheckoutClient } from './checkout-client'

interface Props {
    params: Promise<{ slug: string }>
}

export default async function CheckoutPage({ params }: Props) {
    const { slug } = await params
    const supabase = await createClient()

    const { data: store } = await supabase
        .from('tenants')
        .select('id, name, slug, settings')
        .eq('slug', slug)
        .single()

    if (!store) {
        notFound()
    }

    return (
        <CheckoutClient
            store={{
                id: store.id,
                name: store.name,
                slug: store.slug,
                settings: store.settings as any,
            }}
        />
    )
}
