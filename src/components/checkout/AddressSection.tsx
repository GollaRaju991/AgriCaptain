
import React, { useState } from 'react';
import { MapPin, Plus } from 'lucide-react';
import AddressManager from '@/components/AddressManager';
import { useLanguage } from '@/contexts/LanguageContext';

interface Address {
  id: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  address_type: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
  user_id: string;
}

interface AddressSectionProps {
  addresses: Address[];
  selectedAddress: Address | null;
  addressesLoading: boolean;
  onAddressSelect: (address: Address) => void;
  onAddressRefresh: () => void;
}

const AddressSection: React.FC<AddressSectionProps> = ({
  addresses,
  selectedAddress,
  addressesLoading,
  onAddressSelect,
  onAddressRefresh
}) => {
  const [showAddressManager, setShowAddressManager] = useState(false);

  const handleAddressSelected = (address: Address) => {
    onAddressSelect(address);
    onAddressRefresh();
    setShowAddressManager(false);
  };

  if (showAddressManager) {
    return (
      <div className="bg-card border border-border/50 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border/30 flex items-center gap-2">
          <button onClick={() => setShowAddressManager(false)} className="text-sm text-brand-green font-medium hover:underline">
            ← Back
          </button>
          <h2 className="text-base font-bold text-foreground ml-2">Manage Address</h2>
        </div>
        <div className="p-5">
          <AddressManager 
            onAddressSelect={handleAddressSelected}
            selectedAddressId={selectedAddress?.id}
            onClose={() => setShowAddressManager(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border/50 rounded-2xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-border/30 flex items-center gap-3">
        <div className="w-7 h-7 bg-brand-green rounded-full flex items-center justify-center text-white text-xs font-bold">1</div>
        <h2 className="text-base font-bold text-foreground">Delivery Address</h2>
      </div>
      <div className="p-5">
        {addressesLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-brand-green"></div>
            <span className="ml-3 text-muted-foreground text-sm">Loading addresses...</span>
          </div>
        ) : selectedAddress ? (
          <div className="space-y-4">
            {/* Selected Address Card */}
            <div className="bg-muted/30 rounded-2xl border border-border/40 p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <MapPin className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-foreground">{selectedAddress.name}</span>
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium capitalize ${
                        selectedAddress.address_type === 'home'
                          ? 'bg-brand-green/10 text-brand-green'
                          : selectedAddress.address_type === 'work'
                          ? 'bg-blue-50 text-blue-600'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {selectedAddress.address_type}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">+91 {selectedAddress.phone}</p>
                    <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                      {selectedAddress.address}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {selectedAddress.city}, {selectedAddress.state} {selectedAddress.pincode}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddressManager(true)}
                  className="text-sm font-semibold text-brand-green px-4 py-2 border border-brand-green rounded-xl shrink-0 ml-4 hover:bg-brand-green/5 transition-colors"
                >
                  Change
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <MapPin className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground mb-2 text-sm">No delivery addresses found</p>
            <p className="text-xs text-muted-foreground mb-4">Add your first address to proceed with checkout</p>
            <button 
              onClick={() => setShowAddressManager(true)}
              className="bg-brand-green hover:bg-brand-green/90 text-white font-semibold rounded-xl px-6 py-2.5 text-sm inline-flex items-center gap-2 shadow-sm"
            >
              <Plus className="h-4 w-4" />
              Add Delivery Address
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddressSection;
