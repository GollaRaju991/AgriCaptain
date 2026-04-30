import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, CheckCircle2, XCircle, Clock, Loader2, Sprout, MapPin, IndianRupee, User } from 'lucide-react';
import ValidationSummary, { validateCrop } from '@/components/admin/ValidationSummary';

type Crop = {
  id: string;
  user_id: string;
  seller_id: string;
  crop_name: string;
  sell_type: string;
  listing_type: string; // 'sell_crop' | 'direct_from_farm'
  availability_location: string;
  quantity: string;
  price: string;
  quality_grade: string;
  harvest_date: string | null;
  location_address: string | null;
  crop_images: string[] | null;
  review_status: string;
  rejection_reason: string | null;
  reviewed_at: string | null;
  created_at: string;
  seller?: { name: string; phone: string } | null;
};

const COMMON_REASONS = [
  'Crop images are unclear or missing',
  'Price not specified properly',
  'Quantity unclear',
  'Location is incomplete',
  'Quality grade not justified',
  'Misleading information',
];

const AdminCrops = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [listingFilter, setListingFilter] = useState<'all' | 'sell_crop' | 'direct_from_farm'>('all');
  const [rejectTarget, setRejectTarget] = useState<Crop | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchCrops().finally(() => setLoading(false)); }, []);

  const fetchCrops = async () => {
    const { data, error } = await (supabase.from('farmer_crops') as any)
      .select('*').order('created_at', { ascending: false });
    if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
    const list = (data || []) as Crop[];

    const sellerIds = Array.from(new Set(list.map(c => c.seller_id).filter(Boolean)));
    if (sellerIds.length) {
      const { data: sellers } = await (supabase.from('sellers') as any)
        .select('id,name,phone').in('id', sellerIds);
      const map = new Map<string, any>((sellers || []).map((s: any) => [s.id, s]));
      list.forEach(c => { c.seller = (map.get(c.seller_id) as any) || null; });
    }
    setCrops(list);
  };

  const updateStatus = async (id: string, review_status: 'approved' | 'rejected' | 'pending', reason?: string) => {
    setSubmitting(true);
    const { error } = await (supabase.from('farmer_crops') as any)
      .update({
        review_status,
        rejection_reason: review_status === 'rejected' ? reason : null,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', id);
    setSubmitting(false);
    if (error) { toast({ title: 'Failed', description: error.message, variant: 'destructive' }); return; }
    toast({ title: review_status === 'approved' ? '✅ Crop approved' : review_status === 'rejected' ? '❌ Crop rejected' : 'Moved to pending' });
    setRejectTarget(null); setRejectReason('');
    await fetchCrops();
  };

  const filtered = crops.filter(c => listingFilter === 'all' ? true : c.listing_type === listingFilter);
  const filterByStatus = (status: string) => filtered.filter(c => c.review_status === status);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  const StatusBadge = ({ status }: { status: string }) => {
    const map: Record<string, { label: string; cls: string; icon: any }> = {
      pending: { label: 'Pending', cls: 'bg-amber-100 text-amber-800 border-amber-300', icon: Clock },
      approved: { label: 'Approved', cls: 'bg-green-100 text-green-800 border-green-300', icon: CheckCircle2 },
      rejected: { label: 'Rejected', cls: 'bg-red-100 text-red-800 border-red-300', icon: XCircle },
    };
    const m = map[status] || map.pending;
    const Icon = m.icon;
    return <Badge variant="outline" className={`${m.cls} gap-1`}><Icon className="h-3 w-3" />{m.label}</Badge>;
  };

  const CropCard = ({ c }: { c: Crop }) => (
    <Card className="border">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start gap-3">
          {c.crop_images?.[0] ? (
            <img src={c.crop_images[0]} alt={c.crop_name} className="h-20 w-20 rounded-lg object-cover border" />
          ) : (
            <div className="h-20 w-20 rounded-lg bg-muted flex items-center justify-center"><Sprout className="h-8 w-8 text-green-600" /></div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-bold truncate">{c.crop_name}</h3>
                <p className="text-xs text-muted-foreground capitalize">{c.listing_type.replace(/_/g, ' ')} • {c.sell_type} • {c.quality_grade}</p>
              </div>
              <StatusBadge status={c.review_status} />
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs mt-2">
              <div className="flex items-center gap-1"><IndianRupee className="h-3 w-3" />{c.price}</div>
              <div>Qty: {c.quantity}</div>
              {c.location_address && <div className="flex items-center gap-1 col-span-2 text-muted-foreground"><MapPin className="h-3 w-3" />{c.location_address}</div>}
              {c.seller && <div className="flex items-center gap-1 col-span-2 text-muted-foreground"><User className="h-3 w-3" />{c.seller.name} • {c.seller.phone}</div>}
            </div>
          </div>
        </div>

        {c.crop_images && c.crop_images.length > 1 && (
          <div className="flex gap-1.5 overflow-x-auto">
            {c.crop_images.slice(1, 6).map((img, i) => (
              <img key={i} src={img} alt="" className="h-12 w-12 rounded object-cover border flex-shrink-0" />
            ))}
          </div>
        )}

        <ValidationSummary images={c.crop_images} issues={validateCrop(c)} />

        {c.review_status === 'rejected' && c.rejection_reason && (
          <div className="bg-red-50 border border-red-200 rounded p-2 text-xs text-red-800 whitespace-pre-line">
            <strong>Rejection reason:</strong> {c.rejection_reason}
          </div>
        )}

        {c.review_status === 'pending' ? (
          <div className="flex gap-2">
            <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => updateStatus(c.id, 'approved')} disabled={submitting}>
              <CheckCircle2 className="h-4 w-4 mr-1" /> Approve
            </Button>
            <Button size="sm" variant="destructive" className="flex-1" onClick={() => { setRejectTarget(c); setRejectReason(''); }} disabled={submitting}>
              <XCircle className="h-4 w-4 mr-1" /> Reject
            </Button>
          </div>
        ) : (
          <Button size="sm" variant="outline" onClick={() => updateStatus(c.id, 'pending')} className="w-full text-xs">Move back to Pending</Button>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-50 bg-primary text-primary-foreground flex items-center gap-3 px-4 py-3">
        <button onClick={() => navigate('/admin')}><ArrowLeft className="h-6 w-6" /></button>
        <h1 className="text-lg font-bold">Admin · Crop Approvals</h1>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-4">
        <div className="flex gap-2 flex-wrap">
          {([
            { k: 'all', label: 'All' },
            { k: 'sell_crop', label: 'Sell Crop' },
            { k: 'direct_from_farm', label: 'Direct From Farm' },
          ] as const).map(opt => (
            <button
              key={opt.k}
              onClick={() => setListingFilter(opt.k as any)}
              className={`px-3 py-1.5 text-xs rounded-full border ${listingFilter === opt.k ? 'bg-primary text-primary-foreground border-primary' : 'bg-background hover:bg-muted'}`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <Tabs defaultValue="pending">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="pending">Pending ({filterByStatus('pending').length})</TabsTrigger>
            <TabsTrigger value="approved">Approved ({filterByStatus('approved').length})</TabsTrigger>
            <TabsTrigger value="rejected">Rejected ({filterByStatus('rejected').length})</TabsTrigger>
          </TabsList>
          {(['pending', 'approved', 'rejected'] as const).map(s => (
            <TabsContent key={s} value={s} className="space-y-3 mt-4">
              {filterByStatus(s).length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No {s} crops</p>
              ) : (
                filterByStatus(s).map(c => <CropCard key={c.id} c={c} />)
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>

      <Dialog open={!!rejectTarget} onOpenChange={(o) => !o && setRejectTarget(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Reject {rejectTarget?.crop_name}</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Tell the farmer exactly what to fix:</p>
          <div className="flex flex-wrap gap-1.5">
            {COMMON_REASONS.map(r => (
              <button key={r} type="button" onClick={() => setRejectReason(prev => prev ? `${prev}\n• ${r}` : `• ${r}`)} className="text-xs px-2 py-1 rounded-full bg-muted hover:bg-primary/10 border">
                + {r}
              </button>
            ))}
          </div>
          <Textarea rows={5} value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Enter reason / what to update..." />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectTarget(null)}>Cancel</Button>
            <Button variant="destructive" disabled={!rejectReason.trim() || submitting} onClick={() => rejectTarget && updateStatus(rejectTarget.id, 'rejected', rejectReason.trim())}>
              {submitting ? 'Rejecting...' : 'Reject Crop'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCrops;
