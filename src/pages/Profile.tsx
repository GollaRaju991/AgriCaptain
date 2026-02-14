import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MobileBottomNav from "@/components/MobileBottomNav";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  Edit, 
  Package, 
  Heart, 
  Gift, 
  Bell, 
  CreditCard, 
  Settings, 
  LogOut, 
  Star,
  Smartphone,
  Languages,
  BellRing,
  HelpCircle,
  FileText,
  MessageCircleQuestion,
  ChevronRight,
  ShieldCheck,
  Store,
  Headphones,
  Ticket,
  IndianRupee,
  Wallet
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import EditProfile from '@/components/EditProfile';
import AddressManager from '@/components/AddressManager';
import LogoutConfirmation from '@/components/LogoutConfirmation';
import { supabase } from '@/integrations/supabase/client';
import useScrollToTop from '@/hooks/useScrollToTop';
import MobileAppDownload from '@/components/MobileAppDownload';
import DesktopProfileLayout from '@/components/profile/DesktopProfileLayout';

const Profile = () => {
  const { user, loading: authLoading, logout } = useAuth();
  const isMobile = useIsMobile();
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isAddressManagerOpen, setIsAddressManagerOpen] = useState(false);
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);
  const [profile, setProfile] = useState<{
    name: string | null;
    phone: string | null;
  }>({
    name: null,
    phone: null,
  });

  // Make scroll to top optional - don't auto-scroll on profile page
  useScrollToTop(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('name, phone')
        .eq('id', user?.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
      } else {
        setProfile({
          name: data?.name || null,
          phone: data?.phone || null,
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <svg className="animate-spin h-8 w-8 text-green-500" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const handleSignOut = () => {
    setShowLogoutConfirmation(true);
  };

  const confirmLogout = async () => {
    await logout();
    setShowLogoutConfirmation(false);
  };

  const handleAddressSelect = (address: any) => {
    console.log('Selected address:', address);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {isMobile && <EditProfile />}

      {isMobile && (
        <AddressManager
          onAddressSelect={handleAddressSelect}
          selectedAddressId=""
        />
      )}

      <LogoutConfirmation
        isOpen={showLogoutConfirmation}
        onClose={() => setShowLogoutConfirmation(false)}
        onConfirm={confirmLogout}
      />
      
      {isMobile ? (
        /* =================== MOBILE FLIPKART-STYLE LAYOUT =================== */
        <div className="pb-24">
          {/* User Profile Header */}
          <div className="bg-white px-4 py-4 flex items-center space-x-3 border-b">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-blue-100 text-blue-600 font-bold text-lg">
                {profile.name?.charAt(0).toUpperCase() || '?'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-base font-bold text-foreground">{profile.name || 'User'}</h2>
              <p className="text-xs text-muted-foreground">{profile.phone || user?.email || ''}</p>
            </div>
          </div>

          {/* Quick Action Buttons - 2x2 grid */}
          <div className="bg-white px-4 py-3 grid grid-cols-2 gap-3 border-b">
            <a href="/orders" className="flex items-center space-x-2 border rounded-lg px-3 py-3 hover:bg-gray-50">
              <Package className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-foreground">Orders</span>
            </a>
            <a href="/wishlist" className="flex items-center space-x-2 border rounded-lg px-3 py-3 hover:bg-gray-50">
              <Heart className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-foreground">Wishlist</span>
            </a>
            <a href="/coupons" className="flex items-center space-x-2 border rounded-lg px-3 py-3 hover:bg-gray-50">
              <Ticket className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-foreground">Coupons</span>
            </a>
            <a href="/help-center" className="flex items-center space-x-2 border rounded-lg px-3 py-3 hover:bg-gray-50">
              <Headphones className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-foreground">Help Center</span>
            </a>
          </div>

          {/* Blue divider */}
          <div className="h-2 bg-blue-50"></div>

          {/* Account Settings Section */}
          <div className="bg-white">
            <h3 className="px-4 pt-4 pb-2 text-base font-bold text-foreground">Account Settings</h3>
            <div className="divide-y divide-gray-100">
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); setIsEditProfileOpen(true); }}
                className="flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 active:bg-gray-100"
              >
                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-blue-600" />
                  <span className="text-sm text-foreground">Edit Profile</span>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </a>

              <a href="/gift-cards" className="flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 active:bg-gray-100">
                <div className="flex items-center space-x-3">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                  <span className="text-sm text-foreground">Saved Credit / Debit & Gift Cards</span>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </a>

              <a href="/profile/saved-upi" className="flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 active:bg-gray-100">
                <div className="flex items-center space-x-3">
                  <Wallet className="h-5 w-5 text-blue-600" />
                  <span className="text-sm text-foreground">Saved UPI</span>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </a>

              <a href="/profile/saved-cards" className="flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 active:bg-gray-100">
                <div className="flex items-center space-x-3">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                  <span className="text-sm text-foreground">Saved Cards</span>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </a>

              <a
                href="#"
                onClick={(e) => { e.preventDefault(); setIsAddressManagerOpen(true); }}
                className="flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 active:bg-gray-100"
              >
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  <span className="text-sm text-foreground">Saved Addresses</span>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </a>

              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  const langBtn = document.querySelector('[data-language-trigger]') as HTMLButtonElement;
                  langBtn?.click();
                }}
                className="flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 active:bg-gray-100"
              >
                <div className="flex items-center space-x-3">
                  <Languages className="h-5 w-5 text-blue-600" />
                  <span className="text-sm text-foreground">Select Language</span>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </a>

              <a href="/notifications" className="flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 active:bg-gray-100">
                <div className="flex items-center space-x-3">
                  <BellRing className="h-5 w-5 text-blue-600" />
                  <span className="text-sm text-foreground">Notification Settings</span>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </a>

              <a href="#" className="flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 active:bg-gray-100">
                <div className="flex items-center space-x-3">
                  <ShieldCheck className="h-5 w-5 text-blue-600" />
                  <span className="text-sm text-foreground">Privacy Center</span>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </a>
            </div>
          </div>

          {/* Blue divider */}
          <div className="h-2 bg-blue-50"></div>

          {/* Finance Options Section */}
          <div className="bg-white">
            <h3 className="px-4 pt-4 pb-2 text-base font-bold text-foreground">Finance Options</h3>
            <div className="divide-y divide-gray-100">
              <a href="/loans" className="flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 active:bg-gray-100">
                <div className="flex items-center space-x-3">
                  <IndianRupee className="h-5 w-5 text-blue-600" />
                  <div>
                    <span className="text-sm font-medium text-foreground">Agricultural Loans</span>
                    <p className="text-xs text-muted-foreground">Apply for farm loans & equipment finance</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </a>
            </div>
          </div>

          {/* Blue divider */}
          <div className="h-2 bg-blue-50"></div>

          {/* Earn with Agrizin */}
          <div className="bg-white">
            <h3 className="px-4 pt-4 pb-2 text-base font-bold text-foreground">Earn with Agrizin</h3>
            <div className="divide-y divide-gray-100">
              <a href="/become-seller" className="flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 active:bg-gray-100">
                <div className="flex items-center space-x-3">
                  <Store className="h-5 w-5 text-blue-600" />
                  <span className="text-sm text-foreground">Sell on Agrizin</span>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </a>
            </div>
          </div>

          {/* Blue divider */}
          <div className="h-2 bg-blue-50"></div>

          {/* Feedback & Information */}
          <div className="bg-white">
            <h3 className="px-4 pt-4 pb-2 text-base font-bold text-foreground">Feedback & Information</h3>
            <div className="divide-y divide-gray-100">
              <a href="/terms-policies" className="flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 active:bg-gray-100">
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <span className="text-sm text-foreground">Terms, Policies and Licenses</span>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </a>
              <a href="/faqs" className="flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 active:bg-gray-100">
                <div className="flex items-center space-x-3">
                  <MessageCircleQuestion className="h-5 w-5 text-blue-600" />
                  <span className="text-sm text-foreground">Browse FAQs</span>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </a>
            </div>
          </div>

          {/* Logout Button */}
          <div className="bg-gray-100 px-4 py-4">
            <Button
              variant="outline"
              className="w-full border-gray-300 text-blue-600 font-semibold hover:bg-gray-50"
              onClick={handleSignOut}
            >
              Log Out
            </Button>
          </div>
        </div>
      ) : (
        /* =================== DESKTOP LAYOUT =================== */
        <DesktopProfileLayout
          profile={profile}
          userEmail={user?.email || null}
          userId={user?.id || ''}
          onSignOut={handleSignOut}
          onProfileUpdate={fetchProfile}
        />
      )}
      <div className="h-20 lg:hidden"></div>

<MobileBottomNav />
      <Footer />
    </div>
  );
};

export default Profile;
