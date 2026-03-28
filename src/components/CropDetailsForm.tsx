import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, X, Sprout, Scale, IndianRupee, CalendarDays, Star, Warehouse, MapPin, Loader2, Check, Store, Navigation } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { detectUserLocation } from '@/utils/locationUtils';

interface CropDetailsFormProps {
  sellerId: string;
  userId: string;
  editCropId?: string;
  onComplete: () => void;
}

const cropOptions = [
  'Rice', 'Wheat', 'Maize', 'Tomato', 'Onion', 'Potato',
  'Cotton', 'Sugarcane', 'Banana', 'Mango', 'Groundnut', 'Turmeric',
];

const qualityGrades = ['Grade A', 'Grade B', 'Grade C', 'Organic'];
const availabilityLocations = ['Farm location', 'AC Cold Storage', 'Godham (Warehouse)', 'Marketplace'];

const CropDetailsForm: React.FC<CropDetailsFormProps> = ({ sellerId, userId, editCropId, onComplete }) => {
  const { toast } = useToast();
  const { translations: t, language } = useLanguage();
  const cropFileInputRef = useRef<HTMLInputElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loadingEdit, setLoadingEdit] = useState(!!editCropId);
  const [harvestDate, setHarvestDate] = useState<Date>();
  const [cropImages, setCropImages] = useState<File[]>([]);
  const [cropPreviews, setCropPreviews] = useState<string[]>([]);
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [cropData, setCropData] = useState({
    cropName: '',
    sellType: 'direct_from_farm' as 'direct_from_farm' | 'crop_market' | 'both',
    quantity: '',
    quantityUnit: 'Quintal',
    price: '',
    qualityGrade: 'Grade A',
    availabilityLocation: 'Marketplace',
    locationAddress: '',
    latitude: null as number | null,
    longitude: null as number | null,
  });

  const label = (en: string, te: string) => language === 'te' ? te : en;

  // Load existing crop for edit
  useEffect(() => {
    if (!editCropId) return;
    const loadCrop = async () => {
      setLoadingEdit(true);
      const { data, error } = await supabase
        .from('farmer_crops')
        .select('*')
        .eq('id', editCropId)
        .single();

      if (!error && data) {
        const crop = data as any;
        // Parse quantity
        const parts = crop.quantity.split(' ');
        const qtyNum = parts[0] || '';
        const qtyUnit = parts[1] || 'Quintal';

        setCropData({
          cropName: crop.crop_name,
          sellType: crop.sell_type || 'both',
          quantity: qtyNum,
          quantityUnit: qtyUnit,
          price: crop.price,
          qualityGrade: crop.quality_grade,
          availabilityLocation: crop.availability_location,
          locationAddress: crop.location_address || '',
          latitude: crop.latitude || null,
          longitude: crop.longitude || null,
        });
        if (crop.harvest_date) setHarvestDate(new Date(crop.harvest_date));
        if (crop.crop_images && crop.crop_images.length > 0) {
          setExistingImageUrls(crop.crop_images);
          setCropPreviews(crop.crop_images);
        }
      }
      setLoadingEdit(false);
    };
    loadCrop();
  }, [editCropId]);

  const handleCropInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCropData({ ...cropData, [e.target.name]: e.target.value });
  };

  const handleCropImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(f => f.size <= 5 * 1024 * 1024);
    if (validFiles.length < files.length) {
      toast({ title: 'Some files too large', description: 'Max 5MB per image.', variant: 'destructive' });
    }
    setCropImages(prev => [...prev, ...validFiles]);
    setCropPreviews(prev => [...prev, ...validFiles.map(f => URL.createObjectURL(f))]);
  };

  const removeCropImage = (index: number) => {
    // Check if this is an existing URL or a new file
    const isExisting = index < existingImageUrls.length;
    if (isExisting) {
      setExistingImageUrls(prev => prev.filter((_, i) => i !== index));
    } else {
      const fileIndex = index - existingImageUrls.length;
      setCropImages(prev => prev.filter((_, i) => i !== fileIndex));
    }
    setCropPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const totalImageCount = existingImageUrls.length + cropImages.length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (totalImageCount < 2) {
      toast({
        title: label('Minimum 2 images required', 'కనీసం 2 చిత్రాలు అవసరం'),
        description: label('Please upload at least 2 crop images', 'దయచేసి కనీసం 2 పంట చిత్రాలను అప్‌లోడ్ చేయండి'),
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    try {
      // Upload new images
      const newImageUrls: string[] = [];
      for (const file of cropImages) {
        const ext = file.name.split('.').pop();
        const filePath = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: uploadError } = await supabase.storage.from('crop-images').upload(filePath, file);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('crop-images').getPublicUrl(filePath);
        newImageUrls.push(publicUrl);
      }

      const allImageUrls = [...existingImageUrls, ...newImageUrls];

      const cropPayload = {
        seller_id: sellerId,
        user_id: userId,
        crop_name: cropData.cropName,
        sell_type: cropData.sellType,
        quantity: `${cropData.quantity} ${cropData.quantityUnit}`,
        price: cropData.price,
        harvest_date: harvestDate ? format(harvestDate, 'yyyy-MM-dd') : null,
        quality_grade: cropData.qualityGrade,
        availability_location: cropData.availabilityLocation,
        location_address: cropData.locationAddress || null,
        crop_images: allImageUrls,
        latitude: cropData.latitude,
        longitude: cropData.longitude,
      };

      if (editCropId) {
        const { error } = await supabase.from('farmer_crops').update(cropPayload as any).eq('id', editCropId);
        if (error) throw error;
        toast({ title: label('Crop Updated!', 'పంట అప్‌డేట్ చేయబడింది!') });
      } else {
        const { error } = await supabase.from('farmer_crops' as any).insert(cropPayload as any);
        if (error) throw error;
        toast({ title: label('Crop Submitted!', 'పంట సబ్మిట్ చేయబడింది!') });
      }

      onComplete();
    } catch (error: any) {
      toast({ title: 'Submission Failed', description: error.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingEdit) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card className="rounded-2xl border-0 shadow-lg bg-gradient-to-b from-card to-secondary/30">
      <CardContent className="p-6 sm:p-8">
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
            <Sprout className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">
            {editCropId ? label('Edit Crop Details', 'పంట వివరాలు మార్చండి') : label('Crop Details', 'పంట వివరాలు')}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {label('Add your crop information to list in the marketplace', 'మార్కెట్‌లో జాబితా చేయడానికి మీ పంట సమాచారాన్ని జోడించండి')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Crop Name */}
          <div>
            <Label htmlFor="cropName" className="flex items-center gap-2">
              <Sprout className="h-4 w-4 text-muted-foreground" /> {label('Crop Name', 'పంట పేరు')} *
            </Label>
            <Select value={cropData.cropName} onValueChange={(v) => setCropData({ ...cropData, cropName: v })}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder={label('Select a crop', 'పంట ఎంచుకోండి')} />
              </SelectTrigger>
              <SelectContent>
                {cropOptions.map(crop => (
                  <SelectItem key={crop} value={crop}>{crop}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sell Type */}
          <div>
            <Label className="flex items-center gap-2 mb-2">
              <Store className="h-4 w-4 text-muted-foreground" /> {label('Sell Type', 'అమ్మకం రకం')} *
            </Label>
            <div className="flex gap-2">
              {([
                { value: 'direct_from_farm', label: label('Direct From Farm', 'నేరుగా పొలం నుండి') },
                { value: 'crop_market', label: label('Crop Market', 'పంట మార్కెట్') },
                { value: 'both', label: label('Both', 'రెండూ') },
              ] as const).map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setCropData({ ...cropData, sellType: option.value })}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1.5 rounded-xl border-2 py-3 px-1 font-medium transition-all duration-200 min-w-0",
                    cropData.sellType === option.value
                      ? "border-primary bg-primary text-primary-foreground shadow-md"
                      : "border-border bg-card text-foreground hover:border-primary/50"
                  )}
                >
                  {cropData.sellType === option.value && (
                    <Check className="h-3.5 w-3.5 shrink-0" />
                  )}
                  <span className="text-[11px] sm:text-sm leading-tight text-center">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div>
            <Label htmlFor="quantity" className="flex items-center gap-2">
              <Scale className="h-4 w-4 text-muted-foreground" /> {label('Quantity', 'పరిమాణం')} *
            </Label>
            <div className="flex gap-2 mt-1">
              <Input id="quantity" name="quantity" value={cropData.quantity} onChange={handleCropInputChange} required className="flex-1" placeholder="e.g., 10" type="number" min="0" />
              <Select value={cropData.quantityUnit} onValueChange={(v) => setCropData({ ...cropData, quantityUnit: v })}>
                <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Kg">Kg</SelectItem>
                  <SelectItem value="Quintal">Quintal</SelectItem>
                  <SelectItem value="Ton">Ton</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Price */}
          <div>
            <Label htmlFor="price" className="flex items-center gap-2">
              <IndianRupee className="h-4 w-4 text-muted-foreground" /> {label('Price', 'ధర')} *
            </Label>
            <Input id="price" name="price" value={cropData.price} onChange={handleCropInputChange} required className="mt-1" placeholder="e.g., ₹2000 per quintal" />
          </div>

          {/* Harvest Date */}
          <div>
            <Label className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-muted-foreground" /> {label('Harvest Date', 'పంట తేదీ')}
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full mt-1 justify-start text-left font-normal", !harvestDate && "text-muted-foreground")}>
                  <CalendarDays className="mr-2 h-4 w-4" />
                  {harvestDate ? format(harvestDate, 'PPP') : label('Pick a date', 'తేదీ ఎంచుకోండి')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={harvestDate} onSelect={setHarvestDate} className={cn("p-3 pointer-events-auto")} />
              </PopoverContent>
            </Popover>
          </div>

          {/* Quality Grade */}
          <div>
            <Label className="flex items-center gap-2">
              <Star className="h-4 w-4 text-muted-foreground" /> {label('Quality Grade', 'నాణ్యత గ్రేడ్')} *
            </Label>
            <Select value={cropData.qualityGrade} onValueChange={(v) => setCropData({ ...cropData, qualityGrade: v })}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                {qualityGrades.map(g => (
                  <SelectItem key={g} value={g}>{g}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Availability Location */}
          <div>
            <Label className="flex items-center gap-2">
              <Warehouse className="h-4 w-4 text-muted-foreground" /> {label('Availability Location', 'అందుబాటు స్థానం')} *
            </Label>
            <Select value={cropData.availabilityLocation} onValueChange={(v) => setCropData({ ...cropData, availabilityLocation: v })}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                {availabilityLocations.map(loc => (
                  <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Location Address with GPS detect */}
          <div>
            <Label htmlFor="locationAddress" className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" /> {label('Location Details', 'స్థాన వివరాలు')}
            </Label>
            <div className="flex gap-2 mt-1">
              <Input id="locationAddress" name="locationAddress" value={cropData.locationAddress} onChange={handleCropInputChange} className="flex-1" placeholder={label('e.g., Cold storage near Guntur road', 'ఉదా., గుంటూరు రోడ్ కోల్డ్ స్టోరేజ్')} />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={detectingLocation}
                onClick={async () => {
                  setDetectingLocation(true);
                  try {
                    const loc = await detectUserLocation();
                    setCropData(prev => ({
                      ...prev,
                      latitude: loc.latitude,
                      longitude: loc.longitude,
                      locationAddress: loc.address || prev.locationAddress,
                    }));
                    toast({ title: label('Location detected!', 'స్థానం గుర్తించబడింది!') });
                  } catch {
                    toast({ title: label('Could not detect location', 'స్థానాన్ని గుర్తించలేకపోయింది'), variant: 'destructive' });
                  } finally {
                    setDetectingLocation(false);
                  }
                }}
                className="gap-1 text-xs whitespace-nowrap"
              >
                {detectingLocation ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Navigation className="h-3.5 w-3.5" />}
                {label('GPS', 'GPS')}
              </Button>
            </div>
            {cropData.latitude && (
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <Check className="h-3 w-3" /> {label('GPS location captured', 'GPS స్థానం సేవ్ చేయబడింది')}
              </p>
            )}
          </div>

          {/* Crop Images - minimum 2 required */}
          <div>
            <Label className="flex items-center gap-2 mb-2">
              <Upload className="h-4 w-4 text-muted-foreground" /> {label('Crop Images', 'పంట చిత్రాలు')} * <span className="text-xs text-muted-foreground">({label('min 2', 'కనీసం 2')})</span>
            </Label>
            {cropPreviews.length > 0 && (
              <div className="flex flex-wrap gap-3 mb-3">
                {cropPreviews.map((preview, idx) => (
                  <div key={idx} className="relative">
                    <img src={preview} alt="Crop" className="w-24 h-24 object-cover rounded-lg border" />
                    <button type="button" onClick={() => removeCropImage(idx)} className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div
              onClick={() => cropFileInputRef.current?.click()}
              className={cn(
                "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors",
                totalImageCount < 2 ? "border-destructive/50" : "border-muted-foreground/30"
              )}
            >
              <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                {label(`Upload crop images (${totalImageCount}/2 min)`, `పంట చిత్రాలను అప్‌లోడ్ చేయండి (${totalImageCount}/2 కనీసం)`)}
              </p>
            </div>
            <input ref={cropFileInputRef} type="file" accept="image/*" multiple onChange={handleCropImageChange} className="hidden" />
          </div>

          <Button type="submit" disabled={submitting || !cropData.cropName} className="w-full py-3 text-base">
            {submitting
              ? label('Submitting...', 'సబ్మిట్ అవుతోంది...')
              : editCropId
                ? label('✏️ Update Crop', '✏️ పంట అప్‌డేట్')
                : label('🌾 Submit Crop', '🌾 పంట సబ్మిట్')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CropDetailsForm;
