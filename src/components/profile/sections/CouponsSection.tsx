import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Gift, Copy, Calendar, Percent } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const CouponsSection: React.FC = () => {
  const { toast } = useToast();

  const coupons = [
    { id: 1, code: 'AGRI20', title: '20% Off on All Products', description: 'Get 20% discount on all agricultural products', discount: 20, minOrder: 500, maxDiscount: 200, expiryDate: '2024-12-31', isUsed: false },
    { id: 2, code: 'FIRSTBUY', title: 'First Purchase Discount', description: 'Special discount for first-time buyers', discount: 15, minOrder: 300, maxDiscount: 150, expiryDate: '2024-12-31', isUsed: false },
    { id: 3, code: 'BULK100', title: 'Bulk Order Discount', description: 'For orders above ₹1000', discount: 25, minOrder: 1000, maxDiscount: 500, expiryDate: '2024-12-31', isUsed: true },
  ];

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: "Coupon code copied!", description: `${code} has been copied to your clipboard` });
  };

  return (
    <div className="bg-card border rounded-xl p-8 shadow-sm">
      <h2 className="text-xl font-bold text-foreground mb-6">My Coupons</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {coupons.map((coupon) => (
          <Card key={coupon.id} className={coupon.isUsed ? 'opacity-75 bg-muted/30' : ''}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Gift className="h-5 w-5 text-primary" />
                  <Badge variant={coupon.isUsed ? 'secondary' : 'default'}>{coupon.isUsed ? 'Used' : 'Available'}</Badge>
                </div>
                <span className="font-bold text-lg text-primary">{coupon.discount}%</span>
              </div>
              <CardTitle className="text-base">{coupon.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">{coupon.description}</p>
              <div className="bg-muted/50 p-3 rounded-lg border-2 border-dashed border-muted-foreground/20 flex items-center justify-between">
                <span className="font-mono font-bold tracking-wider">{coupon.code}</span>
                <Button variant="ghost" size="sm" onClick={() => handleCopyCode(coupon.code)} disabled={coupon.isUsed}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <div className="text-sm space-y-1">
                <div className="flex justify-between"><span className="text-muted-foreground">Min Order:</span><span>₹{coupon.minOrder}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Max Discount:</span><span>₹{coupon.maxDiscount}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Expires:</span><span>{new Date(coupon.expiryDate).toLocaleDateString('en-IN')}</span></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CouponsSection;
