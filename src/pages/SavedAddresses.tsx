import React from 'react';
import Header from '@/components/Header';
import MobileBottomNav from '@/components/MobileBottomNav';
import Footer from '@/components/Footer';
import AddressManager from '@/components/AddressManager';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const SavedAddresses = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/auth" replace />;

  const handleAddressSelect = (address: any) => {
    console.log('Selected address:', address);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-2xl mx-auto px-4 py-6 pb-24">
        <AddressManager onAddressSelect={handleAddressSelect} selectedAddressId="" />
      </div>
      <MobileBottomNav />
      <Footer />
    </div>
  );
};

export default SavedAddresses;
