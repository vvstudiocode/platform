import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { NewStorePageForm } from './new-store-page-form'

interface Props {
    params: Promise<{ storeId: string }>
}

export default async function NewStorePagePage({ params }: Props) {
    const { storeId } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: store } = await supabase
        .from('tenants')
        .select('id, name')
        .eq('id', storeId)
        .eq('managed_by', user?.id || '')
        .single()

    if (!store) {
        notFound()
    }

    return <NewStorePageForm storeId={storeId} storeName={store.name} />
}
