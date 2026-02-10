import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Menu,
  X,
  Languages,
  UserPlus,
  ChevronDown,
  User as UserIcon,
  Package,
  Heart,
  Gift,
  LogOut,
  Sprout,
  Droplet,
  Wrench,
  Award,
  TrendingUp,
  Users,
  Truck,
  CreditCard,
  ScanLine,
  Bell,
} from "lucide-react";
import appLogo from "@/assets/app-logo.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  const location = useLocation();
  const { items } = useCart();
  const { user, logout } = useAuth();
  const { translations } = useLanguage();

  // Check if on product detail page
  const isProductPage = location.pathname.startsWith('/product/');

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
        {/* Single row: Logo, quick links, notification - white background */}
        <div className="lg:hidden flex items-center px-2 py-2 bg-white gap-1.5">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-1 flex-shrink-0">
            <img src={appLogo} alt="Agrizin" className="w-7 h-7 rounded-full shadow" />
            <span className="text-sm font-bold text-green-700">Agrizin</span>
          </Link>

          {/* Quick action buttons */}
          <div className="flex items-center gap-1.5 ml-auto">
            {/* Login / Account */}
            {user ? (
              <Link
                to="/profile"
                className="flex items-center gap-1 bg-green-500 rounded-lg px-2.5 py-1.5 shadow-sm"
              >
                <UserIcon className="h-3.5 w-3.5 text-white" />
                <span className="text-[10px] font-semibold text-white whitespace-nowrap">{user.user_metadata?.name || 'Account'}</span>
              </Link>
            ) : (
              <Link
                to="/auth"
                className="flex items-center gap-1 bg-green-500 rounded-lg px-2.5 py-1.5 shadow-sm"
              >
                <UserIcon className="h-3.5 w-3.5 text-white" />
                <span className="text-[10px] font-semibold text-white whitespace-nowrap">{translations.login_signup}</span>
              </Link>
            )}

            {/* Become Seller */}
            <Link
              to="/become-seller"
              className="flex items-center gap-1 bg-orange-500 rounded-lg px-2.5 py-1.5 shadow-sm"
            >
              <UserPlus className="h-3.5 w-3.5 text-white" />
              <span className="text-[10px] font-semibold text-white whitespace-nowrap">{translations.become_seller}</span>
            </Link>

            {/* Language */}
            <button
              onClick={() => setLanguageDialogOpen(true)}
              className="flex items-center gap-1 bg-blue-400 rounded-lg px-2.5 py-1.5 shadow-sm"
            >
              <Languages className="h-3.5 w-3.5 text-white" />
              <span className="text-[10px] font-semibold text-white whitespace-nowrap">{translations.language}</span>
            </button>

            {/* Notification */}
            <Link to="/notifications">
              <Button
                variant="ghost"
                size="icon"
                className="text-green-700 hover:bg-green-50 h-7 w-7"
              >
                <Bell className="h-4.5 w-4.5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Row 2: Search Box with Camera and Scanner - Hidden on product pages */}
        {!isProductPage && (
        <div className="lg:hidden flex items-center px-3 py-2 bg-green-600 gap-2">
          <form
            onSubmit={handleSearch}
            className="flex flex-1 items-center bg-white rounded-lg overflow-hidden shadow-sm"
          >
            <div className="flex items-center pl-3">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <Input
              type="text"
              placeholder={translations.search_products || 'Search products...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-none bg-transparent text-sm flex-1 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            <ImageSearch onImageSearch={(file) => console.log("Image search:", file.name)} />
          </form>
          
          {/* Barcode Scanner Button */}
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-green-500 flex-shrink-0"
            onClick={() => {
              // Scanner functionality placeholder
              console.log("Scanner clicked");
            }}
          >
            <ScanLine className="h-6 w-6" />
          </Button>
        </div>
        )}

        {/* Mobile Category Navigation - Scrollable - Hidden on product pages */}
        {!isProductPage && (
        <div className="lg:hidden overflow-x-auto bg-green-600 border-b border-green-500">
          <div className="flex items-center px-2 py-2 space-x-4 min-w-max">
            {[
              { name: translations.seeds, icon: Sprout, path: '/products?category=seeds' },
              { name: translations.fertilizers, icon: Droplet, path: '/products?category=fertilizers' },
              { name: translations.agri_products || translations.agriculture_products, icon: Wrench, path: '/products?category=agriculture' },
              { name: translations.brands, icon: Award, path: '/products?category=brands' },
              { name: translations.market_details, icon: TrendingUp, path: '/market-details' },
              { name: translations.farm_worker, icon: Users, isPopup: true, action: 'farmWorker' as const },
              { name: translations.rent_vehicles, icon: Truck, isPopup: true, action: 'rentVehicle' as const },
              { name: translations.loans, icon: CreditCard, path: '/loans' },
            ].map((category, index) => {
              const Icon = category.icon;
              
              // Handle popup items (Farm Worker, Rent Vehicles)
              if ('isPopup' in category && category.isPopup) {
                return (
                  <button
                    key={index}
                    onClick={() => {
                      if (category.action === 'farmWorker') {
                        setFarmWorkerDialogOpen(true);
                      } else if (category.action === 'rentVehicle') {
                        setVehicleRentDialogOpen(true);
                      }
                    }}
                    className="flex flex-col items-center min-w-[70px] px-2 py-1 text-white hover:text-green-100"
                  >
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mb-1">
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-xs text-center whitespace-nowrap">{category.name}</span>
                  </button>
                );
              }
              
              // Handle regular link items
              return (
                <Link
                  key={index}
                  to={'path' in category ? category.path : '/'}
                  className="flex flex-col items-center min-w-[70px] px-2 py-1 text-white hover:text-green-100"
                >
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mb-1">
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-xs text-center whitespace-nowrap">{category.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
        )}

        {/* ---------------------- DESKTOP HEADER ---------------------- */}
        <div className="hidden lg:block">
          <div className="flex items-center justify-between py-4 px-6">

            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3">
              <img src={appLogo} alt="Agrizin" className="w-10 h-10 rounded-full shadow" />
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
            <div className="flex items-center space-x-5">

              {/* Language */}
              <Button
                variant="ghost"
                onClick={() => setLanguageDialogOpen(true)}
                className="text-green-700 px-5 py-2 min-w-[110px]"
              >
                <Languages className="h-5 w-5 mr-2" />
                {translations.language}
              </Button>

              {/* Seller */}
              <Link to="/become-seller">
                <Button className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 min-w-[140px]">
                  <UserPlus className="h-4 w-4 mr-2" />
                  {translations.become_seller}
                </Button>
              </Link>

              {/* Cart */}
              <Link to="/cart" className="relative">
                <Button variant="ghost" className="text-green-700 px-5 py-2 min-w-[90px]">
                  🛒 {translations.cart}
                </Button>
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {totalItems}
                  </span>
                )}
              </Link>

              {/* LOGIN / USER DROPDOWN */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <UserIcon className="h-4 w-4" />
                      {user.user_metadata?.name || user.email?.split('@')[0] || 'User'}
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="flex items-center cursor-pointer">
                        <UserIcon className="h-4 w-4 mr-2" />
                        {translations.my_profile || 'My Profile'}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/orders" className="flex items-center cursor-pointer">
                        <Package className="h-4 w-4 mr-2" />
                        {translations.orders || 'Orders'}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/wishlist" className="flex items-center cursor-pointer">
                        <Heart className="h-4 w-4 mr-2" />
                        {translations.wishlist || 'Wishlist'}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/gift-cards" className="flex items-center cursor-pointer">
                        <Gift className="h-4 w-4 mr-2" />
                        {translations.gift_cards || 'Gift Cards'}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => setLogoutDialogOpen(true)}
                      className="cursor-pointer text-red-600 focus:text-red-600"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      {translations.logout || 'Logout'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link to="/auth">
                  <Button className="bg-green-600 text-white hover:bg-green-700 px-6 py-2 min-w-[90px]">
                    {translations.login}
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Mobile menu removed - options now in top bar */}
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
