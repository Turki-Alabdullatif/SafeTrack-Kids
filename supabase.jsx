import { createClient } from '@supabase/supabase-js'

// Replace these with the keys from your Supabase dashboard
const supabaseUrl = 'https://gzzgfexnklerpffrjkid.supabase.co'
const supabaseKey = 'sb_publishable_zcksWHYsKOKBJIjWK9CEfA_QWvEtDpm'

export const supabase = createClient(supabaseUrl, supabaseKey)