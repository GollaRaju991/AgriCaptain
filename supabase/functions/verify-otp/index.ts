import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface VerifyOTPRequest {
  phone: string;
  otp: string;
  name?: string;
}

const MAX_FAILED_ATTEMPTS = 5;

const isValidPhoneNumber = (phone: string): boolean => {
  const e164Regex = /^\+[1-9]\d{1,14}$/;
  return e164Regex.test(phone) && phone.length >= 10 && phone.length <= 16;
};

const isValidOTP = (otp: string): boolean => {
  return /^\d{6}$/.test(otp);
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phone, otp, name }: VerifyOTPRequest = await req.json();

    if (!phone || !otp) {
      return new Response(
        JSON.stringify({ error: "Phone number and OTP are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!isValidPhoneNumber(phone)) {
      return new Response(
        JSON.stringify({ error: "Invalid phone number format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!isValidOTP(otp)) {
      return new Response(
        JSON.stringify({ error: "Invalid OTP format. Must be 6 digits." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check OTP from database
    const { data: otpRecord, error: fetchError } = await supabase
      .from("otp_verifications")
      .select("*")
      .eq("phone", phone)
      .single();

    if (fetchError || !otpRecord) {
      return new Response(
        JSON.stringify({ success: false, error: "No OTP found for this phone number" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check rate limiting on failed attempts
    if (otpRecord.failed_attempts >= MAX_FAILED_ATTEMPTS) {
      return new Response(
        JSON.stringify({ success: false, error: "Too many failed attempts. Please request a new OTP." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check expiry
    if (new Date() > new Date(otpRecord.expires_at)) {
      return new Response(
        JSON.stringify({ success: false, error: "OTP has expired. Please request a new one." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if already verified
    if (otpRecord.verified) {
      return new Response(
        JSON.stringify({ success: false, error: "OTP already used" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify OTP - increment failed_attempts on mismatch
    if (otpRecord.otp !== otp) {
      await supabase
        .from("otp_verifications")
        .update({ 
          failed_attempts: otpRecord.failed_attempts + 1,
          last_attempt_at: new Date().toISOString()
        })
        .eq("phone", phone);

      return new Response(
        JSON.stringify({ success: false, error: "Invalid OTP" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use cryptographically secure random password
    const testPassword = crypto.randomUUID() + crypto.randomUUID();
    const testEmail = `user_${phone.replace(/\+/g, '')}@agricaptain.app`;

    const markVerified = async () => {
      await supabase
        .from("otp_verifications")
        .update({ verified: true })
        .eq("phone", phone);
    };

    const sendSession = (session: any, user: any) =>
      new Response(
        JSON.stringify({ success: true, session, user }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );

    // Try to sign up
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          phone: phone,
          name: name || 'User'
        }
      }
    });

    // If user exists, sign in
    if (signUpError?.message.includes('already registered')) {
      const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
      const existingUser = users?.find(u => u.email === testEmail);

      if (existingUser && !listError) {
        const { error: adminError } = await supabase.auth.admin.updateUserById(existingUser.id, {
          password: testPassword,
          user_metadata: {
            phone: phone,
            name: name || existingUser.user_metadata?.name || 'User'
          }
        });

        if (!adminError) {
          const { data: retrySignIn, error: retryError } = await supabase.auth.signInWithPassword({
            email: testEmail,
            password: testPassword,
          });

          if (!retryError && retrySignIn.session) {
            await markVerified();
            return sendSession(retrySignIn.session, retrySignIn.user);
          }
        }
      }

      // Fallback
      const { data: signInData } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword
      });

      if (signInData?.session) {
        await markVerified();
        return sendSession(signInData.session, signInData.user);
      }
    }

    if (signUpData?.session) {
      await markVerified();
      return sendSession(signUpData.session, signUpData.user);
    }

    // If we get here, OTP was correct but session creation failed — don't mark as verified
    return new Response(
      JSON.stringify({ success: false, error: "OTP verified but session creation failed. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error in verify-otp function");
    return new Response(
      JSON.stringify({ error: "Failed to process request" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
