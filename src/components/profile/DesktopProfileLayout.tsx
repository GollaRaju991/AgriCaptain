import React, { useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  User,
  Package,
  Gift,
  CreditCard,
  LogOut,
  ChevronRight,
  Bell,
  Heart,
  Ticket,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ProfileInformation from './sections/ProfileInformation';
import PanCardSection from './sections/PanCardSection';
import GiftCardsSection from './sections/GiftCardsSection';
import FAQsSection from './sections/FAQsSection';
import CouponsSection from './sections/CouponsSection';
import NotificationsSection from './sections/NotificationsSection';
import WishlistSection from './sections/WishlistSection';

type SidebarSection =
  | 'profile-info'
  | 'pan-card'
  | 'gift-cards'
  | 'saved-upi'
  | 'saved-cards'
  | 'coupons'
  | 'notifications'
  | 'wishlist'
  | 'faqs';

interface DesktopProfileLayoutProps {
  profile: { name: string | null; phone: string | null };
  userEmail: string | null;
  userId: string;
  onSignOut: () => void;
}

const DesktopProfileLayout: React.FC<DesktopProfileLayoutProps> = ({
  profile,
  userEmail,
  userId,
  onSignOut,
}) => {
  const [activeSection, setActiveSection] = useState<SidebarSection>('profile-info');
  const navigate = useNavigate();

  const sidebarLinkClass = (key: string) =>
    `block px-6 py-3.5 text-sm cursor-pointer hover:bg-primary/5 transition-colors ${
      activeSection === key ? 'text-primary font-semibold bg-primary/5 border-l-4 border-primary' : 'text-foreground'
    }`;

  const sectionHeader = (icon: React.ReactNode, label: string) => (
    <div className="flex items-center gap-3 px-6 pt-6 pb-2">
      <span className="text-primary">{icon}</span>
      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
    </div>
  );

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-10">
      <div className="flex gap-10 items-start">
        {/* ======== LEFT SIDEBAR ======== */}
        <div className="w-80 shrink-0 bg-card border rounded-xl shadow-sm overflow-hidden">
          {/* User header */}
          <div className="flex items-center gap-4 px-6 py-6 border-b bg-primary/5">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-primary/10 text-primary font-bold text-2xl">
                {profile.name?.charAt(0).toUpperCase() || '?'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-xs text-muted-foreground">Hello,</p>
              <p className="text-lg font-bold text-foreground">{profile.name || 'User'}</p>
            </div>
          </div>

          {/* MY ORDERS */}
          <div
            className="flex items-center justify-between px-6 py-5 border-b cursor-pointer hover:bg-primary/5 transition-colors"
            onClick={() => navigate('/orders')}
          >
            <div className="flex items-center gap-3">
              <Package className="h-5 w-5 text-primary" />
              <span className="text-sm font-bold uppercase tracking-wider text-muted-foreground">My Orders</span>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>

          {/* ACCOUNT SETTINGS */}
          {sectionHeader(<User className="h-5 w-5" />, 'Account Settings')}
          <div className="border-b pb-1">
            <span className={sidebarLinkClass('profile-info')} onClick={() => setActiveSection('profile-info')}>Profile Information</span>
            <span className={sidebarLinkClass('pan-card')} onClick={() => setActiveSection('pan-card')}>PAN Card Information</span>
          </div>

          {/* PAYMENTS */}
          {sectionHeader(<CreditCard className="h-5 w-5" />, 'Payments')}
          <div className="border-b pb-1">
            <span className={sidebarLinkClass('gift-cards')} onClick={() => setActiveSection('gift-cards')}>Gift Cards</span>
            <span className={sidebarLinkClass('saved-upi')} onClick={() => setActiveSection('saved-upi')}>Saved UPI</span>
            <span className={sidebarLinkClass('saved-cards')} onClick={() => setActiveSection('saved-cards')}>Saved Cards</span>
          </div>

          {/* MY STUFF */}
          {sectionHeader(<Gift className="h-5 w-5" />, 'My Stuff')}
          <div className="border-b pb-1">
            <span className={sidebarLinkClass('coupons')} onClick={() => setActiveSection('coupons')}>My Coupons</span>
            <span className={sidebarLinkClass('notifications')} onClick={() => setActiveSection('notifications')}>All Notifications</span>
            <span className={sidebarLinkClass('wishlist')} onClick={() => setActiveSection('wishlist')}>My Wishlist</span>
          </div>

          {/* LOGOUT */}
          <div
            className="flex items-center gap-3 px-6 py-5 cursor-pointer hover:bg-destructive/10 border-b transition-colors"
            onClick={onSignOut}
          >
            <LogOut className="h-5 w-5 text-primary" />
            <span className="text-sm font-semibold text-foreground">Logout</span>
          </div>

          {/* Frequently Visited */}
          <div className="px-6 py-5">
            <p className="text-xs font-semibold text-muted-foreground mb-2">Frequently Visited:</p>
            <div className="flex gap-4 text-xs text-primary">
              <span className="cursor-pointer hover:underline" onClick={() => navigate('/orders')}>Track Order</span>
              <span className="cursor-pointer hover:underline" onClick={() => navigate('/help-center')}>Help Center</span>
            </div>
          </div>
        </div>

        {/* ======== RIGHT CONTENT ======== */}
        <div className="flex-1 min-w-0">
          {activeSection === 'profile-info' && <ProfileInformation profile={profile} userEmail={userEmail} userId={userId} />}
          {activeSection === 'pan-card' && <PanCardSection userId={userId} />}
          {activeSection === 'gift-cards' && <GiftCardsSection />}
          {activeSection === 'coupons' && <CouponsSection />}
          {activeSection === 'notifications' && <NotificationsSection userId={userId} />}
          {activeSection === 'wishlist' && <WishlistSection />}
          {activeSection === 'saved-upi' && (
            <div className="bg-card border rounded-xl p-12 text-center text-muted-foreground shadow-sm">
              <CreditCard className="h-20 w-20 mx-auto mb-4 text-muted-foreground/40" />
              <p className="font-bold text-xl text-foreground mb-2">Saved UPI</p>
              <p className="text-sm">No saved UPI IDs found.</p>
            </div>
          )}
          {activeSection === 'saved-cards' && (
            <div className="bg-card border rounded-xl p-12 text-center text-muted-foreground shadow-sm">
              <CreditCard className="h-20 w-20 mx-auto mb-4 text-muted-foreground/40" />
              <p className="font-bold text-xl text-foreground mb-2">Saved Cards</p>
              <p className="text-sm">No saved cards found.</p>
            </div>
          )}
          {activeSection === 'faqs' && <FAQsSection />}
        </div>
      </div>
    </div>
  );
};

export default DesktopProfileLayout;
