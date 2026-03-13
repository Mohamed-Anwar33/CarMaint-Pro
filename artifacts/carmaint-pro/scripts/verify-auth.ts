import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

const supabaseUrl = process.env.VITE_SUPABASE_URL || "https://lmkutuybfpglfkfxiwns.supabase.co";
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxta3V0dXliZnBnbGZrZnhpd25zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzNTQ5MTEsImV4cCI6MjA4ODkzMDkxMX0.aiVnyjWij99Jx_OZ9hlQ2ZOBlcb47gugoWh-coPAS-U";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAuth() {
  console.log("1. Authenticating with Supabase...");
  const { data, error } = await supabase.auth.signInWithPassword({
    email: "eisam2350@gmail.com", // testing the email from the screenshot
    password: "Mo123456" // testing the password from the screenshot DOM element
  });

  if (error) {
    console.error("❌ Login failed:", error.message);
    return;
  }

  const token = data.session?.access_token;
  console.log("✅ Login successful, Token obtained!");

  console.log("2. Fetching profile from local API server...");
  try {
    const res = await fetch("http://localhost:8080/api/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const body = await res.text();
    console.log(`API Response Status: ${res.status}`);
    console.log(`API Response Body: ${body}`);
  } catch (err) {
    console.error("❌ Fetch failed:", err);
  }
}

testAuth();
