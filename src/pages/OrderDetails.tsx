import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft, Package, Truck, CheckCircle, Clock, XCircle,
  Loader2, RotateCcw, Headphones, Copy, Home, User, Phone, ChevronDown, ChevronRight, CreditCard, MessageCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';
import useScrollToTop from '@/hooks/useScrollToTop';
import { toast } from 'sonner';
import OrderTracking from '@/components/OrderTracking';
import MobileBottomNav from '@/components/MobileBottomNav';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
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

  useScrollToTop();

  useEffect(() => {
    if (user && id) fetchOrder();
  }, [user, id]);

  const fetchOrder = async () => {
    try {
      const { data, error } = await supabase
        .from('orders').select('*').eq('id', id).eq('user_id', user?.id).single();
      if (error) { toast.error('Order not found'); navigate('/orders'); }
      else setOrder(data);
    } catch (error) { console.error('Error:', error); }
    finally { setLoading(false); }
  };

  if (authLoading || loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }
  if (!user) return <Navigate to="/auth" replace />;
  if (!order) return null;

  const orderItems = Array.isArray(order.items) ? order.items as any[] : [];
  const shippingAddress = (() => { try { const a = order.shipping_address as any; return a?.name ? a : null; } catch { return null; } })();
  const itemsTotal = orderItems.reduce((sum: number, item: any) => sum + (item.quantity || 1) * (item.price || 0), 0);

  const getEstimatedDelivery = (): string | null => {
    if (order.estimated_delivery) return order.estimated_delivery;
    if (order.status === 'delivered' || order.status === 'cancelled') return null;
    const d = new Date(order.created_at); d.setDate(d.getDate() + 5); return d.toISOString();
  };

  const canCancelOrder = (): boolean => {
    if (['cancelled', 'delivered', 'shipped', 'returned'].includes(order.status)) return false;
    return (Date.now() - new Date(order.created_at).getTime()) / (1000 * 60 * 60) <= 24;
  };

  const canReturnOrder = (): boolean => {
    if (order.status !== 'delivered') return false;
    return (Date.now() - new Date(order.updated_at).getTime()) / (1000 * 60 * 60 * 24) <= 7;
  };

  const getRefundAmount = (): number => {
    if (order.payment_status !== 'completed') return 0;
    return order.payment_method === 'cod' ? 99 : order.total_amount;
  };

  const handleCancelOrder = async () => {
    setCancellingOrder(true);
    try {
      const refundAmount = getRefundAmount();
      const { error } = await supabase.from('orders').update({
        status: 'cancelled', payment_status: order.payment_status === 'completed' ? 'refunded' : order.payment_status
      }).eq('id', order.id);
      if (error) { toast.error('Failed to cancel order.'); return; }
      await supabase.from('notifications').insert({
        user_id: user?.id, order_id: order.id, type: 'order', title: 'Order Cancelled',
        message: refundAmount > 0 ? `Your order #${order.order_number} has been cancelled. ₹${refundAmount} will be refunded within 5-7 business days.` : `Your order #${order.order_number} has been cancelled.`,
        action_url: '/orders'
      });
      await fetchOrder();
      toast.success(refundAmount > 0 ? `Order cancelled! ₹${refundAmount} will be refunded within 5-7 business days.` : 'Order cancelled!', { duration: 6000 });
    } catch { toast.error('Failed to cancel order.'); }
    finally { setCancellingOrder(false); }
  };

  const handleReturnOrder = async () => {
    setReturningOrder(true);
    try {
      const { error } = await supabase.from('orders').update({ status: 'returned', payment_status: 'refunded' }).eq('id', order.id);
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

  const copyOrderNumber = () => {
    navigator.clipboard.writeText(order.order_number);
    toast.success('Order number copied!');
  };

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
  const estimatedDelivery = getEstimatedDelivery();

  // Timeline events
  const timelineEvents = (() => {
    const events: { icon: React.ReactNode; label: string; date: string; isActive: boolean; color: string }[] = [];
    events.push({
      icon: <CheckCircle className="h-5 w-5" />,
      label: 'Order Confirmed',
      date: `Today, ${new Date(order.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}`,
      isActive: true,
      color: 'text-green-600 bg-green-100'
    });
    if (order.status === 'cancelled') {
      events.push({
        icon: <XCircle className="h-5 w-5" />,
        label: 'Cancelled',
        date: `Today, ${new Date(order.updated_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}`,
        isActive: true,
        color: 'text-red-600 bg-red-100'
      });
    }
    if (order.status === 'returned') {
      events.push({
        icon: <RotateCcw className="h-5 w-5" />,
        label: 'Returned',
        date: formatDate(order.updated_at),
        isActive: true,
        color: 'text-orange-600 bg-orange-100'
      });
    }
    return events;
  })();

  const paymentMethodLabel = (() => {
    switch (order.payment_method) {
      case 'cod': return 'Cash On Delivery';
      case 'upi': return 'UPI';
      case 'card': return 'Card Payment';
      case 'netbanking': return 'Net Banking';
      default: return order.payment_method?.toUpperCase() || 'Online';
    }
  })();

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Desktop Header */}
      <div className="hidden lg:block">
        <Header />
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden sticky top-0 z-50 bg-white shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/orders')} className="p-1"><ArrowLeft className="h-5 w-5 text-gray-700" /></button>
            <h1 className="text-lg font-bold text-gray-900">Order Details</h1>
          </div>
          <Button variant="outline" size="sm" className="rounded-full border-gray-300 text-gray-600 text-xs px-3" onClick={() => navigate('/help-center')}>
            <Headphones className="h-3.5 w-3.5 mr-1" /> Support
          </Button>
        </div>
      </div>

      {/* Breadcrumb - Desktop */}
      <div className="hidden lg:block bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <nav className="text-sm text-gray-500">
            <span className="hover:text-blue-600 cursor-pointer" onClick={() => navigate('/')}>Home</span>
            <span className="mx-1">›</span>
            <span className="hover:text-blue-600 cursor-pointer" onClick={() => navigate('/profile')}>My Account</span>
            <span className="mx-1">›</span>
            <span className="hover:text-blue-600 cursor-pointer" onClick={() => navigate('/orders')}>My Orders</span>
            <span className="mx-1">›</span>
            <span className="text-gray-900 font-medium">{order.order_number}</span>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-4 lg:py-6">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
          {/* Left Column - Product & Tracking */}
          <div className="flex-1 min-w-0 space-y-4">
            {/* Product Card */}
            <div className="bg-white rounded-lg shadow-sm p-4 lg:p-6">
              {orderItems.map((item: any, index: number) => (
                <div key={index} className={`flex gap-4 ${index > 0 ? 'mt-4 pt-4 border-t' : ''}`}>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-base lg:text-lg font-medium text-gray-900 line-clamp-2">{item.name || `Item ${index + 1}`}</h2>
                    {item.color && <p className="text-sm text-gray-500 mt-0.5">Color: {item.color}</p>}
                    {item.size && <p className="text-sm text-gray-500">Size: {item.size}</p>}
                    {item.seller && <p className="text-sm text-gray-500">Seller: {item.seller}</p>}
                    <p className="text-lg font-bold text-gray-900 mt-2">₹{((item.quantity || 1) * (item.price || 0)).toLocaleString()}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Qty: {item.quantity || 1}</p>
                  </div>
                  <div className="w-20 h-20 lg:w-24 lg:h-24 flex-shrink-0 border rounded overflow-hidden bg-white">
                    <img src={item.image || '/placeholder.svg'} alt={item.name || 'Product'} className="w-full h-full object-contain p-1" />
                  </div>
                </div>
              ))}

              {/* Timeline */}
              <div className="mt-6 pt-4 border-t">
                <div className="space-y-0">
                  {timelineEvents.map((event, index) => (
                    <div key={index} className="flex items-start gap-3 relative">
                      {index < timelineEvents.length - 1 && (
                        <div className="absolute left-[15px] top-8 w-0.5 h-6 bg-gray-300" />
                      )}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${event.color}`}>
                        {event.icon}
                      </div>
                      <div className="pb-4">
                        <p className="text-sm font-semibold text-gray-900">{event.label}, {event.date}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {order.status !== 'cancelled' && order.status !== 'returned' && (
                  <button
                    onClick={() => setTrackingOpen(true)}
                    className="text-sm text-blue-600 font-medium flex items-center gap-1 mt-2 hover:underline"
                  >
                    See All Updates <ChevronRight className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Cancelled/Returned message */}
              {order.status === 'cancelled' && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-gray-600">Your order was cancelled as per your request.</p>
                </div>
              )}

              {/* Chat with us */}
              <div className="mt-4 pt-4 border-t text-center">
                <button
                  onClick={() => navigate('/help-center')}
                  className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
                >
                  <MessageCircle className="h-4 w-4" />
                  Chat with us
                </button>
              </div>

              {/* Rate your experience */}
              {order.status === 'delivered' && (
                <div className="mt-4 pt-4 border-t">
                  <h3 className="font-semibold text-gray-900 mb-3">Rate your experience</h3>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-700">How was your delivery experience?</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              )}

              {order.status === 'cancelled' && (
                <div className="mt-4 pt-4 border-t">
                  <h3 className="font-semibold text-gray-900 mb-3">Rate your experience</h3>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-700">How was your cancellation experience?</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              )}

              {/* Order Number */}
              <div className="mt-4 pt-4 border-t flex items-center gap-2">
                <span className="text-sm text-gray-500">Order #{order.order_number}</span>
                <button onClick={copyOrderNumber} className="text-gray-400 hover:text-gray-600">
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Action Buttons - Desktop */}
            <div className="hidden lg:flex gap-3">
              {canCancelOrder() && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" disabled={cancellingOrder}>
                      {cancellingOrder ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <XCircle className="h-4 w-4 mr-2" />}
                      Cancel Order
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Cancel Order #{order.order_number}?</AlertDialogTitle>
                      <AlertDialogDescription className="space-y-2">
                        <p>Are you sure you want to cancel this order?</p>
                        {getRefundAmount() > 0 && <p className="font-medium text-green-600">₹{getRefundAmount()} will be refunded within 5-7 business days.</p>}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Keep Order</AlertDialogCancel>
                      <AlertDialogAction onClick={handleCancelOrder} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Yes, Cancel Order</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}

              {canReturnOrder() && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-50" disabled={returningOrder}>
                      {returningOrder ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RotateCcw className="h-4 w-4 mr-2" />}
                      Return Order
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Return Order #{order.order_number}?</AlertDialogTitle>
                      <AlertDialogDescription>₹{order.total_amount} will be refunded within 5-7 business days.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Keep Order</AlertDialogCancel>
                      <AlertDialogAction onClick={handleReturnOrder} className="bg-orange-500 text-white hover:bg-orange-600">Yes, Return Order</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>

          {/* Right Sidebar - Delivery & Price Details */}
          <div className="w-full lg:w-[360px] flex-shrink-0 space-y-4">
            {/* Delivery Details */}
            {shippingAddress && (
              <div className="bg-white rounded-lg shadow-sm p-4 lg:p-5">
                <h3 className="text-base font-bold text-gray-900 mb-3">Delivery details</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-2.5">
                    <Home className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-sm font-semibold text-gray-900">{shippingAddress.address_type || 'Home'}</span>
                      <span className="text-sm text-gray-600 ml-2">{shippingAddress.address}, {shippingAddress.city}, {shippingAddress.state} - {shippingAddress.pincode}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <User className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    <span className="text-sm text-gray-700 font-medium">{shippingAddress.name}</span>
                    <span className="text-sm text-gray-500">{shippingAddress.phone}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Price Details */}
            <div className="bg-white rounded-lg shadow-sm p-4 lg:p-5">
              <h3 className="text-base font-bold text-gray-900 mb-3">Price details</h3>
              <div className="space-y-2.5">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Listing price</span>
                  <span className="text-gray-500 line-through">₹{Math.round(itemsTotal * 1.2).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Special price</span>
                  <span className="text-gray-900">₹{itemsTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total fees</span>
                  <span className="text-gray-900">₹{Math.round(order.total_amount - itemsTotal + (itemsTotal * 0.01)).toLocaleString() || '0'}</span>
                </div>
                {itemsTotal > order.total_amount && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Other discount</span>
                    <span className="text-green-600">−₹{(itemsTotal - order.total_amount).toLocaleString()}</span>
                  </div>
                )}
                <div className="border-t border-dashed border-gray-200 pt-2.5 mt-2.5">
                  <div className="flex justify-between text-sm font-bold">
                    <span className="text-gray-900">Total amount</span>
                    <span className="text-gray-900">₹{order.total_amount.toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center text-sm pt-2 border-t">
                  <span className="text-gray-600">Payment method</span>
                  <div className="flex items-center gap-1.5">
                    <CreditCard className="h-3.5 w-3.5 text-gray-500" />
                    <span className="text-gray-700 font-medium">{paymentMethodLabel}</span>
                  </div>
                </div>
                {order.payment_method === 'cod' && (
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600">Advance Paid (Online)</span>
                      <span className="text-green-600 font-medium">₹99</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-orange-600">Due on Delivery</span>
                      <span className="text-orange-600 font-medium">₹{(order.total_amount - 99).toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Actions */}
      <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-gray-200 p-3 z-40 lg:hidden">
        <div className="flex gap-2">
          {order.status !== 'cancelled' && order.status !== 'returned' && (
            <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-xl h-10 text-sm font-semibold" onClick={() => setTrackingOpen(true)}>
              <Truck className="h-4 w-4 mr-1.5" /> Track Order
            </Button>
          )}

          {canCancelOrder() && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" className="flex-1 rounded-xl h-10 text-sm font-semibold" disabled={cancellingOrder}>
                  {cancellingOrder ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4 mr-1.5" />}
                  Cancel
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancel Order #{order.order_number}?</AlertDialogTitle>
                  <AlertDialogDescription className="space-y-2">
                    <p>Are you sure you want to cancel this order?</p>
                    {getRefundAmount() > 0 && <p className="font-medium text-green-600">₹{getRefundAmount()} will be refunded within 5-7 business days.</p>}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep Order</AlertDialogCancel>
                  <AlertDialogAction onClick={handleCancelOrder} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Yes, Cancel</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          {canReturnOrder() && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="flex-1 border-orange-300 text-orange-700 hover:bg-orange-50 rounded-xl h-10 text-sm" disabled={returningOrder}>
                  {returningOrder ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4 mr-1.5" />}
                  Return
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Return Order #{order.order_number}?</AlertDialogTitle>
                  <AlertDialogDescription>₹{order.total_amount} will be refunded within 5-7 business days.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep Order</AlertDialogCancel>
                  <AlertDialogAction onClick={handleReturnOrder} className="bg-orange-500 text-white hover:bg-orange-600">Yes, Return</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      <div className="hidden lg:block"><Footer /></div>
      <MobileBottomNav />

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
