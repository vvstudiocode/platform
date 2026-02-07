import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
    const supabase = await createClient()

    try {
        const formData = await req.formData()
        const file = formData.get('file') as File
        const bucket = formData.get('bucket') || 'product-images'
        const folder = formData.get('folder') as string

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
        }

        // 1. Authenticate & Get Tenant
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { data: role } = await supabase
            .from('users_roles')
            .select('tenant_id, tenants:tenant_id(id, plan_id, storage_usage_mb)')
            .eq('user_id', user.id)
            .in('role', ['store_owner', 'store_admin'])
            .single()

        if (!role || !role.tenants) {
            return NextResponse.json({ error: 'Permission denied / Tenant not found' }, { status: 403 })
        }

        const tenant = role.tenants as any
        const tenantId = tenant.id
        const currentUsage = parseFloat(tenant.storage_usage_mb || '0')
        // const planId = tenant.plan_id || 'free'

        // 2. Check Quota (Hardcoded limits for now, ideally join plans table)
        // const LIMITS: Record<string, number> = {
        //     'free': 50,
        //     'starter': 1024,
        //     'growth': 10240,
        //     'scale': 51200
        // }
        // const limit = LIMITS[planId] || 50

        // Since we are running before migration, we might not have limits in DB or even plan_id mapped.
        // Let's assume a generous limit if unknown, or safe default.
        const limit = 50 * 1024; // Just a fallback if DB lookup fails logic, actual logic should use Plan table.
        // But for "Storage Check", we need real limits. 
        // Let's query plan from plans table if possible, else 50MB.

        let storageLimitMb = 50
        if (tenant.plan_id) {
            const { data: plan } = await supabase
                .from('plans')
                .select('storage_limit_mb')
                .eq('id', tenant.plan_id)
                .single()
            if (plan) storageLimitMb = plan.storage_limit_mb
        }

        const fileSizeMb = file.size / (1024 * 1024)
        if (currentUsage + fileSizeMb > storageLimitMb) {
            return NextResponse.json({ error: `Storage quota exceeded! (${currentUsage.toFixed(2)}/${storageLimitMb} MB)` }, { status: 403 })
        }

        // 3. Upload to Storage
        const timestamp = Date.now()
        const randomStr = Math.random().toString(36).substring(2, 9)
        const extension = file.name.split('.').pop()
        const fileName = `${timestamp}_${randomStr}.${extension}`
        const filePath = folder ? `${folder}/${fileName}` : fileName

        const { data, error } = await supabase.storage
            .from(bucket as string)
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false,
            })

        if (error) {
            console.error('Supabase Storage Error:', error)
            throw new Error('Upload failed')
        }

        // 4. Get Public URL
        const { data: publicUrlData } = supabase.storage
            .from(bucket as string)
            .getPublicUrl(data.path)

        // 5. Increment Usage in DB
        const newUsage = currentUsage + fileSizeMb
        await supabase
            .from('tenants')
            .update({ storage_usage_mb: newUsage })
            .eq('id', tenantId)

        return NextResponse.json({
            url: publicUrlData.publicUrl,
            usage: newUsage
        })

    } catch (e: any) {
        console.error('Upload API Error:', e)
        return NextResponse.json({ error: e.message || 'Server error' }, { status: 500 })
    }
}
