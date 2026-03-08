import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, X, Sprout, Scale, IndianRupee, CalendarDays, Star, Warehouse, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface CropDetailsFormProps {
  sellerId: string;
  userId: string;
  onComplete: () => void;
}

const cropOptions = [
  'Rice', 'Wheat', 'Maize', 'Tomato', 'Onion', 'Potato',
  'Cotton', 'Sugarcane', 'Banana', 'Mango', 'Groundnut', 'Turmeric',
];

const qualityGrades = ['Grade A', 'Grade B', 'Grade C', 'Organic'];

const availabilityLocations = ['Farm location', 'AC Cold Storage', 'Godham (Warehouse)', 'Marketplace'];

const CropDetailsForm: React.FC<CropDetailsFormProps> = ({ sellerId, userId, onComplete }) => {
  const { toast } = useToast();
  const { translations: t } = useLanguage();
  const cropFileInputRef = useRef<HTMLInputElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [harvestDate, setHarvestDate] = useState<Date>();
  const [cropImages, setCropImages] = useState<File[]>([]);
  const [cropPreviews, setCropPreviews] = useState<string[]>([]);
  const [cropData, setCropData] = useState({
    cropName: '',
    quantity: '',
    price: '',
    qualityGrade: 'Grade A',
    availabilityLocation: 'Marketplace',
    locationAddress: '',
  });

  const handleCropInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCropData({ ...cropData, [e.target.name]: e.target.value });
  };

  const handleCropImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(f => f.size <= 5 * 1024 * 1024);
    if (validFiles.length < files.length) {
      toast({ title: t['file_too_large'] || 'Some files too large', description: t['max_5mb'] || 'Max 5MB per image.', variant: 'destructive' });
    }
    setCropImages(prev => [...prev, ...validFiles]);
    setCropPreviews(prev => [...prev, ...validFiles.map(f => URL.createObjectURL(f))]);
  };

  const removeCropImage = (index: number) => {
    setCropImages(prev => prev.filter((_, i) => i !== index));
    setCropPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const imageUrls: string[] = [];
      for (const file of cropImages) {
        const ext = file.name.split('.').pop();
        const filePath = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: uploadError } = await supabase.storage.from('crop-images').upload(filePath, file);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('crop-images').getPublicUrl(filePath);
        imageUrls.push(publicUrl);
      }

      const { error } = await supabase.from('farmer_crops' as any).insert({
        seller_id: sellerId,
        user_id: userId,
        crop_name: cropData.cropName,
        quantity: cropData.quantity,
        price: cropData.price,
        harvest_date: harvestDate ? format(harvestDate, 'yyyy-MM-dd') : null,
        quality_grade: cropData.qualityGrade,
        availability_location: cropData.availabilityLocation,
        location_address: cropData.locationAddress,
        crop_images: imageUrls,
      } as any);

      if (error) throw error;

      toast({ title: t['crop_submitted'] || 'Crop Details Submitted!', description: t['crop_submitted_desc'] || 'Your crop has been listed successfully.' });
      onComplete();
    } catch (error: any) {
      toast({ title: t['submission_failed'] || 'Submission Failed', description: error.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="rounded-2xl border-0 shadow-lg bg-gradient-to-b from-card to-secondary/30">
      <CardContent className="p-6 sm:p-8">
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
            <Sprout className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">
            {t['crop_details_title'] || 'Crop Details'}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {t['crop_details_subtitle'] || 'Add your crop information to list in the marketplace'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Crop Name */}
          <div>
            <Label htmlFor="cropName" className="flex items-center gap-2">
              <Sprout className="h-4 w-4 text-muted-foreground" /> {t['crop_name'] || 'Crop Name'} *
            </Label>
            <Select value={cropData.cropName} onValueChange={(v) => setCropData({ ...cropData, cropName: v })}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder={t['select_crop'] || 'Select a crop'} />
              </SelectTrigger>
              <SelectContent>
                {cropOptions.map(crop => (
                  <SelectItem key={crop} value={crop}>{crop}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Quantity */}
          <div>
            <Label htmlFor="quantity" className="flex items-center gap-2">
              <Scale className="h-4 w-4 text-muted-foreground" /> {t['crop_quantity'] || 'Quantity Available'} *
            </Label>
            <Input id="quantity" name="quantity" value={cropData.quantity} onChange={handleCropInputChange} required className="mt-1" placeholder={t['enter_quantity'] || 'e.g., 500 kg'} />
          </div>

          {/* Price */}
          <div>
            <Label htmlFor="price" className="flex items-center gap-2">
              <IndianRupee className="h-4 w-4 text-muted-foreground" /> {t['crop_price'] || 'Price'} *
            </Label>
            <Input id="price" name="price" value={cropData.price} onChange={handleCropInputChange} required className="mt-1" placeholder={t['enter_price'] || 'e.g., ₹2000 per quintal'} />
          </div>

          {/* Harvest Date */}
          <div>
            <Label className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-muted-foreground" /> {t['harvest_date'] || 'Harvest Date'}
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full mt-1 justify-start text-left font-normal", !harvestDate && "text-muted-foreground")}>
                  <CalendarDays className="mr-2 h-4 w-4" />
                  {harvestDate ? format(harvestDate, 'PPP') : (t['pick_date'] || 'Pick a date')}
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
              <Star className="h-4 w-4 text-muted-foreground" /> {t['quality_grade'] || 'Quality Grade'} *
            </Label>
            <Select value={cropData.qualityGrade} onValueChange={(v) => setCropData({ ...cropData, qualityGrade: v })}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
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
              <Warehouse className="h-4 w-4 text-muted-foreground" /> {t['availability_location'] || 'Availability Location'} *
            </Label>
            <Select value={cropData.availabilityLocation} onValueChange={(v) => setCropData({ ...cropData, availabilityLocation: v })}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availabilityLocations.map(loc => (
                  <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Location Address */}
          <div>
            <Label htmlFor="locationAddress" className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" /> {t['location_address'] || 'Location Address / Details'}
            </Label>
            <Input id="locationAddress" name="locationAddress" value={cropData.locationAddress} onChange={handleCropInputChange} className="mt-1" placeholder={t['enter_location_address'] || 'e.g., Cold storage near Guntur road'} />
          </div>

          {/* Crop Images */}
          <div>
            <Label className="flex items-center gap-2 mb-2">
              <Upload className="h-4 w-4 text-muted-foreground" /> {t['upload_crop_images'] || 'Upload Crop Images'}
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
              className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors"
            >
              <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">{t['upload_crop_hint'] || 'Click to upload crop images (max 5MB each)'}</p>
            </div>
            <input ref={cropFileInputRef} type="file" accept="image/*" multiple onChange={handleCropImageChange} className="hidden" />
          </div>

          <Button type="submit" disabled={submitting || !cropData.cropName} className="w-full py-3 text-base">
            {submitting ? (t['seller_submitting'] || 'Submitting...') : (t['submit_crop'] || '🌾 Submit Crop')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CropDetailsForm;
