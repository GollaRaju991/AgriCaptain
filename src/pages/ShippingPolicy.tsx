import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import useScrollToTop from '@/hooks/useScrollToTop';

const ShippingPolicy = () => {
  useScrollToTop();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">Shipping Policy</h1>
          <p className="text-muted-foreground">Last updated: February 2026</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 prose prose-sm max-w-none">
          <h2 className="text-lg font-semibold text-foreground">1. Shipping Coverage</h2>
          <p className="text-muted-foreground">We currently deliver across India. Delivery availability may vary based on your pincode. Please check delivery availability at checkout.</p>

          <h2 className="text-lg font-semibold text-foreground mt-6">2. Delivery Timeline</h2>
          <p className="text-muted-foreground">Standard delivery takes 3-7 business days depending on your location. Metro cities may receive orders within 2-4 business days. Remote areas may take up to 10 business days.</p>

          <h2 className="text-lg font-semibold text-foreground mt-6">3. Shipping Charges</h2>
          <p className="text-muted-foreground">Free shipping is available on orders above ₹500. For orders below ₹500, a standard shipping fee of ₹49 will be applied. Express delivery options may incur additional charges.</p>

          <h2 className="text-lg font-semibold text-foreground mt-6">4. Order Tracking</h2>
          <p className="text-muted-foreground">Once your order is shipped, you will receive a tracking number via SMS and email. You can track your order status in the "My Orders" section of your account.</p>

          <h2 className="text-lg font-semibold text-foreground mt-6">5. Delivery Attempts</h2>
          <p className="text-muted-foreground">Our delivery partner will make up to 3 delivery attempts. If delivery is unsuccessful after 3 attempts, the order will be returned to our warehouse and a refund will be initiated.</p>

          <h2 className="text-lg font-semibold text-foreground mt-6">6. Bulk Orders</h2>
          <p className="text-muted-foreground">For bulk orders, shipping timelines and charges may vary. Please contact us at agrizincontact@gmail.com for bulk order shipping details.</p>

          <h2 className="text-lg font-semibold text-foreground mt-6">7. Contact</h2>
          <p className="text-muted-foreground">For shipping-related queries, reach us at agrizincontact@gmail.com or call 9912365550.</p>
        </div>
      </div>
      
      <div className="h-20 lg:hidden"></div>
      <Footer />
    </div>
  );
};

export default ShippingPolicy;
