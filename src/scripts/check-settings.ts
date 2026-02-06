
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xgzhsvneffvpbppkojfo.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhnemhzdm5lZmZ2cGJwcGtvamZvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTg3MzU2MCwiZXhwIjoyMDg1NDQ5NTYwfQ.OGBtq9sC_tsSQ-_r5DkXh17V7AQflUjxoOWxZ7iK_6E'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkSettings() {
    const { data, error } = await supabase
        .from('tenants')
        .select('id, slug, settings')
        .eq('slug', 'test2')
        .single()

    if (error) {
        console.error('Error fetching tenant:', error)
        return
    }

    console.log('Tenant Settings:', JSON.stringify(data.settings, null, 2))
}

checkSettings()
