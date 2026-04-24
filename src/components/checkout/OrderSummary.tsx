
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Tag, Shield } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

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
  const { translations: t } = useLanguage();
  const isCOD = paymentMethod === 'cod';
  const itemLabel = items.length > 1 ? (t.items_plural || 'items') : (t.item || 'item');
  return (
    <div className="space-y-4">
      {/* Coupon Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Tag className="h-5 w-5 mr-2 text-green-600" />
            {t.coupons_offers}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex space-x-2">
              <Input
                placeholder={t.enter_coupon}
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="flex-1"
              />
              <Button variant="outline" onClick={onCouponApply}>{t.apply}</Button>
            </div>
            
            {appliedCoupon && (
              <div className="bg-green-50 border border-green-200 rounded p-3">
                <p className="text-green-800 text-sm font-medium">✓ {appliedCoupon} {t.coupon_applied}</p>
                <p className="text-green-600 text-xs">{t.you_saved} ₹{couponDiscount}</p>
              </div>
            )}
            
            <div className="space-y-2 text-sm">
              <p className="font-medium">{t.available_coupons}</p>
              <div className="space-y-1 text-gray-600">
                <p>• SAVE10 - ₹20 {t.off} ₹500+</p>
                <p>• FIRST20 - ₹20 {t.off}</p>
                <p>• WELCOME50 - ₹50 {t.off}</p>
                <p>• UPI10 - 10% {t.off} (UPI)</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Price Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>{t.price_details}</span>
            <span className="text-sm font-normal">({items.length} {itemLabel})</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between">
            <span>{t.price} ({items.length} {itemLabel})</span>
            <span>₹{totalPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-green-600">
            <span>{t.delivery_charges}</span>
            <span>₹0 {t.free}</span>
          </div>
          {appliedCoupon && couponDiscount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>{t.coupon_discount} ({appliedCoupon})</span>
              <span>-₹{couponDiscount.toFixed(2)}</span>
            </div>
          )}
          {upiDiscount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>{t.upi_discount}</span>
              <span>-₹{upiDiscount.toFixed(2)}</span>
            </div>
          )}
          <Separator />
          <div className="flex justify-between text-lg font-bold">
            <span>{t.amount_payable}</span>
            <span>₹{finalTotal.toFixed(2)}</span>
          </div>

          {/* COD Info */}
          {isCOD && (
            <div className="bg-brand-green/5 border border-brand-green/20 rounded-lg p-3 mt-2">
              <p className="text-sm text-muted-foreground">
                {t.pay_full_on_delivery}
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
                ? t.place_order
                : `${t.pay_amount} ₹${finalTotal.toFixed(0)}`
              }
            </Button>
            {(!paymentMethod || !selectedAddress) && (
              <p className="text-xs text-muted-foreground mt-2 text-center">
                {!selectedAddress 
                  ? t.select_address_first
                  : t.select_payment_first
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
            <span className="text-sm">{t.safe_secure_payments}</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">{t.authentic_products}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderSummary;
