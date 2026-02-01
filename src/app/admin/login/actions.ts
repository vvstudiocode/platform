'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(prevState: { error: string }, formData: FormData) {
    const supabase = await createClient()

    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
    }

    const { error } = await supabase.auth.signInWithPassword(data)

    if (error) {
        return { error: '登入失敗，請檢查帳號密碼' }
    }

    // 檢查是否為 platform_admin
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: '驗證失敗' }
    }

    // 檢查是否為 super_admin
    const { data: role } = await supabase
        .from('users_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'super_admin')
        .maybeSingle()

    if (!role) {
        await supabase.auth.signOut()
        return { error: 'unauthorized' }
    }

    revalidatePath('/admin')
    redirect('/admin')
}
