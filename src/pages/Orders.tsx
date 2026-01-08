import React, { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MobileBottomNav from "@/components/MobileBottomNav";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, Truck, CheckCircle, Clock, Eye, Loader2, MapPin, Phone, User, XCircle, AlertCircle, Calendar } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
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

interface ShippingAddress {
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

const Orders = () => {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);
  const [trackingOrderId, setTrackingOrderId] = useState<string | null>(null);

  // Make scroll to top optional - only scroll when coming from external navigation
  useScrollToTop(false);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
      } else {
        console.log('Fetched orders:', data);
        setOrders(data || []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'shipped':
        return <Truck className="h-4 w-4 text-blue-600" />;
      case 'processing':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Package className="h-4 w-4 text-gray-600" />;
    }
  };

  // Check if order can be cancelled (within 24 hours)
  const canCancelOrder = (order: Order): boolean => {
    if (order.status === 'cancelled' || order.status === 'delivered' || order.status === 'shipped') {
      return false;
    }
    const orderDate = new Date(order.created_at);
    const now = new Date();
    const hoursDiff = (now.getTime() - orderDate.getTime()) / (1000 * 60 * 60);
    return hoursDiff <= 24;
  };

  // Get time remaining for cancellation
  const getCancellationTimeRemaining = (order: Order): string => {
    const orderDate = new Date(order.created_at);
    const deadline = new Date(orderDate.getTime() + 24 * 60 * 60 * 1000);
    const now = new Date();
    const hoursRemaining = Math.max(0, (deadline.getTime() - now.getTime()) / (1000 * 60 * 60));
    
    if (hoursRemaining <= 0) return 'Cancellation window expired';
    if (hoursRemaining < 1) return `${Math.round(hoursRemaining * 60)} minutes left to cancel`;
    return `${Math.round(hoursRemaining)} hours left to cancel`;
  };

  // Calculate refund amount
  const getRefundAmount = (order: Order): number => {
    if (order.payment_status !== 'completed') return 0;
    if (order.payment_method === 'cod') return 99; // COD advance payment
    return order.total_amount; // Full refund for online payments
  };

  // Handle order cancellation
  const handleCancelOrder = async (order: Order) => {
    setCancellingOrderId(order.id);
    
    try {
      const refundAmount = getRefundAmount(order);
      
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: 'cancelled',
          payment_status: order.payment_status === 'completed' ? 'refund_initiated' : order.payment_status
        })
        .eq('id', order.id);

      if (error) {
        console.error('Error cancelling order:', error);
        toast.error('Failed to cancel order. Please try again.');
        return;
      }

      // Create notification for order cancellation
      const notificationMessage = refundAmount > 0 
        ? `Your order #${order.order_number} has been cancelled. ₹${refundAmount} will be refunded within 5-7 business days.`
        : `Your order #${order.order_number} has been cancelled.`;

      await supabase
        .from('notifications')
        .insert({
          user_id: user?.id,
          order_id: order.id,
          type: 'order',
          title: 'Order Cancelled',
          message: notificationMessage,
          action_url: '/orders'
        });

      // Refresh orders
      await fetchOrders();

      if (refundAmount > 0) {
        toast.success(
          `Order cancelled successfully! ₹${refundAmount} will be refunded to your original payment method within 5-7 business days.`,
          { duration: 6000 }
        );
      } else {
        toast.success('Order cancelled successfully!');
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error('Failed to cancel order. Please try again.');
    } finally {
      setCancellingOrderId(null);
    }
  };

  const getItemsCount = (items: Json): number => {
    if (Array.isArray(items)) {
      return items.length;
    }
    return 0;
  };

  const getShippingAddress = (address: Json): ShippingAddress | null => {
    try {
      if (typeof address === 'object' && address !== null && !Array.isArray(address)) {
        const addr = address as { [key: string]: any };
        if (addr.name && addr.phone && addr.address && addr.city && addr.state && addr.pincode) {
          return {
            name: addr.name,
            phone: addr.phone,
            address: addr.address,
            city: addr.city,
            state: addr.state,
            pincode: addr.pincode
          };
        }
      }
    } catch (error) {
      console.error('Error parsing shipping address:', error);
    }
    return null;
  };

  const getOrderItems = (items: Json): any[] => {
    if (Array.isArray(items)) {
      return items;
    }
    return [];
  };

  const toggleOrderDetails = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  // Calculate estimated delivery date (5-7 days from order date)
  const getEstimatedDelivery = (order: Order): string | null => {
    if (order.estimated_delivery) return order.estimated_delivery;
    if (order.status === 'delivered' || order.status === 'cancelled') return null;
    const orderDate = new Date(order.created_at);
    orderDate.setDate(orderDate.getDate() + 5); // Default: 5 days from order
    return orderDate.toISOString();
  };

  // Parse tracking updates from JSON
  const getTrackingUpdates = (order: Order): TrackingUpdate[] => {
    if (!order.tracking_updates || !Array.isArray(order.tracking_updates)) {
      return [];
    }
    return order.tracking_updates as unknown as TrackingUpdate[];
  };

  const trackingOrder = orders.find(o => o.id === trackingOrderId);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Orders</h1>
          <p className="text-gray-600">Track and manage your AgriCaptain orders securely</p>
        </div>

        {orders.length > 0 ? (
          <div className="space-y-6">
            {orders.map((order) => {
              const shippingAddress = getShippingAddress(order.shipping_address);
              const orderItems = getOrderItems(order.items);
              const isExpanded = expandedOrder === order.id;

              return (
                <Card key={order.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">Order #{order.order_number}</CardTitle>
                        <p className="text-sm text-gray-600">
                          Placed on {new Date(order.created_at).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(order.status)}
                        <Badge className={getStatusColor(order.status)}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Estimated Delivery Date */}
                      {getEstimatedDelivery(order) && order.status !== 'delivered' && order.status !== 'cancelled' && (
                        <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-800">
                          <Calendar className="h-4 w-4 shrink-0" />
                          <span className="text-sm">
                            <strong>Estimated Delivery:</strong>{' '}
                            {new Date(getEstimatedDelivery(order)!).toLocaleDateString('en-IN', {
                              weekday: 'short',
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Items Ordered:</p>
                          <div className="text-sm text-gray-600">
                            {getItemsCount(order.items)} item(s)
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Payment: {order.payment_status}</p>
                          <p className="font-bold text-lg">₹{order.total_amount}</p>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="border-t pt-4 space-y-4">
                          {orderItems.length > 0 && (
                            <div>
                              <h4 className="font-medium mb-2">Order Items</h4>
                              <div className="space-y-2">
                                {orderItems.map((item: any, index: number) => (
                                  <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                    <div>
                                      <p className="font-medium">{item.name || `Item ${index + 1}`}</p>
                                      <p className="text-sm text-gray-600">
                                        Quantity: {item.quantity || 1} × ₹{item.price || 0}
                                      </p>
                                    </div>
                                    <p className="font-medium">₹{(item.quantity || 1) * (item.price || 0)}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {shippingAddress && (
                            <div>
                              <h4 className="font-medium mb-2 flex items-center">
                                <MapPin className="h-4 w-4 mr-1" />
                                Shipping Address
                              </h4>
                              <div className="bg-gray-50 p-3 rounded">
                                <div className="flex items-center mb-1">
                                  <User className="h-4 w-4 mr-1 text-gray-500" />
                                  <span className="font-medium">{shippingAddress.name}</span>
                                </div>
                                <div className="flex items-center mb-1">
                                  <Phone className="h-4 w-4 mr-1 text-gray-500" />
                                  <span>{shippingAddress.phone}</span>
                                </div>
                                <p className="text-sm">{shippingAddress.address}</p>
                                <p className="text-sm">
                                  {shippingAddress.city}, {shippingAddress.state} - {shippingAddress.pincode}
                                </p>
                              </div>
                            </div>
                          )}

                          <div>
                            <h4 className="font-medium mb-2">Payment Details</h4>
                            <div className="bg-gray-50 p-3 rounded space-y-2">
                              <div className="flex justify-between">
                                <span>Payment Method:</span>
                                <span className="font-medium uppercase">{order.payment_method}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Payment Status:</span>
                                <span className={`font-medium ${
                                  order.payment_status === 'completed' ? 'text-green-600' : 
                                  order.payment_status === 'failed' ? 'text-red-600' : 'text-yellow-600'
                                }`}>
                                  {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                                </span>
                              </div>
                              
                              {order.payment_method === 'cod' && (
                                <>
                                  <div className="border-t pt-2 mt-2">
                                    <div className="flex justify-between text-green-600">
                                      <span>Advance Paid (Online):</span>
                                      <span className="font-medium">₹99</span>
                                    </div>
                                    <div className="flex justify-between text-orange-600">
                                      <span>Due on Delivery:</span>
                                      <span className="font-medium">₹{order.total_amount - 99}</span>
                                    </div>
                                  </div>
                                </>
                              )}
                              
                              <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2">
                                <span>Total Amount:</span>
                                <span>₹{order.total_amount}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Cancellation info banner */}
                      {canCancelOrder(order) && (
                        <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
                          <AlertCircle className="h-4 w-4 shrink-0" />
                          <span>{getCancellationTimeRemaining(order)}</span>
                        </div>
                      )}

                      {order.status === 'cancelled' && (
                        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
                          <XCircle className="h-4 w-4 shrink-0" />
                          <span>
                            This order has been cancelled.
                            {order.payment_status === 'refund_initiated' && ' Refund has been initiated.'}
                          </span>
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-4">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex items-center space-x-1"
                          onClick={() => toggleOrderDetails(order.id)}
                        >
                          <Eye className="h-4 w-4" />
                          <span>{isExpanded ? 'Hide Details' : 'View Details'}</span>
                        </Button>
                        
                        {order.status !== 'cancelled' && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex items-center space-x-1"
                            onClick={() => setTrackingOrderId(order.id)}
                          >
                            <Truck className="h-4 w-4" />
                            <span>Track Order</span>
                          </Button>
                        )}
                        
                        {order.status === 'delivered' && (
                          <Button variant="outline" size="sm">
                            Reorder
                          </Button>
                        )}

                        {canCancelOrder(order) && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="destructive" 
                                size="sm" 
                                className="flex items-center space-x-1"
                                disabled={cancellingOrderId === order.id}
                              >
                                {cancellingOrderId === order.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <XCircle className="h-4 w-4" />
                                )}
                                <span>Cancel Order</span>
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Cancel Order #{order.order_number}?</AlertDialogTitle>
                                <AlertDialogDescription className="space-y-2">
                                  <p>Are you sure you want to cancel this order?</p>
                                  {getRefundAmount(order) > 0 && (
                                    <p className="font-medium text-green-600">
                                      ₹{getRefundAmount(order)} will be refunded to your {order.payment_method === 'cod' ? 'payment method' : 'original payment method'} within 5-7 business days.
                                    </p>
                                  )}
                                  {order.payment_method === 'cod' && order.payment_status === 'completed' && (
                                    <p className="text-sm text-muted-foreground">
                                      (Advance payment of ₹99 will be refunded)
                                    </p>
                                  )}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Keep Order</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleCancelOrder(order)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Yes, Cancel Order
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-16">
              <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders yet</h3>
              <p className="text-gray-600 mb-6">You haven't placed any orders with AgriCaptain yet.</p>
              <Button>Start Shopping</Button>
            </CardContent>
          </Card>
        )}

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
      </div>
      <div className="h-20 lg:hidden"></div>

<MobileBottomNav />
      <Footer />
    </div>
  );
};

export default Orders;
