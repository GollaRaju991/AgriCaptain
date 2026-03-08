import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Layers, Leaf, Sprout, User } from "lucide-react";
import { useLanguage } from '@/contexts/LanguageContext';

const MobileBottomNav = () => {
  const { pathname } = useLocation();
  const { translations } = useLanguage();

  // Hide bottom nav on product details, cart, auth, checkout, and order detail pages
  const isOrderDetailPage = /^\/orders\/[^/]+$/.test(pathname);
  if (pathname.startsWith('/product/') || pathname === '/cart' || pathname === '/auth' || pathname === '/checkout' || pathname === '/order-confirmation' || isOrderDetailPage) return null;

  const isActive = (route: string) =>
    pathname === route ? "text-white font-semibold" : "text-green-100";

  return (
    <div className="lg:hidden fixed bottom-0 left-0 w-full bg-green-600 border-t border-green-500 shadow-lg z-50">
      <div className="flex justify-between items-center px-6 py-2">
        <Link to="/" className="flex flex-col items-center">
          <Home className={`h-6 w-6 ${isActive("/")}`} />
          <span className={`text-xs ${isActive("/")}`}>{translations.bottom_home}</span>
        </Link>
        <Link to="/categories" className="flex flex-col items-center">
          <Layers className={`h-6 w-6 ${isActive("/categories")}`} />
          <span className={`text-xs ${isActive("/categories")}`}>{translations.bottom_categories}</span>
        </Link>
        <Link to="/direct-from-farm" className="flex flex-col items-center">
          <Leaf className={`h-6 w-6 ${isActive("/direct-from-farm")}`} />
          <span className={`text-xs ${isActive("/direct-from-farm")}`}>{translations.bottom_direct_farm || 'Farm'}</span>
        </Link>
        <Link to="/sell-crop" className="flex flex-col items-center">
          <Sprout className={`h-6 w-6 ${isActive("/sell-crop")}`} />
          <span className={`text-xs ${isActive("/sell-crop")}`}>{translations.bottom_sell_crop}</span>
        </Link>
        <Link to="/profile" className="flex flex-col items-center">
          <User className={`h-6 w-6 ${isActive("/profile")}`} />
          <span className={`text-xs ${isActive("/profile")}`}>{translations.bottom_account}</span>
        </Link>
      </div>
    </div>
  );
};

export default MobileBottomNav;
