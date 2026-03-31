import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import useScrollToTop from '@/hooks/useScrollToTop';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PrivacyPolicy = () => {
  useScrollToTop();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 mb-6 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: March 2026</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 prose prose-sm max-w-none">
          <p className="text-muted-foreground">
            Agrizin ("we", "our", "us") operates the Agrizin mobile application. We are committed to protecting your privacy.
          </p>

          <h2 className="text-lg font-semibold text-foreground mt-6">1. Information We Collect</h2>
          <p className="text-muted-foreground">
            We may collect personal information such as your name, phone number, email address, delivery address, and payment details (processed securely via third-party providers). We may also collect device information and location data if required.
          </p>

          <h2 className="text-lg font-semibold text-foreground mt-6">2. How We Use Information</h2>
          <p className="text-muted-foreground">
            We use your information to process orders, deliver products, improve our services, and send updates related to your orders or offers.
          </p>

          <h2 className="text-lg font-semibold text-foreground mt-6">3. Data Sharing</h2>
          <p className="text-muted-foreground">
            We do not sell your personal data. We may share data with delivery partners, payment gateways, and legal authorities if required.
          </p>

          <h2 className="text-lg font-semibold text-foreground mt-6">4. Data Security</h2>
          <p className="text-muted-foreground">
            We implement reasonable security measures to protect your data. However, no system is completely secure.
          </p>

          <h2 className="text-lg font-semibold text-foreground mt-6">5. User Rights</h2>
          <p className="text-muted-foreground">
            You can update your personal information or request account deletion by contacting us.
          </p>

          <h2 className="text-lg font-semibold text-foreground mt-6">6. Children's Privacy</h2>
          <p className="text-muted-foreground">
            Our app is not intended for children under 13.
          </p>

          <h2 className="text-lg font-semibold text-foreground mt-6">7. Changes to This Policy</h2>
          <p className="text-muted-foreground">
            We may update this policy from time to time.
          </p>

          <h2 className="text-lg font-semibold text-foreground mt-6">8. Contact Us</h2>
          <p className="text-muted-foreground">
            Email: <a href="mailto:agrizincontact@gmail.com" className="text-primary underline">agrizincontact@gmail.com</a>
          </p>
        </div>
      </div>
      
      <div className="h-20 lg:hidden"></div>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
