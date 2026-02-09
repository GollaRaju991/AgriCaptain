import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MobileBottomNav from "@/components/MobileBottomNav";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import useScrollToTop from '@/hooks/useScrollToTop';

const FAQs = () => {
  useScrollToTop();

  const faqCategories = [
    {
      id: 'orders',
      title: 'Orders',
      faqs: [
        { q: 'How do I track my order?', a: 'You can track your order from the "Orders" section in your account. Click on any order to see real-time tracking updates.' },
        { q: 'Can I cancel my order?', a: 'Yes, you can cancel your order before it is shipped. Go to Orders, select the order and click "Cancel Order".' },
        { q: 'How do I modify my order?', a: 'Orders cannot be modified once placed. Please cancel and place a new order with the correct items.' },
      ]
    },
    {
      id: 'payments',
      title: 'Payments',
      faqs: [
        { q: 'What payment methods are accepted?', a: 'We accept UPI, Credit/Debit Cards, Net Banking, and Cash on Delivery (COD).' },
        { q: 'Is COD available?', a: 'Yes, Cash on Delivery is available for most locations. A small COD charge may apply.' },
        { q: 'My payment failed but money was deducted', a: 'Don\'t worry! Failed transaction amounts are automatically refunded within 5-7 business days.' },
      ]
    },
    {
      id: 'delivery',
      title: 'Delivery',
      faqs: [
        { q: 'What are the delivery charges?', a: 'Delivery is free for orders above ₹500. For orders below ₹500, a delivery charge of ₹40 applies.' },
        { q: 'How long does delivery take?', a: 'Standard delivery takes 3-7 business days depending on your location.' },
        { q: 'Do you deliver to my area?', a: 'We deliver to most areas across India. Enter your pincode at checkout to check availability.' },
      ]
    },
    {
      id: 'returns',
      title: 'Returns & Refunds',
      faqs: [
        { q: 'What is the return policy?', a: 'Most products can be returned within 7 days of delivery if unused and in original packaging.' },
        { q: 'How do I return a product?', a: 'Go to Orders, select the order, and click "Return". Our team will arrange pickup.' },
        { q: 'When will I get my refund?', a: 'Refunds are processed within 5-7 business days after the returned item is received and inspected.' },
      ]
    },
    {
      id: 'account',
      title: 'Account',
      faqs: [
        { q: 'How do I reset my password?', a: 'Click on "Forgot Password" on the login page and follow the instructions sent to your registered phone/email.' },
        { q: 'How do I update my profile?', a: 'Go to Account > Edit Profile to update your name, phone number, and other details.' },
        { q: 'How do I delete my account?', a: 'Contact our support team to request account deletion. This action is irreversible.' },
      ]
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">Frequently Asked Questions</h1>
          <p className="text-muted-foreground">Find answers to common questions</p>
        </div>

        <div className="space-y-6">
          {faqCategories.map((category) => (
            <div key={category.id} id={category.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b">
                <h2 className="text-base font-semibold text-foreground">{category.title}</h2>
              </div>
              <Accordion type="single" collapsible className="px-4">
                {category.faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`${category.id}-${index}`}>
                    <AccordionTrigger className="text-sm text-left">
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>
      </div>
      
      <div className="h-20 lg:hidden"></div>
      <MobileBottomNav />
      <Footer />
    </div>
  );
};

export default FAQs;
