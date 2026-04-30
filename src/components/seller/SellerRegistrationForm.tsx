import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { User, Phone, Mail, CreditCard, MapPin, Building2, Map, Hash, Upload, X, Store, BadgeCheck, Landmark, Image } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { states, districts, divisions, mandals, villages } from '@/data/locationData';
import { usePincodeLookup } from '@/hooks/usePincodeLookup';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

const allIndianStates = states.IN || [];

interface SellerRegistrationFormProps {
  existingSeller?: any | null;
}

const sellerSubTypes = [
  { value: 'farmer', label: 'Farmer' },
  { value: 'retailer', label: 'Retailer' },
  { value: 'distributor', label: 'Distributor' },
  { value: 'brand', label: 'Brand' },
];

const SellerRegistrationForm: React.FC<SellerRegistrationFormProps> = ({ existingSeller = null }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { translations: t } = useLanguage();
  const photoRef = useRef<HTMLInputElement>(null);
  const aadhaarDocRef = useRef<HTMLInputElement>(null);
  const panDocRef = useRef<HTMLInputElement>(null);
  const bannerRef = useRef<HTMLInputElement>(null);

  const [submitting, setSubmitting] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [aadhaarDocFile, setAadhaarDocFile] = useState<File | null>(null);
  const [panDocFile, setPanDocFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [successOpen, setSuccessOpen] = useState(false);

  const isEditMode = !!existingSeller;

  const [formData, setFormData] = useState({
    name: existingSeller?.name || '',
    phone: existingSeller?.phone || '',
    email: existingSeller?.email || '',
    aadhaarNumber: existingSeller?.aadhaar_number || '',
    shopFarmName: existingSeller?.shop_farm_name || '',
    sellerSubType: existingSeller?.seller_sub_type || '',
    address: existingSeller?.address || '',
    state: existingSeller?.state || '',
    district: existingSeller?.district || '',
    pincode: existingSeller?.pincode || '',
    bankAccountHolder: existingSeller?.bank_account_holder || '',
    bankAccountNumber: existingSeller?.bank_account_number || '',
    bankIfsc: existingSeller?.bank_ifsc || '',
    farmLocation: existingSeller?.farm_location || '',
    googleMapLocation: existingSeller?.google_map_location || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (field: string, value: string) => {
    const resets: Record<string, string[]> = {
      state: ['district'],
      district: [],
    };
    const updated = { ...formData, [field]: value };
    (resets[field] || []).forEach(f => { updated[f as keyof typeof updated] = ''; });
    setFormData(updated);
  };

  const availableDistricts = useMemo(() => {
    if (!formData.state) return [];
    const stateObj = allIndianStates.find(s => s.name === formData.state);
    if (!stateObj) return [];
    return (districts as any)[stateObj.code] || [];
  }, [formData.state]);

  // PIN code auto-fill
  const { data: pinData, loading: pinLoading, error: pinError } = usePincodeLookup(formData.pincode);
  useEffect(() => {
    if (!pinData) return;
    setFormData((prev) => {
      const matchedState = allIndianStates.find(s => s.name.toLowerCase() === pinData.state.toLowerCase());
      const stateName = matchedState ? matchedState.name : prev.state;
      let districtName = prev.district;
      if (matchedState) {
        const distList = (districts as any)[matchedState.code] || [];
        const matched = distList.find((d: any) => d.name.toLowerCase() === pinData.district.toLowerCase());
        if (matched) districtName = matched.name;
      }
      return { ...prev, state: stateName, district: districtName };
    });
  }, [pinData]);

  const handleFileSelect = (file: File | undefined, setter: (f: File | null) => void, previewSetter?: (s: string | null) => void) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Max 5MB allowed.', variant: 'destructive' });
      return;
    }
    setter(file);
    if (previewSetter) previewSetter(URL.createObjectURL(file));
  };

  const uploadFile = async (file: File, bucket: string, userId: string) => {
    const ext = file.name.split('.').pop();
    const filePath = `${userId}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from(bucket).upload(filePath, file);
    if (error) throw error;
    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms) {
      toast({ title: 'Please agree to terms & conditions', variant: 'destructive' });
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: 'Please login first', variant: 'destructive' });
      navigate('/auth');
      return;
    }

    setSubmitting(true);
    try {
      // Re-check for duplicate registration (defensive — UI also blocks)
      if (!isEditMode) {
        const { data: existing } = await (supabase.from('sellers') as any)
          .select('id, status')
          .eq('user_id', user.id)
          .eq('seller_type', 'agriculture_products')
          .maybeSingle();
        if (existing && existing.status !== 'rejected') {
          toast({
            title: 'Already Registered',
            description: 'You already have a seller registration. Duplicate registrations are not allowed.',
            variant: 'destructive',
          });
          setSubmitting(false);
          return;
        }
      }

      let photoUrl: string | null = existingSeller?.photo_url || null;
      let aadhaarDocUrl: string | null = existingSeller?.aadhaar_document_url || null;
      let panDocUrl: string | null = existingSeller?.pan_card_url || null;
      let bannerUrl: string | null = existingSeller?.shop_banner_url || null;

      if (photoFile) photoUrl = await uploadFile(photoFile, 'seller-photos', user.id);
      if (aadhaarDocFile) aadhaarDocUrl = await uploadFile(aadhaarDocFile, 'seller-documents', user.id);
      if (panDocFile) panDocUrl = await uploadFile(panDocFile, 'seller-documents', user.id);
      if (bannerFile) bannerUrl = await uploadFile(bannerFile, 'seller-photos', user.id);

      const payload: any = {
        user_id: user.id,
        seller_type: 'agriculture_products',
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        aadhaar_number: formData.aadhaarNumber,
        shop_farm_name: formData.shopFarmName,
        seller_sub_type: formData.sellerSubType,
        address: formData.address,
        state: formData.state,
        district: formData.district,
        pincode: formData.pincode,
        bank_account_holder: formData.bankAccountHolder,
        bank_account_number: formData.bankAccountNumber,
        bank_ifsc: formData.bankIfsc,
        farm_location: formData.farmLocation,
        google_map_location: formData.googleMapLocation,
        photo_url: photoUrl,
        aadhaar_document_url: aadhaarDocUrl,
        pan_card_url: panDocUrl,
        shop_banner_url: bannerUrl,
      };

      let error: any = null;
      if (isEditMode) {
        // Resubmit a rejected registration — reset to pending, clear rejection reason
        payload.status = 'pending';
        payload.rejection_reason = null;
        const res = await (supabase.from('sellers') as any)
          .update(payload)
          .eq('id', existingSeller.id);
        error = res.error;
      } else {
        const res = await (supabase.from('sellers') as any).insert(payload);
        error = res.error;
      }

      if (error) throw error;

      setSuccessOpen(true);
    } catch (error: any) {
      toast({ title: 'Registration Failed', description: error.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const FileUploadBox = ({ label, icon: Icon, file, onSelect, inputRef }: {
    label: string; icon: any; file: File | null;
    onSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
    inputRef: React.RefObject<HTMLInputElement>;
  }) => (
    <div
      onClick={() => inputRef.current?.click()}
      className="border-2 border-dashed border-primary/30 rounded-lg p-3 text-center cursor-pointer hover:border-primary transition-colors bg-primary/5 flex flex-col items-center gap-1"
    >
      <Icon className="h-8 w-8 text-primary/60" />
      <span className="text-xs font-medium text-foreground">{label}</span>
      <span className={`text-xs ${file ? 'text-primary font-semibold' : 'text-primary/60'}`}>
        {file ? '✅ Uploaded' : 'Upload'}
      </span>
      <input ref={inputRef} type="file" accept="image/*,.pdf" onChange={onSelect} className="hidden" />
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Details */}
      <div className="grid grid-cols-1 gap-3">
        <div>
          <Label className="flex items-center gap-1.5 text-sm mb-1">
            <User className="h-4 w-4 text-primary stroke-[2.5]" /> Full Name <span className="text-destructive">*</span>
          </Label>
          <Input name="name" value={formData.name} onChange={handleChange} required placeholder="Enter your full name" />
        </div>
        <div>
          <Label className="flex items-center gap-1.5 text-sm mb-1">
            <Phone className="h-4 w-4 text-primary stroke-[2.5]" /> Phone Number <span className="text-destructive">*</span>
          </Label>
          <Input name="phone" type="tel" value={formData.phone} onChange={handleChange} required placeholder="Enter phone number" />
        </div>
        <div>
          <Label className="flex items-center gap-1.5 text-sm mb-1">
            <Mail className="h-4 w-4 text-primary stroke-[2.5]" /> Email ID
          </Label>
          <Input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Enter email address" />
        </div>
        <div>
          <Label className="flex items-center gap-1.5 text-sm mb-1">
            <CreditCard className="h-4 w-4 text-primary stroke-[2.5]" /> Aadhaar Number <span className="text-destructive">*</span>
          </Label>
          <Input name="aadhaarNumber" value={formData.aadhaarNumber} onChange={handleChange} required placeholder="XXXX XXXX XXXX" maxLength={14} />
        </div>
        <div>
          <Label className="flex items-center gap-1.5 text-sm mb-1">
            <Store className="h-4 w-4 text-primary stroke-[2.5]" /> Shop / Farm Name <span className="text-destructive">*</span>
          </Label>
          <Input name="shopFarmName" value={formData.shopFarmName} onChange={handleChange} required placeholder="Enter shop or farm name" />
        </div>
        <div>
          <Label className="flex items-center gap-1.5 text-sm mb-1">
            <BadgeCheck className="h-4 w-4 text-primary stroke-[2.5]" /> Seller Type <span className="text-destructive">*</span>
          </Label>
          <Select value={formData.sellerSubType} onValueChange={(v) => handleSelectChange('sellerSubType', v)}>
            <SelectTrigger><SelectValue placeholder="Select Type" /></SelectTrigger>
            <SelectContent>
              {sellerSubTypes.map(st => (
                <SelectItem key={st.value} value={st.value}>{st.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Location */}
      <div className="grid grid-cols-1 gap-3">
        <div>
          <Label className="flex items-center gap-1.5 text-sm mb-1">
            <Map className="h-4 w-4 text-primary stroke-[2.5]" /> State <span className="text-destructive">*</span>
          </Label>
          <Select value={formData.state} onValueChange={(v) => handleSelectChange('state', v)}>
            <SelectTrigger><SelectValue placeholder="Select State" /></SelectTrigger>
            <SelectContent>
              {allIndianStates.map((s) => (
                <SelectItem key={s.code} value={s.name}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="flex items-center gap-1.5 text-sm mb-1">
            <Building2 className="h-4 w-4 text-primary stroke-[2.5]" /> District <span className="text-destructive">*</span>
          </Label>
          <Select value={formData.district} onValueChange={(v) => handleSelectChange('district', v)} disabled={!formData.state}>
            <SelectTrigger><SelectValue placeholder="Select District" /></SelectTrigger>
            <SelectContent>
              {availableDistricts.map((d: any) => (
                <SelectItem key={d.code} value={d.name}>{d.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="flex items-center gap-1.5 text-sm mb-1">
            <MapPin className="h-4 w-4 text-primary stroke-[2.5]" /> Address <span className="text-destructive">*</span>
          </Label>
          <Input name="address" value={formData.address} onChange={handleChange} required placeholder="Enter full address" />
        </div>
        <div>
          <Label className="flex items-center gap-1.5 text-sm mb-1">
            <Hash className="h-4 w-4 text-primary stroke-[2.5]" /> Pincode <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Input
              name="pincode"
              value={formData.pincode}
              onChange={(e) => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
              required
              placeholder="Enter 6-digit pincode"
              maxLength={6}
              inputMode="numeric"
              className="pr-9"
            />
            {pinLoading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary animate-spin" />}
          </div>
          {pinError && <p className="text-xs text-destructive mt-1">{pinError}</p>}
          {pinData && !pinError && (
            <p className="text-xs text-primary mt-1">✓ {pinData.district}, {pinData.state}</p>
          )}
        </div>
      </div>

      {/* Bank Account Details */}
      <div>
        <h3 className="flex items-center gap-2 text-sm font-bold text-foreground mb-2">
          <Landmark className="h-4 w-4 text-primary" /> Bank Account Details
        </h3>
        <div className="grid grid-cols-3 gap-3 bg-muted/50 rounded-lg p-3">
          <div>
            <Label className="text-xs font-semibold">Account Holder</Label>
            <Input name="bankAccountHolder" value={formData.bankAccountHolder} onChange={handleChange} placeholder="Name" className="mt-1 text-sm" />
          </div>
          <div>
            <Label className="text-xs font-semibold">Account No.</Label>
            <Input name="bankAccountNumber" value={formData.bankAccountNumber} onChange={handleChange} placeholder="Enter number" className="mt-1 text-sm" />
          </div>
          <div>
            <Label className="text-xs font-semibold">IFSC Code</Label>
            <Input name="bankIfsc" value={formData.bankIfsc} onChange={handleChange} placeholder="Enter IFSC" className="mt-1 text-sm" />
          </div>
        </div>
      </div>

      {/* Upload Documents */}
      <div>
        <h3 className="text-sm font-bold text-foreground mb-2">Upload Documents</h3>
        <div className="grid grid-cols-3 gap-3">
          <FileUploadBox
            label="Aadhaar Card"
            icon={CreditCard}
            file={aadhaarDocFile}
            onSelect={(e) => handleFileSelect(e.target.files?.[0], setAadhaarDocFile)}
            inputRef={aadhaarDocRef}
          />
          <FileUploadBox
            label="PAN Card"
            icon={CreditCard}
            file={panDocFile}
            onSelect={(e) => handleFileSelect(e.target.files?.[0], setPanDocFile)}
            inputRef={panDocRef}
          />
          <FileUploadBox
            label="Profile Photo"
            icon={User}
            file={photoFile}
            onSelect={(e) => handleFileSelect(e.target.files?.[0], setPhotoFile, setPhotoPreview)}
            inputRef={photoRef}
          />
        </div>
      </div>

      {/* Terms */}
      <div className="flex items-center gap-2">
        <Checkbox checked={agreeTerms} onCheckedChange={(v) => setAgreeTerms(!!v)} id="terms" />
        <label htmlFor="terms" className="text-sm">
          I agree to the <span className="text-primary font-bold cursor-pointer" onClick={() => navigate('/terms-and-conditions')}>terms & conditions</span>
        </label>
      </div>

      <Button type="submit" disabled={submitting || !agreeTerms} className="w-full py-3 text-base font-bold rounded-xl">
        {submitting ? 'Submitting...' : isEditMode ? 'Resubmit for Approval →' : 'Register as Seller →'}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Already registered? <span className="text-primary font-bold cursor-pointer" onClick={() => navigate('/auth')}>Login</span>
      </p>

      {/* Success Popup */}
      <Dialog open={successOpen} onOpenChange={(o) => { if (!o) { setSuccessOpen(false); navigate('/'); } }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <div className="mx-auto mb-2">
              <CheckCircle2 className="h-16 w-16 text-primary" />
            </div>
            <DialogTitle className="text-center text-xl">Registration Completed</DialogTitle>
            <DialogDescription className="text-center">
              {isEditMode
                ? 'Your updated details have been resubmitted. Please wait for admin approval.'
                : 'Thank you for registering as a seller. Please wait for admin approval. You can add product details once your account is approved.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <Button className="w-full" onClick={() => { setSuccessOpen(false); navigate('/'); }}>
              Back to Home
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </form>
  );
};

export default SellerRegistrationForm;
