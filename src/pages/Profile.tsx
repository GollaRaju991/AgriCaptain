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
  Smartphone
} from 'lucide-react';
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
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Profile Header */}
          <Card className="bg-white shadow-md rounded-lg overflow-hidden">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <Avatar className="h-12 w-12">
                <AvatarFallback>{profile.name?.charAt(0).toUpperCase() || '?'}</AvatarFallback>
              </Avatar>
              <div className="ml-4">
                <CardTitle className="text-lg font-semibold">{profile.name || 'No Name'}</CardTitle>
                <p className="text-sm text-gray-500">User ID: {user?.id}</p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>No Address</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Phone className="h-4 w-4 mr-1" />
                  <span>{profile.phone || 'No Phone'}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Mail className="h-4 w-4 mr-1" />
                  <span>{user?.email || 'No Email'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setIsEditProfileOpen(true)}>
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div className="ml-3">
                  <CardTitle className="text-base">Edit Profile</CardTitle>
                  <p className="text-sm text-gray-600">Update your profile information</p>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
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
                  <p className="text-sm text-gray-600">Add, edit, or remove your addresses</p>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
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
                  <p className="text-sm text-gray-600">View your order history</p>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
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
                  <p className="text-sm text-gray-600">Your favorite items</p>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
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
                  <p className="text-sm text-gray-600">Your earned rewards and points</p>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
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
                  <p className="text-sm text-gray-600">Your latest updates</p>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
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
                  <p className="text-sm text-gray-600">Manage your payment options</p>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
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
                  <p className="text-sm text-gray-600">Customize your account settings</p>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
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
                  <p className="text-sm text-gray-600">Download our mobile app</p>
                </div>
              </CardHeader>
              <CardContent>
                <MobileAppDownload />
              </CardContent>
            </Card>
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
