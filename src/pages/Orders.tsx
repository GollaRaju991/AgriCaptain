import React, { useEffect, useState, useMemo } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MobileBottomNav from "@/components/MobileBottomNav";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, Truck, CheckCircle, Clock, Loader2, XCircle, Search, RotateCcw, Star, ChevronRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';
import useScrollToTop from '@/hooks/useScrollToTop';
import { toast } from 'sonner';
import OrderTracking from '@/components/OrderTracking';
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

const Orders = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);
  const [trackingOrderId, setTrackingOrderId] = useState<string | null>(null);
  const [returningOrderId, setReturningOrderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const [timeFilter, setTimeFilter] = useState('');

  useScrollToTop(false);

  useEffect(() => {
    if (user) fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) console.error('Error fetching orders:', error);
      else setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = useMemo(() => {
    let result = orders;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(order => {
        const matchesNumber = order.order_number.toLowerCase().includes(q);
        const items = Array.isArray(order.items) ? order.items : [];
        const matchesItem = items.some((item: any) => item?.name?.toLowerCase?.()?.includes(q));
        return matchesNumber || matchesItem;
      });
    }
    if (statusFilters.length > 0) {
      result = result.filter(order => statusFilters.includes(order.status));
    }
    if (timeFilter) {
      const now = new Date();
      result = result.filter(order => {
        const orderDate = new Date(order.created_at);
        switch (timeFilter) {
          case 'last30': { const d = new Date(now); d.setDate(d.getDate() - 30); return orderDate >= d; }
          case '2026': return orderDate.getFullYear() === 2026;
          case '2025': return orderDate.getFullYear() === 2025;
          case 'older': return orderDate.getFullYear() < 2025;
          default: return true;
        }
      });
    }
    return result;
  }, [orders, searchQuery, statusFilters, timeFilter]);

  const hasActiveFilters = statusFilters.length > 0 || timeFilter !== '';
  const clearAllFilters = () => { setStatusFilters([]); setTimeFilter(''); setSearchQuery(''); };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  const canCancelOrder = (order: Order): boolean => {
    if (['cancelled', 'delivered', 'shipped', 'returned'].includes(order.status)) return false;
    return (Date.now() - new Date(order.created_at).getTime()) / (1000 * 60 * 60) <= 24;
  };

  const canReturnOrder = (order: Order): boolean => {
    if (order.status !== 'delivered') return false;
    return (Date.now() - new Date(order.updated_at).getTime()) / (1000 * 60 * 60 * 24) <= 7;
  };

  const getRefundAmount = (order: Order): number => {
    if (order.payment_status !== 'completed') return 0;
    return order.payment_method === 'cod' ? 99 : order.total_amount;
  };

  const handleCancelOrder = async (order: Order) => {
    setCancellingOrderId(order.id);
    try {
      const refundAmount = getRefundAmount(order);
      const { error } = await supabase.from('orders').update({
        status: 'cancelled',
        payment_status: order.payment_status === 'completed' ? 'refunded' : order.payment_status
      }).eq('id', order.id);

      if (error) { toast.error('Failed to cancel order.'); return; }

      await supabase.from('notifications').insert({
        user_id: user?.id, order_id: order.id, type: 'order', title: 'Order Cancelled',
        message: refundAmount > 0
          ? `Your order #${order.order_number} has been cancelled. ₹${refundAmount} will be refunded within 5-7 business days.`
          : `Your order #${order.order_number} has been cancelled.`,
        action_url: '/orders'
      });

      await fetchOrders();
      toast.success(refundAmount > 0 ? `Order cancelled! ₹${refundAmount} will be refunded within 5-7 business days.` : 'Order cancelled!', { duration: 6000 });
    } catch { toast.error('Failed to cancel order.'); }
    finally { setCancellingOrderId(null); }
  };

  const handleReturnOrder = async (order: Order) => {
    setReturningOrderId(order.id);
    try {
      const { error } = await supabase.from('orders').update({ status: 'returned', payment_status: 'refunded' }).eq('id', order.id);
      if (error) { toast.error('Failed to initiate return.'); return; }
      await supabase.from('notifications').insert({
        user_id: user?.id, order_id: order.id, type: 'order', title: 'Return Initiated',
        message: `Return initiated for order #${order.order_number}. ₹${order.total_amount} will be refunded within 5-7 business days.`,
        action_url: '/orders'
      });
      await fetchOrders();
      toast.success(`Return initiated! ₹${order.total_amount} will be refunded within 5-7 business days.`, { duration: 6000 });
    } catch { toast.error('Failed to initiate return.'); }
    finally { setReturningOrderId(null); }
  };

  const getOrderItems = (items: Json): any[] => Array.isArray(items) ? items : [];

  const getEstimatedDelivery = (order: Order): string | null => {
    if (order.estimated_delivery) return order.estimated_delivery;
    if (order.status === 'delivered' || order.status === 'cancelled') return null;
    const d = new Date(order.created_at); d.setDate(d.getDate() + 5);
    return d.toISOString();
  };

  const getTrackingUpdates = (order: Order): TrackingUpdate[] => {
    if (!order.tracking_updates || !Array.isArray(order.tracking_updates)) return [];
    return order.tracking_updates as unknown as TrackingUpdate[];
  };

  const getStatusInfo = (status: string, order: Order) => {
    const date = new Date(order.status === 'delivered' || order.status === 'cancelled' ? order.updated_at : order.created_at);
    const formattedDate = date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
    
    switch (status) {
      case 'delivered':
        return { color: 'text-green-600', dot: 'bg-green-500', label: `Delivered on ${formattedDate}`, sub: 'Your item has been delivered' };
      case 'shipped':
        return { color: 'text-blue-600', dot: 'bg-blue-500', label: `Shipped on ${formattedDate}`, sub: 'Your item is on the way' };
      case 'processing':
        return { color: 'text-yellow-600', dot: 'bg-yellow-500', label: `Processing`, sub: 'Your order is being prepared' };
      case 'cancelled':
        return { color: 'text-red-600', dot: 'bg-red-500', label: `Cancelled on ${formattedDate}`, sub: 'Your order was cancelled as per your request.' };
      case 'returned':
        return { color: 'text-orange-600', dot: 'bg-orange-500', label: `Returned on ${formattedDate}`, sub: 'Return initiated — refund processing' };
      default:
        return { color: 'text-gray-600', dot: 'bg-gray-500', label: `Placed on ${formattedDate}`, sub: 'Order is pending' };
    }
  };

  const toggleStatusFilter = (status: string) => {
    setStatusFilters(prev => prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]);
  };

  const trackingOrder = orders.find(o => o.id === trackingOrderId);

  // Flatten orders into individual product rows
  const productRows = useMemo(() => {
    const rows: { order: Order; item: any; itemIndex: number }[] = [];
    filteredOrders.forEach(order => {
      const items = getOrderItems(order.items);
      if (items.length === 0) {
        rows.push({ order, item: { name: 'Order Item', price: order.total_amount, quantity: 1 }, itemIndex: 0 });
      } else {
        items.forEach((item, idx) => rows.push({ order, item, itemIndex: idx }));
      }
    });
    return rows;
  }, [filteredOrders]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Breadcrumb - Desktop */}
      <div className="hidden lg:block bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <nav className="text-sm text-gray-500">
            <span className="hover:text-blue-600 cursor-pointer" onClick={() => navigate('/')}>Home</span>
            <span className="mx-1">›</span>
            <span className="hover:text-blue-600 cursor-pointer" onClick={() => navigate('/profile')}>My Account</span>
            <span className="mx-1">›</span>
            <span className="text-gray-900 font-medium">My Orders</span>
          </nav>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="px-4 py-3">
          <h1 className="text-lg font-bold text-gray-900">My Orders</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-4 lg:py-6">
        <div className="flex gap-6">
          {/* Sidebar Filters - Desktop Only */}
          <div className="hidden lg:block w-60 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm p-4 sticky top-20">
              <h2 className="text-base font-bold text-gray-900 mb-4">Filters</h2>

              <div className="mb-6">
                <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">Order Status</h3>
                <div className="space-y-2.5">
                  {[
                    { key: 'shipped', label: 'On the way' },
                    { key: 'delivered', label: 'Delivered' },
                    { key: 'cancelled', label: 'Cancelled' },
                    { key: 'returned', label: 'Returned' },
                  ].map(f => (
                    <label key={f.key} className="flex items-center gap-2.5 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={statusFilters.includes(f.key)}
                        onChange={() => toggleStatusFilter(f.key)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 group-hover:text-gray-900">{f.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">Order Time</h3>
                <div className="space-y-2.5">
                  {[
                    { key: 'last30', label: 'Last 30 days' },
                    { key: '2026', label: '2026' },
                    { key: '2025', label: '2025' },
                    { key: 'older', label: 'Older' },
                  ].map(f => (
                    <label key={f.key} className="flex items-center gap-2.5 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={timeFilter === f.key}
                        onChange={() => setTimeFilter(timeFilter === f.key ? '' : f.key)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 group-hover:text-gray-900">{f.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Search Bar */}
            <div className="flex gap-3 mb-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search your orders here"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-11 pl-4 pr-4 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <Button className="h-11 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium">
                <Search className="h-4 w-4 mr-2" />
                Search Orders
              </Button>
            </div>

            {/* Mobile Filter Chips */}
            <div className="lg:hidden flex gap-2 overflow-x-auto pb-3 mb-3">
              {['shipped', 'delivered', 'cancelled', 'returned'].map(status => (
                <button
                  key={status}
                  onClick={() => toggleStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-colors ${
                    statusFilters.includes(status)
                      ? 'bg-green-50 border-green-300 text-green-700'
                      : 'bg-white border-gray-200 text-gray-600'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
              {hasActiveFilters && (
                <button onClick={clearAllFilters} className="px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap bg-red-50 border border-red-200 text-red-600">
                  Clear All
                </button>
              )}
            </div>

            {/* Product Rows */}
            {productRows.length > 0 ? (
              <div className="space-y-0">
                {productRows.map(({ order, item, itemIndex }, rowIndex) => {
                  const statusInfo = getStatusInfo(order.status, order);
                  return (
                    <div
                      key={`${order.id}-${itemIndex}`}
                      className="bg-white border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-shadow"
                      style={{ borderTop: rowIndex === 0 ? undefined : '0' }}
                      onClick={() => navigate(`/orders/${order.id}`)}
                    >
                      <div className="flex items-start gap-4">
                        {/* Product Image */}
                        <div className="w-16 h-16 md:w-20 md:h-20 flex-shrink-0 bg-white rounded border border-gray-100 overflow-hidden">
                          <img
                            src={item.image || '/placeholder.svg'}
                            alt={item.name || 'Product'}
                            className="w-full h-full object-contain p-1"
                          />
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm md:text-base font-medium text-gray-900 line-clamp-1">
                            {item.name || `Item ${itemIndex + 1}`}
                          </p>
                          {item.color && (
                            <p className="text-xs text-gray-500 mt-0.5">Color: {item.color}</p>
                          )}
                          {item.size && (
                            <p className="text-xs text-gray-500">Size: {item.size}</p>
                          )}
                        </div>

                        {/* Price */}
                        <div className="text-right flex-shrink-0 w-24 hidden md:block">
                          <p className="font-semibold text-sm text-gray-900">₹{((item.quantity || 1) * (item.price || 0)).toLocaleString()}</p>
                        </div>

                        {/* Status */}
                        <div className="flex-shrink-0 text-right w-48 hidden md:block">
                          <div className="flex items-center justify-end gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${statusInfo.dot}`}></span>
                            <span className={`text-sm font-semibold ${statusInfo.color}`}>{statusInfo.label}</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{statusInfo.sub}</p>
                          {order.status === 'delivered' && (
                            <button className="flex items-center gap-1 text-xs text-blue-600 font-medium mt-2 ml-auto hover:underline">
                              <Star className="h-3 w-3" />
                              Rate & Review Product
                            </button>
                          )}
                        </div>

                        {/* Mobile: Price + Status */}
                        <div className="md:hidden flex-shrink-0 text-right">
                          <p className="font-semibold text-sm text-gray-900">₹{((item.quantity || 1) * (item.price || 0)).toLocaleString()}</p>
                          <div className="flex items-center justify-end gap-1 mt-1">
                            <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`}></span>
                            <span className={`text-xs font-medium ${statusInfo.color}`}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : orders.length > 0 ? (
              <div className="bg-white rounded-lg shadow-sm text-center py-16">
                <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No matching orders</h3>
                <p className="text-gray-500 mb-6">Try adjusting your search or filters.</p>
                <Button variant="outline" onClick={clearAllFilters}>Clear Filters</Button>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm text-center py-16">
                <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders yet</h3>
                <p className="text-gray-500 mb-6">You haven't placed any orders yet.</p>
                <Button onClick={() => navigate('/')}>Start Shopping</Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order Tracking Dialog */}
      {trackingOrder && (
        <OrderTracking
          isOpen={!!trackingOrderId}
          onClose={() => setTrackingOrderId(null)}
          orderNumber={trackingOrder.order_number}
          currentStatus={trackingOrder.status}
          estimatedDelivery={getEstimatedDelivery(trackingOrder)}
          trackingUpdates={getTrackingUpdates(trackingOrder)}
          createdAt={trackingOrder.created_at}
        />
      )}

      <div className="h-20 lg:hidden"></div>
      <MobileBottomNav />
      <Footer />
    </div>
  );
};

export default Orders;
