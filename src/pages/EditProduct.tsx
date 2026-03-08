import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Upload, X, Package, Tag, Layers, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import sellerHeroBg from '@/assets/seller-hero-bg.jpg';

const categories = ['Seeds', 'Fertilizers', 'Pesticides', 'Tools', 'Irrigation', 'Crop Nutrition', 'Agri Products'];
const subCategories: Record<string, string[]> = {
  Seeds: ['Cotton Seeds', 'Paddy Seeds', 'Vegetable Seeds', 'Fruit Seeds', 'Flower Seeds', 'Grain Seeds'],
  Fertilizers: ['Organic', 'Chemical', 'Bio Fertilizers', 'Micro Nutrients'],
  Pesticides: ['Insecticides', 'Fungicides', 'Herbicides', 'Bio Pesticides'],
  Tools: ['Hand Tools', 'Power Tools', 'Sprayers', 'Cutting Tools'],
  Irrigation: ['Drip Systems', 'Sprinklers', 'Pipes', 'Pumps'],
  'Crop Nutrition': ['Growth Promoters', 'Soil Conditioners', 'Plant Hormones'],
  'Agri Products': ['Seeds', 'Chemicals', 'Equipment', 'Others'],
};
const unitTypes = ['500 grams', '1 kg', '5 kg', '10 kg', '25 kg', '50 kg', '1 liter', '5 liters', '10 liters', '1 piece', '1 set'];
const seasons = ['Kharif', 'Rabi', 'Zaid', 'All Seasons'];

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];

  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState<(File | null)[]>([null, null, null, null]);
  const [previews, setPreviews] = useState<(string | null)[]>([null, null, null, null]);
  const [existingImageUrls, setExistingImageUrls] = useState<(string | null)[]>([null, null, null, null]);
  const [deliveryAvailable, setDeliveryAvailable] = useState(true);

  const [form, setForm] = useState({
    productName: '', category: '', subCategory: '', brand: '', productType: '',
    mrpPrice: '', sellingPrice: '', discount: '', stockQuantity: '', unitType: '1 kg',
    description: '', cropType: '', season: '', shelfLife: '',
    deliveryCharge: '', deliveryDays: '',
  });

  useEffect(() => {
    const loadProduct = async () => {
      const { data, error } = await (supabase.from('seller_products') as any)
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        toast({ title: 'Product not found', variant: 'destructive' });
        navigate('/seller/dashboard');
        return;
      }

      setForm({
        productName: data.product_name || '',
        category: data.category || '',
        subCategory: data.sub_category || '',
        brand: data.brand || '',
        productType: data.product_type || '',
        mrpPrice: String(data.mrp_price || ''),
        sellingPrice: String(data.selling_price || ''),
        discount: String(data.discount_percent || ''),
        stockQuantity: String(data.stock_quantity || ''),
        unitType: data.unit_type || '1 kg',
        description: data.description || '',
        cropType: data.crop_type || '',
        season: data.season || '',
        shelfLife: data.shelf_life || '',
        deliveryCharge: String(data.delivery_charge || ''),
        deliveryDays: data.delivery_days || '',
      });
      setDeliveryAvailable(data.delivery_available ?? true);

      // Load existing images
      const imgs = data.product_images || [];
      const newPreviews: (string | null)[] = [null, null, null, null];
      const newExisting: (string | null)[] = [null, null, null, null];
      imgs.forEach((url: string, i: number) => {
        if (i < 4) {
          newPreviews[i] = url;
          newExisting[i] = url;
        }
      });
      setPreviews(newPreviews);
      setExistingImageUrls(newExisting);
      setLoading(false);
    };
    loadProduct();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageSelect = (index: number, file: File | undefined) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Max 5MB.', variant: 'destructive' });
      return;
    }
    const newImages = [...images];
    const newPreviews = [...previews];
    const newExisting = [...existingImageUrls];
    newImages[index] = file;
    newPreviews[index] = URL.createObjectURL(file);
    newExisting[index] = null; // replaced
    setImages(newImages);
    setPreviews(newPreviews);
    setExistingImageUrls(newExisting);
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    const newPreviews = [...previews];
    const newExisting = [...existingImageUrls];
    newImages[index] = null;
    newPreviews[index] = null;
    newExisting[index] = null;
    setImages(newImages);
    setPreviews(newPreviews);
    setExistingImageUrls(newExisting);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate('/auth'); return; }

    setSubmitting(true);
    try {
      // Upload new images, keep existing ones
      const imageUrls: string[] = [];
      for (let i = 0; i < 4; i++) {
        if (images[i]) {
          const img = images[i]!;
          const ext = img.name.split('.').pop();
          const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
          const { error } = await supabase.storage.from('product-images').upload(path, img);
          if (error) throw error;
          const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(path);
          imageUrls.push(publicUrl);
        } else if (existingImageUrls[i]) {
          imageUrls.push(existingImageUrls[i]!);
        }
      }

      const { error } = await (supabase.from('seller_products') as any)
        .update({
          product_name: form.productName,
          category: form.category,
          sub_category: form.subCategory,
          brand: form.brand,
          product_type: form.productType,
          mrp_price: parseFloat(form.mrpPrice) || 0,
          selling_price: parseFloat(form.sellingPrice) || 0,
          discount_percent: parseFloat(form.discount) || 0,
          stock_quantity: parseInt(form.stockQuantity) || 0,
          unit_type: form.unitType,
          description: form.description,
          crop_type: form.cropType,
          season: form.season,
          shelf_life: form.shelfLife,
          delivery_available: deliveryAvailable,
          delivery_charge: parseFloat(form.deliveryCharge) || 0,
          delivery_days: form.deliveryDays,
          product_images: imageUrls,
        })
        .eq('id', id);

      if (error) throw error;
      toast({ title: 'Product updated successfully!' });
      navigate('/seller/dashboard');
    } catch (error: any) {
      toast({ title: 'Failed to update', description: error.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const availableSubs = subCategories[form.category] || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading product...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="lg:hidden sticky top-0 z-50 bg-primary text-primary-foreground flex items-center gap-3 px-4 py-3">
        <button onClick={() => navigate(-1)}><ArrowLeft className="h-6 w-6" /></button>
        <h1 className="text-lg font-bold">Edit Product</h1>
      </div>
      <div className="hidden lg:block"><Header /></div>

      <div className="relative h-40 md:h-48 overflow-hidden">
        <img src={sellerHeroBg} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/70 to-primary/90 flex items-end p-4">
          <div>
            <div className="flex items-center gap-2 text-primary-foreground/80 text-sm mb-1">
              <Package className="h-4 w-4" />
            </div>
            <h2 className="text-2xl font-bold text-primary-foreground">Edit Product</h2>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-4 relative z-10 max-w-2xl pb-8">
        <Card className="rounded-2xl border-0 shadow-lg">
          <CardContent className="p-4 sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="flex items-center gap-1.5 text-sm mb-1">
                    <Package className="h-3.5 w-3.5 text-primary" /> Product Name <span className="text-destructive">*</span>
                  </Label>
                  <Input name="productName" value={form.productName} onChange={handleChange} required placeholder="Enter Product Name..." />
                </div>
                <div>
                  <Label className="flex items-center gap-1.5 text-sm mb-1">
                    <Layers className="h-3.5 w-3.5 text-primary" /> Category <span className="text-destructive">*</span>
                  </Label>
                  <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v, subCategory: '' })}>
                    <SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger>
                    <SelectContent>
                      {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="flex items-center gap-1.5 text-sm mb-1">
                    <Tag className="h-3.5 w-3.5 text-primary" /> Brand
                  </Label>
                  <Input name="brand" value={form.brand} onChange={handleChange} placeholder="Enter brand" />
                </div>
                <div>
                  <Label className="flex items-center gap-1.5 text-sm mb-1">
                    <Layers className="h-3.5 w-3.5 text-primary" /> Sub Category
                  </Label>
                  <Select value={form.subCategory} onValueChange={(v) => setForm({ ...form, subCategory: v })} disabled={!form.category}>
                    <SelectTrigger><SelectValue placeholder="Select Sub Category" /></SelectTrigger>
                    <SelectContent>
                      {availableSubs.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm mb-1">Product Type</Label>
                  <Input name="productType" value={form.productType} onChange={handleChange} placeholder="Enter product type" />
                </div>
              </div>

              {/* Pricing */}
              <div>
                <h3 className="text-sm font-bold text-foreground mb-2">Pricing</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-semibold">MRP Price <span className="text-destructive">*</span></Label>
                    <Input name="mrpPrice" type="number" value={form.mrpPrice} onChange={handleChange} required placeholder="MRP price" className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Selling Price <span className="text-destructive">*</span></Label>
                    <Input name="sellingPrice" type="number" value={form.sellingPrice} onChange={handleChange} required placeholder="Selling price" className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Discount %</Label>
                    <Input name="discount" type="number" value={form.discount} onChange={handleChange} placeholder="Discount" className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Stock & Quantity <span className="text-destructive">*</span></Label>
                    <div className="flex gap-2 mt-1">
                      <Input name="stockQuantity" type="number" value={form.stockQuantity} onChange={handleChange} required placeholder="Stock" className="flex-1" />
                      <Select value={form.unitType} onValueChange={(v) => setForm({ ...form, unitType: v })}>
                        <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {unitTypes.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-sm font-bold text-foreground mb-2">Product Description</h3>
                <Textarea name="description" value={form.description} onChange={handleChange} placeholder="Enter product description..." rows={3} />
              </div>

              {/* Specifications */}
              <div>
                <h3 className="text-sm font-bold text-foreground mb-2">Specifications</h3>
                <div className="grid grid-cols-3 gap-3">
                  <Select value={form.cropType} onValueChange={(v) => setForm({ ...form, cropType: v })}>
                    <SelectTrigger><SelectValue placeholder="Crop Type" /></SelectTrigger>
                    <SelectContent>
                      {['Cotton', 'Paddy', 'Wheat', 'Maize', 'Groundnut', 'Soybean', 'Vegetables', 'Fruits', 'Other'].map(c => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={form.season} onValueChange={(v) => setForm({ ...form, season: v })}>
                    <SelectTrigger><SelectValue placeholder="Season" /></SelectTrigger>
                    <SelectContent>
                      {seasons.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Input name="shelfLife" value={form.shelfLife} onChange={handleChange} placeholder="Shelf life" />
                </div>
              </div>

              {/* Delivery */}
              <div className="flex items-center gap-2 mb-2">
                <Checkbox checked={deliveryAvailable} onCheckedChange={(v) => setDeliveryAvailable(!!v)} id="delivery" />
                <label htmlFor="delivery" className="text-sm font-bold flex items-center gap-1">
                  <Truck className="h-4 w-4 text-primary" /> Delivery
                </label>
              </div>

              {/* Product Images */}
              <div className="grid grid-cols-4 gap-3">
                {[0, 1, 2, 3].map(i => (
                  <div key={i} className="relative">
                    {previews[i] ? (
                      <div className="relative aspect-square rounded-lg overflow-hidden border">
                        <img src={previews[i]!} alt="" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => removeImage(i)} className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-0.5">
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => fileRefs[i].current?.click()}
                        className="aspect-square border-2 border-dashed border-primary/30 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors bg-primary/5"
                      >
                        <Upload className="h-5 w-5 text-primary/50 mb-1" />
                        <span className="text-[10px] text-foreground font-medium">Image {i + 1}</span>
                      </div>
                    )}
                    <input ref={fileRefs[i]} type="file" accept="image/*" onChange={(e) => handleImageSelect(i, e.target.files?.[0])} className="hidden" />
                  </div>
                ))}
              </div>

              <Button type="submit" disabled={submitting} className="w-full py-3 text-base font-bold rounded-xl">
                {submitting ? 'Updating...' : 'Update Product'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default EditProduct;
