import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// GET
const { data, error } = await supabase
  .from('sua_tabela')
  .select('*')

// INSERT
await supabase
  .from('sua_tabela')
  .insert([{ coluna: 'valor' }])
