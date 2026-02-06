'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const schema = z.object({
    name: z.string().min(3),
    slug: z.string().min(3).regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers, and hyphens allowed'),
})

export async function createStore(prevState: any, formData: FormData) {
    const supabase = await createClient()

    // 1. Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Not authenticated" }

    // 2. Validate input
    const validated = schema.safeParse({
        name: formData.get('name'),
        slug: formData.get('slug'),
    })

    if (!validated.success) {
        return { error: validated.error.issues[0].message }
    }

    const { name, slug } = validated.data

    // 3. Create Tenant
    // Note: We use a transaction-like approach. RLS policies must allow insert.
    const { data: tenant, error: tenantError } = await supabase
        .from('tenants')
        .insert({
            name,
            slug,
            owner_id: user.id
        })
        .select()
        .single()

    if (tenantError) {
        if (tenantError.code === '23505') { // Unique violation
            return { error: 'This URL is already taken. Please choose another one.' }
        }
        return { error: tenantError.message }
    }

    // 4. Assign Role
    const { error: roleError } = await supabase
        .from('users_roles')
        .insert({
            user_id: user.id,
            tenant_id: tenant.id,
            role: 'store_owner'
        })

    if (roleError) {
        // In a real app, might want to rollback tenant (manual delete)
        return { error: 'Failed to assign role: ' + roleError.message }
    }

    revalidatePath('/')
    redirect('/')
}
