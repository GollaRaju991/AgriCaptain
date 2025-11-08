
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Plus, Edit, Trash2, Home, Building, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import LocationDetector from './LocationDetector';

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
}

const AddressManager: React.FC<AddressManagerProps> = ({ onAddressSelect, selectedAddressId, onClose }) => {
  const { toast } = useToast();
  const { user, session } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: '',
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
    if (!user || !session) {
      console.log('No authenticated user, skipping address fetch');
      return;
    }
    
    setLoading(true);
    console.log('Fetching addresses for user:', user.id);

    try {
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      console.log('Addresses fetch result:', { data, error });

      if (error) {
        console.error('Error fetching addresses:', error);
        toast({
          title: "Error loading addresses",
          description: error.message || "Failed to load your saved addresses",
          variant: "destructive"
        });
        setAddresses([]);
      } else {
        console.log('Successfully fetched addresses:', data?.length || 0);
        setAddresses(data || []);
        
        // Auto-select default address if none selected
        if (data && data.length > 0 && !selectedAddressId) {
          const defaultAddress = data.find((addr) => addr.is_default) || data[0];
          if (defaultAddress) {
            console.log('Auto-selecting default address:', defaultAddress);
            onAddressSelect(defaultAddress);
          }
        }
      }
    } catch (error) {
      console.error('Exception fetching addresses:', error);
      toast({
        title: "Error loading addresses",
        description: "Something went wrong while loading addresses",
        variant: "destructive"
      });
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleLocationDetected = (location: any) => {
    console.log('Location detected:', location);
    setFormData({
      ...formData,
      pincode: location.pincode || '',
      city: location.city || location.district || '',
      state: location.state || '',
      address: location.area ? `${location.area}, ${location.city || location.district}` : formData.address
    });
    
    toast({
      title: "Location detected",
      description: `Found: ${location.city || location.district}, ${location.state}`,
    });
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !session) {
      toast({
        title: "Authentication required",
        description: "Please login to save address",
        variant: "destructive"
      });
      return;
    }
    
    if (!formData.name || !formData.phone || !formData.address || !formData.city || !formData.state || !formData.pincode) {
      toast({
        title: "Please fill all required fields",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);

    try {
      const addressData = {
        user_id: user.id,
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        pincode: formData.pincode.trim(),
        address_type: formData.address_type,
        is_default: addresses.length === 0 // First address is default
      };

      console.log('Saving address data:', addressData);

      if (editingAddress) {
        // Update existing address
        const { data, error } = await supabase
          .from('addresses')
          .update({
            ...addressData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingAddress.id)
          .eq('user_id', user.id) // Extra security check
          .select()
          .single();

        if (error) {
          console.error('Error updating address:', error);
          toast({
            title: "Error updating address",
            description: error.message,
            variant: "destructive"
          });
          return;
        }
        
        console.log('Address updated successfully:', data);
        toast({ title: "Address updated successfully" });
        onAddressSelect(data);
      } else {
        // Create new address
        const { data, error } = await supabase
          .from('addresses')
          .insert([{
            ...addressData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
          .select()
          .single();

        if (error) {
          console.error('Error saving address:', error);
          toast({
            title: "Error saving address",
            description: error.message,
            variant: "destructive"
          });
          return;
        }
        
        console.log('Address saved successfully:', data);
        toast({ title: "Address added successfully" });
        onAddressSelect(data);
      }

      // Refresh addresses list and close form
      await fetchAddresses();
      resetForm();
      setShowForm(false);
    } catch (error) {
      console.error('Exception saving address:', error);
      toast({
        title: "Error saving address",
        description: "Something went wrong while saving the address",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: user?.name || '',
      phone: user?.phone || '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      address_type: 'home'
    });
    setEditingAddress(null);
  };

  const handleEditAddress = (address: Address) => {
    setFormData({
      name: address.name,
      phone: address.phone,
      address: address.address,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      address_type: address.address_type
    });
    setEditingAddress(address);
    setShowForm(true);
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!user || !session) {
      toast({
        title: "Authentication required",
        description: "Please login to delete address",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('addresses')
        .delete()
        .eq('id', addressId)
        .eq('user_id', user.id); // Extra security check

      if (error) {
        console.error('Error deleting address:', error);
        toast({
          title: "Error deleting address",
          description: error.message,
          variant: "destructive"
        });
      } else {
        console.log('Address deleted successfully');
        toast({ title: "Address deleted successfully" });
        await fetchAddresses();
      }
    } catch (error) {
      console.error('Exception deleting address:', error);
      toast({
        title: "Error deleting address",
        description: "Something went wrong while deleting the address",
        variant: "destructive"
      });
    }
  };

  const handleUseAddress = (address: Address) => {
    console.log('Using address:', address);
    onAddressSelect(address);
    if (onClose) {
      onClose();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading addresses...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Manage Addresses</h3>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              resetForm();
              setShowForm(!showForm);
            }}
            className="text-blue-600 border-blue-600 hover:bg-blue-50"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Address
          </Button>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Address Form */}
      {showForm && (
        <Card className="border-2 border-blue-500">
          <CardHeader className="bg-blue-50">
            <CardTitle className="text-lg flex items-center justify-between">
              <span>{editingAddress ? 'Edit Address' : 'Add New Address'}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSaveAddress} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter full name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter 10-digit mobile number"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Address *</Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="House No, Building, Street, Landmark"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="pincode">Pincode *</Label>
                <Input
                  id="pincode"
                  name="pincode"
                  type="text"
                  value={formData.pincode}
                  onChange={handleInputChange}
                  placeholder="Enter pincode"
                  maxLength={6}
                  required
                />
              </div>
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="Enter city"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="Enter state"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address_type">Address Type</Label>
                <select
                  id="address_type"
                  name="address_type"
                  value={formData.address_type}
                  onChange={handleInputChange}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="home">Home</option>
                  <option value="work">Work</option>
                </select>
              </div>

              <div className="mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <LocationDetector onLocationDetected={handleLocationDetected} />
                </div>
              </div>

              <div className="flex space-x-3 pt-2">
                <Button 
                  type="submit" 
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    editingAddress ? 'Update Address' : 'Save Address'
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  disabled={saving}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Address List */}
      {addresses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Saved Addresses ({addresses.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {addresses.map((address) => (
                <div key={address.id} className="flex items-start justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="flex items-center space-x-1">
                        {address.address_type === 'home' ? (
                          <Home className="h-4 w-4 text-gray-500" />
                        ) : (
                          <Building className="h-4 w-4 text-gray-500" />
                        )}
                        <span className="font-medium">{address.name}</span>
                      </div>
                      {address.is_default && (
                        <Badge variant="secondary" className="text-xs">
                          Default
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs capitalize">
                        {address.address_type}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{address.address}</p>
                    <p className="text-sm text-gray-600 mb-1">
                      {address.city}, {address.state} - {address.pincode}
                    </p>
                    <p className="text-sm text-gray-600">Phone: {address.phone}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditAddress(address)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteAddress(address.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUseAddress(address)}
                      className="text-blue-600 border-blue-600 hover:bg-blue-50"
                    >
                      Use This
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {addresses.length === 0 && !showForm && (
        <Card className="text-center py-8">
          <CardContent>
            <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No addresses saved</h3>
            <p className="text-gray-600 mb-4">Add your first address to proceed with checkout</p>
            <Button 
              onClick={() => {
                resetForm();
                setShowForm(true);
              }} 
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Address
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AddressManager;
