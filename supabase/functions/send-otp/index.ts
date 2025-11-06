import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SendOTPRequest {
  phone: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phone }: SendOTPRequest = await req.json();

    if (!phone) {
      return new Response(
        JSON.stringify({ error: "Phone number is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP in Supabase with 10-minute expiry
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Create OTP verification table entry
    const expiryTime = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
    const { error: dbError } = await supabase
      .from("otp_verifications")
      .upsert({
        phone: phone,
        otp: otp,
        expires_at: expiryTime.toISOString(),
        verified: false,
        created_at: new Date().toISOString()
      }, {
        onConflict: 'phone'
      });

    if (dbError) {
      console.error("Database error:", dbError);
      return new Response(
        JSON.stringify({ error: "Failed to store OTP" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Send OTP via Fast2SMS
    const fast2smsApiKey = Deno.env.get("FAST2SMS_API_KEY");
    
    if (!fast2smsApiKey) {
      console.log("Fast2SMS API key not configured, returning OTP for testing:", otp);
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "OTP generated (SMS not configured)",
          otp: otp // Only for testing, remove in production
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fast2SMS API call
    const message = `Your AgriCaptain OTP is: ${otp}. Valid for 10 minutes. Do not share with anyone.`;
    const fast2smsUrl = `https://www.fast2sms.com/dev/bulkV2?authorization=${fast2smsApiKey}&route=otp&variables_values=${otp}&flash=0&numbers=${phone.replace('+91', '')}`;

    const smsResponse = await fetch(fast2smsUrl, {
      method: "GET",
    });

    const smsResult = await smsResponse.json();
    
    if (!smsResponse.ok || smsResult.return === false) {
      console.error("SMS sending failed:", smsResult);
      // Still return success for testing, but log the SMS failure
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "OTP generated (SMS not sent - check Fast2SMS configuration)",
          otp: otp // For testing when SMS fails
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("OTP sent successfully:", { phone, messageId: smsResult.message_id });

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "OTP sent successfully"
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error in send-otp function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
