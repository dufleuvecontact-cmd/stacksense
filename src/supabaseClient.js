import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://pjapdxatvghedkbxtnzo.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_D-78iY0Zo31g-0ZU684RIA_OtzTPiUr'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
