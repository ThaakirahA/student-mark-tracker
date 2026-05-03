import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dlmucwhwkuqmldrhyrle.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsbXVjd2h3a3VxbWxkcmh5cmxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3MzY0NTEsImV4cCI6MjA5MzMxMjQ1MX0.bMtvIwDIBhD2Rq5u6pXDEMqCMlERdc2xI_nJOD3vqxQ'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)