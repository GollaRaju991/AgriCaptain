
import { supabase } from '@/integrations/supabase/client';

interface DualOrderData {
  orderId: string;
  userId: string;
  customerData: {
    name: string;
    email: string;
    phone: string;
  };
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  paymentMethod: string;
  address: any;
}

class DualBackendService {
  private isSubmitting = false;

  async saveOrderDual(orderData: DualOrderData): Promise<{ success: boolean; error?: string }> {
    // Prevent duplicate submissions
    if (this.isSubmitting) {
      console.warn('Order submission already in progress, blocking duplicate');
      return { success: false, error: 'Order submission already in progress' };
    }
    this.isSubmitting = true;

    try {
      // Check for recent duplicate orders (same user, same items, same amount within last 2 minutes)
      const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString();
      const { data: recentOrders } = await supabase
        .from('orders')
        .select('id, items, total_amount, created_at')
        .eq('user_id', orderData.userId)
        .gte('created_at', twoMinutesAgo)
        .order('created_at', { ascending: false });

      if (recentOrders && recentOrders.length > 0) {
        const isDuplicate = recentOrders.some(existingOrder => {
          if (existingOrder.total_amount !== orderData.totalAmount) return false;
          const existingItems = Array.isArray(existingOrder.items) ? existingOrder.items : [];
          if (existingItems.length !== orderData.items.length) return false;
          return orderData.items.every((newItem: any) =>
            existingItems.some((existing: any) =>
              existing.name === newItem.name &&
              existing.quantity === newItem.quantity &&
              existing.price === newItem.price
            )
          );
        });

        if (isDuplicate) {
          console.warn('Duplicate order detected, blocking submission');
          this.isSubmitting = false;
          return { success: false, error: 'This order was already placed. Check your orders page.' };
        }
      }

      const estimatedDelivery = new Date();
      estimatedDelivery.setDate(estimatedDelivery.getDate() + 5);

      const trackingUpdates = [
        {
          status: 'pending',
          title: 'Order Placed',
          description: 'Your order has been placed successfully',
          timestamp: new Date().toISOString(),
          location: 'Online'
        }
      ];

      const { data: supabaseOrder, error: supabaseError } = await supabase
        .from('orders')
        .insert({
          user_id: orderData.userId,
          order_number: orderData.orderId,
          total_amount: orderData.totalAmount,
          status: 'pending',
          payment_status: 'completed',
          payment_method: orderData.paymentMethod,
          items: orderData.items,
          shipping_address: orderData.address,
          estimated_delivery: estimatedDelivery.toISOString(),
          tracking_updates: trackingUpdates
        })
        .select()
        .single();

      if (supabaseError) {
        console.error('Order save error:', supabaseError);
        throw new Error('Failed to save order');
      }

      await supabase
        .from('notifications')
        .insert({
          user_id: orderData.userId,
          order_id: supabaseOrder.id,
          type: 'order',
          title: 'Order Confirmed',
          message: `Your order ${orderData.orderId} has been confirmed and is being processed. Estimated delivery: ${estimatedDelivery.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}`,
          action_url: '/orders'
        });

      // Send vendor order alerts for seller products
      try {
        const orderItems = Array.isArray(orderData.items) ? orderData.items : [];
        for (const item of orderItems) {
          if (item?.seller_id) {
            await (supabase.from('vendor_order_alerts') as any).insert({
              seller_id: item.seller_id,
              order_id: supabaseOrder.id,
              product_name: item.name || 'Product',
              quantity: item.quantity || 1,
              total_amount: (item.price || 0) * (item.quantity || 1),
              customer_address: JSON.stringify(orderData.address),
              status: 'pending'
            });
          }
        }
      } catch (alertErr) {
        console.error('Vendor alert error (non-blocking):', alertErr);
      }

      return { success: true };
    } catch (error) {
      console.error('Order save error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    } finally {
      this.isSubmitting = false;
    }
  }

  async updateOrderStatusDual(orderId: string, status: string): Promise<void> {
    try {
      await supabase
        .from('orders')
        .update({ status })
        .eq('order_number', orderId);
    } catch (error) {
      console.error('Status update error:', error);
    }
  }
}

export const dualBackendService = new DualBackendService();
export type { DualOrderData };
