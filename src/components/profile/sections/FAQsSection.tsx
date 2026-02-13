import React from 'react';

const FAQsSection: React.FC = () => (
  <div className="bg-card border rounded-lg p-6">
    <h2 className="text-lg font-bold text-foreground mb-4">FAQs</h2>
    <div className="space-y-4 text-sm">
      <div>
        <p className="font-semibold text-foreground">What happens when I update my email address (or mobile number)?</p>
        <p className="text-muted-foreground mt-1">Your login email id (or mobile number) changes, likewise. You'll receive all your account related communication on your updated email address (or mobile number).</p>
      </div>
      <div>
        <p className="font-semibold text-foreground">When will my account be updated with the new email address (or mobile number)?</p>
        <p className="text-muted-foreground mt-1">It happens as soon as you confirm the verification code sent to your email (or mobile) and save the changes.</p>
      </div>
      <div>
        <p className="font-semibold text-foreground">Does my Seller account get affected when I update my email address?</p>
        <p className="text-muted-foreground mt-1">Agrizin has a 'single sign-on' policy. Any changes will reflect in your Seller account also.</p>
      </div>
    </div>
  </div>
);

export default FAQsSection;
