'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { z } from 'zod'

const schema = z.object({
    name: z.string().min(2, '名稱至少需要 2 個字'),
    slug: z.string()
        .min(2, '網址代號至少需要 2 個字')
        .regex(/^[a-z0-9-]+$/, '只能使用小寫英文字母、數字和連字符'),
    description: z.string().optional(),
    create_owner: z.boolean().default(false),
    owner_email: z.string().email('請輸入有效的 Email').optional().or(z.literal('')),
    owner_password: z.string().min(6, '密碼至少 6 個字元').optional().or(z.literal('')),
})

export async function createStore(prevState: { error: string }, formData: FormData) {
    const supabase = await createClient()

    // 1. 取得目前使用者（總部管理員）
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: '未登入' }

    // 2. 驗證輸入
    const validated = schema.safeParse({
        name: formData.get('name'),
        slug: formData.get('slug'),
        description: formData.get('description') || '',
        create_owner: formData.get('create_owner') === 'on',
        owner_email: formData.get('owner_email') || '',
        owner_password: formData.get('owner_password') || '',
    })

    if (!validated.success) {
        return { error: validated.error.issues[0].message }
    }

    const { name, slug, description, create_owner, owner_email, owner_password } = validated.data

    // 3. 如果要建立擁有者帳號，先檢查必填欄位
    let ownerUserId: string | null = null

    if (create_owner) {
        if (!owner_email || !owner_password) {
            return { error: '如要建立擁有者帳號，請填寫 Email 和密碼' }
        }

        // 使用 Admin API 建立使用者（需要 Service Role Key）
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

        if (!serviceRoleKey) {
            return { error: '系統設定錯誤：缺少 Service Role Key' }
        }

        const adminSupabase = createAdminClient(supabaseUrl, serviceRoleKey, {
            auth: { autoRefreshToken: false, persistSession: false }
        })

        // 建立使用者
        const { data: newUser, error: createUserError } = await adminSupabase.auth.admin.createUser({
            email: owner_email,
            password: owner_password,
            email_confirm: true, // 自動確認 email
        })

        if (createUserError) {
            if (createUserError.message.includes('already registered')) {
                return { error: '此 Email 已被註冊，請使用其他 Email' }
            }
            return { error: `建立帳號失敗：${createUserError.message}` }
        }

        ownerUserId = newUser.user.id
    }

    // 4. 建立商店
    const { data: tenant, error: tenantError } = await supabase
        .from('tenants')
        .insert({
            name,
            slug,
            description,
            managed_by: user.id,
            owner_id: ownerUserId,
        })
        .select('id')
        .single()

    if (tenantError) {
        if (tenantError.code === '23505') {
            return { error: '這個網址代號已被使用，請換一個' }
        }
        return { error: tenantError.message }
    }

    // 5. 如果有擁有者，建立 users_roles 關聯
    if (ownerUserId && tenant) {
        const { error: roleError } = await supabase
            .from('users_roles')
            .insert({
                user_id: ownerUserId,
                tenant_id: tenant.id,
                role: 'store_owner',
            })

        if (roleError) {
            console.error('建立角色關聯失敗:', roleError)
            // 不中斷流程，商店已建立成功
        }
    }

    // 6. 建立預設首頁與導覽
    if (tenant) {
        // 建立預設首頁內容
        const { data: homePage, error: pageError } = await supabase
            .from('pages')
            .insert({
                tenant_id: tenant.id,
                title: '首頁',
                slug: 'home',
                is_homepage: true,
                published: true,
                show_in_nav: true,
                nav_order: 0,
                content: [
                    {
                        id: crypto.randomUUID(),
                        type: 'hero',
                        props: {
                            title: '歡迎',
                            subtitle: '這是副標題',
                            align: 'center',
                            textColor: '#ffffff',
                            buttonText: '了解更多',
                            buttonUrl: '#'
                        }
                    }
                ]
            })
            .select()
            .single()

        if (pageError) {
            console.error('建立預設首頁失敗:', pageError)
        } else if (homePage) {
            // 建立首頁導覽連結
            const { error: navError } = await supabase
                .from('nav_items')
                .insert({
                    tenant_id: tenant.id,
                    title: '首頁',
                    page_id: homePage.id,
                    position: 0
                })

            if (navError) {
                console.error('建立預設導覽失敗:', navError)
            }
        }
    }

    revalidatePath('/admin/stores')
    redirect('/admin/stores')
}
