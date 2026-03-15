
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MapPin, Plus, Edit, Trash2, Home, Building, User, ArrowLeft, Phone, Bookmark, Navigation, ChevronDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

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

interface AddressManagerProps {
  onAddressSelect: (address: Address) => void;
  selectedAddressId?: string;
  onClose?: () => void;
  onScreenChange?: (screen: 'list' | 'form') => void;
}

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
];

const AddressManager: React.FC<AddressManagerProps> = ({ onAddressSelect, selectedAddressId, onClose, onScreenChange }) => {
  const { toast } = useToast();
  const { user, session } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [screen, setScreenState] = useState<'list' | 'form'>('list');
  const setScreen = (s: 'list' | 'form') => {
    setScreenState(s);
    onScreenChange?.(s);
  };
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    landmark: '',
    city: '',
    state: '',
    pincode: '',
    address_type: 'home' as string
  });

  useEffect(() => {
    if (user && session) {
      fetchAddresses();
    }
  }, [user, session]);

  const fetchAddresses = async () => {
    if (!user || !session) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });
      if (error) {
        toast({ title: "Error loading addresses", variant: "destructive" });
        setAddresses([]);
      } else {
        setAddresses(data || []);
        if (data && data.length > 0 && !selectedAddressId) {
          const defaultAddr = data.find(a => a.is_default) || data[0];
          if (defaultAddr) onAddressSelect(defaultAddr);
        }
      }
    } catch {
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: user?.name || '',
      phone: user?.phone || '',
      address: '',
      landmark: '',
      city: '',
      state: '',
      pincode: '',
      address_type: 'home'
    });
    setEditingAddress(null);
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !session) {
      toast({ title: "Please login", variant: "destructive" });
      return;
    }
    if (!formData.name || !formData.phone || !formData.address || !formData.city || !formData.state || !formData.pincode) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }
    if (formData.phone.replace(/\D/g, '').length < 10) {
      toast({ title: "Enter a valid phone number", variant: "destructive" });
      return;
    }
    if (formData.pincode.length !== 6) {
      toast({ title: "Enter a valid 6-digit pincode", variant: "destructive" });
      return;
    }

    setSaving(true);
    const fullAddress = formData.landmark
      ? `${formData.address}, ${formData.landmark}`
      : formData.address;

    const addressData = {
      user_id: user.id,
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      address: fullAddress.trim(),
      city: formData.city.trim(),
      state: formData.state.trim(),
      pincode: formData.pincode.trim(),
      address_type: formData.address_type,
      is_default: addresses.length === 0
    };

    try {
      if (editingAddress) {
        const { data, error } = await supabase
          .from('addresses')
          .update({ ...addressData, updated_at: new Date().toISOString() })
          .eq('id', editingAddress.id)
          .eq('user_id', user.id)
          .select()
          .single();
        if (error) { toast({ title: "Error updating address", variant: "destructive" }); return; }
        toast({ title: "Address updated successfully" });
        onAddressSelect(data);
      } else {
        const { data, error } = await supabase
          .from('addresses')
          .insert([{ ...addressData, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }])
          .select()
          .single();
        if (error) { toast({ title: "Error saving address", variant: "destructive" }); return; }
        toast({ title: "Address added successfully" });
        onAddressSelect(data);
      }
      await fetchAddresses();
      resetForm();
      setScreen('list');
    } catch {
      toast({ title: "Error saving address", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleEditAddress = (address: Address) => {
    const parts = address.address.split(', ');
    const landmark = parts.length > 2 ? parts[parts.length - 1] : '';
    const mainAddr = landmark ? parts.slice(0, -1).join(', ') : address.address;
    
    setFormData({
      name: address.name,
      phone: address.phone,
      address: mainAddr,
      landmark: landmark,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      address_type: address.address_type
    });
    setEditingAddress(address);
    setScreen('form');
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!user || !session) return;
    try {
      const { error } = await supabase
        .from('addresses')
        .delete()
        .eq('id', addressId)
        .eq('user_id', user.id);
      if (!error) {
        toast({ title: "Address deleted" });
        await fetchAddresses();
      }
    } catch {
      toast({ title: "Error deleting address", variant: "destructive" });
    }
  };

  const handleDeliverHere = (address: Address) => {
    onAddressSelect(address);
    if (onClose) onClose();
  };

  // ── ADD NEW ADDRESS FORM SCREEN ──
  if (screen === 'form') {
    return (
      <div className="min-h-full bg-muted/30">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => { setScreen('list'); resetForm(); }} className="p-1">
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <h1 className="text-lg font-bold text-foreground">
            {editingAddress ? 'Edit Address' : 'Add New Address'}
          </h1>
        </div>

        {/* Form Card */}
        <div className="bg-card rounded-2xl border border-border/50 shadow-sm p-5 space-y-5">
          <form onSubmit={handleSaveAddress} className="space-y-5">
            {/* Full Name */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-foreground flex items-center gap-2">
                <User className="h-4 w-4 text-brand-green" />
                Full Name
              </Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter full name"
                className="h-11 rounded-xl border-border/60 text-sm"
                required
              />
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Phone className="h-4 w-4 text-brand-green" />
                Phone Number
              </Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                placeholder="Enter phone number"
                className="h-11 rounded-xl border-border/60 text-sm"
                maxLength={10}
                required
              />
            </div>

            {/* Address Type */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Bookmark className="h-4 w-4 text-brand-green" />
                Address Type
              </Label>
              <div className="flex gap-3">
                {[
                  { value: 'home', label: 'Home', icon: <Home className="h-4 w-4" /> },
                  { value: 'work', label: 'Work', icon: <Building className="h-4 w-4" /> },
                  { value: 'other', label: 'Other', icon: <MapPin className="h-4 w-4" /> },
                ].map(type => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, address_type: type.value })}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
                      formData.address_type === type.value
                        ? 'border-brand-green bg-brand-green/5 text-brand-green'
                        : 'border-border/60 text-muted-foreground hover:border-border'
                    }`}
                  >
                    {type.icon}
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Street Address */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Navigation className="h-4 w-4 text-brand-green" />
                Street Address
              </Label>
              <Textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Enter street, building, area"
                className="rounded-xl border-border/60 text-sm min-h-[80px] resize-y"
                required
              />
            </div>

            {/* Landmark */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Bookmark className="h-4 w-4 text-brand-green" />
                Landmark <span className="text-muted-foreground font-normal">(Optional)</span>
              </Label>
              <Input
                value={formData.landmark}
                onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                placeholder="e.g., Near ABC Hospital"
                className="h-11 rounded-xl border-border/60 text-sm"
              />
            </div>

            {/* City & Pincode */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Building className="h-4 w-4 text-brand-green" />
                  City
                </Label>
                <Input
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Enter city"
                  className="h-11 rounded-xl border-border/60 text-sm"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Navigation className="h-4 w-4 text-brand-green" />
                  Pincode
                </Label>
                <Input
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                  placeholder="Enter pincode"
                  className="h-11 rounded-xl border-border/60 text-sm"
                  maxLength={6}
                  required
                />
              </div>
            </div>

            {/* State */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-foreground flex items-center gap-2">
                <MapPin className="h-4 w-4 text-brand-green" />
                State
              </Label>
              <div className="relative">
                <select
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full h-11 rounded-xl border border-border/60 bg-background px-3 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green"
                  required
                >
                  <option value="">Select state</option>
                  {INDIAN_STATES.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            {/* Save Button */}
            <Button
              type="submit"
              disabled={saving}
              className="w-full h-12 bg-brand-green hover:bg-brand-green/90 text-white font-semibold text-sm rounded-xl shadow-md"
            >
              {saving ? 'Saving...' : editingAddress ? 'Update Address' : 'Save Address'}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  // ── MANAGE ADDRESS LIST SCREEN ──
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-green"></div>
        <span className="ml-3 text-muted-foreground text-sm">Loading addresses...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* + Add New Address Button */}
      <div className="flex justify-end">
        <Button
          onClick={() => { resetForm(); setScreen('form'); }}
          className="bg-brand-green hover:bg-brand-green/90 text-white font-semibold rounded-xl px-5 h-11 shadow-sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Address
        </Button>
      </div>

      {/* Saved Addresses */}
      {addresses.length > 0 ? (
        <div className="space-y-3">
          <h3 className="text-base font-bold text-foreground">Saved Addresses</h3>
          {addresses.map((address) => (
            <div
              key={address.id}
              className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden"
            >
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-2.5 flex-1 min-w-0">
                    <MapPin className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-foreground">{address.name}</span>
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium capitalize ${
                          address.address_type === 'home'
                            ? 'bg-brand-green/10 text-brand-green'
                            : address.address_type === 'work'
                            ? 'bg-blue-50 text-blue-600'
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {address.address_type}
                        </span>
                        {address.is_default && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 font-medium">Default</span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                        {address.address}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {address.city}, {address.state} - {address.pincode}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Phone: {address.phone}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 ml-2">
                    <button
                      onClick={() => handleEditAddress(address)}
                      className="p-2 rounded-lg hover:bg-muted/60 transition-colors"
                    >
                      <Edit className="h-4 w-4 text-muted-foreground" />
                    </button>
                    <button
                      onClick={() => handleDeleteAddress(address.id)}
                      className="p-2 rounded-lg hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 className="h-4 w-4 text-orange-500" />
                    </button>
                  </div>
                </div>
              </div>
              {/* Deliver Here Button */}
              <div className="px-4 pb-4">
                <div className="border-t border-border/30 pt-3">
                  <Button
                    onClick={() => handleDeliverHere(address)}
                    className="w-full h-11 bg-brand-green hover:bg-brand-green/90 text-white font-semibold text-sm rounded-xl shadow-sm"
                  >
                    Deliver Here
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-card rounded-2xl border border-border/50">
          <MapPin className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-base font-semibold text-foreground mb-2">No addresses saved</h3>
          <p className="text-sm text-muted-foreground mb-4">Add your first address to proceed</p>
          <Button
            onClick={() => { resetForm(); setScreen('form'); }}
            className="bg-brand-green hover:bg-brand-green/90 text-white font-semibold rounded-xl px-6 h-11"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Address
          </Button>
        </div>
      )}
    </div>
  );
};

export default AddressManager;
