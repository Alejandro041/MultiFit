const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  "https://vrqrcnqtltxlfzhzrjml.supabase.co",
  "sb_publishable_xW3x4arccQhOdy8npPm7Xw_vpvBuK4w",
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  }
);

(async () => {
  const email = `codexsup${Date.now()}@gmail.com`;
  const { data, error } = await supabase.auth.signUp({
    email,
    password: "Test1234!",
    options: {
      data: { full_name: "Codex Metadata", appRole: "SuperAdmin" }
    }
  });
  console.log('signup data', data);
  console.log('signup error', error);
})();
