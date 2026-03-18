import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { WishlistProvider } from "./contexts/WishlistContext";
import Index from "./pages/Index";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import Orders from "./pages/Orders";
import OrderDetails from "./pages/OrderDetails";
import Coupons from "./pages/Coupons";
import Notifications from "./pages/Notifications";
import FarmWorker from "./pages/FarmWorker";
import VehicleRent from "./pages/VehicleRent";
import BecomeSeller from "./pages/BecomeSeller";
import OrderConfirmation from "./pages/OrderConfirmation";
import Wishlist from "./pages/Wishlist";
import SellCrop from "./pages/SellCrop";
import CropDetail from "./pages/CropDetail";
import AddCropPage from "./pages/AddCropPage";
import GiftCards from "./pages/GiftCards";
import MarketDetails from "./pages/MarketDetails";
import Scanner from "./pages/Scanner";
import DirectFromFarm from "./pages/DirectFromFarm";
import Loans from "./pages/Loans";
import Categories from "./pages/Categories";
import HelpCenter from "./pages/HelpCenter";
import TermsPolicies from "./pages/TermsPolicies";
import FAQs from "./pages/FAQs";
import Contact from "./pages/Contact";
import TermsAndConditions from "./pages/TermsAndConditions";
import RefundPolicy from "./pages/RefundPolicy";
import ShippingPolicy from "./pages/ShippingPolicy";
import SavedUPI from "./pages/SavedUPI";
import SavedCards from "./pages/SavedCards";
import SavedAddresses from "./pages/SavedAddresses";
import EditProfilePage from "./pages/EditProfilePage";
import AgrizinMoney from "./pages/AgrizinMoney";
import AddProduct from "./pages/AddProduct";
import EditProduct from "./pages/EditProduct";
import SellerDashboard from "./pages/SellerDashboard";
import AdminOrders from "./pages/AdminOrders";
import SupportChat from "./pages/SupportChat";
import NotFound from "./pages/NotFound";
import ScrollToTop from "./components/ScrollToTop";

// ⭐ ADD THIS
import MobileBottomNav from "@/components/MobileBottomNav";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LanguageProvider>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              {/* ⭐ Add bottom padding so content is not hidden */}
              <div className="w-full min-h-screen overflow-x-hidden pb-16 lg:pb-0">
                
                <Toaster />
                <Sonner />

                <BrowserRouter>
                  <ScrollToTop />
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/product/:id" element={<ProductDetails />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/orders" element={<Orders />} />
                    <Route path="/orders/:id" element={<OrderDetails />} />
                    <Route path="/coupons" element={<Coupons />} />
                    <Route path="/notifications" element={<Notifications />} />
                    <Route path="/farm-worker" element={<FarmWorker />} />
                    <Route path="/vehicle-rent" element={<VehicleRent />} />
                    <Route path="/become-seller" element={<BecomeSeller />} />
                    <Route path="/order-confirmation" element={<OrderConfirmation />} />
                    <Route path="/wishlist" element={<Wishlist />} />
                    <Route path="/sell-crop" element={<SellCrop />} />
                    <Route path="/sell-crop/add" element={<AddCropPage />} />
                    <Route path="/sell-crop/:id" element={<CropDetail />} />
                    <Route path="/gift-cards" element={<GiftCards />} />
                    <Route path="/market-details" element={<MarketDetails />} />
                    <Route path="/direct-from-farm" element={<DirectFromFarm />} />
                    <Route path="/loans" element={<Loans />} />
                    <Route path="/categories" element={<Categories />} />
                    <Route path="/help-center" element={<HelpCenter />} />
                    <Route path="/terms-policies" element={<TermsPolicies />} />
                    <Route path="/faqs" element={<FAQs />} />
                    <Route path="/profile/saved-upi" element={<SavedUPI />} />
                    <Route path="/profile/saved-cards" element={<SavedCards />} />
                    <Route path="/profile/saved-addresses" element={<SavedAddresses />} />
                    <Route path="/profile/edit" element={<EditProfilePage />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
                    <Route path="/refund-policy" element={<RefundPolicy />} />
                    <Route path="/shipping-policy" element={<ShippingPolicy />} />
                    <Route path="/agrizin-money" element={<AgrizinMoney />} />
                    <Route path="/seller/add-product" element={<AddProduct />} />
                    <Route path="/seller/edit-product/:id" element={<EditProduct />} />
                    <Route path="/seller/dashboard" element={<SellerDashboard />} />
                    <Route path="/scanner" element={<Scanner />} />
                    <Route path="/admin/orders" element={<AdminOrders />} />
                    <Route path="/support-chat" element={<SupportChat />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>

                  {/* ⭐ ALWAYS visible on mobile */}
                  <MobileBottomNav />

                </BrowserRouter>
              </div>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
