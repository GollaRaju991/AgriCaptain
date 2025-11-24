import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Search, ShoppingCart, Heart, User } from "lucide-react";

const MobileBottomNav = () => {
  const { pathname } = useLocation();

  // Check active route
  const isActive = (route: string) =>
    pathname === route ? "text-green-600 font-semibold" : "text-gray-500";

  return (
    <div className="lg:hidden fixed bottom-0 left-0 w-full bg-white border-t shadow-lg z-50">
      <div className="flex justify-between items-center px-6 py-2">
        
        {/* Home */}
        <Link to="/" className="flex flex-col items-center">
          <Home className={`h-6 w-6 ${isActive("/")}`} />
          <span className="text-xs">Home</span>
        </Link>

        {/* Search */}
        <Link to="/search" className="flex flex-col items-center">
          <Search className={`h-6 w-6 ${isActive("/search")}`} />
          <span className="text-xs">Search</span>
        </Link>

        {/* Cart */}
        <Link to="/cart" className="flex flex-col items-center">
          <ShoppingCart className={`h-6 w-6 ${isActive("/cart")}`} />
          <span className="text-xs">Cart</span>
        </Link>

        {/* Wishlist */}
        <Link to="/wishlist" className="flex flex-col items-center">
          <Heart className={`h-6 w-6 ${isActive("/wishlist")}`} />
          <span className="text-xs">Wishlist</span>
        </Link>

        {/* Account */}
        <Link to="/auth" className="flex flex-col items-center">
          <User className={`h-6 w-6 ${isActive("/auth")}`} />
          <span className="text-xs">Account</span>
        </Link>

      </div>
    </div>
  );
};

export default MobileBottomNav;
