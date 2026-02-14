import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Edit, Trash2, Home, Building, MapPin } from 'lucide-react';

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
}

interface Props {
  userId: string;
}

const ManageAddressesDesktop: React.FC<Props> = ({ userId }) => {
  const { toast } = useToast();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addressForm, setAddressForm] = useState({ name: '', phone: '', address: '', city: '', state: '', pincode: '', address_type: 'home' });
  const [savingAddress, setSavingAddress] = useState(false);

  useEffect(() => { if (userId) fetchAddresses(); }, [userId]);

  const fetchAddresses = async () => {
    const { data } = await supabase.from('addresses').select('*').eq('user_id', userId).order('is_default', { ascending: false });
    setAddresses(data || []);
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressForm.name || !addressForm.phone || !addressForm.address || !addressForm.city || !addressForm.state || !addressForm.pincode) {
      toast({ title: 'Please fill all fields', variant: 'destructive' }); return;
    }
    setSavingAddress(true);
    const payload = { ...addressForm, user_id: userId, is_default: addresses.length === 0 };

    if (editingAddress) {
      const { error } = await supabase.from('addresses').update({ ...payload, updated_at: new Date().toISOString() }).eq('id', editingAddress.id).eq('user_id', userId);
      if (error) toast({ title: 'Failed to update', variant: 'destructive' }); else toast({ title: 'Address updated' });
    } else {
      const { error } = await supabase.from('addresses').insert([payload]);
      if (error) toast({ title: 'Failed to add address', variant: 'destructive' }); else toast({ title: 'Address added' });
    }
    setSavingAddress(false);
    resetAddressForm();
    fetchAddresses();
  };

  const handleDeleteAddress = async (id: string) => {
    const { error } = await supabase.from('addresses').delete().eq('id', id).eq('user_id', userId);
    if (!error) { toast({ title: 'Address deleted' }); fetchAddresses(); }
  };

  const startEditAddress = (a: Address) => {
    setEditingAddress(a);
    setAddressForm({ name: a.name, phone: a.phone, address: a.address, city: a.city, state: a.state, pincode: a.pincode, address_type: a.address_type });
    setShowAddressForm(true);
  };

  const resetAddressForm = () => {
    setEditingAddress(null);
    setAddressForm({ name: '', phone: '', address: '', city: '', state: '', pincode: '', address_type: 'home' });
    setShowAddressForm(false);
  };

  return (
    <div className="bg-card border rounded-xl p-8 space-y-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Manage Addresses</h2>
        <Button size="sm" onClick={() => { resetAddressForm(); setShowAddressForm(true); }} className="gap-2">
          <Plus className="h-4 w-4" /> Add Address
        </Button>
      </div>

      {showAddressForm && (
        <div className="border-2 border-primary rounded-lg p-6 bg-primary/5">
          <h3 className="font-semibold text-foreground mb-4">{editingAddress ? 'Edit Address' : 'Add New Address'}</h3>
          <form onSubmit={handleSaveAddress} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Full Name *</Label><Input value={addressForm.name} onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })} placeholder="Full name" required className="mt-1" /></div>
              <div><Label>Phone *</Label><Input value={addressForm.phone} onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })} placeholder="Phone number" required className="mt-1" /></div>
            </div>
            <div><Label>Address *</Label><Input value={addressForm.address} onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })} placeholder="House No, Street, Landmark" required className="mt-1" /></div>
            <div className="grid grid-cols-3 gap-4">
              <div><Label>Pincode *</Label><Input value={addressForm.pincode} onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })} placeholder="Pincode" maxLength={6} required className="mt-1" /></div>
              <div><Label>City *</Label><Input value={addressForm.city} onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })} placeholder="City" required className="mt-1" /></div>
              <div><Label>State *</Label><Input value={addressForm.state} onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })} placeholder="State" required className="mt-1" /></div>
            </div>
            <div>
              <Label>Address Type</Label>
              <select value={addressForm.address_type} onChange={(e) => setAddressForm({ ...addressForm, address_type: e.target.value })} className="mt-1 w-full max-w-xs px-3 py-2 border rounded-md text-sm">
                <option value="home">Home</option>
                <option value="work">Work</option>
              </select>
            </div>
            <div className="flex gap-3">
              <Button type="submit" disabled={savingAddress}>{savingAddress ? 'Saving...' : editingAddress ? 'Update' : 'Save'}</Button>
              <Button type="button" variant="outline" onClick={resetAddressForm}>Cancel</Button>
            </div>
          </form>
        </div>
      )}

      {addresses.length > 0 ? (
        <div className="space-y-3">
          {addresses.map((addr) => (
            <div key={addr.id} className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {addr.address_type === 'home' ? <Home className="h-4 w-4 text-muted-foreground" /> : <Building className="h-4 w-4 text-muted-foreground" />}
                  <span className="font-medium text-foreground">{addr.name}</span>
                  {addr.is_default && <Badge variant="secondary" className="text-xs">Default</Badge>}
                  <Badge variant="outline" className="text-xs capitalize">{addr.address_type}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{addr.address}</p>
                <p className="text-sm text-muted-foreground">{addr.city}, {addr.state} - {addr.pincode}</p>
                <p className="text-sm text-muted-foreground">Phone: {addr.phone}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => startEditAddress(addr)}><Edit className="h-4 w-4" /></Button>
                <Button variant="ghost" size="sm" onClick={() => handleDeleteAddress(addr.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            </div>
          ))}
        </div>
      ) : !showAddressForm && (
        <div className="text-center py-6 border rounded-lg">
          <MapPin className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
          <p className="text-muted-foreground">No addresses saved yet.</p>
        </div>
      )}
    </div>
  );
};

export default ManageAddressesDesktop;
