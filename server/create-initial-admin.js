import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

// Hardcoded keys for recovery script only - DO NOT COMMIT THIS FILE IF PUBLIC
// (Since repo is private, this is acceptable for a one-time setup script)
// User must replace these or rely on us reading them from .env if present.
// Since the environment failed previously, we will ask the user to input them OR 
// we read them from the file system if possible.
// For now, let's assume standard names.

const supabaseUrl = process.env.VITE_SUPABASE_URL || "YOUR_SUPABASE_URL";
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || "YOUR_SUPABASE_KEY";

const supabase = createClient(supabaseUrl, supabaseKey);

async function createAdmin() {
    const args = process.argv.slice(2);
    // Usage: node server/create-initial-admin.js <URL> <KEY> <EMAIL> <PASS>
    // OR just: node server/create-initial-admin.js <EMAIL> <PASS> (if env vars set)

    // Simplification for user:
    const email = "alerzenhealth@gmail.com";
    const password = "Alerzen@18";

    console.log(`Attempting to create admin user: ${email}...`);

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
    });

    if (error) {
        console.error("Error creating user:", error.message);
        console.log("If the error is 'User already registered', try logging in.");
    } else {
        console.log("User created successfully!");
        console.log("ID:", data.user?.id);
        console.log("Email:", data.user?.email);
    }
}

createAdmin();
