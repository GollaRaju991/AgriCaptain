
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Package, Truck, Phone, Mail, ArrowLeft } from 'lucide-react';

interface OrderDetails {
  orderNumber: string;
  date: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  shippingAddress: {
    name: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  paymentSummary: {
    subtotal: number;
    delivery: number;
    discount: number;
    total: number;
  };
}

const OrderConfirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const orderDetails = location.state?.orderDetails as OrderDetails;

  // Fallback data if no order details are passed
  const defaultOrderDetails: OrderDetails = {
    orderNumber: '#AG' + Math.random().toString(36).substr(2, 9).toUpperCase(),
    date: new Date().toLocaleDateString('en-IN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }),
    items: [
      { name: 'Fertilizer Pack', quantity: 2, price: 400 },
      { name: 'Organic Seeds', quantity: 1, price: 400 }
    ],
    shippingAddress: {
      name: 'Rahul Sharma',
      address: 'Village ABC',
      city: 'District XYZ',
      state: 'Maharashtra',
      pincode: '123456'
    },
    paymentSummary: {
      subtotal: 800,
      delivery: 50,
      discount: 0,
      total: 850
    }
  };

  const order = orderDetails || defaultOrderDetails;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Thank you for your order!</h1>
          <p className="text-lg text-gray-600">
            We appreciate your trust in AgriCaptain. Your order has been successfully placed and is now being processed.
          </p>
        </div>

        {/* Order Summary Card */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold flex items-center">
                <Package className="h-5 w-5 mr-2 text-green-600" />
                Order Summary
              </h2>
              <div className="text-right">
                <p className="text-sm text-gray-600">Order Number</p>
                <p className="font-bold text-lg">{order.orderNumber}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3">Order Details</h3>
                <p className="text-sm text-gray-600 mb-2">Date: {order.date}</p>
                <div className="space-y-2">
                  <h4 className="font-medium">Items Ordered:</h4>
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{item.name} x {item.quantity}</span>
                      <span>₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3 flex items-center">
                  <Truck className="h-4 w-4 mr-2 text-green-600" />
                  Delivery Details
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-medium">Shipping to:</p>
                  <p className="text-sm">{order.shippingAddress.name}</p>
                  <p className="text-sm">{order.shippingAddress.address}</p>
                  <p className="text-sm">
                    {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                  </p>
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-sm font-medium text-green-600">
                      Expected Delivery: Between {new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} - {new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Summary */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">💳 Payment Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>₹{order.paymentSummary.subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery:</span>
                <span>₹{order.paymentSummary.delivery}</span>
              </div>
              {order.paymentSummary.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount:</span>
                  <span>-₹{order.paymentSummary.discount}</span>
                </div>
              )}
              <div className="border-t pt-2">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total Paid:</span>
                  <span>₹{order.paymentSummary.total}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>


        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={() => navigate('/products')} className="bg-green-600 hover:bg-green-700">
            Continue Shopping
          </Button>
          <Button onClick={() => navigate('/profile')} variant="outline">
            View Order History
          </Button>
          <Button onClick={() => navigate('/')} variant="outline" className="flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
