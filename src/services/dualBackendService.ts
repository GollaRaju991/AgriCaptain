
import { supabase } from '@/integrations/supabase/client';
import { hostingerApi, OrderData } from './hostingerApi';

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
  // Save order to both Supabase and Hostinger
  async saveOrderDual(orderData: DualOrderData): Promise<{ success: boolean; error?: string }> {
    try {
      // Calculate estimated delivery (5 days from now)
      const estimatedDelivery = new Date();
      estimatedDelivery.setDate(estimatedDelivery.getDate() + 5);

      // Initial tracking update
      const trackingUpdates = [
        {
          status: 'pending',
          title: 'Order Placed',
          description: 'Your order has been placed successfully',
          timestamp: new Date().toISOString(),
          location: 'Online'
        }
      ];

      // Save to Supabase first (primary database)
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
        console.error('Supabase order save error:', supabaseError);
        throw new Error('Failed to save order to primary database');
      }

      // Create notification for new order
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

      // Then save to Hostinger (backup/sync)
      const hostingerOrderData: OrderData = {
        orderId: orderData.orderId,
        customerName: orderData.customerData.name,
        customerEmail: orderData.customerData.email,
        customerPhone: orderData.customerData.phone,
        items: orderData.items,
        totalAmount: orderData.totalAmount,
        paymentMethod: orderData.paymentMethod,
        address: orderData.address
      };

      const hostingerResult = await hostingerApi.saveOrder(hostingerOrderData);
      
      if (!hostingerResult.success) {
        console.warn('Hostinger order save failed, but Supabase saved successfully:', hostingerResult.error);
        // Don't fail the whole operation if Hostinger fails
      }

      return { success: true };
    } catch (error) {
      console.error('Dual backend save error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Send OTP with dual backend support
  async sendOTPDual(phone: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Generate OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Try Supabase OTP first
      const supabaseResult = await supabase.auth.signInWithOtp({
        phone: phone.startsWith('+') ? phone : '+91' + phone
      });

      // Also send via Hostinger for backup
      const hostingerResult = await hostingerApi.sendOTP(phone, otp);
      
      if (supabaseResult.error && !hostingerResult.success) {
        return { success: false, error: 'Failed to send OTP via both services' };
      }

      return { success: true };
    } catch (error) {
      console.error('Dual OTP send error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Sync order status to both services
  async updateOrderStatusDual(orderId: string, status: string): Promise<void> {
    try {
      // Update in Supabase
      await supabase
        .from('orders')
        .update({ status })
        .eq('order_number', orderId);

      // Update in Hostinger
      await hostingerApi.updateOrderStatus(orderId, status);
    } catch (error) {
      console.error('Dual status update error:', error);
    }
  }
}

export const dualBackendService = new DualBackendService();
export type { DualOrderData };
