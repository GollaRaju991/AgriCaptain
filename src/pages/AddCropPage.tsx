import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Upload, X, User, Phone, MapPin, Hash, Home, Building2, Map, Loader2, Pencil, Trash2 } from 'lucide-react';
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
import { states, districts, divisions, mandals, villages } from '@/data/locationData';

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

const AddCropPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editCropId = searchParams.get('editCrop');
  const { toast } = useToast();
  const { translations: t, language } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [existingSeller, setExistingSeller] = useState<SellerData | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [editingFarmer, setEditingFarmer] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [deletingSeller, setDeletingSeller] = useState(false);

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
    const mandalList = (mandals as any)[districtObj.code];
    if (mandalList) return mandalList;
    const divisionList = (divisions as any)[districtObj.code];
    if (divisionList) {
      const allM: any[] = [];
      divisionList.forEach((div: any) => {
        const m = (mandals as any)[div.code];
        if (m) allM.push(...m);
      });
      return allM;
    }
    return [];
  }, [formData.district, availableDistricts]);

  const availableVillages = useMemo(() => {
    if (!formData.mandal) return [];
    const mandalObj = availableMandals.find((m: any) => m.name === formData.mandal);
    if (!mandalObj) return [];
    return (villages as any)[mandalObj.code] || [];
  }, [formData.mandal, availableMandals]);

  useEffect(() => {
    const checkFarmer = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: 'Please login first', variant: 'destructive' });
        navigate('/auth');
        return;
      }
      setUserId(user.id);

      const { data: seller } = await supabase
        .from('sellers')
        .select('*')
        .eq('user_id', user.id)
        .eq('seller_type', 'farmers_market')
        .maybeSingle();

      if (seller) {
        setExistingSeller(seller as unknown as SellerData);
      }
      setLoading(false);
    };
    checkFarmer();
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

  const startEditFarmer = () => {
    if (existingSeller) {
      setFormData({
        name: existingSeller.name,
        phone: existingSeller.phone,
        address: existingSeller.address,
        village: existingSeller.village || '',
        district: existingSeller.district || '',
        state: existingSeller.state || '',
        mandal: '',
        pincode: existingSeller.pincode,
      });
      setPhotoPreview(existingSeller.photo_url);
      setEditingFarmer(true);
    }
  };

  const handleDeleteFarmer = async () => {
    if (!existingSeller) return;
    setDeletingSeller(true);
    try {
      // Delete all crops first
      await supabase.from('farmer_crops').delete().eq('seller_id', existingSeller.id);
      // Delete seller
      const { error } = await supabase.from('sellers').delete().eq('id', existingSeller.id);
      if (error) throw error;
      toast({ title: label('Farmer details deleted', 'రైతు వివరాలు తొలగించబడ్డాయి') });
      setExistingSeller(null);
      setEditingFarmer(false);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setDeletingSeller(false);
    }
  };

  const handleFarmerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setSubmitting(true);
    try {
      let photoUrl = existingSeller?.photo_url || null;
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

      if (existingSeller) {
        // Update
        const { error } = await supabase.from('sellers').update(sellerData).eq('id', existingSeller.id);
        if (error) throw error;
        setExistingSeller({ ...existingSeller, ...sellerData, id: existingSeller.id } as SellerData);
        toast({ title: label('Farmer details updated', 'రైతు వివరాలు అప్‌డేట్ చేయబడ్డాయి') });
      } else {
        // Insert
        const { data, error } = await supabase.from('sellers').insert(sellerData).select().single();
        if (error) throw error;
        setExistingSeller(data as unknown as SellerData);
        toast({ title: label('Farmer details saved', 'రైతు వివరాలు సేవ్ చేయబడ్డాయి') });
      }
      setEditingFarmer(false);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const showFarmerForm = !existingSeller || editingFarmer;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Mobile header */}
      <div className="lg:hidden sticky top-0 z-50 bg-green-600 text-white flex items-center gap-3 px-4 py-3">
        <button onClick={() => navigate('/sell-crop')}>
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-lg font-bold">
          {showFarmerForm
            ? label('Farmer Details', 'రైతు వివరాలు', 'किसान विवरण')
            : label('Crop Details', 'పంట వివరాలు', 'फसल विवरण')}
        </h1>
      </div>

      <main className="container mx-auto px-4 py-4 max-w-2xl">
        {showFarmerForm ? (
          /* ──── Farmer Details Form ──── */
          <Card className="rounded-2xl border-0 shadow-lg bg-gradient-to-b from-card to-secondary/30">
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">
                  {editingFarmer ? label('Edit Farmer Details', 'రైతు వివరాలు మార్చండి') : label('Farmer Details', 'రైతు వివరాలు')}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {label('Fill your details once to start listing crops', 'పంటలు జాబితా చేయడానికి మీ వివరాలు నమోదు చేయండి')}
                </p>
              </div>

              <form onSubmit={handleFarmerSubmit} className="space-y-4">
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
        ) : (
          /* ──── Farmer exists → show summary + crop form ──── */
          <>
            {/* Farmer summary card */}
            <Card className="mb-4 rounded-xl">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-muted-foreground">{label('Farmer Details', 'రైతు వివరాలు')}</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={startEditFarmer}>
                      <Pencil className="h-3 w-3 mr-1" /> {label('Edit', 'మార్చు')}
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm" disabled={deletingSeller}>
                          <Trash2 className="h-3 w-3 mr-1" /> {label('Delete', 'తొలగించు')}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>{label('Delete Farmer Details?', 'రైతు వివరాలు తొలగించాలా?')}</AlertDialogTitle>
                          <AlertDialogDescription>
                            {label('This will also delete all your crops. This action cannot be undone.', 'ఇది మీ అన్ని పంటలను కూడా తొలగిస్తుంది.')}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{label('Cancel', 'రద్దు')}</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDeleteFarmer}>{label('Delete', 'తొలగించు')}</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {existingSeller.photo_url ? (
                    <img src={existingSeller.photo_url} alt="" className="w-12 h-12 rounded-full object-cover border-2 border-green-500" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-lg">
                      {existingSeller.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-foreground">{existingSeller.name}</p>
                    <p className="text-sm text-muted-foreground">+91 {existingSeller.phone}</p>
                    <p className="text-xs text-muted-foreground">{[existingSeller.village, existingSeller.district, existingSeller.state].filter(Boolean).join(', ')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Crop details form */}
            <CropDetailsForm
              sellerId={existingSeller.id}
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
