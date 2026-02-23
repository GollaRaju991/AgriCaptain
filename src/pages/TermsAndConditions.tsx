import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import useScrollToTop from '@/hooks/useScrollToTop';

const TermsAndConditions = () => {
  useScrollToTop();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">Terms and Conditions</h1>
          <p className="text-muted-foreground">Last updated: February 2026</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 prose prose-sm max-w-none">
          <h2 className="text-lg font-semibold text-foreground">1. Introduction</h2>
          <p className="text-muted-foreground">Welcome to Agrizin. By accessing and using our platform, you agree to be bound by these Terms and Conditions. Please read them carefully before using our services.</p>

          <h2 className="text-lg font-semibold text-foreground mt-6">2. Account Registration</h2>
          <p className="text-muted-foreground">You must provide accurate and complete information when creating an account. You are responsible for maintaining the confidentiality of your login credentials and for all activities under your account.</p>

          <h2 className="text-lg font-semibold text-foreground mt-6">3. Product Information</h2>
          <p className="text-muted-foreground">We strive to provide accurate product descriptions, images, and pricing. However, we do not warrant that all product information is complete, reliable, or error-free. We reserve the right to correct any errors and update information at any time.</p>

          <h2 className="text-lg font-semibold text-foreground mt-6">4. Orders and Payments</h2>
          <p className="text-muted-foreground">All orders are subject to product availability and confirmation. We reserve the right to refuse or cancel any order. Payment must be made through our approved payment methods including UPI, debit/credit cards, net banking, and cash on delivery.</p>

          <h2 className="text-lg font-semibold text-foreground mt-6">5. Pricing</h2>
          <p className="text-muted-foreground">All prices are listed in Indian Rupees (₹) and include applicable taxes unless stated otherwise. Prices are subject to change without prior notice.</p>

          <h2 className="text-lg font-semibold text-foreground mt-6">6. User Conduct</h2>
          <p className="text-muted-foreground">Users agree not to misuse the platform, engage in fraudulent activities, or violate any applicable laws while using Agrizin services.</p>

          <h2 className="text-lg font-semibold text-foreground mt-6">7. Intellectual Property</h2>
          <p className="text-muted-foreground">All content on this platform, including logos, text, images, and software, is the property of Agrizin and is protected by intellectual property laws.</p>

          <h2 className="text-lg font-semibold text-foreground mt-6">8. Limitation of Liability</h2>
          <p className="text-muted-foreground">Agrizin shall not be liable for any indirect, incidental, or consequential damages arising from the use of our platform or products purchased through it.</p>

          <h2 className="text-lg font-semibold text-foreground mt-6">9. Contact</h2>
          <p className="text-muted-foreground">For any questions regarding these Terms and Conditions, please contact us at agrizincontact@gmail.com or call 9912365550.</p>
        </div>
      </div>
      
      <div className="h-20 lg:hidden"></div>
      <Footer />
    </div>
  );
};

export default TermsAndConditions;
