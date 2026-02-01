import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { OrderSearchClient } from './order-search-client'

interface Props {
    params: Promise<{ slug: string }>
}

export default async function OrderSearchPage({ params }: Props) {
    const { slug } = await params
    const supabase = await createClient()

    const { data: store } = await supabase
        .from('tenants')
        .select('id, name, slug')
        .eq('slug', slug)
        .single()

    if (!store) {
        notFound()
    }

    return <OrderSearchClient store={{ name: store.name, slug: store.slug }} />
}
