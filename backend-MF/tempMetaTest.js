const { createClient } = require("@supabase/supabase-js");
const admin = createClient(
  "https://vrqrcnqtltxlfzhzrjml.supabase.co",
  "sb_secret_LINzHIhE_MAz4YqWFv9Wzg_GaFWeEv_",
  { auth: { persistSession: false } }
);
(async () => {
  const email = `codex-admin-test-${Date.now()}@example.com`;
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password: "Test1234!",
    user_metadata: { appRole: "SuperAdmin", full_name: "Codex Test" }
  });
  if (createError) {
    console.error('create error', createError);
    return;
  }
  const userId = created.user?.id;
  console.log('metadata before update', created.user?.user_metadata);
  const { data: updated, error: updateError } = await admin.auth.admin.updateUserById(userId, {
    email_confirm: true
  });
  if (updateError) {
    console.error('update error', updateError);
  } else {
    console.log('metadata after update', updated.user?.user_metadata);
  }
  await admin.auth.admin.deleteUser(userId);
})();
