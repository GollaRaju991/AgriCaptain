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

    // Get active orders. Keep a high cap so newly created test orders also progress quickly.
    // (Older hard limit of 10 caused newer orders to wait behind backlog.)
    const { data: orders, error } = await supabase
      .from("orders")
      .select("*")
      .in("status", ["pending", "processing", "shipped", "out_for_delivery"])
      .order("created_at", { ascending: true })
      .limit(200);

    

    if (error) throw error;

    const now = new Date();
    const results: string[] = [];

    for (const order of orders || []) {
      const createdAt = new Date(order.created_at);
      const minutesOld = (now.getTime() - createdAt.getTime()) / (1000 * 60);

      let newStatus: string | null = null;

      // Auto-progress every 1 minute:
      // 0-1 min: pending
      // 1 min: processing
      // 2 min: shipped
      // 3 min: out_for_delivery
      // 4 min: delivered
      if (order.status === "pending" && minutesOld >= 1) {
        newStatus = "processing";
      } else if (order.status === "processing" && minutesOld >= 2) {
        newStatus = "shipped";
      } else if (order.status === "shipped" && minutesOld >= 3) {
        newStatus = "out_for_delivery";
      } else if (order.status === "out_for_delivery" && minutesOld >= 4) {
        newStatus = "delivered";
      }

      if (newStatus) {
        try {
          const updateData: any = { status: newStatus, updated_at: now.toISOString() };

          const existingUpdates = Array.isArray(order.tracking_updates) ? order.tracking_updates : [];
          const trackingEntry = {
            status: newStatus,
            title: getStatusTitle(newStatus),
            description: getStatusDescription(newStatus, order.order_number),
            timestamp: now.toISOString(),
            location: getStatusLocation(newStatus),
          };
          updateData.tracking_updates = [...existingUpdates, trackingEntry];

          if (newStatus === "delivered" && order.payment_method === "cod") {
            updateData.payment_status = "completed";
          }

          const { error: updateError } = await supabase.from("orders").update(updateData).eq("id", order.id);
          if (updateError) {
            console.error(`Failed to update order ${order.order_number}:`, updateError);
            continue;
          }

          // Notification (fire and forget)
          const messages: Record<string, string> = {
            processing: `Your order #${order.order_number} is being processed.`,
            shipped: `Your order #${order.order_number} has been shipped!`,
            out_for_delivery: `Your order #${order.order_number} is out for delivery! 🚚`,
            delivered: `Your order #${order.order_number} has been delivered! ✅`,
          };

          if (messages[newStatus]) {
            supabase.from("notifications").insert({
              user_id: order.user_id,
              order_id: order.id,
              type: "order",
              title: `Order ${getStatusTitle(newStatus)}`,
              message: messages[newStatus],
              action_url: "/orders",
            }).then(() => {});
          }

          results.push(`Order ${order.order_number}: ${order.status} → ${newStatus}`);
        } catch (e) {
          console.error(`Error processing order ${order.order_number}:`, e);
        }
      }
    }

    return new Response(JSON.stringify({ success: true, updated: results.length, details: results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function getStatusTitle(status: string): string {
  const titles: Record<string, string> = {
    processing: "Processing",
    shipped: "Shipped",
    out_for_delivery: "Out for Delivery",
    delivered: "Delivered",
  };
  return titles[status] || status;
}

function getStatusDescription(status: string, orderNumber: string): string {
  const descriptions: Record<string, string> = {
    processing: "Your order is being packed and prepared for shipping",
    shipped: "Your package has been handed to the courier",
    out_for_delivery: "Your package is on its way to your doorstep",
    delivered: "Your package has been delivered successfully",
  };
  return descriptions[status] || "";
}

function getStatusLocation(status: string): string {
  const locations: Record<string, string> = {
    processing: "Agrizin Warehouse, Hyderabad",
    shipped: "Sorting Facility, Hyderabad",
    out_for_delivery: "Local Delivery Hub",
    delivered: "Delivered to Customer",
  };
  return locations[status] || "";
}
