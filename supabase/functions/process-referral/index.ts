import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { referral_code, new_user_id } = await req.json();

    if (!referral_code || !new_user_id) {
      return new Response(JSON.stringify({ error: "Missing parameters" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Find the referral
    const { data: referral, error: refErr } = await supabase
      .from("referrals")
      .select("*")
      .eq("referral_code", referral_code)
      .eq("status", "pending")
      .is("referred_user_id", null)
      .maybeSingle();

    if (refErr || !referral) {
      return new Response(JSON.stringify({ error: "Invalid or already used referral code" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Don't allow self-referral
    if (referral.referrer_id === new_user_id) {
      return new Response(JSON.stringify({ error: "Cannot use your own referral code" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const bonusAmount = referral.bonus_amount || 25;

    // Update referral status
    await supabase
      .from("referrals")
      .update({
        referred_user_id: new_user_id,
        status: "completed",
        completed_at: new Date().toISOString(),
      })
      .eq("id", referral.id);

    // Credit referrer's wallet
    const { data: wallet } = await supabase
      .from("wallets")
      .select("*")
      .eq("user_id", referral.referrer_id)
      .maybeSingle();

    if (wallet) {
      await supabase
        .from("wallets")
        .update({ balance: wallet.balance + bonusAmount })
        .eq("user_id", referral.referrer_id);
    } else {
      await supabase
        .from("wallets")
        .insert({ user_id: referral.referrer_id, balance: bonusAmount });
    }

    // Add transaction record for referrer
    await supabase.from("wallet_transactions").insert({
      user_id: referral.referrer_id,
      amount: bonusAmount,
      type: "credit",
      description: "Referral Bonus - New user signup",
      reference_type: "referral",
      reference_id: referral.id,
    });

    // Create a new referral code entry for the referrer (so they can refer more people)
    const { data: newCode } = await supabase.rpc("generate_referral_code");
    await supabase.from("referrals").insert({
      referrer_id: referral.referrer_id,
      referral_code: newCode,
      bonus_amount: 25,
    });

    // Send notification to referrer
    await supabase.from("notifications").insert({
      user_id: referral.referrer_id,
      type: "referral",
      title: "Referral Bonus Credited!",
      message: `₹${bonusAmount} has been added to your Agrizin Money wallet for a successful referral.`,
      action_url: "/agrizin-money",
    });

    return new Response(JSON.stringify({ success: true, bonus: bonusAmount }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
