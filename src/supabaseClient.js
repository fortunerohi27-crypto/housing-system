import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://pbzbgxzyppbvndniusbx.supabase.co'
const supabaseAnonKey = 'sb_publishable_Qdq8kqtK44BDzwigo0hj5g_XsGebRFA'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
