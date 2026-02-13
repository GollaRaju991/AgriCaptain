import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Props {
  profile: { name: string | null; phone: string | null };
  userEmail: string | null;
  userId: string;
}

const ProfileInformation: React.FC<Props> = ({ profile, userEmail, userId }) => {
  const { toast } = useToast();
  const [editingField, setEditingField] = useState<string | null>(null);
  const [name, setName] = useState(profile.name || '');
  const [phone, setPhone] = useState(profile.phone || '');
  const [gender, setGender] = useState<string>('');

  const handleSaveName = async () => {
    const { error } = await supabase
      .from('profiles')
      .update({ name: name.trim(), updated_at: new Date().toISOString() })
      .eq('id', userId);
    if (error) {
      toast({ title: 'Failed to update name', variant: 'destructive' });
    } else {
      toast({ title: 'Name updated successfully' });
      setEditingField(null);
    }
  };

  const handleSavePhone = async () => {
    const { error } = await supabase
      .from('profiles')
      .update({ phone: phone.trim(), updated_at: new Date().toISOString() })
      .eq('id', userId);
    if (error) {
      toast({ title: 'Failed to update phone', variant: 'destructive' });
    } else {
      toast({ title: 'Phone updated successfully' });
      setEditingField(null);
    }
  };

  return (
    <div className="bg-card border rounded-lg p-6 space-y-8">
      {/* Personal Information */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-lg font-bold text-foreground">Personal Information</h2>
          {editingField !== 'name' && (
            <button className="text-blue-600 text-sm font-medium hover:underline" onClick={() => setEditingField('name')}>
              Edit
            </button>
          )}
        </div>
        {editingField === 'name' ? (
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full Name" />
            </div>
            <Button size="sm" onClick={handleSaveName}>Save</Button>
            <Button size="sm" variant="outline" onClick={() => setEditingField(null)}>Cancel</Button>
          </div>
        ) : (
          <div className="bg-muted/50 border rounded px-4 py-2.5 text-sm text-foreground w-full max-w-md">
            {profile.name || 'Not provided'}
          </div>
        )}
      </div>

      {/* Gender */}
      <div>
        <p className="text-sm font-medium text-foreground mb-2">Your Gender</p>
        <RadioGroup value={gender} onValueChange={setGender} className="flex gap-6">
          <div className="flex items-center gap-2">
            <RadioGroupItem value="male" id="male" />
            <Label htmlFor="male" className="text-sm">Male</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="female" id="female" />
            <Label htmlFor="female" className="text-sm">Female</Label>
          </div>
        </RadioGroup>
      </div>

      {/* Email */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-lg font-bold text-foreground">Email Address</h2>
        </div>
        <div className="bg-muted/50 border rounded px-4 py-2.5 text-sm text-foreground w-full max-w-md">
          {userEmail || 'Not provided'}
        </div>
      </div>

      {/* Mobile */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-lg font-bold text-foreground">Mobile Number</h2>
          {editingField !== 'phone' && (
            <button className="text-blue-600 text-sm font-medium hover:underline" onClick={() => setEditingField('phone')}>
              Edit
            </button>
          )}
        </div>
        {editingField === 'phone' ? (
          <div className="flex gap-3 items-end">
            <div className="flex-1 max-w-md">
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone number" />
            </div>
            <Button size="sm" onClick={handleSavePhone}>Save</Button>
            <Button size="sm" variant="outline" onClick={() => setEditingField(null)}>Cancel</Button>
          </div>
        ) : (
          <div className="bg-muted/50 border rounded px-4 py-2.5 text-sm text-foreground w-full max-w-md">
            {profile.phone || 'Not provided'}
          </div>
        )}
      </div>

      {/* FAQs */}
      <div>
        <h2 className="text-lg font-bold text-foreground mb-4">FAQs</h2>
        <div className="space-y-4 text-sm">
          <div>
            <p className="font-semibold text-foreground">What happens when I update my email address (or mobile number)?</p>
            <p className="text-muted-foreground mt-1">Your login email id (or mobile number) changes, likewise. You'll receive all your account related communication on your updated email address (or mobile number).</p>
          </div>
          <div>
            <p className="font-semibold text-foreground">Does my Seller account get affected when I update my email address?</p>
            <p className="text-muted-foreground mt-1">Agrizin has a 'single sign-on' policy. Any changes will reflect in your Seller account also.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileInformation;
