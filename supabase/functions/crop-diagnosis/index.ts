import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { image } = await req.json();
    if (!image) {
      return new Response(JSON.stringify({ error: "No image provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are an expert agricultural scientist and plant pathologist.

IMPORTANT RULES:
1. If the image is NOT a plant, leaf, crop, or tree — respond with EXACTLY this format:
   **NOT_A_PLANT**
   The image you provided does not appear to be a plant or crop. Please upload a clear photo of a leaf or plant for disease analysis.

2. If the image IS a plant/leaf but is blurry, dark, or unclear — respond with EXACTLY this format:
   **UNCLEAR_IMAGE**
   The image is not clear enough to analyze properly. Please scan again with better lighting and hold the camera steady.

3. If the image IS a clear plant/leaf, analyze it and provide:
   **IS_PLANT_DISEASE**
   - **Plant/Crop Name**: Identify the plant
   - **Health Status**: Healthy or Diseased
   - **Disease Name**: If diseased, name the disease
   - **Severity**: Low, Medium, or High
   - **Symptoms**: Describe visible symptoms
   - **Causes**: What causes this disease
   - **Treatment**: Recommend specific pesticides/fungicides by name. Only recommend products that are commonly available in Indian agriculture markets.
   - **Prevention**: How to prevent this in future
   - **Recommended Products**: List 1-3 specific pesticide/fungicide product names that treat this disease (e.g., "Coragen", "Roundup", "Neem Oil"). If no specific product is needed (plant is healthy), write "NONE".

Keep responses concise and practical for Indian farmers. Use simple language.`,
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analyze this crop/plant image for diseases and provide diagnosis with treatment recommendations.",
              },
              {
                type: "image_url",
                image_url: { url: image },
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Service temporarily unavailable. Please try again later." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "Unable to analyze the image.";

    return new Response(JSON.stringify({ analysis: content }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("crop-diagnosis error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
