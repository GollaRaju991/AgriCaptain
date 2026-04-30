// Seeds the first admin user. Idempotent. Uses FIRST_ADMIN_EMAIL / FIRST_ADMIN_PASSWORD secrets.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const email = Deno.env.get("FIRST_ADMIN_EMAIL");
    const password = Deno.env.get("FIRST_ADMIN_PASSWORD");
    if (!email || !password) {
      return new Response(JSON.stringify({ error: "FIRST_ADMIN_EMAIL / FIRST_ADMIN_PASSWORD not set" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    // Try create
    let userId: string | null = null;
    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name: "Admin", role: "admin" },
    });
    if (created?.user) {
      userId = created.user.id;
    } else if (createErr && /already|exists|registered/i.test(createErr.message)) {
      // Find existing
      const { data: list } = await admin.auth.admin.listUsers();
      const found = list?.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
      if (!found) throw new Error("Admin exists but could not be located");
      userId = found.id;
      // Reset password to the secret value so user can log in
      await admin.auth.admin.updateUserById(userId, { password, email_confirm: true });
    } else if (createErr) {
      throw createErr;
    }

    if (!userId) throw new Error("No user id");

    // Ensure profile
    await admin.from("profiles").upsert({ id: userId, name: "Admin" });

    // Grant admin role
    await admin.from("user_roles").upsert({ user_id: userId, role: "admin" }, { onConflict: "user_id,role" });

    return new Response(JSON.stringify({ success: true, email, userId }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e?.message || e) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
