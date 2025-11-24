import React, { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MobileBottomNav from "@/components/MobileBottomNav";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, Truck, CheckCircle, Clock, Eye, Loader2, MapPin, Phone, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';
import useScrollToTop from '@/hooks/useScrollToTop';

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
      default:
        return <Package className="h-4 w-4 text-gray-600" />;
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
                            <div className="bg-gray-50 p-3 rounded">
                              <div className="flex justify-between">
                                <span>Payment Method:</span>
                                <span className="font-medium">{order.payment_method}</span>
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
                              <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2">
                                <span>Total Amount:</span>
                                <span>₹{order.total_amount}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-3 pt-4">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex items-center space-x-1"
                          onClick={() => toggleOrderDetails(order.id)}
                        >
                          <Eye className="h-4 w-4" />
                          <span>{isExpanded ? 'Hide Details' : 'View Details'}</span>
                        </Button>
                        <Button variant="outline" size="sm" className="flex items-center space-x-1">
                          <Truck className="h-4 w-4" />
                          <span>Track Order</span>
                        </Button>
                        {order.status === 'delivered' && (
                          <Button variant="outline" size="sm">
                            Reorder
                          </Button>
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
      </div>
      <div className="h-20 lg:hidden"></div>

<MobileBottomNav />
      <Footer />
    </div>
  );
};

export default Orders;
