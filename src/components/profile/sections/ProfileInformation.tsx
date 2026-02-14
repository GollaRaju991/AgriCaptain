import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Props {
  profile: { name: string | null; phone: string | null };
  userEmail: string | null;
  userId: string;
  onProfileUpdate?: () => void;
}

const ProfileInformation: React.FC<Props> = ({ profile, userEmail, userId, onProfileUpdate }) => {
  const { toast } = useToast();
  const [editingField, setEditingField] = useState<string | null>(null);
  const [name, setName] = useState(profile.name || '');
  const [phone, setPhone] = useState(profile.phone || '');
  const [gender, setGender] = useState<string>('');

  const handleSave = async (field: string, value: Record<string, string>) => {
    const { error } = await supabase
      .from('profiles')
      .update({ ...value, updated_at: new Date().toISOString() })
      .eq('id', userId);
    if (error) {
      toast({ title: `Failed to update ${field}`, variant: 'destructive' });
    } else {
      if (value.name) {
        await supabase.auth.updateUser({ data: { name: value.name } });
      }
      toast({ title: `${field} updated successfully` });
      setEditingField(null);
      onProfileUpdate?.();
    }
  };

  return (
    <div className="bg-card border rounded-xl p-8 space-y-10 shadow-sm">
      {/* Personal Information */}
      <div>
        <div className="flex items-center gap-3 mb-5">
          <h2 className="text-xl font-bold text-foreground">Personal Information</h2>
          {editingField !== 'name' && (
            <button className="text-primary text-sm font-medium hover:underline" onClick={() => setEditingField('name')}>Edit</button>
          )}
        </div>
        {editingField === 'name' ? (
          <div className="flex gap-3 items-end max-w-lg">
            <div className="flex-1">
              <Label className="text-sm mb-1.5 block">Full Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full Name" className="h-12 text-base" />
            </div>
            <Button onClick={() => handleSave('Name', { name: name.trim() })}>Save</Button>
            <Button variant="outline" onClick={() => setEditingField(null)}>Cancel</Button>
          </div>
        ) : (
          <div className="bg-muted/50 border rounded-lg px-5 py-3.5 text-base text-foreground w-full max-w-lg">
            {profile.name || 'Not provided'}
          </div>
        )}
      </div>

      {/* Gender */}
      <div>
        <p className="text-sm font-semibold text-foreground mb-3">Your Gender</p>
        <RadioGroup value={gender} onValueChange={setGender} className="flex gap-8">
          <div className="flex items-center gap-2">
            <RadioGroupItem value="male" id="male" />
            <Label htmlFor="male" className="text-base cursor-pointer">Male</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="female" id="female" />
            <Label htmlFor="female" className="text-base cursor-pointer">Female</Label>
          </div>
        </RadioGroup>
      </div>

      {/* Email */}
      <div>
        <div className="flex items-center gap-3 mb-5">
          <h2 className="text-xl font-bold text-foreground">Email Address</h2>
        </div>
        <div className="bg-muted/50 border rounded-lg px-5 py-3.5 text-base text-foreground w-full max-w-lg">
          {userEmail || 'Not provided'}
        </div>
      </div>

      {/* Mobile */}
      <div>
        <div className="flex items-center gap-3 mb-5">
          <h2 className="text-xl font-bold text-foreground">Mobile Number</h2>
          {editingField !== 'phone' && (
            <button className="text-primary text-sm font-medium hover:underline" onClick={() => setEditingField('phone')}>Edit</button>
          )}
        </div>
        {editingField === 'phone' ? (
          <div className="flex gap-3 items-end max-w-lg">
            <div className="flex-1">
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone number" className="h-12 text-base" />
            </div>
            <Button onClick={() => handleSave('Phone', { phone: phone.trim() })}>Save</Button>
            <Button variant="outline" onClick={() => setEditingField(null)}>Cancel</Button>
          </div>
        ) : (
          <div className="bg-muted/50 border rounded-lg px-5 py-3.5 text-base text-foreground w-full max-w-lg">
            {profile.phone || 'Not provided'}
          </div>
        )}
      </div>

      {/* FAQs */}
      <div>
        <h2 className="text-xl font-bold text-foreground mb-5">FAQs</h2>
        <div className="space-y-5 text-sm">
          <div>
            <p className="font-semibold text-foreground">What happens when I update my email address (or mobile number)?</p>
            <p className="text-muted-foreground mt-1.5">Your login email id (or mobile number) changes, likewise. You'll receive all your account related communication on your updated email address (or mobile number).</p>
          </div>
          <div>
            <p className="font-semibold text-foreground">Does my Seller account get affected when I update my email address?</p>
            <p className="text-muted-foreground mt-1.5">Agrizin has a 'single sign-on' policy. Any changes will reflect in your Seller account also.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileInformation;
