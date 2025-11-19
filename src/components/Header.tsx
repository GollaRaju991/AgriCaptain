
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  ShoppingCart, 
  User, 
  Menu, 
  X, 
  ChevronDown,
  Languages,
  Sprout,
  Beaker,
  Tractor,
  Award,
  Users,
  Truck,
  CreditCard,
  UserPlus,
  Package,
  Heart,
  Gift,
  Bell
} from 'lucide-react';
import ImageSearch from './ImageSearch';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSelector from './LanguageSelector';
import LanguagePopupController from './LanguagePopupController';
import FarmWorkerDialog from './FarmWorkerDialog';
import RentVehicleDialog from './RentVehicleDialog';
import LogoutConfirmation from './LogoutConfirmation';

const Header = () => {
  const navigate = useNavigate();
  const { items } = useCart();
  const { user, logout } = useAuth();
  const { translations } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [languageDialogOpen, setLanguageDialogOpen] = useState(false);
  const [farmWorkerDialogOpen, setFarmWorkerDialogOpen] = useState(false);
  const [vehicleRentDialogOpen, setVehicleRentDialogOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleImageSearch = (imageFile: File) => {
    // Implement image search logic here
    console.log('Image search:', imageFile);
    // For now, just navigate to products page
    navigate('/products');
  };

  const handleLogout = () => {
    logout();
    setLogoutDialogOpen(false);
    setActiveDropdown(null);
  };

  const menuItems = [
    {
      name: translations.seeds,
      href: '/products?category=seeds',
      icon: Sprout,
      submenu: [
        'Vegetable Seeds',
        'Flower Seeds', 
        'Fruit Seeds',
        'Grain Seeds',
        'Herb Seeds'
      ]
    },
    {
      name: translations.fertilizers,
      href: '/products?category=fertilizers',
      icon: Beaker,
      submenu: [
        'Organic Fertilizers',
        'Chemical Fertilizers',
        'Bio Fertilizers',
        'Liquid Fertilizers',
        'Granular Fertilizers'
      ]
    },
    {
      name: translations.agriculture_products,
      href: '/products?category=agriculture',
      icon: Tractor,
      submenu: [
        'Pesticides',
        'Insecticides',
        'Fungicides',
        'Herbicides',
        'Plant Growth Regulators'
      ]
    },
    {
      name: translations.brands,
      href: '/products?category=brands',
      icon: Award,
      submenu: [
        'Tata Rallis',
        'UPL Limited',
        'Bayer CropScience',
        'Syngenta',
        'BASF'
      ]
    },
    {
      name: translations.market_details,
      href: '/market-details',
      icon: Tractor,
      submenu: []
    },
    {
      name: translations.Animal_husbandry,
      href: '/products?category=Animal',
      icon: Sprout,
      submenu: [
        'CATTLE',
        'POULTRY',
        'OTHERS',
        'POPULAR BRANDS',
        'BASF'
      ]
    },
    {
      name: translations.farm_worker,
      icon: Users,
      action: () => setFarmWorkerDialogOpen(true)
    },
    {
      name: translations.rent_vehicles,
      icon: Truck,
      action: () => setVehicleRentDialogOpen(true)
    },
    {
      name: translations.loans,
      href: '/products?category=loans',
      icon: CreditCard,
      submenu: [
        'Crop Loans',
        'Equipment Loans',
        'Land Purchase Loans',
        'Working Capital Loans'
      ]
    }
  ];

  useEffect(() => {
    // Only show language popup on first login (when user is authenticated but hasn't selected language)
    if (user) {
      const hasSelectedLanguage = localStorage.getItem('agricaptain_language_selected');
      const hasShownForUser = localStorage.getItem(`language_shown_${user.id}`);
      
      if (!hasSelectedLanguage && !hasShownForUser) {
        setLanguageDialogOpen(true);
        localStorage.setItem(`language_shown_${user.id}`, 'true');
      }
    }
  }, [user]);

  const userMenuItems = [
    { name: 'My Profile', icon: User, href: '/profile' },
    { name: 'Orders', icon: Package, href: '/orders' },
    { name: 'Wishlist', icon: Heart, href: '/wishlist' },
    { name: 'Coupons', icon: Gift, href: '/coupons' },
    { name: 'Gift Cards', icon: CreditCard, href: '/gift-cards' },
    { name: 'Notifications', icon: Bell, href: '/notifications' }
  ];

  return (
    <>
      {/* Main Header */}
      <header className="bg-white shadow-md sticky top-0 z-50 w-full">
        <div className="max-w-full mx-auto px-2 sm:px-4">
          <div className="flex items-center justify-between py-4">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-green-600 to-green-700 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg sm:text-xl">A</span>
              </div>
              <span className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">Agrizin</span>
            </Link>

            {/* Search Bar - Hidden on mobile */}
            <div className="hidden lg:flex flex-1 max-w-2xl mx-4 xl:mx-8">
              <form onSubmit={handleSearch} className="flex w-full">
                <Input
                  type="text"
                  placeholder={`${translations.search} for seeds, fertilizers, tools...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="rounded-r-none border-r-0 focus:ring-green-500 focus:border-green-500"
                />
                <ImageSearch onImageSearch={handleImageSearch} />
                <Button 
                  type="submit"
                  className="rounded-none bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </form>
            </div>

            {/* User Actions */}
            <div className="flex items-center space-x-1 sm:space-x-4">
              {/* Mobile Search and Image Search */}
              <div className="lg:hidden flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-green-600 hover:text-green-700 hover:bg-green-50 p-2"
                  onClick={() => {/* Could implement mobile search modal */}}
                >
                  <Search className="h-5 w-5" />
                </Button>
                <ImageSearch onImageSearch={handleImageSearch} />
              </div>

              {/* Language Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLanguageDialogOpen(true)}
                className="text-green-600 hover:text-green-700 hover:bg-green-50 h-8 px-2 hidden sm:flex"
              >
                <Languages className="h-4 w-4 mr-1" />
                <span className="hidden md:inline">Language</span>
              </Button>

              {/* Become Seller */}
              <Link to="/become-seller">
                <Button variant="outline" size="sm" className="border-orange-500 text-orange-600 hover:bg-orange-500 hover:text-white text-xs sm:text-sm px-2 sm:px-4">
                  <UserPlus className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Become Seller</span>
                  <span className="sm:hidden">Seller</span>
                </Button>
              </Link>

              {/* Cart */}
              <Link to="/cart">
                <Button variant="ghost" size="sm" className="relative text-green-600 hover:text-green-700 hover:bg-green-50 p-2">
                  <ShoppingCart className="h-5 w-5" />
                  {totalItems > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-gradient-to-r from-orange-500 to-red-500 text-xs">
                      {totalItems}
                    </Badge>
                  )}
                </Button>
              </Link>

              {/* User Menu */}
              {user ? (
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveDropdown(activeDropdown === 'user' ? null : 'user')}
                    className="flex items-center space-x-1 text-green-600 hover:text-green-700 hover:bg-green-50 px-2"
                  >
                    <User className="h-5 w-5" />
                    <span className="hidden md:inline truncate max-w-24">Agrizin User</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                  {activeDropdown === 'user' && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-2 z-50 border">
                      <div className="px-4 py-2 border-b">
                        <p className="text-sm font-medium text-gray-900">Hello {user.name || 'Agrizin User'}</p>
                      </div>
                      {userMenuItems.map((item, index) => {
                        const IconComponent = item.icon;
                        return (
                          <Link
                            key={index}
                            to={item.href}
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600"
                            onClick={() => setActiveDropdown(null)}
                          >
                            <IconComponent className="h-4 w-4 mr-3" />
                            {item.name}
                          </Link>
                        );
                      })}
                      <div className="border-t mt-1 pt-1">
                        <button
                          onClick={() => {
                            setActiveDropdown(null);
                            setLogoutDialogOpen(true);
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600"
                        >
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="relative">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveDropdown(activeDropdown === 'login' ? null : 'login')}
                    className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white flex items-center space-x-1 px-2"
                  >
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">{translations.login}</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                  {activeDropdown === 'login' && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-2 z-50 border">
                      {userMenuItems.map((item, index) => {
                        const IconComponent = item.icon;
                        return (
                          <Link
                            key={index}
                            to="/auth"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600"
                            onClick={() => setActiveDropdown(null)}
                          >
                            <IconComponent className="h-4 w-4 mr-3" />
                            {item.name}
                          </Link>
                        );
                      })}
                      <div className="border-t mt-1 pt-1">
                        <Link
                          to="/auth"
                          className="block w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 hover:text-blue-700 font-medium"
                          onClick={() => setActiveDropdown(null)}
                        >
                          Login
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden text-green-600 hover:text-green-700 hover:bg-green-50 p-2"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="hidden lg:block border-t border-gray-200">
            <div className="flex bg-gradient-to-r from-green-600 via-green-700 to-green-600 shadow-lg">
              {menuItems.map((item, index) => {
                const IconComponent = item.icon;
                const hasSubmenu = item.submenu && (item.name === translations.seeds || item.name === translations.fertilizers || item.name === translations.agriculture_products || item.name === translations.brands || item.name === translations.Animal_husbandry || item.name === translations.loans);
                
                return (
                  <div
                    key={index}
                    className="relative group flex-1"
                    onMouseEnter={() => hasSubmenu && setActiveDropdown(item.name)}
                    onMouseLeave={() => setActiveDropdown(null)}
                  >
                    {item.href ? (
                      <Link
                        to={item.href}
                        className="flex items-center justify-center space-x-2 px-3 py-4 text-sm font-medium text-white hover:bg-white hover:bg-opacity-20 transition-all duration-200 border-r border-green-500 border-opacity-30"
                      >
                        <IconComponent className="h-4 w-4" />
                        <span className="text-center">{item.name}</span>
                      </Link>
                    ) : (
                      <button
                        onClick={item.action}
                        className="flex items-center justify-center space-x-2 px-3 py-4 text-sm font-medium text-white hover:bg-white hover:bg-opacity-20 transition-all duration-200 border-r border-green-500 border-opacity-30 w-full"
                      >
                        <IconComponent className="h-4 w-4" />
                        <span className="text-center">{item.name}</span>
                      </button>
                    )}
                    
                    {/* Submenu */}
                    {activeDropdown === item.name && hasSubmenu && (
                      <div className="absolute top-full left-0 mt-0 w-56 bg-white rounded-md shadow-lg py-1 z-50 border">
                        {item.submenu?.map((subItem, subIndex) => (
                          <a
                            key={subIndex}
                            href="#"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600"
                          >
                            {subItem}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </nav>

          {/* Mobile Search Bar */}
          <div className="lg:hidden py-4 border-t border-gray-200">
              <form onSubmit={handleSearch} className="flex">
                <Input
                  type="text"
                  placeholder={`${translations.search} products...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="rounded-r-none border-r-0"
                />
                <ImageSearch onImageSearch={handleImageSearch} />
                <Button type="submit" className="rounded-none bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800">
                  <Search className="h-4 w-4" />
                </Button>
              </form>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-200 shadow-lg">
            <div className="px-4 py-2 space-y-2">
              {menuItems.map((item, index) => {
                const IconComponent = item.icon;
                const hasSubmenu = item.submenu && (item.name === translations.seeds || item.name === translations.fertilizers || item.name === translations.agriculture_products || item.name === translations.brands || item.name === translations.Animal_husbandry || item.name === translations.loans);
                
                return (
                  <div key={index}>
                    {item.href ? (
                      <Link
                        to={item.href}
                        className="flex items-center space-x-2 py-3 px-2 text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <IconComponent className="h-5 w-5" />
                        <span>{item.name}</span>
                      </Link>
                    ) : (
                      <button
                        onClick={() => {
                          item.action?.();
                          setIsMenuOpen(false);
                        }}
                        className="flex items-center space-x-2 py-3 px-2 text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors w-full text-left"
                      >
                        <IconComponent className="h-5 w-5" />
                        <span>{item.name}</span>
                      </button>
                    )}
                    
                    {hasSubmenu && (
                      <div className="ml-8 space-y-1">
                        {item.submenu?.map((subItem, subIndex) => (
                          <a
                            key={subIndex}
                            href="#"
                            className="block py-1 px-2 text-sm text-gray-600 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                          >
                            {subItem}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </header>

      {/* Language Selector Dialog */}
      <LanguageSelector
        open={languageDialogOpen}
        onOpenChange={setLanguageDialogOpen}
      />

      {/* Farm Worker Dialog */}
      <FarmWorkerDialog
        open={farmWorkerDialogOpen}
        onOpenChange={setFarmWorkerDialogOpen}
      />

      {/* Vehicle Rent Dialog */}
      <RentVehicleDialog
        open={vehicleRentDialogOpen}
        onOpenChange={setVehicleRentDialogOpen}
      />

      {/* Logout Confirmation Dialog */}
      <LogoutConfirmation
        isOpen={logoutDialogOpen}
        onClose={() => setLogoutDialogOpen(false)}
        onConfirm={handleLogout}
      />
    </>
  );
};

export default Header;
