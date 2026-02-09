import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MobileBottomNav from "@/components/MobileBottomNav";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  HelpCircle, 
  Phone, 
  Mail, 
  MessageCircle,
  ChevronRight,
  Package,
  CreditCard,
  Truck,
  RotateCcw
} from 'lucide-react';
import useScrollToTop from '@/hooks/useScrollToTop';

const HelpCenter = () => {
  useScrollToTop();

  const helpTopics = [
    { icon: Package, title: 'Order Issues', description: 'Track, cancel or return your orders', href: '/faqs#orders' },
    { icon: CreditCard, title: 'Payment Problems', description: 'Refunds, failed payments & more', href: '/faqs#payments' },
    { icon: Truck, title: 'Delivery Help', description: 'Shipping, delivery status & delays', href: '/faqs#delivery' },
    { icon: RotateCcw, title: 'Returns & Refunds', description: 'Return policy and refund process', href: '/faqs#returns' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">Help Center</h1>
          <p className="text-muted-foreground">How can we help you today?</p>
        </div>

        {/* Quick Help Topics */}
        <div className="space-y-3 mb-8">
          <h2 className="text-lg font-semibold text-foreground">Quick Help</h2>
          <div className="grid gap-3">
            {helpTopics.map((topic, index) => (
              <a 
                key={index}
                href={topic.href}
                className="flex items-center justify-between bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center space-x-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <topic.icon className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-foreground">{topic.title}</span>
                    <p className="text-xs text-muted-foreground">{topic.description}</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </a>
            ))}
          </div>
        </div>

        {/* Contact Us */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Contact Us</h2>
          <div className="bg-white rounded-lg shadow-sm overflow-hidden divide-y divide-gray-100">
            <a 
              href="tel:+911234567890" 
              className="flex items-center justify-between p-4 hover:bg-gray-50"
            >
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Phone className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <span className="text-sm font-medium text-foreground">Call Us</span>
                  <p className="text-xs text-muted-foreground">+91 1234567890</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </a>
            
            <a 
              href="mailto:support@agrizin.com" 
              className="flex items-center justify-between p-4 hover:bg-gray-50"
            >
              <div className="flex items-center space-x-3">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <Mail className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <span className="text-sm font-medium text-foreground">Email Us</span>
                  <p className="text-xs text-muted-foreground">support@agrizin.com</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </a>
            
            <a 
              href="#chat" 
              className="flex items-center justify-between p-4 hover:bg-gray-50"
            >
              <div className="flex items-center space-x-3">
                <div className="bg-green-100 p-2 rounded-lg">
                  <MessageCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <span className="text-sm font-medium text-foreground">Live Chat</span>
                  <p className="text-xs text-muted-foreground">Chat with our support team</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </a>
          </div>
        </div>
      </div>
      
      <div className="h-20 lg:hidden"></div>
      <MobileBottomNav />
      <Footer />
    </div>
  );
};

export default HelpCenter;
