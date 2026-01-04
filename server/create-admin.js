import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY; // Needs Service Role Key for Admin creation ideally, but SignUp works with public key
const supabase = createClient(supabaseUrl, supabaseKey);

async function createAdmin() {
    const args = process.argv.slice(2);
    if (args.length < 2) {
        console.error("Usage: node server/create-admin.js <email> <password>");
        process.exit(1);
    }

    const [email, password] = args;

    console.log(`Creating Admin User: ${email}...`);

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
    });

    if (error) {
        console.error("Error creating user:", error.message);
        process.exit(1);
    }

    console.log("User created successfully!");
    console.log("ID:", data.user.id);
    console.log("Email:", data.user.email);
    console.log("\nNext Steps:");
    console.log("1. Check your email for verification (if enabled in Supabase).");
    console.log("2. Run the SQL script in Supabase Dashboard to create the 'admin_profiles' table.");
    console.log("3. Log in to the Admin Panel to set up 2FA.");
}

createAdmin();
