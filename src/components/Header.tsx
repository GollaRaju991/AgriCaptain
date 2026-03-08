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
import catSeedsIcon from "@/assets/cat-seeds-icon.png";
import catFertilizerIcon from "@/assets/cat-fertilizer-icon.png";
import catAgriIcon from "@/assets/cat-agri-icon.png";
import catBrandsIcon from "@/assets/cat-brands-icon.png";
import catFarmworkerIcon from "@/assets/cat-farmworker-icon.png";
import catVehicleIcon from "@/assets/cat-vehicle-icon.png";
import catMarketIcon from "@/assets/cat-market-icon.png";
import catLoansIcon from "@/assets/cat-loans-icon.png";
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
  const hideFullMobileHeader = ['/cart', '/wishlist', '/profile'].includes(location.pathname);
  
  // Hide header completely on these standalone pages (mobile)
  const hideHeaderPages = ['/coupons', '/help-center', '/orders', '/checkout', '/become-seller'];
  const isOrderDetailPage = /^\/orders\/[^/]+$/.test(location.pathname);
  const isStandalonePage = hideHeaderPages.includes(location.pathname) || isOrderDetailPage;

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
      <header className={`bg-white shadow-md sticky top-0 z-50 w-full ${isStandalonePage ? 'lg:block hidden' : ''}`}>

        {/* ===================== MOBILE HEADER ===================== */}

        {/* Product page mobile header: back + search + cart */}
        {isProductPage && !isStandalonePage && (
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
        {!isProductPage && !hideFullMobileHeader && (
          <>
            {/* Green gradient header area */}
            <div className="lg:hidden" style={{ background: 'linear-gradient(135deg, #1FAF5A 0%, #0E8A43 100%)' }}>
              {/* Row 1: Logo + actions - hides on scroll */}
              <div
                className={`flex items-center px-3 py-2.5 gap-2 transition-all duration-300 overflow-hidden ${
                  scrolled ? "max-h-0 py-0 opacity-0" : "max-h-20 opacity-100"
                }`}
              >
                <Link to="/" className="flex items-center gap-2 flex-shrink-0">
                  <img src={appLogo} alt="Agrizin" className="w-8 h-8 rounded-full" />
                  <span className="text-xl font-bold text-white">Agrizin</span>
                </Link>

                <div className="flex items-center gap-2 ml-auto">
                  <Link
                    to="/become-seller"
                    className="flex items-center gap-1.5 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-sm"
                  >
                    <UserPlus className="h-4 w-4 text-green-700" />
                    <span className="text-[11px] font-semibold text-green-800 whitespace-nowrap">{translations.become_seller}</span>
                  </Link>

                  <button
                    onClick={() => setLanguageDialogOpen(true)}
                    className="flex items-center gap-1.5 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-sm"
                  >
                    <Languages className="h-4 w-4 text-green-700" />
                    <span className="text-[11px] font-semibold text-green-800 whitespace-nowrap">{translations.language}</span>
                  </button>
                </div>
              </div>

              {/* Row 2: Search bar */}
              <div className="flex items-center px-3 pb-3 pt-1">
                <form
                  onSubmit={handleSearch}
                  className="flex flex-1 items-center bg-white rounded-full overflow-hidden shadow-md"
                >
                  <div className="flex items-center pl-4">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <Input
                    type="text"
                    placeholder={translations.search_products || 'Search products...'}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border-none bg-transparent text-sm flex-1 focus-visible:ring-0 focus-visible:ring-offset-0 h-10"
                  />
                  <ImageSearch onImageSearch={(file) => console.log("Image search:", file.name)} />
                </form>
              </div>
            </div>

            {/* Row 3: Category menu - white background with green icons */}
            <div className="lg:hidden overflow-x-auto bg-white border-b border-gray-200">
              <div className="flex items-center px-2 py-2 space-x-4 min-w-max">
                {[
                  { name: translations.seeds, image: catSeedsIcon, path: '/products?category=seeds', bg: 'bg-green-50' },
                  { name: translations.fertilizers, image: catFertilizerIcon, path: '/products?category=fertilizers', bg: 'bg-emerald-50' },
                  { name: translations.agri_products || translations.agriculture_products, image: catAgriIcon, path: '/products?category=agriculture', bg: 'bg-amber-50' },
                  { name: translations.brands, image: catBrandsIcon, path: '/products?category=brands', bg: 'bg-pink-50' },
                  { name: translations.market_details, image: catMarketIcon, path: '/market-details', bg: 'bg-cyan-50' },
                  { name: translations.farm_worker, image: catFarmworkerIcon, isPopup: true, action: 'farmWorker' as const, bg: 'bg-orange-50' },
                  { name: translations.rent_vehicles, image: catVehicleIcon, isPopup: true, action: 'rentVehicle' as const, bg: 'bg-lime-50' },
                  { name: translations.loans, image: catLoansIcon, path: '/loans', bg: 'bg-yellow-50' },
                ].map((category, index) => {
                  if ('isPopup' in category && category.isPopup) {
                    return (
                      <button
                        key={index}
                        onClick={() => {
                          if (category.action === 'farmWorker') setFarmWorkerDialogOpen(true);
                          else if (category.action === 'rentVehicle') setVehicleRentDialogOpen(true);
                        }}
                        className="flex flex-col items-center min-w-[70px] px-2 py-1 text-gray-700 hover:text-green-700"
                      >
                        <div className={`w-10 h-10 ${category.bg} rounded-xl flex items-center justify-center mb-1 overflow-hidden`}>
                          <img src={category.image} alt={category.name} className="w-8 h-8 object-contain" />
                        </div>
                        <span className="text-xs text-center whitespace-nowrap text-gray-700">{category.name}</span>
                      </button>
                    );
                  }
                  
                  return (
                    <Link
                      key={index}
                      to={'path' in category ? category.path : '/'}
                      className="flex flex-col items-center min-w-[70px] px-2 py-1 text-gray-700 hover:text-green-700"
                    >
                      <div className={`w-10 h-10 ${category.bg} rounded-xl flex items-center justify-center mb-1 overflow-hidden`}>
                        <img src={category.image} alt={category.name} className="w-8 h-8 object-contain" />
                      </div>
                      <span className="text-xs text-center whitespace-nowrap text-gray-700">{category.name}</span>
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
