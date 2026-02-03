
import { createClient } from '@supabase/supabase-js'

// Need to use service role key if possible to bypass RLS, or user anon key if RLS allows public read.
// Since we are debugging, assuming environment variables are set in .env.local
// Hardcoded for debugging purposes from env
const supabaseUrl = 'https://xgzhsvneffvpbppkojfo.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhnemhzdm5lZmZ2cGJwcGtvamZvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTg3MzU2MCwiZXhwIjoyMDg1NDQ5NTYwfQ.OGBtq9sC_tsSQ-_r5DkXh17V7AQflUjxoOWxZ7iK_6E'


if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Key')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkData() {
    console.log('--- Checking Tenants ---')
    const { data: tenants, error: tenantError } = await supabase
        .from('tenants')
        .select('id, name, slug')

    if (tenantError) console.error('Tenant Error:', tenantError)
    else console.table(tenants)

    console.log('\n--- Checking Products ---')
    const { data: products, error: productError } = await supabase
        .from('products')
        .select('id, name, tenant_id')
        .limit(10)

    if (productError) console.error('Product Error:', productError)
    else {
        console.table(products)
        if (tenants && products) {
            console.log('\n--- Product Tenant ID Match ---')
            products.forEach(p => {
                const tenant = tenants.find(t => t.id === p.tenant_id)
                console.log(`Product: ${p.name} (${p.id}) -> Tenant: ${tenant ? tenant.slug : 'UNKNOWN'} (${p.tenant_id})`)
            })
        }
    }

    console.log('\n--- Checking Pages for "weili" ---')
    if (tenants) {
        const weili = tenants.find(t => t.slug === 'weili')
        if (weili) {
            const { data: pages, error: pageError } = await supabase
                .from('pages')
                .select('id, title, slug, is_homepage, published, tenant_id')
                .eq('tenant_id', weili.id)

            if (pageError) console.error('Page Error:', pageError)
            else console.table(pages)
        } else {
            console.log('Tenant "weili" not found')
        }
    }
}

checkData()
