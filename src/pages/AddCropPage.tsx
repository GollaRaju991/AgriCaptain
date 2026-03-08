import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Upload, X, User, Phone, MapPin, Hash, Home, Building2, Map, Loader2, Pencil, Trash2, Plus, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import CropDetailsForm from '@/components/CropDetailsForm';
import MobileBottomNav from '@/components/MobileBottomNav';
import { states, districts, divisions, mandals, villages, getMandalsForDistrict } from '@/data/locationData';

const allIndianStates = states.IN || [];

interface SellerData {
  id: string;
  name: string;
  aadhaar_number: string;
  phone: string;
  address: string;
  village: string | null;
  district: string | null;
  state: string | null;
  pincode: string;
  photo_url: string | null;
}

type PageStep = 'profile-selection' | 'profile-form' | 'crop-form';

const AddCropPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editCropId = searchParams.get('editCrop');
  const { toast } = useToast();
  const { language } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [sellerProfiles, setSellerProfiles] = useState<SellerData[]>([]);
  const [selectedSeller, setSelectedSeller] = useState<SellerData | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [editingSeller, setEditingSeller] = useState<SellerData | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [deletingSeller, setDeletingSeller] = useState(false);
  const [step, setStep] = useState<PageStep>('profile-selection');

  const [formData, setFormData] = useState({
    name: '', phone: '', address: '', village: '', district: '', state: '', mandal: '', pincode: '',
  });

  const label = (en: string, te: string, hi?: string) => {
    if (language === 'te') return te;
    if (language === 'hi') return hi || en;
    return en;
  };

  // Location dropdowns
  const availableDistricts = useMemo(() => {
    if (!formData.state) return [];
    const stateObj = allIndianStates.find(s => s.name === formData.state);
    if (!stateObj) return [];
    return (districts as any)[stateObj.code] || [];
  }, [formData.state]);

  const availableMandals = useMemo(() => {
    if (!formData.district) return [];
    const districtObj = availableDistricts.find((d: any) => d.name === formData.district);
    if (!districtObj) return [];
    return getMandalsForDistrict(districtObj.code);
  }, [formData.district, availableDistricts]);

  const availableVillages = useMemo(() => {
    if (!formData.mandal) return [];
    const mandalObj = availableMandals.find((m: any) => m.name === formData.mandal);
    if (!mandalObj) return [];
    return (villages as any)[mandalObj.code] || [];
  }, [formData.mandal, availableMandals]);

  useEffect(() => {
    const loadProfiles = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: 'Please login first', variant: 'destructive' });
        navigate('/auth');
        return;
      }
      setUserId(user.id);

      const { data: sellers } = await supabase
        .from('sellers')
        .select('*')
        .eq('user_id', user.id)
        .eq('seller_type', 'farmers_market')
        .order('created_at', { ascending: false });

      if (sellers && sellers.length > 0) {
        setSellerProfiles(sellers as unknown as SellerData[]);
        setStep('profile-selection');
      } else {
        setStep('profile-form');
      }
      setLoading(false);
    };
    loadProfiles();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (field: string, value: string) => {
    const resets: Record<string, string[]> = {
      state: ['district', 'mandal', 'village'],
      district: ['mandal', 'village'],
      mandal: ['village'],
    };
    const fieldsToReset = resets[field] || [];
    const updated = { ...formData, [field]: value };
    fieldsToReset.forEach(f => { updated[f as keyof typeof updated] = ''; });
    setFormData(updated);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Max 5MB', variant: 'destructive' });
      return;
    }
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const resetForm = () => {
    setFormData({ name: '', phone: '', address: '', village: '', district: '', state: '', mandal: '', pincode: '' });
    setPhotoFile(null);
    setPhotoPreview(null);
    setEditingSeller(null);
  };

  const startCreateNew = () => {
    resetForm();
    setStep('profile-form');
  };

  const startEditProfile = (seller: SellerData) => {
    setEditingSeller(seller);
    setFormData({
      name: seller.name,
      phone: seller.phone,
      address: seller.address,
      village: seller.village || '',
      district: seller.district || '',
      state: seller.state || '',
      mandal: '',
      pincode: seller.pincode,
    });
    setPhotoPreview(seller.photo_url);
    setStep('profile-form');
  };

  const handleDeleteProfile = async (seller: SellerData) => {
    setDeletingSeller(true);
    try {
      await supabase.from('farmer_crops').delete().eq('seller_id', seller.id);
      const { error } = await supabase.from('sellers').delete().eq('id', seller.id);
      if (error) throw error;
      const updated = sellerProfiles.filter(s => s.id !== seller.id);
      setSellerProfiles(updated);
      if (selectedSeller?.id === seller.id) setSelectedSeller(null);
      toast({ title: label('Farmer profile deleted', 'రైతు ప్రొఫైల్ తొలగించబడింది') });
      if (updated.length === 0) {
        setStep('profile-form');
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setDeletingSeller(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setSubmitting(true);
    try {
      let photoUrl = editingSeller?.photo_url || null;
      if (photoFile) {
        const ext = photoFile.name.split('.').pop();
        const filePath = `${userId}/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage.from('seller-photos').upload(filePath, photoFile);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('seller-photos').getPublicUrl(filePath);
        photoUrl = publicUrl;
      }

      const sellerData = {
        user_id: userId,
        seller_type: 'farmers_market',
        name: formData.name,
        aadhaar_number: 'N/A',
        phone: formData.phone,
        address: formData.address,
        village: formData.village,
        district: formData.district,
        state: formData.state,
        pincode: formData.pincode,
        photo_url: photoUrl,
      };

      if (editingSeller) {
        const { error } = await supabase.from('sellers').update(sellerData).eq('id', editingSeller.id);
        if (error) throw error;
        const updatedSeller = { ...editingSeller, ...sellerData, id: editingSeller.id } as SellerData;
        setSellerProfiles(prev => prev.map(s => s.id === editingSeller.id ? updatedSeller : s));
        setSelectedSeller(updatedSeller);
        toast({ title: label('Profile updated', 'ప్రొఫైల్ అప్‌డేట్ చేయబడింది') });
      } else {
        const { data, error } = await supabase.from('sellers').insert(sellerData).select().single();
        if (error) throw error;
        const newSeller = data as unknown as SellerData;
        setSellerProfiles(prev => [newSeller, ...prev]);
        setSelectedSeller(newSeller);
        toast({ title: label('Profile saved', 'ప్రొఫైల్ సేవ్ చేయబడింది') });
      }
      resetForm();
      setStep('crop-form');
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const selectProfileAndContinue = (seller: SellerData) => {
    setSelectedSeller(seller);
    setStep('crop-form');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const headerTitle = step === 'profile-selection'
    ? label('Select Farmer Profile', 'రైతు ప్రొఫైల్ ఎంచుకోండి', 'किसान प्रोफ़ाइल चुनें')
    : step === 'profile-form'
      ? (editingSeller ? label('Edit Farmer Profile', 'రైతు ప్రొఫైల్ మార్చండి') : label('New Farmer Profile', 'కొత్త రైతు ప్రొఫైల్'))
      : label('Crop Details', 'పంట వివరాలు', 'फसल विवरण');

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Mobile header */}
      <div className="lg:hidden sticky top-0 z-50 bg-green-600 text-white flex items-center gap-3 px-4 py-3">
        <button onClick={() => {
          if (step === 'crop-form') {
            setStep(sellerProfiles.length > 0 ? 'profile-selection' : 'profile-form');
          } else if (step === 'profile-form' && sellerProfiles.length > 0) {
            setStep('profile-selection');
          } else {
            navigate('/sell-crop');
          }
        }}>
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-lg font-bold">{headerTitle}</h1>
      </div>

      {/* Desktop back header */}
      <div className="hidden lg:flex items-center gap-3 container mx-auto max-w-2xl px-4 pt-6 pb-2">
        <button
          onClick={() => {
            if (step === 'crop-form') {
              setStep(sellerProfiles.length > 0 ? 'profile-selection' : 'profile-form');
            } else if (step === 'profile-form' && sellerProfiles.length > 0) {
              setStep('profile-selection');
            } else {
              navigate('/sell-crop');
            }
          }}
          className="p-2 rounded-full hover:bg-muted transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <h1 className="text-xl font-bold text-foreground">{headerTitle}</h1>
      </div>

      <main className="container mx-auto px-4 py-4 max-w-2xl">
        {/* ──── Step 1: Profile Selection ──── */}
        {step === 'profile-selection' && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {label('Select an existing farmer profile or create a new one', 'ఇప్పటికే ఉన్న రైతు ప్రొఫైల్ ఎంచుకోండి లేదా కొత్తది సృష్టించండి')}
            </p>

            {sellerProfiles.map((seller) => (
              <Card key={seller.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {seller.photo_url ? (
                      <img src={seller.photo_url} alt="" className="w-12 h-12 rounded-full object-cover border-2 border-green-500 flex-shrink-0" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-lg flex-shrink-0">
                        {seller.name.charAt(0)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-foreground">{seller.name}</p>
                      <p className="text-sm text-muted-foreground">+91 {seller.phone}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {[seller.village, seller.district, seller.state].filter(Boolean).join(', ')}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-3">
                    <Button size="sm" className="flex-1" onClick={() => selectProfileAndContinue(seller)}>
                      <Check className="h-3 w-3 mr-1" /> {label('Use This', 'ఉపయోగించు')}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => startEditProfile(seller)}>
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-destructive border-destructive/30" disabled={deletingSeller}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>{label('Delete this profile?', 'ఈ ప్రొఫైల్ తొలగించాలా?')}</AlertDialogTitle>
                          <AlertDialogDescription>
                            {label('This will also delete all crops linked to this profile.', 'ఈ ప్రొఫైల్‌కు లింక్ చేయబడిన అన్ని పంటలు కూడా తొలగించబడతాయి.')}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{label('Cancel', 'రద్దు')}</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteProfile(seller)}>{label('Delete', 'తొలగించు')}</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}

            <Button variant="outline" className="w-full py-3" onClick={startCreateNew}>
              <Plus className="h-4 w-4 mr-2" /> {label('Create New Farmer Profile', 'కొత్త రైతు ప్రొఫైల్ సృష్టించండి')}
            </Button>
          </div>
        )}

        {/* ──── Step 2: Profile Form ──── */}
        {step === 'profile-form' && (
          <Card className="rounded-2xl border-0 shadow-lg bg-gradient-to-b from-card to-secondary/30">
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">
                  {editingSeller ? label('Edit Farmer Profile', 'రైతు ప్రొఫైల్ మార్చండి') : label('Farmer Details', 'రైతు వివరాలు')}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {label('Fill your details to start listing crops', 'పంటలు జాబితా చేయడానికి మీ వివరాలు నమోదు చేయండి')}
                </p>
              </div>

              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" /> {label('Name', 'పేరు')} *
                  </Label>
                  <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required className="mt-1" placeholder={label('Enter full name', 'పూర్తి పేరు')} />
                </div>

                <div>
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" /> {label('Phone', 'ఫోన్')} *
                  </Label>
                  <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleInputChange} required className="mt-1" placeholder={label('Phone number', 'ఫోన్ నంబర్')} />
                </div>

                <div>
                  <Label htmlFor="address" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" /> {label('Address', 'అడ్రస్')} *
                  </Label>
                  <Textarea id="address" name="address" value={formData.address} onChange={handleInputChange} required className="mt-1" placeholder={label('Full address', 'పూర్తి అడ్రస్')} rows={2} />
                </div>

                {/* State */}
                <div>
                  <Label className="flex items-center gap-2">
                    <Map className="h-4 w-4 text-muted-foreground" /> {label('State', 'రాష్ట్రం')} *
                  </Label>
                  <Select value={formData.state} onValueChange={(v) => handleSelectChange('state', v)}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder={label('Select State', 'రాష్ట్రం ఎంచుకోండి')} /></SelectTrigger>
                    <SelectContent>
                      {allIndianStates.map((s) => (
                        <SelectItem key={s.code} value={s.name}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* District */}
                <div>
                  <Label className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" /> {label('District', 'జిల్లా')} *
                  </Label>
                  <Select value={formData.district} onValueChange={(v) => handleSelectChange('district', v)} disabled={!formData.state}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder={label('Select District', 'జిల్లా ఎంచుకోండి')} /></SelectTrigger>
                    <SelectContent>
                      {availableDistricts.map((d: any) => (
                        <SelectItem key={d.code} value={d.name}>{d.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Mandal */}
                <div>
                  <Label className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" /> {label('Mandal', 'మండలం')}
                  </Label>
                  {availableMandals.length > 0 ? (
                    <Select value={formData.mandal} onValueChange={(v) => handleSelectChange('mandal', v)} disabled={!formData.district}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder={label('Select Mandal', 'మండలం ఎంచుకోండి')} /></SelectTrigger>
                      <SelectContent>
                        {availableMandals.map((m: any) => (
                          <SelectItem key={m.code} value={m.name}>{m.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input name="mandal" value={formData.mandal} onChange={handleInputChange} className="mt-1" placeholder={label('Enter mandal', 'మండలం నమోదు చేయండి')} disabled={!formData.district} />
                  )}
                </div>

                {/* Village */}
                <div>
                  <Label className="flex items-center gap-2">
                    <Home className="h-4 w-4 text-muted-foreground" /> {label('Village', 'గ్రామం')} *
                  </Label>
                  {availableVillages.length > 0 ? (
                    <Select value={formData.village} onValueChange={(v) => handleSelectChange('village', v)} disabled={!formData.mandal}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder={label('Select Village', 'గ్రామం ఎంచుకోండి')} /></SelectTrigger>
                      <SelectContent>
                        {availableVillages.map((v: any) => (
                          <SelectItem key={v.code} value={v.name}>{v.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input name="village" value={formData.village} onChange={handleInputChange} required className="mt-1" placeholder={label('Enter village', 'గ్రామం నమోదు చేయండి')} disabled={!formData.mandal && availableMandals.length > 0} />
                  )}
                </div>

                {/* Pincode */}
                <div>
                  <Label htmlFor="pincode" className="flex items-center gap-2">
                    <Hash className="h-4 w-4 text-muted-foreground" /> {label('Pin Code', 'పిన్ కోడ్')} *
                  </Label>
                  <Input id="pincode" name="pincode" value={formData.pincode} onChange={handleInputChange} required className="mt-1" placeholder="XXXXXX" maxLength={6} />
                </div>

                {/* Photo */}
                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <Upload className="h-4 w-4 text-muted-foreground" /> {label('Profile Photo', 'ఫోటో')}
                  </Label>
                  {photoPreview ? (
                    <div className="relative inline-block">
                      <img src={photoPreview} alt="Preview" className="w-28 h-28 object-cover rounded-lg border" />
                      <button type="button" onClick={() => { setPhotoFile(null); setPhotoPreview(null); }} className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors">
                      <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">{label('Click to upload (max 5MB)', 'అప్‌లోడ్ చేయండి (5MB)')}</p>
                    </div>
                  )}
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                </div>

                <Button type="submit" disabled={submitting} className="w-full py-3">
                  {submitting ? label('Saving...', 'సేవ్ అవుతోంది...') : label('Save & Continue', 'సేవ్ & కొనసాగించు')}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* ──── Step 3: Crop Form ──── */}
        {step === 'crop-form' && selectedSeller && (
          <>
            {/* Selected farmer summary */}
            <Card className="mb-4 rounded-xl">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    {label('Using Profile', 'ప్రొఫైల్ ఉపయోగించడం')}
                  </p>
                  <Button variant="ghost" size="sm" className="text-xs" onClick={() => setStep('profile-selection')}>
                    {label('Change', 'మార్చు')}
                  </Button>
                </div>
                <div className="flex items-center gap-3">
                  {selectedSeller.photo_url ? (
                    <img src={selectedSeller.photo_url} alt="" className="w-10 h-10 rounded-full object-cover border-2 border-green-500" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-sm">
                      {selectedSeller.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-foreground text-sm">{selectedSeller.name}</p>
                    <p className="text-xs text-muted-foreground">{[selectedSeller.village, selectedSeller.district].filter(Boolean).join(', ')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <CropDetailsForm
              sellerId={selectedSeller.id}
              userId={userId!}
              editCropId={editCropId || undefined}
              onComplete={() => navigate('/sell-crop')}
            />
          </>
        )}
      </main>

      <MobileBottomNav />
    </div>
  );
};

export default AddCropPage;
