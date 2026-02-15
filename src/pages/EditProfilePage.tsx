import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import MobileBottomNav from '@/components/MobileBottomNav';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, User, Phone, MapPin, CreditCard, FileText, Loader2, Trash2 } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const EditProfilePage = () => {
  const { user, loading: authLoading, updateUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    panCard: '',
    aadharCard: ''
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('name, phone, address, pan_card, aadhar_card')
        .eq('id', user?.id)
        .single();

      if (data) {
        setFormData({
          name: data.name || '',
          phone: data.phone || '',
          address: data.address || '',
          panCard: data.pan_card || '',
          aadharCard: data.aadhar_card || '',
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  if (authLoading) return null;
  if (!user) return <Navigate to="/auth" replace />;

  const handleInputChange = (field: string, value: string) => {
    let sanitizedValue = value.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    if (field === 'panCard') sanitizedValue = sanitizedValue.toUpperCase().replace(/[^A-Z0-9]/g, '');
    else if (field === 'aadharCard') sanitizedValue = sanitizedValue.replace(/[^0-9]/g, '');
    else if (field === 'phone') sanitizedValue = sanitizedValue.replace(/[^+0-9\s-]/g, '');
    setFormData(prev => ({ ...prev, [field]: sanitizedValue }));
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast({ title: "Name is required", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const result = await updateUser({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        panCard: formData.panCard.trim(),
        aadharCard: formData.aadharCard.trim(),
      });
      if (result.success) {
        // Also update auth metadata for header sync
        await supabase.auth.updateUser({ data: { name: formData.name.trim() } });
        toast({ title: "Profile Updated" });
        navigate('/profile');
      } else {
        toast({ title: "Update Failed", description: result.error, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Update Failed", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleClearField = (field: string) => {
    setFormData(prev => ({ ...prev, [field]: '' }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple header with back arrow */}
      <div className="bg-white border-b px-4 py-3 flex items-center gap-3 sticky top-0 z-40">
        <button onClick={() => navigate('/profile')} className="p-1">
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <h1 className="text-base font-semibold text-foreground">Edit Profile</h1>
      </div>

      <div className="px-4 py-6 pb-24 space-y-5">
        <div>
          <Label htmlFor="name" className="flex items-center gap-2 mb-2 text-sm">
            <User className="h-4 w-4" /> Full Name *
          </Label>
          <Input value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} placeholder="Enter your full name" maxLength={100} />
        </div>

        <div>
          <Label htmlFor="phone" className="flex items-center gap-2 mb-2 text-sm">
            <Phone className="h-4 w-4" /> Phone Number
          </Label>
          <Input value={formData.phone} onChange={(e) => handleInputChange('phone', e.target.value)} placeholder="Enter phone number" type="tel" maxLength={15} />
        </div>

        <div>
          <Label htmlFor="address" className="flex items-center gap-2 mb-2 text-sm">
            <MapPin className="h-4 w-4" /> Address
          </Label>
          <Textarea value={formData.address} onChange={(e) => handleInputChange('address', e.target.value)} placeholder="Enter your complete address" rows={3} maxLength={500} />
        </div>

        <div>
          <Label htmlFor="panCard" className="flex items-center gap-2 mb-2 text-sm">
            <CreditCard className="h-4 w-4" /> PAN Card
          </Label>
          <div className="flex gap-2">
            <Input value={formData.panCard} onChange={(e) => handleInputChange('panCard', e.target.value)} placeholder="e.g., ABCDE1234F" maxLength={10} className="flex-1" />
            {formData.panCard && (
              <Button variant="ghost" size="icon" onClick={() => handleClearField('panCard')}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            )}
          </div>
          {formData.panCard && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.panCard) && (
            <p className="text-sm text-destructive mt-1">Invalid PAN format</p>
          )}
        </div>

        <div>
          <Label htmlFor="aadharCard" className="flex items-center gap-2 mb-2 text-sm">
            <FileText className="h-4 w-4" /> Aadhar Card
          </Label>
          <div className="flex gap-2">
            <Input value={formData.aadharCard} onChange={(e) => handleInputChange('aadharCard', e.target.value)} placeholder="Enter 12-digit Aadhar number" maxLength={12} className="flex-1" />
            {formData.aadharCard && (
              <Button variant="ghost" size="icon" onClick={() => handleClearField('aadharCard')}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            )}
          </div>
          {formData.aadharCard && !/^\d{12}$/.test(formData.aadharCard) && (
            <p className="text-sm text-destructive mt-1">Aadhar must be 12 digits</p>
          )}
        </div>

        <div className="flex gap-3 pt-4">
          <Button onClick={handleSave} className="flex-1" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Save Changes
          </Button>
          <Button variant="outline" onClick={() => navigate('/profile')} className="flex-1" disabled={loading}>
            Cancel
          </Button>
        </div>
      </div>

      <MobileBottomNav />
    </div>
  );
};

export default EditProfilePage;
