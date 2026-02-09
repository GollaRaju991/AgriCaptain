import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MobileBottomNav from "@/components/MobileBottomNav";
import { 
  FileText, 
  Shield, 
  Lock,
  ChevronRight,
  ScrollText,
  Scale
} from 'lucide-react';
import useScrollToTop from '@/hooks/useScrollToTop';

const TermsPolicies = () => {
  useScrollToTop();

  const policies = [
    { icon: FileText, title: 'Terms of Use', description: 'Terms and conditions for using Agrizin', href: '#terms' },
    { icon: Lock, title: 'Privacy Policy', description: 'How we collect and use your data', href: '#privacy' },
    { icon: Shield, title: 'Return Policy', description: 'Our return and refund guidelines', href: '#returns' },
    { icon: ScrollText, title: 'Shipping Policy', description: 'Delivery terms and conditions', href: '#shipping' },
    { icon: Scale, title: 'Grievance Policy', description: 'How to raise and resolve complaints', href: '#grievance' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">Terms, Policies & Licenses</h1>
          <p className="text-muted-foreground">Legal information and policies</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden divide-y divide-gray-100">
          {policies.map((policy, index) => (
            <a 
              key={index}
              href={policy.href}
              className="flex items-center justify-between p-4 hover:bg-gray-50"
            >
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <policy.icon className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <span className="text-sm font-medium text-foreground">{policy.title}</span>
                  <p className="text-xs text-muted-foreground">{policy.description}</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </a>
          ))}
        </div>

        {/* Sample Terms Content */}
        <div id="terms" className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Terms of Use</h2>
          <div className="prose prose-sm text-muted-foreground">
            <p>Welcome to Agrizin. By accessing and using our platform, you agree to comply with these terms and conditions.</p>
            <h3 className="text-foreground font-medium mt-4">1. Account Registration</h3>
            <p>You must provide accurate information when creating an account. You are responsible for maintaining the confidentiality of your account credentials.</p>
            <h3 className="text-foreground font-medium mt-4">2. Product Information</h3>
            <p>We strive to provide accurate product descriptions and pricing. However, we reserve the right to correct any errors.</p>
            <h3 className="text-foreground font-medium mt-4">3. Orders and Payments</h3>
            <p>All orders are subject to availability and confirmation. Payment must be made through our approved payment methods.</p>
          </div>
        </div>
      </div>
      
      <div className="h-20 lg:hidden"></div>
      <MobileBottomNav />
      <Footer />
    </div>
  );
};

export default TermsPolicies;
