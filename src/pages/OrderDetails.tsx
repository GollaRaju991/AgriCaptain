import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, Package, Truck, CheckCircle, Clock, XCircle, 
  Loader2, AlertCircle, RotateCcw, Headphones, Eye
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';
import useScrollToTop from '@/hooks/useScrollToTop';
import { toast } from 'sonner';
import OrderTracking from '@/components/OrderTracking';
import MobileBottomNav from '@/components/MobileBottomNav';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface TrackingUpdate {
  status: string;
  title: string;
  description: string;
  timestamp: string;
  location?: string;
}

interface Order {
  id: string;
  order_number: string;
  created_at: string;
  total_amount: number;
  status: string;
  items: Json;
  payment_status: string;
  user_id: string;
  updated_at: string;
  shipping_address: Json;
  payment_method: string;
  estimated_delivery?: string | null;
  tracking_updates?: Json;
}

const OrderDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancellingOrder, setCancellingOrder] = useState(false);
  const [returningOrder, setReturningOrder] = useState(false);
  const [trackingOpen, setTrackingOpen] = useState(false);
  const [expandDetails, setExpandDetails] = useState(false);

  useScrollToTop();

  useEffect(() => {
    if (user && id) fetchOrder();
  }, [user, id]);

  const fetchOrder = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .eq('user_id', user?.id)
        .single();

      if (error) {
        console.error('Error fetching order:', error);
        toast.error('Order not found');
        navigate('/orders');
      } else {
        setOrder(data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;
  if (!order) return null;

  const statusSteps = [
    { key: 'pending', label: 'Order Placed', icon: Package },
    { key: 'processing', label: 'Packed', icon: Package },
    { key: 'shipped', label: 'Shipped', icon: Truck },
    { key: 'delivered', label: 'Delivered', icon: CheckCircle },
  ];

  const getStepStatus = (stepKey: string): 'completed' | 'current' | 'upcoming' => {
    const statusOrder = ['pending', 'processing', 'shipped', 'out_for_delivery', 'delivered'];
    const currentIndex = statusOrder.indexOf(order.status);
    const stepMap: Record<string, number> = { pending: 0, processing: 1, shipped: 2, delivered: 4 };
    const stepIndex = stepMap[stepKey] ?? 0;
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'upcoming';
  };

  const orderItems = Array.isArray(order.items) ? order.items as any[] : [];

  const getEstimatedDelivery = (): string | null => {
    if (order.estimated_delivery) return order.estimated_delivery;
    if (order.status === 'delivered' || order.status === 'cancelled') return null;
    const d = new Date(order.created_at);
    d.setDate(d.getDate() + 5);
    return d.toISOString();
  };

  const canCancelOrder = (): boolean => {
    if (['cancelled', 'delivered', 'shipped', 'returned'].includes(order.status)) return false;
    const hoursDiff = (Date.now() - new Date(order.created_at).getTime()) / (1000 * 60 * 60);
    return hoursDiff <= 24;
  };

  const getCancellationTimeRemaining = (): string => {
    const deadline = new Date(order.created_at).getTime() + 24 * 60 * 60 * 1000;
    const hours = Math.max(0, (deadline - Date.now()) / (1000 * 60 * 60));
    if (hours <= 0) return 'Cancellation window expired';
    if (hours < 1) return `Cancel within ${Math.round(hours * 60)} minutes`;
    return `Cancel within ${Math.round(hours)} hours`;
  };

  const canReturnOrder = (): boolean => {
    if (order.status !== 'delivered') return false;
    const days = (Date.now() - new Date(order.updated_at).getTime()) / (1000 * 60 * 60 * 24);
    return days <= 7;
  };

  const getRefundAmount = (): number => {
    if (order.payment_status !== 'completed') return 0;
    return order.payment_method === 'cod' ? 99 : order.total_amount;
  };

  const handleCancelOrder = async () => {
    setCancellingOrder(true);
    try {
      const refundAmount = getRefundAmount();
      const { error } = await supabase
        .from('orders')
        .update({ status: 'cancelled', payment_status: order.payment_status === 'completed' ? 'refunded' : order.payment_status })
        .eq('id', order.id);

      if (error) { toast.error('Failed to cancel order.'); return; }

      await supabase.from('notifications').insert({
        user_id: user?.id, order_id: order.id, type: 'order', title: 'Order Cancelled',
        message: refundAmount > 0
          ? `Your order #${order.order_number} has been cancelled. ₹${refundAmount} will be refunded within 5-7 business days.`
          : `Your order #${order.order_number} has been cancelled.`,
        action_url: '/orders'
      });

      await fetchOrder();
      toast.success(refundAmount > 0
        ? `Order cancelled! ₹${refundAmount} will be refunded within 5-7 business days.`
        : 'Order cancelled successfully!', { duration: 6000 });
    } catch { toast.error('Failed to cancel order.'); }
    finally { setCancellingOrder(false); }
  };

  const handleReturnOrder = async () => {
    setReturningOrder(true);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'returned', payment_status: 'refunded' })
        .eq('id', order.id);

      if (error) { toast.error('Failed to initiate return.'); return; }

      await supabase.from('notifications').insert({
        user_id: user?.id, order_id: order.id, type: 'order', title: 'Return Initiated',
        message: `Return initiated for order #${order.order_number}. ₹${order.total_amount} will be refunded within 5-7 business days.`,
        action_url: '/orders'
      });

      await fetchOrder();
      toast.success(`Return initiated! ₹${order.total_amount} will be refunded within 5-7 business days.`, { duration: 6000 });
    } catch { toast.error('Failed to initiate return.'); }
    finally { setReturningOrder(false); }
  };

  const getTrackingUpdates = (): TrackingUpdate[] => {
    if (!order.tracking_updates || !Array.isArray(order.tracking_updates)) return [];
    return order.tracking_updates as unknown as TrackingUpdate[];
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
      case 'shipped': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'processing': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'pending': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'returned': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const estimatedDelivery = getEstimatedDelivery();

  const shippingAddress = (() => {
    try {
      const addr = order.shipping_address as any;
      if (addr?.name) return addr;
    } catch {}
    return null;
  })();

  const itemsTotal = orderItems.reduce((sum: number, item: any) => sum + (item.quantity || 1) * (item.price || 0), 0);

  return (
    <div className="min-h-screen bg-[#f0f5ee]">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/orders')} className="p-1">
              <ArrowLeft className="h-5 w-5 text-gray-700" />
            </button>
            <h1 className="text-lg font-bold text-gray-900">Order Details</h1>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full border-gray-300 text-gray-600 text-xs px-3"
            onClick={() => navigate('/help-center')}
          >
            <Headphones className="h-3.5 w-3.5 mr-1" />
            Support
          </Button>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4 pb-40">
        {/* Order Info Card */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-start justify-between mb-1">
            <div>
              <h2 className="text-base font-bold text-gray-900">Order #{order.order_number}</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Placed on {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
            <Badge className={`${getStatusBadgeColor(order.status)} border rounded-full px-3 py-1 text-xs font-medium`}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </Badge>
          </div>

          {/* Progress Tracker */}
          {order.status !== 'cancelled' && order.status !== 'returned' && (
            <div className="mt-5 mb-3">
              <div className="flex items-center justify-between relative">
                {statusSteps.map((step, index) => {
                  const stepStatus = getStepStatus(step.key);
                  const Icon = step.icon;
                  return (
                    <div key={step.key} className="flex flex-col items-center relative z-10 flex-1">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        stepStatus === 'completed' ? 'bg-green-500 text-white' :
                        stepStatus === 'current' ? 'bg-green-500 text-white' :
                        'bg-gray-200 text-gray-400'
                      }`}>
                        {stepStatus === 'completed' ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <Icon className="h-4 w-4" />
                        )}
                      </div>
                      <span className={`text-[10px] mt-1.5 text-center leading-tight ${
                        stepStatus === 'upcoming' ? 'text-gray-400' : 'text-gray-700 font-medium'
                      }`}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
                {/* Progress line */}
                <div className="absolute top-4 left-[12.5%] right-[12.5%] h-0.5 bg-gray-200 -z-0" />
                <div
                  className="absolute top-4 left-[12.5%] h-0.5 bg-green-500 -z-0 transition-all"
                  style={{
                    width: `${Math.min(
                      (['pending', 'processing', 'shipped', 'out_for_delivery', 'delivered'].indexOf(order.status) / 3) * 100,
                      100
                    )}%`
                  }}
                />
              </div>
            </div>
          )}

          {/* Status banners for cancelled/returned */}
          {order.status === 'cancelled' && (
            <div className="flex items-center gap-2 mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              <XCircle className="h-4 w-4 shrink-0" />
              <span className="font-medium">Order was Cancelled{order.payment_status === 'refunded' && ' — Refund initiated'}</span>
            </div>
          )}
          {order.status === 'returned' && (
            <div className="flex items-center gap-2 mt-4 p-3 bg-orange-50 border border-orange-200 rounded-xl text-orange-700 text-sm">
              <RotateCcw className="h-4 w-4 shrink-0" />
              <span className="font-medium">Order was Returned — Refund initiated</span>
            </div>
          )}

          {/* Estimated Delivery */}
          {estimatedDelivery && order.status !== 'delivered' && order.status !== 'cancelled' && order.status !== 'returned' && (
            <div className="mt-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-sm text-gray-600 font-medium">Estimated Delivery</p>
              <p className="text-base font-bold text-green-700">
                {new Date(estimatedDelivery).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          )}
        </div>

        {/* Order Items Card */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="space-y-3">
            {orderItems.map((item: any, index: number) => (
              <div key={index} className="flex gap-3">
                <div className="w-16 h-16 flex-shrink-0 bg-gray-50 rounded-xl border border-gray-100 overflow-hidden">
                  <img src={item.image || '/placeholder.svg'} alt={item.name || 'Product'} className="w-full h-full object-contain p-1" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-sm text-gray-900 line-clamp-2">{item.name || `Item ${index + 1}`}</p>
                      <p className="text-xs text-gray-500 mt-0.5">Qty: {item.quantity || 1}</p>
                      <p className="text-xs text-gray-500">Price: ₹{(item.price || 0).toLocaleString()}</p>
                    </div>
                    <p className="font-bold text-sm text-gray-900">₹{((item.quantity || 1) * (item.price || 0)).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
            <span className="text-sm text-gray-500">Total</span>
            <span className="font-bold text-base text-gray-900">₹{order.total_amount.toLocaleString()}</span>
          </div>
        </div>

        {/* Payment Summary */}
        <div>
          <h3 className="text-base font-semibold text-gray-700 mb-2 px-1">Payment Summary</h3>
          <div className="bg-white rounded-2xl p-4 shadow-sm space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Items Total</span>
              <span className="text-gray-900">₹{itemsTotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Delivery Fee</span>
              <span className="text-green-600 font-medium">Free</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Discount</span>
              <span className="text-gray-900">₹{Math.max(0, itemsTotal - order.total_amount).toLocaleString()}</span>
            </div>
            {order.payment_method === 'cod' && (
              <>
                <div className="border-t border-gray-100 pt-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600">Advance Paid (Online)</span>
                    <span className="text-green-600 font-medium">₹99</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-orange-600">Due on Delivery</span>
                    <span className="text-orange-600 font-medium">₹{(order.total_amount - 99).toLocaleString()}</span>
                  </div>
                </div>
              </>
            )}
            <div className="flex justify-between items-center pt-2 border-t border-gray-100">
              <span className="font-bold text-sm text-gray-900">Total Paid</span>
              <span className="font-bold text-base text-gray-900">₹{order.total_amount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Shipping Address (expandable) */}
        {shippingAddress && expandDetails && (
          <div>
            <h3 className="text-base font-semibold text-gray-700 mb-2 px-1">Delivery Address</h3>
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <p className="font-medium text-sm text-gray-900">{shippingAddress.name}</p>
              <p className="text-sm text-gray-600 mt-1">{shippingAddress.address}</p>
              <p className="text-sm text-gray-600">{shippingAddress.city}, {shippingAddress.state} - {shippingAddress.pincode}</p>
              <p className="text-sm text-gray-500 mt-1">Phone: {shippingAddress.phone}</p>
            </div>
          </div>
        )}

        {/* Cancel/Return info banner */}
        {canCancelOrder() && (
          <div className="flex items-center gap-2 p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-amber-800 text-sm">
            <Clock className="h-4 w-4 shrink-0" />
            <span className="font-medium">{getCancellationTimeRemaining()}</span>
          </div>
        )}

        {canReturnOrder() && (
          <div className="flex items-center gap-2 p-3.5 bg-blue-50 border border-blue-200 rounded-2xl text-blue-700 text-sm">
            <RotateCcw className="h-4 w-4 shrink-0" />
            <span className="font-medium">
              {(() => {
                const deadline = new Date(order.updated_at).getTime() + 7 * 24 * 60 * 60 * 1000;
                const days = Math.max(0, Math.ceil((deadline - Date.now()) / (1000 * 60 * 60 * 24)));
                return `${days} day${days > 1 ? 's' : ''} left to return`;
              })()}
            </span>
          </div>
        )}
      </div>

      {/* Bottom Action Buttons */}
      <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-gray-200 p-3 z-40 lg:hidden">
        <div className="flex gap-2">
          {order.status !== 'cancelled' && order.status !== 'returned' && (
            <Button
              size="sm"
              className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-xl h-10 text-sm font-semibold"
              onClick={() => setTrackingOpen(true)}
            >
              <Truck className="h-4 w-4 mr-1.5" />
              Track Order
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            className="flex-1 rounded-xl h-10 text-sm font-medium border-gray-300"
            onClick={() => setExpandDetails(!expandDetails)}
          >
            <Eye className="h-4 w-4 mr-1.5" />
            {expandDetails ? 'Hide' : 'View'} Details
          </Button>

          {canCancelOrder() && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  className="flex-1 rounded-xl h-10 text-sm font-semibold"
                  disabled={cancellingOrder}
                >
                  {cancellingOrder ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4 mr-1.5" />}
                  Cancel Order
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancel Order #{order.order_number}?</AlertDialogTitle>
                  <AlertDialogDescription className="space-y-2">
                    <p>Are you sure you want to cancel this order?</p>
                    {getRefundAmount() > 0 && (
                      <p className="font-medium text-green-600">₹{getRefundAmount()} will be refunded within 5-7 business days.</p>
                    )}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep Order</AlertDialogCancel>
                  <AlertDialogAction onClick={handleCancelOrder} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Yes, Cancel Order
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          {canReturnOrder() && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 border-orange-300 text-orange-700 hover:bg-orange-50 rounded-xl h-10 text-sm font-medium"
                  disabled={returningOrder}
                >
                  {returningOrder ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4 mr-1.5" />}
                  Return
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Return Order #{order.order_number}?</AlertDialogTitle>
                  <AlertDialogDescription>
                    ₹{order.total_amount} will be refunded within 5-7 business days.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep Order</AlertDialogCancel>
                  <AlertDialogAction onClick={handleReturnOrder} className="bg-orange-500 text-white hover:bg-orange-600">
                    Yes, Return Order
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      {/* Desktop buttons */}
      <div className="hidden lg:block max-w-3xl mx-auto px-4 pb-8">
        <div className="flex gap-3">
          {order.status !== 'cancelled' && order.status !== 'returned' && (
            <Button className="bg-green-600 hover:bg-green-700" onClick={() => setTrackingOpen(true)}>
              <Truck className="h-4 w-4 mr-2" /> Track Order
            </Button>
          )}
          <Button variant="outline" onClick={() => setExpandDetails(!expandDetails)}>
            <Eye className="h-4 w-4 mr-2" /> {expandDetails ? 'Hide' : 'View'} Details
          </Button>
        </div>
      </div>

      <MobileBottomNav />

      {/* Order Tracking Dialog */}
      <OrderTracking
        isOpen={trackingOpen}
        onClose={() => setTrackingOpen(false)}
        orderNumber={order.order_number}
        currentStatus={order.status}
        estimatedDelivery={getEstimatedDelivery()}
        trackingUpdates={getTrackingUpdates()}
        createdAt={order.created_at}
      />
    </div>
  );
};

export default OrderDetails;
