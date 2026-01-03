import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Layers, ShoppingCart, Heart, User } from "lucide-react";

const MobileBottomNav = () => {
  const { pathname } = useLocation();

  // Active route highlighter
  const isActive = (route: string) =>
    pathname === route ? "text-white font-semibold" : "text-green-100";

  return (
    <div className="lg:hidden fixed bottom-0 left-0 w-full bg-green-600 border-t border-green-500 shadow-lg z-50">
      <div className="flex justify-between items-center px-6 py-2">

        {/* Home */}
        <Link to="/" className="flex flex-col items-center">
          <Home className={`h-6 w-6 ${isActive("/")}`} />
          <span className={`text-xs ${isActive("/")}`}>Home</span>
        </Link>

        {/* Categories */}
        <Link to="/products" className="flex flex-col items-center">
          <Layers className={`h-6 w-6 ${isActive("/products")}`} />
          <span className={`text-xs ${isActive("/products")}`}>Categories</span>
        </Link>

        {/* Cart */}
        <Link to="/cart" className="flex flex-col items-center">
          <ShoppingCart className={`h-6 w-6 ${isActive("/cart")}`} />
          <span className={`text-xs ${isActive("/cart")}`}>Cart</span>
        </Link>

        {/* Wishlist */}
        <Link to="/wishlist" className="flex flex-col items-center">
          <Heart className={`h-6 w-6 ${isActive("/wishlist")}`} />
          <span className={`text-xs ${isActive("/wishlist")}`}>Wishlist</span>
        </Link>

        {/* Account */}
        <Link to="/auth" className="flex flex-col items-center">
          <User className={`h-6 w-6 ${isActive("/auth")}`} />
          <span className={`text-xs ${isActive("/auth")}`}>Account</span>
        </Link>

      </div>
    </div>
  );
};

export default MobileBottomNav;
