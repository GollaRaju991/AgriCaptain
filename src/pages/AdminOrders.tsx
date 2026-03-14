import React, { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Package, Truck, CheckCircle, Clock, Loader2, XCircle, RotateCcw,
  Search, ChevronDown, RefreshCw, ArrowLeft
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';
import { toast } from 'sonner';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';

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
}

const statusOptions = [
  { value: 'pending', label: 'Pending', color: 'bg-gray-500' },
  { value: 'processing', label: 'Processing', color: 'bg-yellow-500' },
  { value: 'shipped', label: 'Shipped', color: 'bg-blue-500' },
  { value: 'delivered', label: 'Delivered', color: 'bg-green-500' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-500' },
  { value: 'returned', label: 'Returned', color: 'bg-orange-500' },
];

const AdminOrders = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (user) fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) console.error('Error:', error);
      else setOrders(data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const updateOrderStatus = async (order: Order, newStatus: string) => {
    setUpdatingId(order.id);
    try {
      const now = new Date().toISOString();
      // Update the order status
      const updateData: any = { status: newStatus, updated_at: now };

      if (newStatus === 'delivered') {
        updateData.payment_status = order.payment_method === 'cod' ? 'completed' : order.payment_status;
      }
      if (newStatus === 'cancelled') {
        updateData.payment_status = order.payment_status === 'completed' ? 'refunded' : order.payment_status;
      }
      if (newStatus === 'returned') {
        updateData.payment_status = 'refunded';
      }

      const { error } = await supabase.from('orders').update(updateData).eq('id', order.id);
      if (error) { toast.error('Failed to update order status'); return; }

      // Create delivery tracking entry
      if (['shipped', 'delivered'].includes(newStatus)) {
        await supabase.from('delivery_tracking').insert({
          order_id: order.id,
          user_id: order.user_id,
          status: newStatus,
          shipped_at: newStatus === 'shipped' ? now : null,
          delivered_at: newStatus === 'delivered' ? now : null,
          updated_by: 'admin',
          courier_name: 'Agrizin Logistics'
        });
      }

      // Create return request entry
      if (newStatus === 'returned') {
        await supabase.from('return_requests').insert({
          order_id: order.id,
          user_id: order.user_id,
          reason: 'Admin initiated return',
          status: 'approved',
          refund_amount: order.total_amount,
          refund_status: 'processing'
        });
      }

      // Send notification
      const messages: Record<string, string> = {
        processing: `Your order #${order.order_number} is being processed.`,
        shipped: `Your order #${order.order_number} has been shipped! Track your delivery.`,
        delivered: `Your order #${order.order_number} has been delivered. Enjoy!`,
        cancelled: `Your order #${order.order_number} has been cancelled.`,
        returned: `Return approved for order #${order.order_number}. Refund of ₹${order.total_amount} will be processed within 5-7 days.`,
      };

      if (messages[newStatus]) {
        await supabase.from('notifications').insert({
          user_id: order.user_id,
          order_id: order.id,
          type: 'order',
          title: `Order ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`,
          message: messages[newStatus],
          action_url: '/orders'
        });
      }

      await fetchOrders();
      toast.success(`Order #${order.order_number} updated to "${newStatus}"`);
    } catch { toast.error('Failed to update'); }
    finally { setUpdatingId(null); }
  };

  const simulateDelivery = async (order: Order) => {
    setUpdatingId(order.id);
    const steps = ['processing', 'shipped', 'delivered'];
    for (const step of steps) {
      if (['shipped', 'delivered'].includes(order.status) && step !== 'delivered') continue;
      if (order.status === 'delivered') break;
      await updateOrderStatus(order, step);
      await new Promise(r => setTimeout(r, 1500));
      order = { ...order, status: step };
    }
    setUpdatingId(null);
  };

  if (authLoading || loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-green-600" /></div>;
  }
  if (!user) return <Navigate to="/auth" replace />;

  const filteredOrders = orders.filter(o => {
    const matchesStatus = filterStatus === 'all' || o.status === filterStatus;
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || o.order_number.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    const opt = statusOptions.find(s => s.value === status);
    const colors: Record<string, string> = {
      pending: 'bg-gray-100 text-gray-700',
      processing: 'bg-yellow-100 text-yellow-700',
      shipped: 'bg-blue-100 text-blue-700',
      delivered: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
      returned: 'bg-orange-100 text-orange-700',
    };
    return <Badge className={`${colors[status] || 'bg-gray-100 text-gray-700'} font-medium`}>{opt?.label || status}</Badge>;
  };

  const getOrderItems = (items: Json): any[] => Array.isArray(items) ? items : [];

  const orderCounts = {
    all: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => o.status === 'processing').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
    returned: orders.filter(o => o.status === 'returned').length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="w-full px-4 lg:px-8 py-4 lg:py-6">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/')} className="p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin — Order Management</h1>
              <p className="text-sm text-gray-500 mt-0.5">Manage order statuses, deliveries, and returns</p>
            </div>
          </div>
          <Button onClick={fetchOrders} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" /> Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
          {[
            { key: 'all', label: 'All', icon: Package, color: 'text-gray-700 bg-gray-100' },
            { key: 'pending', label: 'Pending', icon: Clock, color: 'text-gray-700 bg-gray-50' },
            { key: 'processing', label: 'Processing', icon: RefreshCw, color: 'text-yellow-700 bg-yellow-50' },
            { key: 'shipped', label: 'Shipped', icon: Truck, color: 'text-blue-700 bg-blue-50' },
            { key: 'delivered', label: 'Delivered', icon: CheckCircle, color: 'text-green-700 bg-green-50' },
            { key: 'cancelled', label: 'Cancelled', icon: XCircle, color: 'text-red-700 bg-red-50' },
            { key: 'returned', label: 'Returned', icon: RotateCcw, color: 'text-orange-700 bg-orange-50' },
          ].map(stat => (
            <button
              key={stat.key}
              onClick={() => setFilterStatus(stat.key)}
              className={`rounded-lg p-3 text-left transition-all border ${
                filterStatus === stat.key ? 'border-green-500 ring-1 ring-green-200' : 'border-gray-200'
              } ${stat.color}`}
            >
              <stat.icon className="h-5 w-5 mb-1" />
              <p className="text-xs font-medium">{stat.label}</p>
              <p className="text-lg font-bold">{orderCounts[stat.key as keyof typeof orderCounts]}</p>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="flex gap-3 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by order number..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-10 pr-4 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
            />
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          {/* Desktop Table Header */}
          <div className="hidden lg:grid grid-cols-12 gap-4 px-4 py-3 bg-gray-50 border-b text-xs font-semibold text-gray-500 uppercase tracking-wide">
            <div className="col-span-2">Order #</div>
            <div className="col-span-3">Items</div>
            <div className="col-span-1">Amount</div>
            <div className="col-span-1">Payment</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-2">Change Status</div>
            <div className="col-span-2">Actions</div>
          </div>

          {filteredOrders.length > 0 ? filteredOrders.map(order => {
            const items = getOrderItems(order.items);
            const isUpdating = updatingId === order.id;

            return (
              <div key={order.id} className="border-b last:border-b-0 p-4 hover:bg-gray-50 transition-colors">
                {/* Desktop Row */}
                <div className="hidden lg:grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-2">
                    <p className="text-sm font-semibold text-gray-900">{order.order_number}</p>
                    <p className="text-xs text-gray-500">{new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                  <div className="col-span-3">
                    {items.slice(0, 2).map((item: any, i: number) => (
                      <p key={i} className="text-sm text-gray-700 truncate">{item.name} × {item.quantity || 1}</p>
                    ))}
                    {items.length > 2 && <p className="text-xs text-gray-400">+{items.length - 2} more</p>}
                  </div>
                  <div className="col-span-1">
                    <p className="text-sm font-semibold">₹{order.total_amount.toLocaleString()}</p>
                  </div>
                  <div className="col-span-1">
                    <Badge variant="outline" className="text-xs">{order.payment_method?.toUpperCase()}</Badge>
                    <p className="text-xs text-gray-500 mt-0.5">{order.payment_status}</p>
                  </div>
                  <div className="col-span-1">{getStatusBadge(order.status)}</div>
                  <div className="col-span-2">
                    <Select
                      value={order.status}
                      onValueChange={(val) => updateOrderStatus(order, val)}
                      disabled={isUpdating}
                    >
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map(opt => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2 flex gap-2">
                    {!['delivered', 'cancelled', 'returned'].includes(order.status) && (
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white text-xs"
                        disabled={isUpdating}
                        onClick={() => simulateDelivery(order)}
                      >
                        {isUpdating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Truck className="h-3 w-3 mr-1" />}
                        Simulate Delivery
                      </Button>
                    )}
                  </div>
                </div>

                {/* Mobile Card */}
                <div className="lg:hidden space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-bold text-gray-900">{order.order_number}</p>
                      <p className="text-xs text-gray-500">{new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">₹{order.total_amount.toLocaleString()}</p>
                      {getStatusBadge(order.status)}
                    </div>
                  </div>
                  <div>
                    {items.slice(0, 2).map((item: any, i: number) => (
                      <p key={i} className="text-xs text-gray-600">{item.name} × {item.quantity || 1}</p>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Select
                      value={order.status}
                      onValueChange={(val) => updateOrderStatus(order, val)}
                      disabled={isUpdating}
                    >
                      <SelectTrigger className="h-9 text-sm flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map(opt => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {!['delivered', 'cancelled', 'returned'].includes(order.status) && (
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white text-xs h-9"
                        disabled={isUpdating}
                        onClick={() => simulateDelivery(order)}
                      >
                        {isUpdating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Truck className="h-3 w-3" />}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          }) : (
            <div className="text-center py-16">
              <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No orders found</p>
            </div>
          )}
        </div>

        {/* How it works info */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">📋 How Order Management Works</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Order Status Flow</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>📦 <strong>Pending</strong> → Order placed, awaiting processing</p>
                <p>⚙️ <strong>Processing</strong> → Order is being prepared/packed</p>
                <p>🚚 <strong>Shipped</strong> → Out for delivery (tracking entry created)</p>
                <p>✅ <strong>Delivered</strong> → Successfully delivered to customer</p>
                <p>❌ <strong>Cancelled</strong> → Order cancelled, refund initiated</p>
                <p>🔄 <strong>Returned</strong> → Return approved, refund processing</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">What Happens Automatically</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• <strong>Status change</strong> → Notification sent to customer</p>
                <p>• <strong>Shipped</strong> → Entry added to <code className="bg-gray-100 px-1 rounded">delivery_tracking</code> table</p>
                <p>• <strong>Delivered</strong> → Payment marked as completed (for COD)</p>
                <p>• <strong>Returned</strong> → Entry in <code className="bg-gray-100 px-1 rounded">return_requests</code> table + refund initiated</p>
                <p>• <strong>Simulate Delivery</strong> → Auto-progresses: Pending → Processing → Shipped → Delivered</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AdminOrders;
