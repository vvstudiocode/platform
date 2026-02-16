
import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'

// Load .env.local
const envPath = path.resolve(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8')
    envConfig.split('\n').forEach(line => {
        const [key, value] = line.split('=')
        if (key && value) {
            process.env[key.trim()] = value.trim()
        }
    })
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, serviceRoleKey)

async function main() {
    console.log('Fetching one product to check its structure...')
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .limit(1)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error:', error)
        return
    }

    if (!data || data.length === 0) {
        console.log('No products found')
        return
    }

    const product = data[0]
    console.log('Product ID:', product.id)
    console.log('Product SKU:', product.sku)
    console.log('Product Name:', product.name)
    console.log('Possible ID fields:', Object.keys(product).filter(k => product[k] && String(product[k]).includes('P0')))
}

main()
