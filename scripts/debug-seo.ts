
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

// Manually parse .env.local because we don't have dotenv
const envPath = path.resolve(process.cwd(), '.env.local')
const envContent = fs.readFileSync(envPath, 'utf-8')
const envVars: Record<string, string> = {}

envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/)
    if (match) {
        const key = match[1].trim()
        const value = match[2].trim().replace(/^["']|["']$/g, '') // remove quotes
        envVars[key] = value
    }
})

const supabaseUrl = envVars['NEXT_PUBLIC_SUPABASE_URL']
const supabaseKey = envVars['SUPABASE_SERVICE_ROLE_KEY']

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function main() {
    console.log('--- Finding a Sub-site ---')
    const { data: subSite } = await supabase
        .from('tenants')
        .select('*')
        .eq('is_hq', false)
        .limit(1)
        .single()

    if (subSite) {
        console.log(`Checking Sub-site: ${subSite.name} (${subSite.slug})`)
        const { data: pages } = await supabase
            .from('pages')
            .select('id, title, slug, is_homepage, published, seo_title, seo_description, updated_at')
            .eq('tenant_id', subSite.id)
            .eq('is_homepage', true)

        console.log(`Found ${pages?.length} homepage(s):`)
        pages?.forEach(p => {
            console.log(`\n[ID: ${p.id}]`)
            console.log('- Title:', p.title)
            console.log('- Slug:', p.slug)
            console.log('- Is Homepage:', p.is_homepage)
            console.log('- Published:', p.published)
            console.log('- SEO Title:', p.seo_title)
            console.log('- SEO Description:', p.seo_description)
            console.log('- Updated At:', p.updated_at)
        })
    } else {
        console.log('No sub-site found.')
    }
}

main()
