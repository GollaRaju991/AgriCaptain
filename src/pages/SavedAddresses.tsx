import React from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import MobileBottomNav from '@/components/MobileBottomNav';
import AddressManager from '@/components/AddressManager';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const SavedAddresses = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  if (loading) return null;
  if (!user) return <Navigate to="/auth" replace />;

  const handleAddressSelect = (address: any) => {
    console.log('Selected address:', address);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {isMobile ? (
        <div className="bg-white border-b px-4 py-3 flex items-center gap-3 sticky top-0 z-40">
          <button onClick={() => navigate('/profile')} className="p-1">
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <h1 className="text-base font-semibold text-foreground">Saved Addresses</h1>
        </div>
      ) : (
        <Header />
      )}
      <div className="max-w-2xl mx-auto px-4 py-6 pb-24">
        <AddressManager onAddressSelect={handleAddressSelect} selectedAddressId="" />
      </div>
      <MobileBottomNav />
      {!isMobile && <Footer />}
    </div>
  );
};

export default SavedAddresses;
