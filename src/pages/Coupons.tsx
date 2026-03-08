
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Gift, Copy, Calendar, Percent } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import useScrollToTop from '@/hooks/useScrollToTop';

const Coupons = () => {
  const { toast } = useToast();
  
  // Scroll to top when component mounts
  useScrollToTop();

  const coupons = [
    {
      id: 1,
      code: 'AGRI20',
      title: '20% Off on All Products',
      description: 'Get 20% discount on all agricultural products',
      discount: 20,
      minOrder: 500,
      maxDiscount: 200,
      expiryDate: '2024-12-31',
      isUsed: false
    },
    {
      id: 2,
      code: 'FIRSTBUY',
      title: 'First Purchase Discount',
      description: 'Special discount for first-time buyers',
      discount: 15,
      minOrder: 300,
      maxDiscount: 150,
      expiryDate: '2024-12-31',
      isUsed: false
    },
    {
      id: 3,
      code: 'BULK100',
      title: 'Bulk Order Discount',
      description: 'For orders above ₹1000',
      discount: 25,
      minOrder: 1000,
      maxDiscount: 500,
      expiryDate: '2024-12-31',
      isUsed: true
    }
  ];

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Coupon code copied!",
      description: `${code} has been copied to your clipboard`,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Coupons</h1>
          <p className="text-gray-600">Save money with exclusive discount coupons</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coupons.map((coupon) => (
            <Card key={coupon.id} className={`hover:shadow-lg transition-shadow ${
              coupon.isUsed ? 'opacity-75 bg-gray-50' : 'bg-white'
            }`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Gift className="h-5 w-5 text-green-600" />
                    <Badge variant={coupon.isUsed ? "secondary" : "default"} 
                           className={coupon.isUsed ? "" : "bg-green-100 text-green-800"}>
                      {coupon.isUsed ? "Used" : "Available"}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-1 text-green-600">
                    <Percent className="h-4 w-4" />
                    <span className="font-bold text-lg">{coupon.discount}%</span>
                  </div>
                </div>
                <CardTitle className="text-lg">{coupon.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">{coupon.description}</p>
                
                {/* Coupon Code */}
                <div className="bg-gray-100 p-3 rounded-lg border-2 border-dashed border-gray-300">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-lg tracking-wider">
                      {coupon.code}
                    </span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleCopyCode(coupon.code)}
                      disabled={coupon.isUsed}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Coupon Details */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Min Order:</span>
                    <span className="font-medium">₹{coupon.minOrder}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Max Discount:</span>
                    <span className="font-medium">₹{coupon.maxDiscount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Expires:</span>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3 text-gray-400" />
                      <span className="font-medium text-sm">
                        {new Date(coupon.expiryDate).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <Button 
                  className="w-full" 
                  variant={coupon.isUsed ? "secondary" : "default"}
                  disabled={coupon.isUsed}
                  onClick={() => handleCopyCode(coupon.code)}
                >
                  {coupon.isUsed ? "Already Used" : "Copy & Use Code"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Coupons State */}
        {coupons.length === 0 && (
          <Card className="text-center py-16">
            <CardContent>
              <Gift className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No coupons available</h3>
              <p className="text-gray-600 mb-6">Check back later for exciting discount offers!</p>
              <Button>Browse Products</Button>
            </CardContent>
          </Card>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Coupons;
