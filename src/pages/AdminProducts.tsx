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
import { ArrowLeft, CheckCircle2, XCircle, Clock, Loader2, Package2, Tag, IndianRupee, User, Inbox, Layers } from 'lucide-react';
import ValidationSummary, { validateProduct } from '@/components/admin/ValidationSummary';

type SellerProduct = {
  id: string;
  user_id: string;
  seller_id: string;
  product_name: string;
  category: string;
  sub_category: string | null;
  brand: string | null;
  product_type: string | null;
  mrp_price: number;
  selling_price: number;
  discount_percent: number | null;
  stock_quantity: number;
  unit_type: string;
  description: string | null;
  product_images: string[] | null;
  status: string;
  review_status: string;
  rejection_reason: string | null;
  reviewed_at: string | null;
  created_at: string;
  seller?: { name: string; phone: string; shop_farm_name: string | null } | null;
};

const COMMON_REASONS = [
  'Product images are unclear or missing',
  'Price is unrealistic',
  'Description is incomplete',
  'Brand information missing',
  'Category does not match product',
  'Stock quantity invalid',
  'Misleading product information',
];

const AdminProducts = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<SellerProduct[]>([]);
  const [rejectTarget, setRejectTarget] = useState<SellerProduct | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchProducts().finally(() => setLoading(false)); }, []);

  const fetchProducts = async () => {
    const { data, error } = await (supabase.from('seller_products') as any)
      .select('*')
      .order('created_at', { ascending: false });
    if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
    const list = (data || []) as SellerProduct[];

    // Fetch seller names for context
    const sellerIds = Array.from(new Set(list.map(p => p.seller_id).filter(Boolean)));
    if (sellerIds.length) {
      const { data: sellers } = await (supabase.from('sellers') as any)
        .select('id,name,phone,shop_farm_name').in('id', sellerIds);
      const map = new Map<string, any>((sellers || []).map((s: any) => [s.id, s]));
      list.forEach(p => { p.seller = (map.get(p.seller_id) as any) || null; });
    }
    setProducts(list);
  };

  const updateStatus = async (id: string, review_status: 'approved' | 'rejected' | 'pending', reason?: string) => {
    setSubmitting(true);
    const { error } = await (supabase.from('seller_products') as any)
      .update({
        review_status,
        rejection_reason: review_status === 'rejected' ? reason : null,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', id);
    setSubmitting(false);
    if (error) { toast({ title: 'Failed', description: error.message, variant: 'destructive' }); return; }
    toast({ title: review_status === 'approved' ? '✅ Product approved' : review_status === 'rejected' ? '❌ Product rejected' : 'Moved to pending' });
    setRejectTarget(null); setRejectReason('');
    await fetchProducts();
  };

  const filterByStatus = (status: string) => products.filter(p => p.review_status === status);

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-purple-50 to-blue-50">
      <Loader2 className="h-10 w-10 animate-spin text-purple-600" />
      <p className="text-sm text-muted-foreground">Loading product submissions…</p>
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

  const ProductCard = ({ p }: { p: SellerProduct }) => {
    const discount = p.mrp_price > 0 ? Math.round(((p.mrp_price - p.selling_price) / p.mrp_price) * 100) : 0;
    return (
      <Card className="border-0 shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden ring-1 ring-border/60">
        <CardContent className="p-0">
          <div className="p-4 space-y-3">
            <div className="flex items-start gap-3">
              <div className="relative flex-shrink-0">
                {p.product_images?.[0] ? (
                  <img src={p.product_images[0]} alt={p.product_name} className="h-24 w-24 rounded-xl object-cover border-2 border-white shadow-md" />
                ) : (
                  <div className="h-24 w-24 rounded-xl bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center border-2 border-white shadow-md">
                    <Package2 className="h-10 w-10 text-purple-600" />
                  </div>
                )}
                {p.product_images && p.product_images.length > 1 && (
                  <span className="absolute -bottom-1 -right-1 bg-foreground text-background text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center shadow">
                    +{p.product_images.length - 1}
                  </span>
                )}
                {discount > 0 && (
                  <span className="absolute -top-1.5 -left-1.5 bg-red-600 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 shadow">
                    -{discount}%
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="min-w-0">
                    <h3 className="font-bold text-base truncate leading-tight">{p.product_name}</h3>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {p.category}{p.sub_category ? ` › ${p.sub_category}` : ''}
                    </p>
                    {p.brand && (
                      <span className="inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 font-semibold">
                        {p.brand}
                      </span>
                    )}
                  </div>
                  <StatusBadge status={p.review_status} />
                </div>
                <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs mt-3">
                  <div className="flex items-baseline gap-1.5">
                    <IndianRupee className="h-3.5 w-3.5 text-green-600 self-center" />
                    <span className="font-bold text-foreground">{p.selling_price}</span>
                    {p.mrp_price > p.selling_price && (
                      <span className="line-through text-[11px] text-muted-foreground">₹{p.mrp_price}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Tag className="h-3.5 w-3.5" />
                    <span>{p.unit_type}</span>
                  </div>
                  <div className="flex items-center gap-1.5 col-span-2">
                    <Layers className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className={`font-semibold ${p.stock_quantity > 0 ? 'text-foreground' : 'text-red-600'}`}>
                      Stock: {p.stock_quantity}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {p.seller && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 border">
                <div className="h-7 w-7 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {p.seller.name?.charAt(0).toUpperCase() || 'S'}
                </div>
                <div className="flex-1 min-w-0 text-xs">
                  <p className="font-semibold truncate">
                    {p.seller.name}
                    {p.seller.shop_farm_name && <span className="text-muted-foreground font-normal"> · {p.seller.shop_farm_name}</span>}
                  </p>
                  <p className="text-muted-foreground truncate">{p.seller.phone}</p>
                </div>
              </div>
            )}

            {p.description && (
              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{p.description}</p>
            )}

            {p.product_images && p.product_images.length > 1 && (
              <div className="flex gap-1.5 overflow-x-auto pb-1">
                {p.product_images.slice(1, 6).map((img, i) => (
                  <img key={i} src={img} alt="" className="h-14 w-14 rounded-lg object-cover border flex-shrink-0 hover:scale-105 transition-transform" />
                ))}
              </div>
            )}

            <ValidationSummary images={p.product_images} issues={validateProduct(p)} />

            {p.review_status === 'rejected' && p.rejection_reason && (
              <div className="bg-red-50 border-l-4 border-red-400 rounded-r p-3 text-xs text-red-800 whitespace-pre-line">
                <strong className="block mb-1">Rejection reason</strong>
                {p.rejection_reason}
              </div>
            )}
          </div>

          <div className="px-4 py-3 bg-muted/30 border-t">
            {p.review_status === 'pending' ? (
              <div className="flex gap-2">
                <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700 shadow-sm" onClick={() => updateStatus(p.id, 'approved')} disabled={submitting}>
                  <CheckCircle2 className="h-4 w-4 mr-1.5" /> Approve
                </Button>
                <Button size="sm" variant="destructive" className="flex-1 shadow-sm" onClick={() => { setRejectTarget(p); setRejectReason(''); }} disabled={submitting}>
                  <XCircle className="h-4 w-4 mr-1.5" /> Reject
                </Button>
              </div>
            ) : (
              <Button size="sm" variant="outline" onClick={() => updateStatus(p.id, 'pending')} className="w-full text-xs">
                <Clock className="h-3.5 w-3.5 mr-1.5" /> Move back to Pending
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const totals = {
    pending: products.filter(p => p.review_status === 'pending').length,
    approved: products.filter(p => p.review_status === 'approved').length,
    rejected: products.filter(p => p.review_status === 'rejected').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50/40 via-background to-blue-50/40">
      <div className="sticky top-0 z-50 bg-gradient-to-r from-purple-700 via-purple-600 to-indigo-600 text-white shadow-lg">
        <div className="max-w-5xl mx-auto flex items-center gap-3 px-4 py-4">
          <button onClick={() => navigate('/admin')} className="hover:bg-white/10 rounded-full p-1.5 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2.5 flex-1">
            <div className="h-9 w-9 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center">
              <Package2 className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-base font-bold leading-tight">Product Approvals</h1>
              <p className="text-[11px] text-white/80">Review seller listings</p>
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
                  <p className="text-sm font-semibold text-foreground">No {s} products</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {s === 'pending' ? 'All caught up! New submissions will appear here.' : `No products in ${s} state yet.`}
                  </p>
                </div>
              ) : (
                filterByStatus(s).map(p => <ProductCard key={p.id} p={p} />)
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>

      <Dialog open={!!rejectTarget} onOpenChange={(o) => !o && setRejectTarget(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Reject {rejectTarget?.product_name}</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Tell the seller exactly what to fix:</p>
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
              {submitting ? 'Rejecting...' : 'Reject Product'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminProducts;
