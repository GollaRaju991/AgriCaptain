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
import { ArrowLeft, CheckCircle2, XCircle, Clock, Loader2, Sprout, MapPin, IndianRupee, User, Wheat, Calendar, Filter, Inbox } from 'lucide-react';
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

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-amber-50 to-green-50">
      <Loader2 className="h-10 w-10 animate-spin text-green-600" />
      <p className="text-sm text-muted-foreground">Loading crop submissions…</p>
    </div>
  );

  const StatusBadge = ({ status }: { status: string }) => {
    const map: Record<string, { label: string; cls: string; icon: any }> = {
      pending: { label: 'Pending', cls: 'bg-amber-100 text-amber-800 border-amber-300', icon: Clock },
      approved: { label: 'Approved', cls: 'bg-green-100 text-green-800 border-green-300', icon: CheckCircle2 },
      rejected: { label: 'Rejected', cls: 'bg-red-100 text-red-800 border-red-300', icon: XCircle },
    };
    const m = map[status] || map.pending;
    const Icon = m.icon;
    return <Badge variant="outline" className={`${m.cls} gap-1 font-medium`}><Icon className="h-3 w-3" />{m.label}</Badge>;
  };

  const ListingTypeBadge = ({ type }: { type: string }) => {
    const isFarm = type === 'direct_from_farm';
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${isFarm ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-orange-50 text-orange-700 border border-orange-200'}`}>
        {isFarm ? <Sprout className="h-2.5 w-2.5" /> : <Wheat className="h-2.5 w-2.5" />}
        {isFarm ? 'Direct From Farm' : 'Sell Crop'}
      </span>
    );
  };

  const CropCard = ({ c }: { c: Crop }) => (
    <Card className="border-0 shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden ring-1 ring-border/60">
      <CardContent className="p-0">
        <div className="p-4 space-y-3">
          <div className="flex items-start gap-3">
            <div className="relative flex-shrink-0">
              {c.crop_images?.[0] ? (
                <img src={c.crop_images[0]} alt={c.crop_name} className="h-24 w-24 rounded-xl object-cover border-2 border-white shadow-md" />
              ) : (
                <div className="h-24 w-24 rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center border-2 border-white shadow-md">
                  <Sprout className="h-10 w-10 text-green-600" />
                </div>
              )}
              {c.crop_images && c.crop_images.length > 1 && (
                <span className="absolute -bottom-1 -right-1 bg-foreground text-background text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center shadow">
                  +{c.crop_images.length - 1}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="min-w-0">
                  <h3 className="font-bold text-base truncate leading-tight">{c.crop_name}</h3>
                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                    <ListingTypeBadge type={c.listing_type} />
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground capitalize">{c.sell_type}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">Grade {c.quality_grade}</span>
                  </div>
                </div>
                <StatusBadge status={c.review_status} />
              </div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs mt-3">
                <div className="flex items-center gap-1.5 font-semibold text-foreground">
                  <IndianRupee className="h-3.5 w-3.5 text-green-600" />
                  <span>{c.price}</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Wheat className="h-3.5 w-3.5" />
                  <span>{c.quantity}</span>
                </div>
                {c.harvest_date && (
                  <div className="flex items-center gap-1.5 text-muted-foreground col-span-2">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Harvest: {new Date(c.harvest_date).toLocaleDateString()}</span>
                  </div>
                )}
                {c.location_address && (
                  <div className="flex items-center gap-1.5 col-span-2 text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="truncate">{c.location_address}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {c.seller && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 border">
              <div className="h-7 w-7 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {c.seller.name?.charAt(0).toUpperCase() || 'F'}
              </div>
              <div className="flex-1 min-w-0 text-xs">
                <p className="font-semibold truncate">{c.seller.name}</p>
                <p className="text-muted-foreground truncate">{c.seller.phone}</p>
              </div>
            </div>
          )}

          {c.crop_images && c.crop_images.length > 1 && (
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {c.crop_images.slice(1, 6).map((img, i) => (
                <img key={i} src={img} alt="" className="h-14 w-14 rounded-lg object-cover border flex-shrink-0 hover:scale-105 transition-transform" />
              ))}
            </div>
          )}

          <ValidationSummary images={c.crop_images} issues={validateCrop(c)} />

          {c.review_status === 'rejected' && c.rejection_reason && (
            <div className="bg-red-50 border-l-4 border-red-400 rounded-r p-3 text-xs text-red-800 whitespace-pre-line">
              <strong className="block mb-1">Rejection reason</strong>
              {c.rejection_reason}
            </div>
          )}
        </div>

        <div className="px-4 py-3 bg-muted/30 border-t">
          {c.review_status === 'pending' ? (
            <div className="flex gap-2">
              <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700 shadow-sm" onClick={() => updateStatus(c.id, 'approved')} disabled={submitting}>
                <CheckCircle2 className="h-4 w-4 mr-1.5" /> Approve
              </Button>
              <Button size="sm" variant="destructive" className="flex-1 shadow-sm" onClick={() => { setRejectTarget(c); setRejectReason(''); }} disabled={submitting}>
                <XCircle className="h-4 w-4 mr-1.5" /> Reject
              </Button>
            </div>
          ) : (
            <Button size="sm" variant="outline" onClick={() => updateStatus(c.id, 'pending')} className="w-full text-xs">
              <Clock className="h-3.5 w-3.5 mr-1.5" /> Move back to Pending
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const totals = {
    pending: crops.filter(c => c.review_status === 'pending').length,
    approved: crops.filter(c => c.review_status === 'approved').length,
    rejected: crops.filter(c => c.review_status === 'rejected').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50/40 via-background to-green-50/40">
      <div className="sticky top-0 z-50 bg-gradient-to-r from-green-700 via-green-600 to-emerald-600 text-white shadow-lg">
        <div className="max-w-5xl mx-auto flex items-center gap-3 px-4 py-4">
          <button onClick={() => navigate(adminPath(''))} className="hover:bg-white/10 rounded-full p-1.5 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2.5 flex-1">
            <div className="h-9 w-9 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center">
              <Wheat className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-base font-bold leading-tight">Crop Approvals</h1>
              <p className="text-[11px] text-white/80">Review farmer submissions</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-4 space-y-4">
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <div className="bg-white rounded-xl p-3 sm:p-4 border shadow-sm">
            <div className="flex items-center gap-2 text-amber-700 mb-1">
              <Clock className="h-3.5 w-3.5" />
              <span className="text-[11px] font-medium uppercase tracking-wide">Pending</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{totals.pending}</p>
          </div>
          <div className="bg-white rounded-xl p-3 sm:p-4 border shadow-sm">
            <div className="flex items-center gap-2 text-green-700 mb-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span className="text-[11px] font-medium uppercase tracking-wide">Approved</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{totals.approved}</p>
          </div>
          <div className="bg-white rounded-xl p-3 sm:p-4 border shadow-sm">
            <div className="flex items-center gap-2 text-red-700 mb-1">
              <XCircle className="h-3.5 w-3.5" />
              <span className="text-[11px] font-medium uppercase tracking-wide">Rejected</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{totals.rejected}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-3 border shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Filter className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Listing type</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {([
              { k: 'all', label: 'All Listings' },
              { k: 'sell_crop', label: 'Sell Crop' },
              { k: 'direct_from_farm', label: 'Direct From Farm' },
            ] as const).map(opt => (
              <button
                key={opt.k}
                onClick={() => setListingFilter(opt.k as any)}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-full border transition-all ${listingFilter === opt.k ? 'bg-green-600 text-white border-green-600 shadow-sm' : 'bg-background hover:bg-muted border-border'}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <Tabs defaultValue="pending">
          <TabsList className="grid grid-cols-3 w-full bg-white border shadow-sm h-11">
            <TabsTrigger value="pending" className="data-[state=active]:bg-amber-100 data-[state=active]:text-amber-900 font-semibold">
              Pending <span className="ml-1.5 text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded-full">{filterByStatus('pending').length}</span>
            </TabsTrigger>
            <TabsTrigger value="approved" className="data-[state=active]:bg-green-100 data-[state=active]:text-green-900 font-semibold">
              Approved <span className="ml-1.5 text-[10px] bg-green-200 text-green-900 px-1.5 py-0.5 rounded-full">{filterByStatus('approved').length}</span>
            </TabsTrigger>
            <TabsTrigger value="rejected" className="data-[state=active]:bg-red-100 data-[state=active]:text-red-900 font-semibold">
              Rejected <span className="ml-1.5 text-[10px] bg-red-200 text-red-900 px-1.5 py-0.5 rounded-full">{filterByStatus('rejected').length}</span>
            </TabsTrigger>
          </TabsList>
          {(['pending', 'approved', 'rejected'] as const).map(s => (
            <TabsContent key={s} value={s} className="space-y-3 mt-4">
              {filterByStatus(s).length === 0 ? (
                <div className="bg-white rounded-xl border border-dashed py-12 px-6 text-center">
                  <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-muted mb-3">
                    <Inbox className="h-7 w-7 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-semibold text-foreground">No {s} crops</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {s === 'pending' ? 'All caught up! New submissions will appear here.' : `No crops in ${s} state yet.`}
                  </p>
                </div>
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
