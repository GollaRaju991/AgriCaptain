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

// Validate phone number format (E.164)
const isValidPhoneNumber = (phone: string): boolean => {
  const e164Regex = /^\+[1-9]\d{1,14}$/;
  return e164Regex.test(phone) && phone.length >= 10 && phone.length <= 16;
};

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

    // Validate phone number format
    if (!isValidPhoneNumber(phone)) {
      return new Response(
        JSON.stringify({ error: "Invalid phone number format. Please use E.164 format (e.g., +919876543210)" }),
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
      console.error("Database error storing OTP");
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
      console.log("Twilio credentials not configured - OTP stored in database");
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "OTP generated (SMS not configured)"
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
      console.error("Twilio SMS sending failed");
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "OTP generated (SMS delivery issue - check Twilio configuration)"
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("OTP sent successfully via Twilio");

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "OTP sent successfully"
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error in send-otp function");
    return new Response(
      JSON.stringify({ error: "Failed to process request" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);