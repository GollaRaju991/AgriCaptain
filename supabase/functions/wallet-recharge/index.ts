import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string,
  secret: string
): Promise<boolean> {
  const encoder = new TextEncoder();
  const data = encoder.encode(`${orderId}|${paymentId}`);
  const key = encoder.encode(secret);
  const cryptoKey = await crypto.subtle.importKey(
    "raw", key, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", cryptoKey, data);
  const expectedSignature = Array.from(new Uint8Array(sig))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  return expectedSignature === signature;
}

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

    const { amount, razorpay_payment_id, razorpay_order_id, razorpay_signature } = await req.json();

    // Validate amount
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount < 1 || parsedAmount > 50000 || !Number.isFinite(parsedAmount)) {
      return new Response(JSON.stringify({ error: "Invalid amount. Must be between ₹1 and ₹50,000." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify Razorpay payment signature
    if (!razorpay_payment_id || !razorpay_signature) {
      return new Response(JSON.stringify({ error: "Missing payment verification details" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const razorpaySecret = Deno.env.get("RAZORPAY_KEY_SECRET");
    if (!razorpaySecret) {
      console.error("RAZORPAY_KEY_SECRET not configured");
      return new Response(JSON.stringify({ error: "Payment verification not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // If we have an order_id, verify signature with HMAC
    if (razorpay_order_id) {
      const isValid = await verifyRazorpaySignature(
        razorpay_order_id, razorpay_payment_id, razorpay_signature, razorpaySecret
      );
      if (!isValid) {
        console.error("Razorpay signature verification failed");
        return new Response(JSON.stringify({ error: "Payment verification failed" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } else {
      // Fallback: verify payment exists via Razorpay API
      const razorpayKeyId = Deno.env.get("RAZORPAY_KEY_ID") || "rzp_live_SX4NYEslAbwwUn";
      const authString = btoa(`${razorpayKeyId}:${razorpaySecret}`);
      const verifyResponse = await fetch(
        `https://api.razorpay.com/v1/payments/${razorpay_payment_id}`,
        {
          headers: { "Authorization": `Basic ${authString}` },
        }
      );

      if (!verifyResponse.ok) {
        console.error("Razorpay payment verification API failed");
        return new Response(JSON.stringify({ error: "Payment verification failed" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const paymentData = await verifyResponse.json();
      if (paymentData.status !== "captured" && paymentData.status !== "authorized") {
        return new Response(JSON.stringify({ error: "Payment not completed" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Verify the payment amount matches
      const paidAmountInRupees = paymentData.amount / 100;
      if (Math.abs(paidAmountInRupees - parsedAmount) > 0.01) {
        return new Response(JSON.stringify({ error: "Payment amount mismatch" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Payment verified - now credit wallet
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
      reference_id: razorpay_payment_id,
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
