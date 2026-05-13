import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dgzyzpwjwnykyiszsegg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRnenl6cHdqd255a3lpc3pzZWdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0MTk0ODksImV4cCI6MjA4Njk5NTQ5MH0.hmyszZYT_Yy1J_iJm3LMmQdt13Z8S9vf9EWuCxA2pgo';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data: creatives, error } = await supabase.from('profiles').select('*').eq('role', 'creative');
  if (error) console.error("Error fetching profiles", error);
  console.log("Creatives:", creatives);
}
check();
