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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get all pending/processing orders older than 2 minutes (for demo speed)
    const { data: orders, error } = await supabase
      .from("orders")
      .select("*")
      .in("status", ["pending", "processing", "shipped"])
      .order("created_at", { ascending: true });

    if (error) throw error;

    const now = new Date();
    const results: string[] = [];

    for (const order of orders || []) {
      const createdAt = new Date(order.created_at);
      const minutesOld = (now.getTime() - createdAt.getTime()) / (1000 * 60);

      let newStatus: string | null = null;

      // Auto-progress based on age
      if (order.status === "pending" && minutesOld >= 2) {
        newStatus = "processing";
      } else if (order.status === "processing" && minutesOld >= 5) {
        newStatus = "shipped";
      } else if (order.status === "shipped" && minutesOld >= 10) {
        newStatus = "delivered";
      }

      if (newStatus) {
        const updateData: any = { status: newStatus, updated_at: now.toISOString() };
        if (newStatus === "delivered" && order.payment_method === "cod") {
          updateData.payment_status = "completed";
        }

        await supabase.from("orders").update(updateData).eq("id", order.id);

        // Add delivery tracking
        if (newStatus === "shipped" || newStatus === "delivered") {
          await supabase.from("delivery_tracking").insert({
            order_id: order.id,
            user_id: order.user_id,
            status: newStatus,
            shipped_at: newStatus === "shipped" ? now.toISOString() : null,
            delivered_at: newStatus === "delivered" ? now.toISOString() : null,
            courier_name: "Agrizin Logistics",
            updated_by: "auto-simulation",
          });
        }

        // Send notification
        const messages: Record<string, string> = {
          processing: `Your order #${order.order_number} is being processed.`,
          shipped: `Your order #${order.order_number} has been shipped!`,
          delivered: `Your order #${order.order_number} has been delivered!`,
        };

        if (messages[newStatus]) {
          await supabase.from("notifications").insert({
            user_id: order.user_id,
            order_id: order.id,
            type: "order",
            title: `Order ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`,
            message: messages[newStatus],
            action_url: "/orders",
          });
        }

        results.push(`Order ${order.order_number}: ${order.status} → ${newStatus}`);
      }
    }

    return new Response(JSON.stringify({ success: true, updated: results.length, details: results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
