import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft, Package, Truck, CheckCircle, Clock, XCircle,
  Loader2, RotateCcw, Copy, Home, User, Phone, ChevronRight, CreditCard, MessageCircle, MapPin, Calendar, IndianRupee, Banknote, CircleDollarSign, ShieldCheck
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
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

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
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [returnReason, setReturnReason] = useState('');
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [refundDialogOpen, setRefundDialogOpen] = useState(false);
  const [returnRequest, setReturnRequest] = useState<any>(null);

  useScrollToTop();

  const formatStatusLabel = (status: string) =>
    status.split('_').join(' ').replace(/\b\w/g, (ch) => ch.toUpperCase());

  useEffect(() => {
    if (user && id) {
      fetchOrder();
      fetchReturnRequest();
      const interval = setInterval(fetchOrder, 5000);
      const channel = supabase
        .channel(`order-${id}`)
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${id}` }, (payload) => {
          const next = payload.new as Order;
          setOrder((prev) => {
            if (prev && prev.status !== next.status) {
              toast.success(`Order status changed to ${formatStatusLabel(next.status)}`);
            }
            return next;
          });
        })
        .subscribe();
      return () => {
        clearInterval(interval);
        supabase.removeChannel(channel);
      };
    }
  }, [user, id]);

  const fetchReturnRequest = async () => {
    if (!id || !user) return;
    const { data } = await supabase
      .from('return_requests')
      .select('*')
      .eq('order_id', id)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (data) setReturnRequest(data);
  };

  const fetchOrder = async () => {
    try {
      const { data, error } = await supabase
        .from('orders').select('*').eq('id', id).eq('user_id', user?.id).single();
      if (error) { toast.error('Order not found'); navigate('/orders'); }
      else {
        setOrder((prev) => {
          if (prev && prev.status !== data.status) {
            toast.success(`Order status changed to ${formatStatusLabel(data.status)}`);
          }
          return data;
        });
      }
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
    if (['cancelled', 'delivered', 'shipped', 'out_for_delivery', 'returned'].includes(order.status)) return false;
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
    setCancelDialogOpen(false);
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
    if (!returnReason) { toast.error('Please select a reason'); return; }
    setReturningOrder(true);
    setReturnDialogOpen(false);
    try {
      const { error } = await supabase.from('orders').update({ status: 'returned', payment_status: 'refunded' }).eq('id', order.id);
      if (error) { toast.error('Failed to initiate return.'); return; }
      await supabase.from('return_requests').insert({
        order_id: order.id,
        user_id: user?.id,
        reason: returnReason,
        status: 'approved',
        refund_amount: order.total_amount,
        refund_status: 'processing'
      });
      await supabase.from('notifications').insert({
        user_id: user?.id, order_id: order.id, type: 'order', title: 'Return Initiated',
        message: `Return initiated for order #${order.order_number}. ₹${order.total_amount} will be refunded within 5-7 business days.`,
        action_url: '/orders'
      });
      await fetchOrder();
      await fetchReturnRequest();
      toast.success(`Return initiated! ₹${order.total_amount} will be refunded within 5-7 business days.`, { duration: 6000 });
    } catch { toast.error('Failed to initiate return.'); }
    finally { setReturningOrder(false); setReturnReason(''); }
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
  const formatFullDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const estimatedDelivery = getEstimatedDelivery();

  // Timeline for mobile - 4 steps only
  const mobileTimelineSteps = (() => {
    if (order.status === 'cancelled') {
      return [
        { key: 'pending', label: 'Order Confirmed', isActive: true, isCurrent: false },
        { key: 'cancelled', label: 'Cancelled', isActive: true, isCurrent: true },
      ];
    }
    if (order.status === 'returned') {
      return [
        { key: 'pending', label: 'Order Confirmed', isActive: true, isCurrent: false },
        { key: 'returned', label: 'Returned', isActive: true, isCurrent: true },
      ];
    }

    const steps = [
      { key: 'pending', label: 'Order Confirmed' },
      { key: 'processing', label: 'Processing' },
      { key: 'shipped', label: 'Shipped' },
      { key: 'delivered', label: 'Delivered' },
    ];
    const statusOrder = ['pending', 'processing', 'shipped', 'out_for_delivery', 'delivered'];
    const currentIdx = statusOrder.indexOf(order.status);
    // Map out_for_delivery to shipped visually (step index 2)
    const mappedIdx = order.status === 'out_for_delivery' ? 2 : steps.findIndex(s => s.key === order.status);

    return steps.map((step, idx) => ({
      ...step,
      isActive: idx <= (mappedIdx >= 0 ? mappedIdx : currentIdx),
      isCurrent: idx === (mappedIdx >= 0 ? mappedIdx : currentIdx),
    }));
  })();

  // Desktop timeline - full 5 steps
  const desktopTimelineEvents = (() => {
    const allSteps = [
      { status: 'pending', label: 'Order Confirmed', icon: <CheckCircle className="h-5 w-5" />, color: 'text-green-600 bg-green-100' },
      { status: 'processing', label: 'Processing', icon: <Package className="h-5 w-5" />, color: 'text-yellow-600 bg-yellow-100' },
      { status: 'shipped', label: 'Shipped', icon: <Truck className="h-5 w-5" />, color: 'text-blue-600 bg-blue-100' },
      { status: 'out_for_delivery', label: 'Out for Delivery', icon: <Truck className="h-5 w-5" />, color: 'text-purple-600 bg-purple-100' },
      { status: 'delivered', label: 'Delivered', icon: <CheckCircle className="h-5 w-5" />, color: 'text-green-600 bg-green-100' },
    ];

    if (order.status === 'cancelled') {
      return [
        { ...allSteps[0], isActive: true, date: formatDate(order.created_at) },
        { status: 'cancelled', label: 'Cancelled', icon: <XCircle className="h-5 w-5" />, color: 'text-red-600 bg-red-100', isActive: true, date: formatDate(order.updated_at) },
      ];
    }
    if (order.status === 'returned') {
      return [
        { ...allSteps[0], isActive: true, date: formatDate(order.created_at) },
        { status: 'returned', label: 'Returned', icon: <RotateCcw className="h-5 w-5" />, color: 'text-orange-600 bg-orange-100', isActive: true, date: formatDate(order.updated_at) },
      ];
    }

    const statusOrder = ['pending', 'processing', 'shipped', 'out_for_delivery', 'delivered'];
    const currentIdx = statusOrder.indexOf(order.status);

    return allSteps.map((step, idx) => {
      const isActive = idx <= currentIdx;
      const isCurrent = idx === currentIdx;
      return {
        ...step, isActive, isCurrent,
        date: isActive ? (idx === 0 ? formatDate(order.created_at) : formatDate(order.updated_at)) : '',
        color: isActive ? step.color : 'text-gray-400 bg-gray-100',
      };
    });
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

  // Need Help options based on status (mobile only)
  const getNeedHelpOptions = () => {
    const chatOption = { label: 'Chat With Us', icon: <MessageCircle className="h-4 w-4" />, action: () => navigate('/help-center') };

    if (order.status === 'delivered') {
      return {
        primary: [
          ...(canReturnOrder() ? [{ label: 'Return Order', icon: <RotateCcw className="h-4 w-4" />, action: () => { setReturnReason(''); setReturnDialogOpen(true); } }] : []),
          chatOption,
        ],
      };
    }

    if (order.status === 'shipped' || order.status === 'out_for_delivery') {
      return {
        primary: [chatOption],
      };
    }

    if (order.status === 'cancelled' || order.status === 'returned') {
      return {
        primary: [chatOption],
      };
    }

    // pending or processing
    return {
      primary: [
        { label: 'Change Phone Number', icon: <Phone className="h-4 w-4" />, action: () => navigate('/help-center'), hasArrow: true },
        { label: 'Change Delivery Address', icon: <MapPin className="h-4 w-4" />, action: () => navigate('/help-center'), hasArrow: true },
        ...(canCancelOrder() ? [{ label: 'Cancel Order', icon: <XCircle className="h-4 w-4" />, action: () => setCancelDialogOpen(true) }] : []),
        chatOption,
      ],
    };
  };

  const helpOptions = getNeedHelpOptions();

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Desktop Header */}
      <div className="hidden lg:block">
        <Header />
      </div>

      {/* ===== MOBILE VIEW ===== */}
      <div className="lg:hidden">
        {/* Mobile Header - Clean, no Help button */}
        <div className="sticky top-0 z-50 bg-white shadow-sm">
          <div className="flex items-center gap-3 px-4 py-3">
            <button onClick={() => navigate('/orders')} className="p-1"><ArrowLeft className="h-5 w-5 text-gray-700" /></button>
            <h1 className="text-base font-bold text-gray-900">Order Details</h1>
          </div>
        </div>

        <div className="px-3 py-3 space-y-3 pb-20">
          {/* Product Card */}
          {orderItems.map((item: any, index: number) => (
            <div key={index} className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex gap-3">
                <div className="w-20 h-20 flex-shrink-0 border border-gray-100 rounded-lg overflow-hidden bg-white">
                  <img src={item.image || '/placeholder.svg'} alt={item.name || 'Product'} className="w-full h-full object-contain p-1.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-sm font-semibold text-gray-900 line-clamp-2">{item.name || `Item ${index + 1}`}</h2>
                  <p className="text-base font-bold text-gray-900 mt-1">₹{((item.quantity || 1) * (item.price || 0)).toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Qty: {item.quantity || 1}</p>
                </div>
              </div>
            </div>
          ))}

          {/* Order Status Tracker Card */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            {/* Horizontal Progress Tracker */}
            <div className="py-2">
              <div className="flex items-start justify-between relative">
                {mobileTimelineSteps.map((step, index) => {
                  const isCompleted = step.isActive && !step.isCurrent;
                  const isCurrent = step.isCurrent;
                  const isPending = !step.isActive;
                  const isCancelled = step.key === 'cancelled';
                  const isReturned = step.key === 'returned';

                  return (
                    <div key={step.key} className="flex flex-col items-center flex-1 relative">
                      {/* Connector line */}
                      {index < mobileTimelineSteps.length - 1 && (
                        <div className={`absolute top-3.5 left-[calc(50%+12px)] right-[calc(-50%+12px)] h-[3px] ${
                          step.isActive && mobileTimelineSteps[index + 1]?.isActive ? 'bg-green-500' :
                          step.isActive ? 'bg-gradient-to-r from-green-500 to-gray-200' : 'bg-gray-200'
                        }`} />
                      )}

                      {/* Circle Icon */}
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center relative z-10 ${
                        isCancelled ? 'bg-red-100 text-red-600' :
                        isReturned ? 'bg-orange-100 text-orange-600' :
                        isCompleted ? 'bg-green-100 text-green-600 ring-2 ring-green-200' :
                        isCurrent ? 'bg-green-500 text-white ring-2 ring-green-200' :
                        'bg-gray-100 text-gray-400'
                      }`}>
                        {isCompleted && <CheckCircle className="h-4 w-4" />}
                        {isCurrent && !isCancelled && !isReturned && <CheckCircle className="h-4 w-4" />}
                        {isCancelled && <XCircle className="h-4 w-4" />}
                        {isReturned && <RotateCcw className="h-4 w-4" />}
                        {isPending && <div className="w-2 h-2 rounded-full bg-gray-300" />}
                      </div>

                      {/* Label */}
                      <p className={`text-[10px] font-semibold mt-1.5 text-center leading-tight ${
                        isCancelled ? 'text-red-600' :
                        isReturned ? 'text-orange-600' :
                        isCurrent ? 'text-green-700' :
                        isCompleted ? 'text-gray-700' : 'text-gray-400'
                      }`}>{step.label}</p>

                      {/* Date for confirmed */}
                      {step.key === 'pending' && step.isActive && (
                        <p className="text-[9px] text-gray-400 mt-0.5">{formatDate(order.created_at)}</p>
                      )}
                      {step.isCurrent && (
                        <span className="text-[9px] text-green-600 font-medium mt-0.5">Current</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* See All Updates */}
            {order.status !== 'cancelled' && order.status !== 'returned' && (
              <button
                onClick={() => setTrackingOpen(true)}
                className="text-sm text-blue-600 font-medium flex items-center gap-1 mt-3 hover:underline"
              >
                See All Updates <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Need Help? Section */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h3 className="text-sm font-bold text-gray-900 mb-3">Need Help?</h3>
            <div className="space-y-0">
              {helpOptions.primary.map((option, idx) => (
                <button
                  key={idx}
                  onClick={option.action}
                  className="flex items-center justify-between w-full py-3 border-b border-gray-50 last:border-b-0 hover:bg-gray-50 -mx-1 px-1 rounded"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500">{option.icon}</span>
                    <span className="text-sm text-gray-700">{option.label}</span>
                  </div>
                  {(option as any).hasArrow && <ChevronRight className="h-4 w-4 text-gray-400" />}
                </button>
              ))}
            </div>
          </div>

          {/* Order Info Card */}
          <div className="bg-white rounded-xl shadow-sm p-4 space-y-3">
            {/* Order ID */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Order #{order.order_number}</span>
              <button onClick={copyOrderNumber} className="text-gray-400 hover:text-gray-600">
                <Copy className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Order Date */}
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Calendar className="h-3.5 w-3.5" />
              <span>Ordered on {formatFullDate(order.created_at)}</span>
            </div>

            {/* Estimated Delivery */}
            {estimatedDelivery && order.status !== 'delivered' && order.status !== 'cancelled' && order.status !== 'returned' && (
              <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 rounded-lg px-3 py-2">
                <Truck className="h-3.5 w-3.5" />
                <span className="font-medium">Estimated delivery: {formatFullDate(estimatedDelivery)}</span>
              </div>
            )}

            {order.status === 'delivered' && (
              <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 rounded-lg px-3 py-2">
                <CheckCircle className="h-3.5 w-3.5" />
                <span className="font-medium">Delivered on {formatDate(order.updated_at)}</span>
              </div>
            )}
          </div>

          {/* Delivery Address Card */}
          {shippingAddress && (
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h3 className="text-sm font-bold text-gray-900 mb-2">Delivery Address</h3>
              <div className="space-y-1.5">
                <div className="flex items-start gap-2">
                  <Home className="h-3.5 w-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-xs font-semibold text-gray-800">{shippingAddress.address_type || 'Home'}</span>
                    <span className="text-xs text-gray-600 ml-1.5">{shippingAddress.address}, {shippingAddress.city}, {shippingAddress.state} - {shippingAddress.pincode}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-5">
                  <span className="text-xs text-gray-700 font-medium">{shippingAddress.name}</span>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs text-gray-500">{shippingAddress.phone}</span>
                </div>
              </div>
            </div>
          )}

          {/* Payment & Price Card */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h3 className="text-sm font-bold text-gray-900 mb-3">Price Details</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Listing price</span>
                <span className="text-gray-400 line-through">₹{Math.round(itemsTotal * 1.2).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Special price</span>
                <span className="text-gray-800">₹{itemsTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Total fees</span>
                <span className="text-gray-800">₹{Math.round(order.total_amount - itemsTotal + (itemsTotal * 0.01)).toLocaleString() || '0'}</span>
              </div>
              <div className="border-t border-dashed border-gray-200 pt-2 mt-2">
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-gray-900">Total amount</span>
                  <span className="text-gray-900">₹{order.total_amount.toLocaleString()}</span>
                </div>
              </div>
              <div className="flex justify-between items-center text-xs pt-2 border-t">
                <span className="text-gray-500">Payment method</span>
                <div className="flex items-center gap-1">
                  <CreditCard className="h-3 w-3 text-gray-400" />
                  <span className="text-gray-700 font-medium">{paymentMethodLabel}</span>
                </div>
              </div>
              {order.payment_method === 'cod' && (
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-green-600">Advance Paid (Online)</span>
                    <span className="text-green-600 font-medium">₹99</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-orange-600">Due on Delivery</span>
                    <span className="text-orange-600 font-medium">₹{(order.total_amount - 99).toLocaleString()}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ===== DESKTOP VIEW ===== */}
      <div className="hidden lg:block">
        {/* Breadcrumb */}
        <div className="bg-white border-b">
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

        {/* Desktop Main Content */}
        <div className="w-full px-8 py-6">
          <div className="flex gap-6">
            {/* Left Column */}
            <div className="flex-1 min-w-0 space-y-4">
              {/* Product Cards */}
              {orderItems.map((item: any, index: number) => (
                <div key={index} className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex gap-4">
                    <div className="w-28 h-28 flex-shrink-0 border border-gray-200 rounded-lg overflow-hidden bg-white">
                      <img src={item.image || '/placeholder.svg'} alt={item.name || 'Product'} className="w-full h-full object-contain p-2" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-lg font-semibold text-gray-900 line-clamp-2">{item.name || `Item ${index + 1}`}</h2>
                      {item.color && <p className="text-sm text-gray-500 mt-0.5">Color: {item.color}</p>}
                      {item.size && <p className="text-sm text-gray-500">Size: {item.size}</p>}
                      {item.seller && <p className="text-sm text-gray-500 mt-0.5">Seller: {item.seller}</p>}
                      <p className="text-lg font-bold text-gray-900 mt-2">₹{((item.quantity || 1) * (item.price || 0)).toLocaleString()}</p>
                      <p className="text-xs text-gray-500 mt-0.5">Qty: {item.quantity || 1}</p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Timeline Card - Desktop */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="overflow-x-auto pb-2">
                  <div className="flex items-start min-w-max">
                    {desktopTimelineEvents.map((event, index) => (
                      <div key={index} className="flex items-start flex-1 min-w-[120px]">
                        <div className="flex flex-col items-center text-center w-full relative">
                          {index < desktopTimelineEvents.length - 1 && (
                            <div className={`absolute top-4 left-1/2 w-full h-0.5 ${event.isActive ? 'bg-green-400' : 'bg-gray-200'}`} />
                          )}
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 relative z-10 ${event.color} ${(event as any).isCurrent ? 'ring-2 ring-offset-1 ring-blue-400 animate-pulse' : ''}`}>
                            {event.icon}
                          </div>
                          <p className={`text-xs font-semibold mt-2 ${event.isActive ? 'text-gray-900' : 'text-gray-400'}`}>{event.label}</p>
                          {event.date && <p className="text-[10px] text-gray-500">{event.date}</p>}
                          {(event as any).isCurrent && <span className="text-[10px] text-blue-600 font-medium">Current</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {order.status !== 'cancelled' && order.status !== 'returned' && (
                  <button onClick={() => setTrackingOpen(true)} className="text-sm text-blue-600 font-medium flex items-center gap-1 mt-2 hover:underline">
                    See All Updates <ChevronRight className="h-4 w-4" />
                  </button>
                )}

                {order.status === 'cancelled' && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-gray-600">Your order was cancelled as per your request.</p>
                  </div>
                )}

                {/* Order Number */}
                <div className="mt-4 pt-4 border-t flex items-center gap-2">
                  <span className="text-sm text-gray-500">Order #{order.order_number}</span>
                  <button onClick={copyOrderNumber} className="text-gray-400 hover:text-gray-600"><Copy className="h-3.5 w-3.5" /></button>
                </div>

                {/* Order Date */}
                <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
                  <Calendar className="h-4 w-4" />
                  <span>Ordered on {formatFullDate(order.created_at)}</span>
                </div>

                {/* Estimated Delivery */}
                {estimatedDelivery && order.status !== 'delivered' && order.status !== 'cancelled' && order.status !== 'returned' && (
                  <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 rounded-lg px-4 py-2.5 mt-3">
                    <Truck className="h-4 w-4" />
                    <span className="font-medium">Estimated delivery: {formatFullDate(estimatedDelivery)}</span>
                  </div>
                )}

                {order.status === 'delivered' && (
                  <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 rounded-lg px-4 py-2.5 mt-3">
                    <CheckCircle className="h-4 w-4" />
                    <span className="font-medium">Delivered on {formatDate(order.updated_at)}</span>
                  </div>
                )}
              </div>

              {/* Need Help? Section - Desktop */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-base font-bold text-gray-900 mb-4">Need Help?</h3>
                <div className="space-y-0">
                  {helpOptions.primary.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={option.action}
                      className="flex items-center justify-between w-full py-3.5 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 px-2 rounded transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-gray-500">{option.icon}</span>
                        <span className="text-sm text-gray-700 font-medium">{option.label}</span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="w-[400px] flex-shrink-0 space-y-4">
              {shippingAddress && (
                <div className="bg-white rounded-lg shadow-sm p-5">
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

              <div className="bg-white rounded-lg shadow-sm p-5">
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

        <Footer />
      </div>

      <MobileBottomNav />

      {/* Cancel Order Dialog (Mobile) */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent className="max-w-sm mx-auto rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-base">Cancel Order</DialogTitle>
            <DialogDescription className="text-sm text-gray-600">
              Are you sure you want to cancel this order?
            </DialogDescription>
          </DialogHeader>
          {getRefundAmount() > 0 && (
            <p className="text-sm font-medium text-green-600">₹{getRefundAmount()} will be refunded within 5-7 business days.</p>
          )}
          <DialogFooter className="flex flex-row gap-2 sm:flex-row">
            <Button variant="outline" className="flex-1" onClick={() => setCancelDialogOpen(false)}>No, Keep Order</Button>
            <Button variant="destructive" className="flex-1" onClick={handleCancelOrder} disabled={cancellingOrder}>
              {cancellingOrder ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              Yes, Cancel Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Return Order Dialog (Mobile) */}
      <Dialog open={returnDialogOpen} onOpenChange={setReturnDialogOpen}>
        <DialogContent className="max-w-sm mx-auto rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-base">Return Order Request</DialogTitle>
            <DialogDescription className="text-sm text-gray-600">
              Please select a reason for returning the product.
            </DialogDescription>
          </DialogHeader>
          <RadioGroup value={returnReason} onValueChange={setReturnReason} className="space-y-3">
            {[
              'Damaged product',
              'Wrong item delivered',
              'Not satisfied with product',
              'Other'
            ].map((reason) => (
              <div key={reason} className="flex items-center space-x-3">
                <RadioGroupItem value={reason} id={reason} />
                <Label htmlFor={reason} className="text-sm text-gray-700 cursor-pointer">{reason}</Label>
              </div>
            ))}
          </RadioGroup>
          <DialogFooter>
            <Button
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              onClick={handleReturnOrder}
              disabled={!returnReason || returningOrder}
            >
              {returningOrder ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              Submit Return Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
