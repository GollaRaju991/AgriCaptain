
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Tag, Shield } from 'lucide-react';

interface OrderSummaryProps {
  items: any[];
  totalPrice: number;
  upiDiscount: number;
  couponDiscount: number;
  finalTotal: number;
  couponCode: string;
  setCouponCode: (code: string) => void;
  appliedCoupon: string | null;
  paymentMethod: string;
  selectedAddress: any;
  onCouponApply: () => void;
  onPayment: () => void;
  codAdvancePaid?: boolean;
  codAdvanceAmount?: number;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({
  items,
  totalPrice,
  upiDiscount,
  couponDiscount,
  finalTotal,
  couponCode,
  setCouponCode,
  appliedCoupon,
  paymentMethod,
  selectedAddress,
  onCouponApply,
  onPayment,
  codAdvancePaid = false,
  codAdvanceAmount = 99
}) => {
  const isCOD = paymentMethod === 'cod';
  const codRemainingAmount = Math.max(0, finalTotal - codAdvanceAmount);
  return (
    <div className="space-y-4">
      {/* Coupon Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Tag className="h-5 w-5 mr-2 text-green-600" />
            Coupons & Offers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex space-x-2">
              <Input
                placeholder="Enter coupon code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="flex-1"
              />
              <Button variant="outline" onClick={onCouponApply}>Apply</Button>
            </div>
            
            {appliedCoupon && (
              <div className="bg-green-50 border border-green-200 rounded p-3">
                <p className="text-green-800 text-sm font-medium">✓ {appliedCoupon} applied</p>
                <p className="text-green-600 text-xs">You saved ₹{couponDiscount}</p>
              </div>
            )}
            
            <div className="space-y-2 text-sm">
              <p className="font-medium">Available Coupons:</p>
              <div className="space-y-1 text-gray-600">
                <p>• SAVE10 - ₹20 off on orders above ₹500</p>
                <p>• FIRST20 - ₹20 off for first time buyers</p>
                <p>• WELCOME50 - ₹50 off (Limited time)</p>
                <p>• UPI10 - Extra 10% off with UPI payment</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Price Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>PRICE DETAILS</span>
            <span className="text-sm font-normal">({items.length} item{items.length > 1 ? 's' : ''})</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between">
            <span>Price ({items.length} item{items.length > 1 ? 's' : ''})</span>
            <span>₹{totalPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-green-600">
            <span>Delivery Charges</span>
            <span>₹0 Free</span>
          </div>
          {appliedCoupon && couponDiscount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Coupon Discount ({appliedCoupon})</span>
              <span>-₹{couponDiscount.toFixed(2)}</span>
            </div>
          )}
          {upiDiscount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>UPI Discount (10%)</span>
              <span>-₹{upiDiscount.toFixed(2)}</span>
            </div>
          )}
          <Separator />
          <div className="flex justify-between text-lg font-bold">
            <span>Amount Payable</span>
            <span>₹{finalTotal.toFixed(2)}</span>
          </div>

          {/* COD Info */}
          {isCOD && (
            <div className="bg-brand-green/5 border border-brand-green/20 rounded-lg p-3 mt-2">
              <p className="text-sm text-muted-foreground">
                Pay ₹{finalTotal.toFixed(0)} when your order is delivered.
              </p>
            </div>
          )}
          
          {/* Pay button hidden on mobile - shown in sticky bottom bar */}
          <div className="mt-6 hidden lg:block">
            <Button 
              onClick={onPayment} 
              className="w-full h-12 text-base font-medium bg-brand-green hover:bg-brand-green/90 text-white rounded-xl"
              disabled={!paymentMethod || !selectedAddress}
            >
              {isCOD 
                ? 'Place Order'
                : `Pay ₹${finalTotal.toFixed(0)}`
              }
            </Button>
            {(!paymentMethod || !selectedAddress) && (
              <p className="text-xs text-muted-foreground mt-2 text-center">
                {!selectedAddress 
                  ? 'Please select delivery address' 
                  : 'Please select payment method'
                }
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Safe Payments Info */}
      <Card className="bg-gray-50">
        <CardContent className="p-4 text-center">
          <div className="flex items-center justify-center space-x-2 text-gray-600">
            <Shield className="h-4 w-4" />
            <span className="text-sm">Safe and Secure Payments. Easy returns.</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">100% Authentic products.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderSummary;
