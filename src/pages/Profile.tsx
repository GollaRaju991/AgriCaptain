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
  ChevronRight
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

      <EditProfile />

      <AddressManager
        onAddressSelect={handleAddressSelect}
        selectedAddressId=""
      />

      <LogoutConfirmation
        isOpen={showLogoutConfirmation}
        onClose={() => setShowLogoutConfirmation(false)}
        onConfirm={confirmLogout}
      />
      
      <div className="max-w-7xl mx-auto px-4 py-8 lg:px-4 lg:py-8">
        <div className="space-y-6">
          {/* Profile Header */}
          <Card className="bg-white shadow-md rounded-lg overflow-hidden">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <Avatar className="h-12 w-12">
                <AvatarFallback>{profile.name?.charAt(0).toUpperCase() || '?'}</AvatarFallback>
              </Avatar>
              <div className="ml-4">
                <CardTitle className="text-lg font-semibold">{profile.name || 'No Name'}</CardTitle>
                <p className="text-sm text-muted-foreground">User ID: {user?.id}</p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center text-muted-foreground">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>No Address</span>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <Phone className="h-4 w-4 mr-1" />
                  <span>{profile.phone || 'No Phone'}</span>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <Mail className="h-4 w-4 mr-1" />
                  <span className="truncate max-w-[150px]">{user?.email || 'No Email'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mobile-only Flipkart-style Account Settings */}
          {isMobile && (
            <>
              {/* Account Settings Section */}
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 border-b">
                  <h2 className="text-base font-semibold text-foreground">Account Settings</h2>
                </div>
                <div className="divide-y divide-gray-100">
                  <a 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      // Trigger language dialog - we'll handle this through a state
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
                  
                  <a 
                    href="/notifications" 
                    className="flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 active:bg-gray-100"
                  >
                    <div className="flex items-center space-x-3">
                      <BellRing className="h-5 w-5 text-blue-600" />
                      <span className="text-sm text-foreground">Notification Settings</span>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </a>
                  
                  <a 
                    href="/help-center" 
                    className="flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 active:bg-gray-100"
                  >
                    <div className="flex items-center space-x-3">
                      <HelpCircle className="h-5 w-5 text-blue-600" />
                      <span className="text-sm text-foreground">Help Center</span>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </a>
                </div>
              </div>

              {/* Feedback & Information Section */}
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 border-b">
                  <h2 className="text-base font-semibold text-foreground">Feedback & Information</h2>
                </div>
                <div className="divide-y divide-gray-100">
                  <a 
                    href="/terms-policies" 
                    className="flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 active:bg-gray-100"
                  >
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <span className="text-sm text-foreground">Terms, Policies and Licenses</span>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </a>
                  
                  <a 
                    href="/faqs" 
                    className="flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 active:bg-gray-100"
                  >
                    <div className="flex items-center space-x-3">
                      <MessageCircleQuestion className="h-5 w-5 text-blue-600" />
                      <span className="text-sm text-foreground">Browse FAQs</span>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </a>
                </div>
              </div>
            </>
          )}

          {/* Profile Sections - Desktop grid, Mobile list */}
          <div className={isMobile ? "space-y-0 bg-white rounded-lg shadow-sm overflow-hidden divide-y divide-gray-100" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"}>
            {isMobile ? (
              <>
                {/* Mobile list style */}
                <a 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); setIsEditProfileOpen(true); }}
                  className="flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 active:bg-gray-100"
                >
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <span className="text-sm font-medium text-foreground">Edit Profile</span>
                      <p className="text-xs text-muted-foreground">Update your profile information</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </a>

                <a 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); setIsAddressManagerOpen(true); }}
                  className="flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 active:bg-gray-100"
                >
                  <div className="flex items-center space-x-3">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <MapPin className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <span className="text-sm font-medium text-foreground">Manage Addresses</span>
                      <p className="text-xs text-muted-foreground">Add, edit, or remove your addresses</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </a>

                <a 
                  href="/orders" 
                  className="flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 active:bg-gray-100"
                >
                  <div className="flex items-center space-x-3">
                    <div className="bg-orange-100 p-2 rounded-lg">
                      <Package className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <span className="text-sm font-medium text-foreground">Orders</span>
                      <p className="text-xs text-muted-foreground">View your order history</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </a>

                <a 
                  href="/wishlist" 
                  className="flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 active:bg-gray-100"
                >
                  <div className="flex items-center space-x-3">
                    <div className="bg-red-100 p-2 rounded-lg">
                      <Heart className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <span className="text-sm font-medium text-foreground">Wishlist</span>
                      <p className="text-xs text-muted-foreground">Your favorite items</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </a>

                <a 
                  href="/gift-cards" 
                  className="flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 active:bg-gray-100"
                >
                  <div className="flex items-center space-x-3">
                    <div className="bg-teal-100 p-2 rounded-lg">
                      <Gift className="h-5 w-5 text-teal-600" />
                    </div>
                    <div>
                      <span className="text-sm font-medium text-foreground">Gift Cards</span>
                      <p className="text-xs text-muted-foreground">Your gift cards and rewards</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </a>

                <a 
                  href="/coupons" 
                  className="flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 active:bg-gray-100"
                >
                  <div className="flex items-center space-x-3">
                    <div className="bg-yellow-100 p-2 rounded-lg">
                      <CreditCard className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <span className="text-sm font-medium text-foreground">Coupons</span>
                      <p className="text-xs text-muted-foreground">Your saved coupons</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </a>
              </>
            ) : (
              <>
                {/* Desktop card style */}
                <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setIsEditProfileOpen(true)}>
                  <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="ml-3">
                      <CardTitle className="text-base">Edit Profile</CardTitle>
                      <p className="text-sm text-muted-foreground">Update your profile information</p>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Manage your personal details, such as name, and phone number.
                    </p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setIsAddressManagerOpen(true)}>
                  <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <MapPin className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="ml-3">
                      <CardTitle className="text-base">Manage Addresses</CardTitle>
                      <p className="text-sm text-muted-foreground">Add, edit, or remove your addresses</p>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Manage your saved addresses for faster checkout and delivery.
                    </p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                    <div className="bg-orange-100 p-2 rounded-lg">
                      <Package className="h-5 w-5 text-orange-600" />
                    </div>
                    <div className="ml-3">
                      <CardTitle className="text-base">Orders</CardTitle>
                      <p className="text-sm text-muted-foreground">View your order history</p>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Track your past orders and view details.
                    </p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                    <div className="bg-red-100 p-2 rounded-lg">
                      <Heart className="h-5 w-5 text-red-600" />
                    </div>
                    <div className="ml-3">
                      <CardTitle className="text-base">Wishlist</CardTitle>
                      <p className="text-sm text-muted-foreground">Your favorite items</p>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      View and manage items you've saved for later.
                    </p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                    <div className="bg-teal-100 p-2 rounded-lg">
                      <Gift className="h-5 w-5 text-teal-600" />
                    </div>
                    <div className="ml-3">
                      <CardTitle className="text-base">Rewards</CardTitle>
                      <p className="text-sm text-muted-foreground">Your earned rewards and points</p>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Check your rewards balance and redeem points.
                    </p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                    <div className="bg-purple-100 p-2 rounded-lg">
                      <Bell className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="ml-3">
                      <CardTitle className="text-base">Notifications</CardTitle>
                      <p className="text-sm text-muted-foreground">Your latest updates</p>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Stay informed about your orders and account activity.
                    </p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                    <div className="bg-yellow-100 p-2 rounded-lg">
                      <CreditCard className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div className="ml-3">
                      <CardTitle className="text-base">Payment Methods</CardTitle>
                      <p className="text-sm text-muted-foreground">Manage your payment options</p>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Add, edit, or remove your credit and debit cards.
                    </p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                    <div className="bg-gray-100 p-2 rounded-lg">
                      <Settings className="h-5 w-5 text-gray-600" />
                    </div>
                    <div className="ml-3">
                      <CardTitle className="text-base">Settings</CardTitle>
                      <p className="text-sm text-muted-foreground">Customize your account settings</p>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Configure your preferences and manage your account.
                    </p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                    <div className="bg-purple-100 p-2 rounded-lg">
                      <Smartphone className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="ml-3">
                      <CardTitle className="text-base">Mobile App</CardTitle>
                      <p className="text-sm text-muted-foreground">Download our mobile app</p>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <MobileAppDownload />
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          <Button variant="destructive" className="w-full" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
      <div className="h-20 lg:hidden"></div>

<MobileBottomNav />
      <Footer />
    </div>
  );
};

export default Profile;
