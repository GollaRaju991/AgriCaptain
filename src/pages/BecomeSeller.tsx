import React, { useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Upload, X, User, Phone, MapPin, CreditCard, Hash, Home, Building2, Map } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import CropDetailsForm from '@/components/CropDetailsForm';
import { states, districts, divisions, mandals, villages } from '@/data/locationData';
import agricultureImg from '@/assets/agriculture-products.png';
import farmersMarketImg from '@/assets/farmers-market.png';

type SellerType = 'agriculture_products' | 'farmers_market';
type FarmerStep = 'details' | 'crops';

// All Indian states for dropdown
const allIndianStates = states.IN || [];

const BecomeSeller = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { translations: t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedType, setSelectedType] = useState<SellerType | null>(null);
  const [farmerStep, setFarmerStep] = useState<FarmerStep>('details');
  const [submitting, setSubmitting] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [savedSellerId, setSavedSellerId] = useState<string | null>(null);
  const [savedUserId, setSavedUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    aadhaarNumber: '',
    phone: '',
    address: '',
    village: '',
    district: '',
    state: '',
    mandal: '',
    pincode: '',
  });

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

  // Get available districts for selected state
  const availableDistricts = useMemo(() => {
    if (!formData.state) return [];
    const stateObj = allIndianStates.find(s => s.name === formData.state);
    if (!stateObj) return [];
    return (districts as any)[stateObj.code] || [];
  }, [formData.state]);

  // Get available mandals for selected district
  const availableMandals = useMemo(() => {
    if (!formData.district) return [];
    const districtObj = availableDistricts.find((d: any) => d.name === formData.district);
    if (!districtObj) return [];
    // Check mandals directly, or check divisions first
    const mandalList = (mandals as any)[districtObj.code];
    if (mandalList) return mandalList;
    // Try via divisions -> mandals
    const divisionList = (divisions as any)[districtObj.code];
    if (divisionList) {
      const allMandals: any[] = [];
      divisionList.forEach((div: any) => {
        const m = (mandals as any)[div.code];
        if (m) allMandals.push(...m);
      });
      return allMandals;
    }
    return [];
  }, [formData.district, availableDistricts]);

  // Get available villages for selected mandal
  const availableVillages = useMemo(() => {
    if (!formData.mandal) return [];
    // Find mandal code
    const mandalObj = availableMandals.find((m: any) => m.name === formData.mandal);
    if (!mandalObj) return [];
    return (villages as any)[mandalObj.code] || [];
  }, [formData.mandal, availableMandals]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Please select an image under 5MB.', variant: 'destructive' });
      return;
    }
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedType) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: 'Please login first', description: 'You need to be logged in to register as a seller.', variant: 'destructive' });
      navigate('/auth');
      return;
    }

    setSubmitting(true);
    try {
      let photoUrl: string | null = null;

      if (photoFile) {
        const ext = photoFile.name.split('.').pop();
        const filePath = `${user.id}/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage.from('seller-photos').upload(filePath, photoFile);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('seller-photos').getPublicUrl(filePath);
        photoUrl = publicUrl;
      }

      const insertData: any = {
        user_id: user.id,
        seller_type: selectedType,
        name: formData.name,
        aadhaar_number: selectedType === 'agriculture_products' ? formData.aadhaarNumber : 'N/A',
        phone: formData.phone,
        address: formData.address,
        pincode: formData.pincode,
        photo_url: photoUrl,
      };

      if (selectedType === 'farmers_market') {
        insertData.village = formData.village;
        insertData.district = formData.district;
        insertData.state = formData.state;
      }

      const { data, error } = await supabase.from('sellers').insert(insertData).select().single();

      if (error) throw error;

      if (selectedType === 'farmers_market') {
        setSavedSellerId((data as any).id);
        setSavedUserId(user.id);
        setFarmerStep('crops');
        toast({ title: t['farmer_details_saved'] || 'Farmer Details Saved!', description: t['now_add_crops'] || 'Now add your crop details.' });
      } else {
        toast({ title: 'Application Submitted!', description: 'We will review your application and get back to you within 24 hours.' });
        navigate('/');
      }
    } catch (error: any) {
      toast({ title: 'Submission Failed', description: error.message || 'Something went wrong.', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const sellerOptions = [
    {
      type: 'agriculture_products' as SellerType,
      titleKey: 'seller_agriculture_title',
      descKey: 'seller_agriculture_desc',
      image: agricultureImg,
    },
    {
      type: 'farmers_market' as SellerType,
      titleKey: 'seller_market_title',
      descKey: 'seller_market_desc',
      image: farmersMarketImg,
    },
  ];

  const isFarmerMarketCropStep = selectedType === 'farmers_market' && farmerStep === 'crops';

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Decorative background */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/10 to-primary/5 -z-10" />
        <div className="absolute top-0 left-0 w-72 h-72 bg-primary/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl -z-10" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/10 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl -z-10" />
      </div>

      <div className="container mx-auto px-4 py-8 max-w-3xl relative">
        {!selectedType ? (
          <>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {t['become_seller_title'] || 'Become a Seller'}
              </h1>
              <p className="text-muted-foreground">
                {t['become_seller_subtitle'] || 'Choose your selling category to get started'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {sellerOptions.map((option) => (
                <Card
                  key={option.type}
                  className="cursor-pointer group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary overflow-hidden rounded-2xl"
                  onClick={() => setSelectedType(option.type)}
                >
                  <CardContent className="p-0">
                    <div className="w-full aspect-square overflow-hidden">
                      <img
                        src={option.image}
                        alt={t[option.titleKey]}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                    <div className="p-5 text-center">
                      <h3 className="text-xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                        {t[option.titleKey]}
                      </h3>
                      <p className="text-sm text-muted-foreground">{t[option.descKey]}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        ) : isFarmerMarketCropStep ? (
          <>
            <button
              onClick={() => setFarmerStep('details')}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> {t['seller_back'] || 'Back'}
            </button>

            {/* Step indicator */}
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">✓</div>
                <span className="text-sm font-medium text-muted-foreground">{t['step_farmer_details'] || 'Farmer Details'}</span>
              </div>
              <div className="w-8 h-px bg-primary" />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">2</div>
                <span className="text-sm font-medium text-foreground">{t['step_crop_details'] || 'Crop Details'}</span>
              </div>
            </div>

            <CropDetailsForm
              sellerId={savedSellerId!}
              userId={savedUserId!}
              onComplete={() => navigate('/')}
            />
          </>
        ) : (
          <>
            <button
              onClick={() => { setSelectedType(null); setFarmerStep('details'); }}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> {t['seller_back'] || 'Back to options'}
            </button>

            {/* Step indicator for farmer's market */}
            {selectedType === 'farmers_market' && (
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">1</div>
                  <span className="text-sm font-medium text-foreground">{t['step_farmer_details'] || 'Farmer Details'}</span>
                </div>
                <div className="w-8 h-px bg-muted-foreground/30" />
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-sm font-bold">2</div>
                  <span className="text-sm font-medium text-muted-foreground">{t['step_crop_details'] || 'Crop Details'}</span>
                </div>
              </div>
            )}

            <Card className="rounded-2xl border-0 shadow-lg bg-gradient-to-b from-card to-secondary/30">
              <CardContent className="p-6 sm:p-8">
                <div className="text-center mb-6">
                  <div className="w-24 h-24 mx-auto mb-4 rounded-xl overflow-hidden shadow-md">
                    <img
                      src={selectedType === 'agriculture_products' ? agricultureImg : farmersMarketImg}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">
                    {selectedType === 'farmers_market'
                      ? (t['farmer_registration'] || 'Farmer Registration')
                      : (t['seller_registration'] || 'Seller Registration')}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedType === 'agriculture_products'
                      ? t['seller_agriculture_title']
                      : t['seller_market_title']}
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <Label htmlFor="name" className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" /> {t['seller_name'] || 'Name'} *
                    </Label>
                    <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required className="mt-1" placeholder={t['seller_enter_name'] || 'Enter your full name'} />
                  </div>

                  {/* Show Aadhaar only for Agriculture Products */}
                  {selectedType === 'agriculture_products' && (
                    <div>
                      <Label htmlFor="aadhaarNumber" className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-muted-foreground" /> {t['seller_aadhaar'] || 'Aadhaar Card Number'} *
                      </Label>
                      <Input id="aadhaarNumber" name="aadhaarNumber" value={formData.aadhaarNumber} onChange={handleInputChange} required className="mt-1" placeholder={t['seller_enter_aadhaar'] || 'XXXX XXXX XXXX'} maxLength={14} />
                    </div>
                  )}

                  <div>
                    <Label htmlFor="phone" className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" /> {t['seller_phone'] || 'Phone Number'} *
                    </Label>
                    <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleInputChange} required className="mt-1" placeholder={t['seller_enter_phone'] || 'Enter your phone number'} />
                  </div>

                  <div>
                    <Label htmlFor="address" className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" /> {t['seller_address'] || 'Address'} *
                    </Label>
                    <Textarea id="address" name="address" value={formData.address} onChange={handleInputChange} required className="mt-1" placeholder={t['seller_enter_address'] || 'Enter your full address'} rows={3} />
                  </div>

                  {selectedType === 'farmers_market' && (
                    <>
                      {/* State Dropdown */}
                      <div>
                        <Label className="flex items-center gap-2">
                          <Map className="h-4 w-4 text-muted-foreground" /> {t['seller_state'] || 'State'} *
                        </Label>
                        <Select value={formData.state} onValueChange={(v) => handleSelectChange('state', v)}>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder={t['select_state'] || 'Select State'} />
                          </SelectTrigger>
                          <SelectContent>
                            {allIndianStates.map((s) => (
                              <SelectItem key={s.code} value={s.name}>{s.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* District Dropdown */}
                      <div>
                        <Label className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" /> {t['seller_district'] || 'District'} *
                        </Label>
                        <Select value={formData.district} onValueChange={(v) => handleSelectChange('district', v)} disabled={!formData.state}>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder={t['select_district'] || 'Select District'} />
                          </SelectTrigger>
                          <SelectContent>
                            {availableDistricts.map((d: any) => (
                              <SelectItem key={d.code} value={d.name}>{d.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Mandal Dropdown / Input */}
                      <div>
                        <Label className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" /> {t['seller_mandal'] || 'Mandal'} *
                        </Label>
                        {availableMandals.length > 0 ? (
                          <Select value={formData.mandal} onValueChange={(v) => handleSelectChange('mandal', v)} disabled={!formData.district}>
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder={t['select_mandal'] || 'Select Mandal'} />
                            </SelectTrigger>
                            <SelectContent>
                              {availableMandals.map((m: any) => (
                                <SelectItem key={m.code} value={m.name}>{m.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input name="mandal" value={formData.mandal} onChange={handleInputChange} required className="mt-1" placeholder={t['enter_mandal'] || 'Enter mandal name'} disabled={!formData.district} />
                        )}
                      </div>

                      {/* Village Dropdown / Input */}
                      <div>
                        <Label className="flex items-center gap-2">
                          <Home className="h-4 w-4 text-muted-foreground" /> {t['seller_village'] || 'Village'} *
                        </Label>
                        {availableVillages.length > 0 ? (
                          <Select value={formData.village} onValueChange={(v) => handleSelectChange('village', v)} disabled={!formData.mandal}>
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder={t['select_village'] || 'Select Village'} />
                            </SelectTrigger>
                            <SelectContent>
                              {availableVillages.map((v: any) => (
                                <SelectItem key={v.code} value={v.name}>{v.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input name="village" value={formData.village} onChange={handleInputChange} required className="mt-1" placeholder={t['enter_village'] || 'Enter village name'} disabled={!formData.mandal} />
                        )}
                      </div>
                    </>
                  )}

                  <div>
                    <Label htmlFor="pincode" className="flex items-center gap-2">
                      <Hash className="h-4 w-4 text-muted-foreground" /> {t['seller_pincode'] || 'Pin Code'} *
                    </Label>
                    <Input id="pincode" name="pincode" value={formData.pincode} onChange={handleInputChange} required className="mt-1" placeholder={t['seller_enter_pincode'] || 'Enter pin code'} maxLength={6} />
                  </div>

                  <div>
                    <Label className="flex items-center gap-2 mb-2">
                      <Upload className="h-4 w-4 text-muted-foreground" /> {t['seller_upload_photo'] || 'Upload Photo'}
                    </Label>
                    {photoPreview ? (
                      <div className="relative inline-block">
                        <img src={photoPreview} alt="Preview" className="w-32 h-32 object-cover rounded-lg border" />
                        <button type="button" onClick={removePhoto} className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
                      >
                        <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">{t['seller_upload_hint'] || 'Click to upload photo (max 5MB)'}</p>
                      </div>
                    )}
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                  </div>

                  <Button type="submit" disabled={submitting} className="w-full py-3 text-base">
                    {submitting
                      ? (t['seller_submitting'] || 'Submitting...')
                      : selectedType === 'farmers_market'
                        ? (t['submit_continue'] || 'Submit & Continue')
                        : (t['seller_submit'] || 'Submit Application')}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default BecomeSeller;