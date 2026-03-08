import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify JWT and extract user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Validate the user's JWT
    const anonClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!);
    const { data: { user }, error: authError } = await anonClient.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { amount } = await req.json();

    // Validate amount
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount < 1 || parsedAmount > 50000 || !Number.isFinite(parsedAmount)) {
      return new Response(JSON.stringify({ error: "Invalid amount. Must be between ₹1 and ₹50,000." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // NOTE: In production, integrate a real payment gateway (Razorpay, Paytm, etc.)
    // and verify the payment callback before crediting the wallet.
    // For now, this edge function ensures server-side control over wallet operations.

    // Get current wallet
    const { data: wallet } = await supabase
      .from("wallets")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!wallet) {
      return new Response(JSON.stringify({ error: "Wallet not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update wallet balance server-side
    const { error: updateError } = await supabase
      .from("wallets")
      .update({ balance: wallet.balance + parsedAmount })
      .eq("user_id", user.id);

    if (updateError) {
      return new Response(JSON.stringify({ error: "Failed to update wallet" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Add transaction record
    const { error: txError } = await supabase.from("wallet_transactions").insert({
      user_id: user.id,
      amount: parsedAmount,
      type: "credit",
      description: "Wallet Recharge",
      reference_type: "recharge",
    });

    if (txError) {
      console.error("Failed to insert transaction record:", txError.message);
    }

    return new Response(
      JSON.stringify({ success: true, new_balance: wallet.balance + parsedAmount }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Wallet recharge error");
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
