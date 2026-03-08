import React, { useState, useRef, useMemo } from 'react';
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

const allIndianStates = states.IN || [];

const sellerSubTypes = [
  { value: 'farmer', label: 'Farmer' },
  { value: 'retailer', label: 'Retailer' },
  { value: 'distributor', label: 'Distributor' },
  { value: 'brand', label: 'Brand' },
];

const SellerRegistrationForm = () => {
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

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    aadhaarNumber: '',
    shopFarmName: '',
    sellerSubType: '',
    address: '',
    state: '',
    district: '',
    pincode: '',
    bankAccountHolder: '',
    bankAccountNumber: '',
    bankIfsc: '',
    farmLocation: '',
    googleMapLocation: '',
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
      let photoUrl: string | null = null;
      let aadhaarDocUrl: string | null = null;
      let panDocUrl: string | null = null;
      let bannerUrl: string | null = null;

      if (photoFile) photoUrl = await uploadFile(photoFile, 'seller-photos', user.id);
      if (aadhaarDocFile) aadhaarDocUrl = await uploadFile(aadhaarDocFile, 'seller-documents', user.id);
      if (panDocFile) panDocUrl = await uploadFile(panDocFile, 'seller-documents', user.id);
      if (bannerFile) bannerUrl = await uploadFile(bannerFile, 'seller-photos', user.id);

      const { error } = await (supabase.from('sellers') as any).insert({
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
      });

      if (error) throw error;

      toast({ title: 'Registration Successful!', description: 'Now add your products.' });
      navigate('/seller/add-product');
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
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="flex items-center gap-1.5 text-sm mb-1">
            <User className="h-3.5 w-3.5 text-primary" /> Full Name <span className="text-destructive">*</span>
          </Label>
          <Input name="name" value={formData.name} onChange={handleChange} required placeholder="Enter your full name" />
        </div>
        <div>
          <Label className="flex items-center gap-1.5 text-sm mb-1">
            <Phone className="h-3.5 w-3.5 text-primary" /> Phone Number <span className="text-destructive">*</span>
          </Label>
          <Input name="phone" type="tel" value={formData.phone} onChange={handleChange} required placeholder="Enter phone number" />
        </div>
        <div>
          <Label className="flex items-center gap-1.5 text-sm mb-1">
            <Mail className="h-3.5 w-3.5 text-primary" /> Email ID
          </Label>
          <Input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Enter email address" />
        </div>
        <div>
          <Label className="flex items-center gap-1.5 text-sm mb-1">
            <CreditCard className="h-3.5 w-3.5 text-primary" /> Aadhaar Number <span className="text-destructive">*</span>
          </Label>
          <Input name="aadhaarNumber" value={formData.aadhaarNumber} onChange={handleChange} required placeholder="XXXX XXXX XXXX" maxLength={14} />
        </div>
        <div>
          <Label className="flex items-center gap-1.5 text-sm mb-1">
            <Store className="h-3.5 w-3.5 text-primary" /> Shop / Farm Name <span className="text-destructive">*</span>
          </Label>
          <Input name="shopFarmName" value={formData.shopFarmName} onChange={handleChange} required placeholder="Enter shop or farm name" />
        </div>
        <div>
          <Label className="flex items-center gap-1.5 text-sm mb-1">
            <BadgeCheck className="h-3.5 w-3.5 text-primary" /> Seller Type <span className="text-destructive">*</span>
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
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="flex items-center gap-1.5 text-sm mb-1">
            <Map className="h-3.5 w-3.5 text-primary" /> State <span className="text-destructive">*</span>
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
            <Building2 className="h-3.5 w-3.5 text-primary" /> District <span className="text-destructive">*</span>
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
            <MapPin className="h-3.5 w-3.5 text-primary" /> Address <span className="text-destructive">*</span>
          </Label>
          <Input name="address" value={formData.address} onChange={handleChange} required placeholder="Enter full address" />
        </div>
        <div>
          <Label className="flex items-center gap-1.5 text-sm mb-1">
            <Hash className="h-3.5 w-3.5 text-primary" /> Pincode <span className="text-destructive">*</span>
          </Label>
          <Input name="pincode" value={formData.pincode} onChange={handleChange} required placeholder="Enter pincode" maxLength={6} />
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
        {submitting ? 'Submitting...' : 'Register as Seller →'}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Already registered? <span className="text-primary font-bold cursor-pointer" onClick={() => navigate('/auth')}>Login</span>
      </p>
    </form>
  );
};

export default SellerRegistrationForm;
