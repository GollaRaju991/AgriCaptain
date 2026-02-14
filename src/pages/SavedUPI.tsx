import React from 'react';
import Header from '@/components/Header';
import MobileBottomNav from '@/components/MobileBottomNav';
import Footer from '@/components/Footer';
import SavedUPISection from '@/components/profile/sections/SavedUPISection';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const SavedUPI = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/auth" replace />;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-2xl mx-auto px-4 py-6 pb-24">
        <SavedUPISection />
      </div>
      <MobileBottomNav />
      <Footer />
    </div>
  );
};

export default SavedUPI;
