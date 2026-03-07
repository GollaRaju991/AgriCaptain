
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Wheat, Store, Upload, X, User, Phone, MapPin, CreditCard, Hash } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

type SellerType = 'agriculture_products' | 'farmers_market';

const BecomeSeller = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedType, setSelectedType] = useState<SellerType | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    aadhaarNumber: '',
    phone: '',
    address: '',
    pincode: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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

      const { error } = await supabase.from('sellers').insert({
        user_id: user.id,
        seller_type: selectedType,
        name: formData.name,
        aadhaar_number: formData.aadhaarNumber,
        phone: formData.phone,
        address: formData.address,
        pincode: formData.pincode,
        photo_url: photoUrl,
      } as any);

      if (error) throw error;

      toast({ title: 'Application Submitted!', description: 'We will review your application and get back to you within 24 hours.' });
      navigate('/');
    } catch (error: any) {
      toast({ title: 'Submission Failed', description: error.message || 'Something went wrong.', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const sellerOptions = [
    {
      type: 'agriculture_products' as SellerType,
      title: 'Agriculture Products',
      description: 'Sell seeds, fertilizers, pesticides, tools & equipment',
      icon: Wheat,
      gradient: 'from-emerald-500 to-green-600',
      bgLight: 'bg-emerald-50',
    },
    {
      type: 'farmers_market' as SellerType,
      title: "Farmer's Market",
      description: 'Sell fresh produce, grains, fruits & vegetables directly',
      icon: Store,
      gradient: 'from-amber-500 to-orange-600',
      bgLight: 'bg-amber-50',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {!selectedType ? (
          <>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">Become a Seller</h1>
              <p className="text-muted-foreground">Choose your selling category to get started</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {sellerOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <Card
                    key={option.type}
                    className="cursor-pointer group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary overflow-hidden"
                    onClick={() => setSelectedType(option.type)}
                  >
                    <CardContent className="p-0">
                      <div className={`bg-gradient-to-br ${option.gradient} p-8 flex items-center justify-center`}>
                        <div className="bg-white/20 backdrop-blur-sm rounded-full p-5">
                          <Icon className="h-12 w-12 text-white" />
                        </div>
                      </div>
                      <div className="p-6 text-center">
                        <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                          {option.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">{option.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </>
        ) : (
          <>
            <button
              onClick={() => setSelectedType(null)}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Back to options
            </button>

            <Card>
              <CardContent className="p-6 sm:p-8">
                <div className="text-center mb-6">
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-4 ${
                    selectedType === 'agriculture_products' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {selectedType === 'agriculture_products' ? <Wheat className="h-4 w-4" /> : <Store className="h-4 w-4" />}
                    {selectedType === 'agriculture_products' ? 'Agriculture Products' : "Farmer's Market"}
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">Seller Registration</h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <Label htmlFor="name" className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" /> Name *
                    </Label>
                    <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required className="mt-1" placeholder="Enter your full name" />
                  </div>

                  <div>
                    <Label htmlFor="aadhaarNumber" className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-muted-foreground" /> Aadhaar Card Number *
                    </Label>
                    <Input id="aadhaarNumber" name="aadhaarNumber" value={formData.aadhaarNumber} onChange={handleInputChange} required className="mt-1" placeholder="XXXX XXXX XXXX" maxLength={14} />
                  </div>

                  <div>
                    <Label htmlFor="phone" className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" /> Phone Number *
                    </Label>
                    <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleInputChange} required className="mt-1" placeholder="Enter your phone number" />
                  </div>

                  <div>
                    <Label htmlFor="address" className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" /> Address *
                    </Label>
                    <Textarea id="address" name="address" value={formData.address} onChange={handleInputChange} required className="mt-1" placeholder="Enter your full address" rows={3} />
                  </div>

                  <div>
                    <Label htmlFor="pincode" className="flex items-center gap-2">
                      <Hash className="h-4 w-4 text-muted-foreground" /> Pin Code *
                    </Label>
                    <Input id="pincode" name="pincode" value={formData.pincode} onChange={handleInputChange} required className="mt-1" placeholder="Enter pin code" maxLength={6} />
                  </div>

                  <div>
                    <Label className="flex items-center gap-2 mb-2">
                      <Upload className="h-4 w-4 text-muted-foreground" /> Upload Photo
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
                        <p className="text-sm text-muted-foreground">Click to upload photo (max 5MB)</p>
                      </div>
                    )}
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                  </div>

                  <Button type="submit" disabled={submitting} className="w-full py-3 text-base">
                    {submitting ? 'Submitting...' : 'Submit Application'}
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
