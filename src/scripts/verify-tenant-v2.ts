import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

// Manually parse .env.local since dotenv might not be installed
const envPath = path.resolve(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf-8')
    content.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/)
        if (match) {
            const key = match[1].trim()
            const value = match[2].trim().replace(/^["']|["']$/g, '') // Remove quotes
            process.env[key] = value
        }
    })
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials. ensure .env.local exists and has NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function verify() {
    console.log('Querying tenant "test2"...')
    const { data: tenant, error } = await supabase
        .from('tenants')
        .select('name, slug, logo_url')
        .eq('slug', 'test2')
        .single()

    if (error) {
        console.error('Error fetching tenant:', error)
    } else {
        console.log('Tenant Data:', tenant)
        if (tenant?.logo_url) {
            console.log('Logo URL found:', tenant.logo_url)
        } else {
            console.log('No logo_url found.')
        }
    }
}

verify()
