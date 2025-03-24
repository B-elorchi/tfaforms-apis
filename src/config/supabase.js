const { createClient } = require('@supabase/supabase-js');

// Supabase integration code
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY; 

if (!supabaseUrl || !supabaseKey) {
    console.error("Supabase URL or Key is missing. Check your environment variables.");
    process.exit(1); // Exit the process if credentials are missing
}

console.log('Supabase URL:', supabaseUrl);

const supabase = createClient(
    supabaseUrl,
    supabaseKey,
    {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
        },
    }
);

// JWT Secret (used elsewhere in your application, if needed)
const supabaseSecret = "50v0D5rbLHK89AQxO1rNjtBHHLyAhk+aR7sfyp8LxFkh2ueVtaCP7fs9hKPeN+UYCdLIgVMo8iC1uPYOxKuUmg==";

module.exports = { supabase, supabaseSecret };
