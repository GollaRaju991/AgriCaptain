import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface SendOTPRequest {
  phone: string;
}

const MAX_SEND_PER_HOUR = 5;

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

    if (!isValidPhoneNumber(phone)) {
      return new Response(
        JSON.stringify({ error: "Invalid phone number format. Please use E.164 format (e.g., +919876543210)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Rate limiting: check existing record
    const { data: existing } = await supabase
      .from("otp_verifications")
      .select("send_count, first_sent_at")
      .eq("phone", phone)
      .maybeSingle();

    if (existing) {
      const firstSent = new Date(existing.first_sent_at);
      const hourAgo = new Date(Date.now() - 60 * 60 * 1000);

      if (firstSent > hourAgo && existing.send_count >= MAX_SEND_PER_HOUR) {
        return new Response(
          JSON.stringify({ error: "Too many OTP requests. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // TEST MODE: Use fixed OTP "123456" for test numbers (remove in production!)
    const TEST_PHONES = ["+919999999999", "+911234567890", "+910000000000"];
    const isTestPhone = TEST_PHONES.includes(formattedPhone);
    const otp = isTestPhone ? "123456" : Math.floor(100000 + Math.random() * 900000).toString();
    const expiryTime = new Date(Date.now() + 10 * 60 * 1000);

    // Determine send_count and first_sent_at
    let sendCount = 1;
    let firstSentAt = new Date().toISOString();
    if (existing) {
      const firstSent = new Date(existing.first_sent_at);
      const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
      if (firstSent > hourAgo) {
        sendCount = existing.send_count + 1;
        firstSentAt = existing.first_sent_at;
      }
    }

    const { error: dbError } = await supabase
      .from("otp_verifications")
      .upsert({
        phone: phone,
        otp: otp,
        expires_at: expiryTime.toISOString(),
        verified: false,
        created_at: new Date().toISOString(),
        failed_attempts: 0,
        send_count: sendCount,
        first_sent_at: firstSentAt,
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

    // Skip SMS for test phones
    if (isTestPhone) {
      console.log(`TEST MODE: OTP for ${formattedPhone} is 123456`);
      return new Response(
        JSON.stringify({ success: true, message: "Test OTP: 123456" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Send OTP via Twilio
    const twilioAccountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const twilioAuthToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    const twilioPhoneNumber = Deno.env.get("TWILIO_PHONE_NUMBER");
    
    if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
      console.log("Twilio credentials not configured - OTP stored in database");
      return new Response(
        JSON.stringify({ success: true, message: "OTP generated (SMS not configured)" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

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
        JSON.stringify({ success: true, message: "OTP generated (SMS delivery issue)" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: "OTP sent successfully" }),
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
