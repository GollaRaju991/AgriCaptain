import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import useScrollToTop from '@/hooks/useScrollToTop';

const RefundPolicy = () => {
  useScrollToTop();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">Refund Policy</h1>
          <p className="text-muted-foreground">Last updated: February 2026</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 prose prose-sm max-w-none">
          <h2 className="text-lg font-semibold text-foreground">1. Return Eligibility</h2>
          <p className="text-muted-foreground">Products can be returned within 7 days of delivery if they are damaged, defective, or not as described. Items must be unused and in their original packaging.</p>

          <h2 className="text-lg font-semibold text-foreground mt-6">2. Non-Returnable Items</h2>
          <p className="text-muted-foreground">Perishable goods such as seeds (if opened), fertilizers (if opened), and pesticides cannot be returned once the seal is broken. Custom or bulk orders are also non-returnable.</p>

          <h2 className="text-lg font-semibold text-foreground mt-6">3. Return Process</h2>
          <p className="text-muted-foreground">To initiate a return, contact our customer support at agrizincontact@gmail.com or call 9912365550. Provide your order number and reason for return. Our team will guide you through the process.</p>

          <h2 className="text-lg font-semibold text-foreground mt-6">4. Refund Timeline</h2>
          <p className="text-muted-foreground">Once the returned product is received and inspected, refunds will be processed within 5-7 business days. The refund will be credited to the original payment method.</p>

          <h2 className="text-lg font-semibold text-foreground mt-6">5. Partial Refunds</h2>
          <p className="text-muted-foreground">Partial refunds may be issued for items that show signs of use or are not in original condition.</p>

          <h2 className="text-lg font-semibold text-foreground mt-6">6. Damaged or Wrong Products</h2>
          <p className="text-muted-foreground">If you receive a damaged or incorrect product, please contact us within 48 hours of delivery with photographs. We will arrange a free replacement or full refund.</p>

          <h2 className="text-lg font-semibold text-foreground mt-6">7. Contact</h2>
          <p className="text-muted-foreground">For refund-related queries, reach us at agrizincontact@gmail.com or call 9912365550.</p>
        </div>
      </div>
      
      <div className="h-20 lg:hidden"></div>
      <Footer />
    </div>
  );
};

export default RefundPolicy;
