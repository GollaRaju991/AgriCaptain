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
import { ArrowLeft, CheckCircle2, XCircle, Clock, Loader2, Package2, Tag, IndianRupee, User } from 'lucide-react';
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

  const ProductCard = ({ p }: { p: SellerProduct }) => (
    <Card className="border">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start gap-3">
          {p.product_images?.[0] ? (
            <img src={p.product_images[0]} alt={p.product_name} className="h-20 w-20 rounded-lg object-cover border" />
          ) : (
            <div className="h-20 w-20 rounded-lg bg-muted flex items-center justify-center"><Package2 className="h-8 w-8 text-muted-foreground" /></div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-bold truncate">{p.product_name}</h3>
                <p className="text-xs text-muted-foreground truncate">{p.category}{p.sub_category ? ` › ${p.sub_category}` : ''}{p.brand ? ` • ${p.brand}` : ''}</p>
              </div>
              <StatusBadge status={p.review_status} />
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs mt-2">
              <div className="flex items-center gap-1"><IndianRupee className="h-3 w-3" />{p.selling_price} <span className="line-through text-muted-foreground ml-1">{p.mrp_price}</span></div>
              <div className="flex items-center gap-1"><Tag className="h-3 w-3" />{p.unit_type} • Stock: {p.stock_quantity}</div>
              {p.seller && <div className="flex items-center gap-1 col-span-2 text-muted-foreground"><User className="h-3 w-3" />{p.seller.name} {p.seller.shop_farm_name ? `(${p.seller.shop_farm_name})` : ''} • {p.seller.phone}</div>}
            </div>
          </div>
        </div>

        {p.description && <p className="text-xs text-muted-foreground line-clamp-2">{p.description}</p>}

        {p.product_images && p.product_images.length > 1 && (
          <div className="flex gap-1.5 overflow-x-auto">
            {p.product_images.slice(1, 6).map((img, i) => (
              <img key={i} src={img} alt="" className="h-12 w-12 rounded object-cover border flex-shrink-0" />
            ))}
          </div>
        )}

        {p.review_status === 'rejected' && p.rejection_reason && (
          <div className="bg-red-50 border border-red-200 rounded p-2 text-xs text-red-800 whitespace-pre-line">
            <strong>Rejection reason:</strong> {p.rejection_reason}
          </div>
        )}

        {p.review_status === 'pending' ? (
          <div className="flex gap-2">
            <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => updateStatus(p.id, 'approved')} disabled={submitting}>
              <CheckCircle2 className="h-4 w-4 mr-1" /> Approve
            </Button>
            <Button size="sm" variant="destructive" className="flex-1" onClick={() => { setRejectTarget(p); setRejectReason(''); }} disabled={submitting}>
              <XCircle className="h-4 w-4 mr-1" /> Reject
            </Button>
          </div>
        ) : (
          <Button size="sm" variant="outline" onClick={() => updateStatus(p.id, 'pending')} className="w-full text-xs">Move back to Pending</Button>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-50 bg-primary text-primary-foreground flex items-center gap-3 px-4 py-3">
        <button onClick={() => navigate('/admin')}><ArrowLeft className="h-6 w-6" /></button>
        <h1 className="text-lg font-bold">Admin · Product Approvals</h1>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        <Tabs defaultValue="pending">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="pending">Pending ({filterByStatus('pending').length})</TabsTrigger>
            <TabsTrigger value="approved">Approved ({filterByStatus('approved').length})</TabsTrigger>
            <TabsTrigger value="rejected">Rejected ({filterByStatus('rejected').length})</TabsTrigger>
          </TabsList>
          {(['pending', 'approved', 'rejected'] as const).map(s => (
            <TabsContent key={s} value={s} className="space-y-3 mt-4">
              {filterByStatus(s).length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No {s} products</p>
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
