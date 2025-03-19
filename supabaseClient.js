import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fhauifujthuakifgwlfy.supabase.co'; 
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZoYXVpZnVqdGh1YWtpZmd3bGZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIxMTU3NjgsImV4cCI6MjA1NzY5MTc2OH0.MYxcCfK2hF-am_DUfX9bz5tw2nr2OiVvGS-f92qMPlM'; 

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
