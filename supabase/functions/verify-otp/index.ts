import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface VerifyOTPRequest {
  phone: string;
  otp: string;
  name?: string;
}

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
        JSON.stringify({ 
          success: false, 
          error: "No OTP found for this phone number" 
        }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if OTP is expired
    const now = new Date();
    const expiryTime = new Date(otpRecord.expires_at);
    
    if (now > expiryTime) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "OTP has expired. Please request a new one." 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if OTP already verified
    if (otpRecord.verified) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "OTP already used" 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify OTP
    if (otpRecord.otp !== otp) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Invalid OTP" 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Mark OTP as verified
    const { error: updateError } = await supabase
      .from("otp_verifications")
      .update({ verified: true })
      .eq("phone", phone);

    if (updateError) {
      console.error("Error updating OTP status:", updateError);
    }

    // Create or get user by phone
    const testEmail = `user_${phone.replace(/\+/g, '')}@agricaptain.app`;
    const testPassword = `otp_${phone}_${Date.now()}`;

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
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword
      });

      if (signInError) {
        // Try to update password and retry
        const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
        const existingUser = users?.find(u => u.email === testEmail);

        if (existingUser && !listError) {
          const { error: adminError } = await supabase.auth.admin.updateUserById(existingUser.id, {
            password: testPassword,
          });

          if (!adminError) {
            const { data: retrySignIn, error: retryError } = await supabase.auth.signInWithPassword({
              email: testEmail,
              password: testPassword,
            });

            if (!retryError && retrySignIn.session) {
              return new Response(
                JSON.stringify({
                  success: true,
                  session: retrySignIn.session,
                  user: retrySignIn.user,
                }),
                { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
              );
            }
          }
        }
      }

      if (signInData?.session) {
        return new Response(
          JSON.stringify({ 
            success: true,
            session: signInData.session,
            user: signInData.user
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Return success with session
    if (signUpData?.session) {
      return new Response(
        JSON.stringify({ 
          success: true,
          session: signUpData.session,
          user: signUpData.user
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "OTP verified successfully"
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error in verify-otp function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
