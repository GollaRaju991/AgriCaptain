
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
  async saveOrderDual(orderData: DualOrderData): Promise<{ success: boolean; error?: string }> {
    try {
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

      return { success: true };
    } catch (error) {
      console.error('Order save error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
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
