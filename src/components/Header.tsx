import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Menu,
  X,
  Languages,
  UserPlus,
} from "lucide-react";

import ImageSearch from "./ImageSearch";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

import LanguageSelector from "./LanguageSelector";
import FarmWorkerDialog from "./FarmWorkerDialog";
import RentVehicleDialog from "./RentVehicleDialog";
import LogoutConfirmation from "./LogoutConfirmation";

const Header = () => {
  const navigate = useNavigate();
  const { items } = useCart();
  const { user, logout } = useAuth();
  const { translations } = useLanguage();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [languageDialogOpen, setLanguageDialogOpen] = useState(false);
  const [farmWorkerDialogOpen, setFarmWorkerDialogOpen] = useState(false);
  const [vehicleRentDialogOpen, setVehicleRentDialogOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  return (
    <>
      {/* ---------------------- HEADER WRAPPER ---------------------- */}
      <header className="bg-white shadow-md sticky top-0 z-50 w-full">

        {/* ---------------------- MOBILE HEADER ---------------------- */}
        <div className="lg:hidden flex items-center justify-between px-3 py-3 border-b shadow-sm">

          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold shadow">
              A
            </div>
            <span className="text-xl font-bold text-green-700">Agrizin</span>
          </Link>

          {/* Search */}
          <form
            onSubmit={handleSearch}
            className="flex flex-1 mx-3 bg-gray-100 rounded-lg overflow-hidden"
          >
            <Input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-none bg-gray-100 text-sm"
            />
            <Button type="submit" className="bg-green-600 rounded-none text-white">
              <Search className="h-4 w-4" />
            </Button>
          </form>

          {/* Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-green-700"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* ---------------------- DESKTOP HEADER ---------------------- */}
        <div className="hidden lg:block">
          <div className="flex items-center justify-between py-4 px-6">

            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold shadow">
                A
              </div>
              <span className="text-3xl font-bold text-green-700">Agrizin</span>
            </Link>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex flex-1 mx-8 max-w-xl">
              <Input
                type="text"
                placeholder={`${translations.search} for seeds, fertilizers…`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="rounded-r-none border-r-0"
              />
              <Button type="submit" className="rounded-none bg-green-600 text-white">
                <Search className="h-4 w-4" />
              </Button>
            </form>

            {/* Right Options */}
            <div className="flex items-center space-x-4">

              {/* Language */}
              <Button
                variant="ghost"
                onClick={() => setLanguageDialogOpen(true)}
                className="text-green-700"
              >
                <Languages className="h-5 w-5 mr-1" />
                Language
              </Button>

              {/* Seller */}
              <Link to="/become-seller">
                <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                  <UserPlus className="h-4 w-4 mr-1" />
                  Become Seller
                </Button>
              </Link>

              {/* Cart */}
              <Link to="/cart" className="relative">
                <Button variant="ghost" className="text-green-700">
                  🛒 Cart
                </Button>
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {totalItems}
                  </span>
                )}
              </Link>

              {/* LOGIN / USER BUTTON */}
              {user ? (
                <Button 
                  onClick={() => setLogoutDialogOpen(true)}
                  className="border border-green-600 text-green-700 hover:bg-green-600 hover:text-white"
                >
                  {user.user_metadata?.name || user.email?.split('@')[0] || 'User'}
                </Button>
              ) : (
                <Link to="/auth">
                  <Button className="bg-green-600 text-white hover:bg-green-700">
                    Login
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* ---------------------- MOBILE MENU ---------------------- */}
        {isMenuOpen && (
          <div className="lg:hidden bg-white shadow-md border-t">
            <div className="px-4 py-4 space-y-3 text-gray-700">

              <Link to="/" className="block py-2">Home</Link>
              <Link to="/products" className="block py-2">Products</Link>
              <Link to="/market-details" className="block py-2">Market Details</Link>
              <Link to="/become-seller" className="block py-2">Become Seller</Link>

              <button
                onClick={() => setLanguageDialogOpen(true)}
                className="block py-2 w-full text-left"
              >
                🌐 Language
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ---------------------- POPUP COMPONENTS ---------------------- */}
      <LanguageSelector open={languageDialogOpen} onOpenChange={setLanguageDialogOpen} />
      <FarmWorkerDialog open={farmWorkerDialogOpen} onOpenChange={setFarmWorkerDialogOpen} />
      <RentVehicleDialog open={vehicleRentDialogOpen} onOpenChange={setVehicleRentDialogOpen} />

      <LogoutConfirmation
        isOpen={logoutDialogOpen}
        onClose={() => setLogoutDialogOpen(false)}
        onConfirm={() => logout()}
      />
    </>
  );
};

export default Header;
