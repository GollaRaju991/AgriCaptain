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
  ArrowLeft,
  ShoppingCart,
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

  const isProductPage = location.pathname.startsWith('/product/');

  const [searchQuery, setSearchQuery] = useState("");
  const [languageDialogOpen, setLanguageDialogOpen] = useState(false);
  const [farmWorkerDialogOpen, setFarmWorkerDialogOpen] = useState(false);
  const [vehicleRentDialogOpen, setVehicleRentDialogOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  return (
    <>
      <header className="bg-white shadow-md sticky top-0 z-50 w-full">

        {/* ===================== MOBILE HEADER ===================== */}

        {/* Product page mobile header: back + search + cart */}
        {isProductPage && (
          <div className="lg:hidden flex items-center px-2 py-2 bg-white gap-2">
            <button onClick={() => navigate(-1)} className="p-1">
              <ArrowLeft className="h-5 w-5 text-gray-700" />
            </button>
            <form
              onSubmit={handleSearch}
              className="flex flex-1 items-center bg-gray-100 rounded-lg overflow-hidden"
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
            </form>
            <Link to="/cart" className="relative p-1">
              <ShoppingCart className="h-5 w-5 text-gray-700" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>
        )}

        {/* Non-product pages mobile header */}
        {!isProductPage && (
          <>
            {/* Row 1: Logo + actions - hides on scroll */}
            <div
              className={`lg:hidden flex items-center px-3 py-2 bg-green-600 gap-2 transition-all duration-300 overflow-hidden ${
                scrolled ? "max-h-0 py-0 opacity-0" : "max-h-20 opacity-100"
              }`}
            >
              <Link to="/" className="flex-shrink-0">
                <span className="text-xl font-bold text-white">Agrizin</span>
              </Link>

              <div className="flex items-center gap-1.5 ml-auto">
                <Link
                  to="/become-seller"
                  className="flex items-center gap-1.5 bg-white rounded-md px-2.5 py-1.5"
                >
                  <UserPlus className="h-4 w-4 text-green-700" />
                  <span className="text-xs font-medium text-gray-800 whitespace-nowrap">{translations.become_seller}</span>
                </Link>

                <button
                  onClick={() => setLanguageDialogOpen(true)}
                  className="flex items-center gap-1.5 bg-white rounded-md px-2.5 py-1.5"
                >
                  <Languages className="h-4 w-4 text-green-700" />
                  <span className="text-xs font-medium text-gray-800 whitespace-nowrap">{translations.language}</span>
                </button>

                {user ? (
                  <Link
                    to="/profile"
                    className="relative flex items-center bg-white rounded-md p-2"
                  >
                    <UserIcon className="h-5 w-5 text-blue-600" />
                  </Link>
                ) : (
                  <Link
                    to="/auth"
                    className="relative flex items-center bg-white rounded-md p-2"
                  >
                    <UserIcon className="h-5 w-5 text-blue-600" />
                  </Link>
                )}
              </div>
            </div>

            {/* Row 2: Search - always visible (sticky on scroll) */}
            <div className="lg:hidden flex items-center px-3 py-2 bg-white gap-2">
              <form
                onSubmit={handleSearch}
                className="flex flex-1 items-center border-2 border-gray-800 rounded-lg overflow-hidden"
              >
                <div className="flex items-center pl-3">
                  <Search className="h-4 w-4 text-green-600" />
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
              
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-600 hover:bg-gray-100 flex-shrink-0"
                onClick={() => console.log("Scanner clicked")}
              >
                <ScanLine className="h-6 w-6" />
              </Button>
            </div>

            {/* Row 3: Category menu - always visible (sticky on scroll) */}
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
                  
                  if ('isPopup' in category && category.isPopup) {
                    return (
                      <button
                        key={index}
                        onClick={() => {
                          if (category.action === 'farmWorker') setFarmWorkerDialogOpen(true);
                          else if (category.action === 'rentVehicle') setVehicleRentDialogOpen(true);
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
          </>
        )}

        {/* ===================== DESKTOP HEADER ===================== */}
        <div className="hidden lg:block">
          {/* Row 1: Logo + Search + Actions - hides on scroll */}
          <div
            className={`flex items-center justify-between py-4 px-6 transition-all duration-300 overflow-hidden ${
              scrolled ? "max-h-0 py-0 opacity-0" : "max-h-24 opacity-100"
            }`}
          >
            <Link to="/" className="flex items-center space-x-3">
              <img src={appLogo} alt="Agrizin" className="w-10 h-10 rounded-full shadow" />
              <span className="text-3xl font-bold text-green-700">Agrizin</span>
            </Link>

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

            <div className="flex items-center space-x-5">
              <Button
                variant="ghost"
                onClick={() => setLanguageDialogOpen(true)}
                className="text-green-700 px-5 py-2 min-w-[110px]"
              >
                <Languages className="h-5 w-5 mr-2" />
                {translations.language}
              </Button>

              <Link to="/become-seller">
                <Button className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 min-w-[140px]">
                  <UserPlus className="h-4 w-4 mr-2" />
                  {translations.become_seller}
                </Button>
              </Link>

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

              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center gap-2">
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

          {/* Desktop: Sticky search bar visible on scroll */}
          <div
            className={`flex items-center justify-between px-6 py-2 bg-white border-b transition-all duration-300 overflow-hidden ${
              scrolled ? "max-h-16 opacity-100" : "max-h-0 py-0 opacity-0"
            }`}
          >
            <Link to="/" className="flex items-center space-x-2 mr-4">
              <img src={appLogo} alt="Agrizin" className="w-8 h-8 rounded-full shadow" />
              <span className="text-xl font-bold text-green-700">Agrizin</span>
            </Link>

            <form onSubmit={handleSearch} className="flex flex-1 max-w-xl">
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

            <div className="flex items-center space-x-4 ml-4">
              <Link to="/cart" className="relative">
                <Button variant="ghost" className="text-green-700">
                  🛒 {translations.cart}
                </Button>
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {totalItems}
                  </span>
                )}
              </Link>
              {user ? (
                <Link to="/profile">
                  <Button variant="ghost" className="text-green-700">
                    <UserIcon className="h-4 w-4 mr-1" />
                    {user.user_metadata?.name || 'Account'}
                  </Button>
                </Link>
              ) : (
                <Link to="/auth">
                  <Button className="bg-green-600 text-white hover:bg-green-700">
                    {translations.login}
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
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
