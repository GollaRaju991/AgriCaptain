
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube, Users, Gift, Share2, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const Footer = () => {
  const { translations } = useLanguage();
  const [showShareDialog, setShowShareDialog] = useState(false);
  
  const appUrl = window.location.origin;
  const shareMessage = "Check out Agrizin - Your trusted partner in agriculture! Get quality seeds, fertilizers, and farming tools.";
  
  const handleWhatsAppShare = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareMessage + ' ' + appUrl)}`;
    window.open(url, '_blank');
  };
  
  const handleFacebookShare = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(appUrl)}`;
    window.open(url, '_blank');
  };
  
  const handleInstagramShare = () => {
    // Instagram doesn't support direct sharing via URL, so we'll copy the link
    navigator.clipboard.writeText(appUrl);
    alert('Link copied! Open Instagram and paste it in your story or post.');
  };

  return (
    <footer className="bg-gray-900 text-white">
      {/* Referral Section */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <div className="bg-white bg-opacity-20 p-3 rounded-full">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Refer Friends & Earn ₹25</h3>
                <p className="text-green-100">Get ₹25 for each successful referral. 50 referrals = ₹1000 directly to your UPI!</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button 
                onClick={() => setShowShareDialog(true)}
                className="bg-white text-green-600 px-6 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                <Share2 className="h-4 w-4 inline mr-2" />
                Refer Now
              </button>
              <button className="border border-white text-white px-6 py-2 rounded-lg font-medium hover:bg-white hover:text-green-600 transition-colors">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-green-600 to-green-700 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">A</span>
              </div>
              <span className="text-xl font-bold">Agrizin</span>
            </div>
            <p className="text-gray-400 mb-4">
              Your trusted partner in agriculture. We provide high-quality seeds, fertilizers, and farming tools to help you grow better crops.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{translations.quick_links || "Quick Links"}</h3>
            <ul className="space-y-2">
              <li><Link to="/products?category=seeds" className="text-gray-400 hover:text-white transition-colors">{translations.seeds || "Seeds"}</Link></li>
              <li><Link to="/products?category=fertilizers" className="text-gray-400 hover:text-white transition-colors">{translations.fertilizers || "Fertilizers"}</Link></li>
              <li><Link to="/products?category=agriculture" className="text-gray-400 hover:text-white transition-colors">{translations.agriculture_products || "Agriculture Tools"}</Link></li>
              <li><Link to="/products?category=brands" className="text-gray-400 hover:text-white transition-colors">{translations.brands || "Brands"}</Link></li>
              <li><Link to="/farm-worker" className="text-gray-400 hover:text-white transition-colors">{translations.farm_worker || "Farm Worker"}</Link></li>
              <li><Link to="/vehicle-rent" className="text-gray-400 hover:text-white transition-colors">{translations.rent_vehicles || "Rent Vehicles"}</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{translations.customer_service || "Customer Service"}</h3>
            <ul className="space-y-2">
              <li><Link to="/help" className="text-gray-400 hover:text-white transition-colors">{translations.help_center || "Help Center"}</Link></li>
              <li><Link to="/returns" className="text-gray-400 hover:text-white transition-colors">{translations.returns || "Returns & Refunds"}</Link></li>
              <li><Link to="/shipping" className="text-gray-400 hover:text-white transition-colors">{translations.shipping || "Shipping Info"}</Link></li>
              <li><Link to="/track-order" className="text-gray-400 hover:text-white transition-colors">{translations.track_order || "Track Order"}</Link></li>
              <li><Link to="/bulk-orders" className="text-gray-400 hover:text-white transition-colors">{translations.bulk_orders || "Bulk Orders"}</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{translations.contact_us || "Contact Us"}</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <Phone className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <p className="text-gray-400">9912365550</p>
                  <p className="text-sm text-gray-500">Mon-Sat 9AM-7PM</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Mail className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <p className="text-gray-400">agrizincontact@gmail.com</p>
                  <p className="text-sm text-gray-500">24/7 Support</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <p className="text-gray-400">Nanakramguda Rd, Financial District</p>
                  <p className="text-gray-400">Serilingampalle (M), Hyderabad</p>
                  <p className="text-gray-400">Telangana 500032</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 Agrizin. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link to="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">
                {translations.privacy_policy || "Privacy Policy"}
              </Link>
              <Link to="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">
                {translations.terms || "Terms of Service"}
              </Link>
              <Link to="/cookies" className="text-gray-400 hover:text-white text-sm transition-colors">
                {translations.cookies || "Cookie Policy"}
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Refer & Earn ₹25</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-gray-600">
              Share Agrizin with your friends and family. Earn ₹25 for each successful referral!
            </p>
            
            <div className="space-y-3">
              <Button
                onClick={handleWhatsAppShare}
                className="w-full bg-green-500 hover:bg-green-600 text-white"
              >
                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                Share on WhatsApp
              </Button>
              
              <Button
                onClick={handleFacebookShare}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Facebook className="h-5 w-5 mr-2" />
                Share on Facebook
              </Button>
              
              <Button
                onClick={handleInstagramShare}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
              >
                <Instagram className="h-5 w-5 mr-2" />
                Share on Instagram
              </Button>
            </div>
            
            <div className="pt-4 border-t">
              <p className="text-sm text-gray-500 text-center">
                50 successful referrals = ₹1000 directly to your UPI!
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </footer>
  );
};

export default Footer;
