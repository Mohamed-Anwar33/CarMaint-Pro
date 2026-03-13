import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Missing Supabase environment variables!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  console.log("Testing Supabase connection...");
  try {
    // A simple query to test the connection. This fetches 1 row from the 'profiles' table.
    const { data, error } = await supabase.from("profiles").select("*").limit(1);

    if (error) {
      console.error("❌ Database connection failed.");
      console.error("Error details:", error.message);
      return;
    }

    console.log("✅ Database connected successfully!");
    console.log("Sample data:", data);
  } catch (err) {
    console.error("❌ An unexpected error occurred:", err);
  }
}

testConnection();
