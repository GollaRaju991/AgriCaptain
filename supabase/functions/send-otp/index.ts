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

    // Send OTP via Twilio
    const twilioAccountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const twilioAuthToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    const twilioPhoneNumber = Deno.env.get("TWILIO_PHONE_NUMBER");
    
    if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
      console.log("Twilio credentials not configured, returning OTP for testing:", otp);
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "OTP generated (SMS not configured)",
          otp: otp // Only for testing
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Twilio API call
    const message = `Your AgriCaptain OTP is: ${otp}. Valid for 10 minutes. Do not share with anyone.`;
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;
    
    const twilioAuth = btoa(`${twilioAccountSid}:${twilioAuthToken}`);
    
    const formData = new URLSearchParams({
      To: phone,
      From: twilioPhoneNumber,
      Body: message
    });

    const smsResponse = await fetch(twilioUrl, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${twilioAuth}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: formData.toString()
    });

    if (!smsResponse.ok) {
      const errorText = await smsResponse.text();
      console.error("Twilio SMS sending failed:", errorText);
      // Still return success for testing, but log the SMS failure
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "OTP generated (SMS not sent - check Twilio configuration)",
          otp: otp // For testing when SMS fails
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const smsResult = await smsResponse.json();
    console.log("OTP sent successfully via Twilio:", { phone, sid: smsResult.sid });

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
