
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
          <div className="flex justify-between text-green-600">
            <span>Packaging Charges</span>
            <span>₹0 Free</span>
          </div>
          {upiDiscount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>UPI Discount (10%)</span>
              <span>-₹{upiDiscount.toFixed(2)}</span>
            </div>
          )}
          {appliedCoupon && couponDiscount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Coupon Discount</span>
              <span>-₹{couponDiscount.toFixed(2)}</span>
            </div>
          )}
          <Separator />
          <div className="flex justify-between text-lg font-bold">
            <span>Amount Payable</span>
            <span>₹{finalTotal.toFixed(2)}</span>
          </div>

          {/* COD Payment Breakdown */}
          {isCOD && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-3 space-y-2">
              <p className="text-sm font-medium text-amber-800">Cash on Delivery Breakdown:</p>
              <div className="flex justify-between text-sm">
                <span className={codAdvancePaid ? 'text-green-700' : 'text-amber-700'}>
                  {codAdvancePaid ? '✓ Advance Paid' : 'Advance Payment'}
                </span>
                <span className={codAdvancePaid ? 'text-green-700 font-medium' : 'text-amber-700'}>
                  ₹{codAdvanceAmount}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Due on Delivery</span>
                <span className="font-medium">₹{codRemainingAmount.toFixed(2)}</span>
              </div>
              {(upiDiscount > 0 || couponDiscount > 0) && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Total Savings</span>
                  <span>-₹{(upiDiscount + couponDiscount).toFixed(2)}</span>
                </div>
              )}
            </div>
          )}
          
          {/* Pay Button */}
          <div className="mt-6">
            <Button 
              onClick={onPayment} 
              className="w-full h-12 text-base font-medium bg-orange-500 hover:bg-orange-600 text-white"
              disabled={!paymentMethod || !selectedAddress || (isCOD && !codAdvancePaid)}
            >
              {isCOD 
                ? (codAdvancePaid 
                    ? `PLACE ORDER (Pay ₹${codRemainingAmount.toFixed(0)} on Delivery)` 
                    : 'Complete Advance Payment First')
                : `PAY ₹${finalTotal.toFixed(0)}`
              }
            </Button>
            {(!paymentMethod || !selectedAddress || (isCOD && !codAdvancePaid)) && (
              <p className="text-xs text-gray-500 mt-2 text-center">
                {!selectedAddress 
                  ? 'Please select delivery address' 
                  : !paymentMethod 
                    ? 'Please select payment method'
                    : isCOD && !codAdvancePaid 
                      ? 'Please complete ₹99 advance payment above'
                      : ''
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
