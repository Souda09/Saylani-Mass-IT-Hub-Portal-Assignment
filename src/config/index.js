import {createClient} from '@supabase/supabase-js'

const apiURL = 'https://glpihhtjipjnkglrkbaw.supabase.co'
const apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdscGloaHRqaXBqbmtnbHJrYmF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzNDY1NzQsImV4cCI6MjA3NTkyMjU3NH0.PtugLdOh5FgIe_cUFZLTcFcL1jue7vut9ephGoBpjXM'

const supabase =createClient(apiURL,apiKey);

export default supabase