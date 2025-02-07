import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://icpuzjpvwlomyxxfmtan.supabase.co'; 
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljcHV6anB2d2xvbXl4eGZtdGFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA1Mzg0NDAsImV4cCI6MjA0NjExNDQ0MH0.ldiLfWY0QF4uE5tmol8kGJVvdtTlcV_c9Dd-1mVJwDM'; // Zastąp swoim kluczem anon

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
