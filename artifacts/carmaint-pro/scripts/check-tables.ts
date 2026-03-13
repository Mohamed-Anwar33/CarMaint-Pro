import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

const supabaseUrl = process.env.VITE_SUPABASE_URL || "https://lmkutuybfpglfkfxiwns.supabase.co";
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxta3V0dXliZnBnbGZrZnhpd25zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzNTQ5MTEsImV4cCI6MjA4ODkzMDkxMX0.aiVnyjWij99Jx_OZ9hlQ2ZOBlcb47gugoWh-coPAS-U";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkTables() {
  console.log("Checking if 'users' table exists...");
  const { error } = await supabase.from("users").select("id").limit(1);
  if (error) {
    console.error("❌ Error fetching from 'users' table:", error.message, error.code);
    if (error.code === '42P01') {
      console.log("⚠️ The 'users' table DOES NOT EXIST. You need to run supabase-tables.sql in your Supabase SQL Editor.");
    }
  } else {
    console.log("✅ 'users' table exists.");
  }
}

checkTables();
