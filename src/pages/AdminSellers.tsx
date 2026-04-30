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
import { ArrowLeft, CheckCircle2, XCircle, Clock, Phone, Mail, MapPin, FileText, Loader2, Eye } from 'lucide-react';

// Convert a stored public-style URL for the private `seller-documents` bucket into a signed URL
const getViewableDocUrl = async (url: string | null): Promise<string | null> => {
  if (!url) return null;
  // If not in the private bucket, return as-is
  const marker = '/storage/v1/object/public/seller-documents/';
  if (!url.includes(marker)) {
    // Sometimes URL may use /sign/ or already be a path — try direct
    return url;
  }
  const path = url.split(marker)[1];
  const { data, error } = await supabase.storage.from('seller-documents').createSignedUrl(path, 60 * 60);
  if (error || !data?.signedUrl) {
    console.error('Failed to sign doc url', error);
    return null;
  }
  return data.signedUrl;
};

const DocLink: React.FC<{ url: string | null; label: string }> = ({ url, label }) => {
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const handleView = async () => {
    if (!url) return;
    setLoading(true);
    const signed = await getViewableDocUrl(url);
    setLoading(false);
    if (!signed) {
      toast({ title: 'Unable to load document', description: 'File may be missing or access denied.', variant: 'destructive' });
      return;
    }
    setPreviewUrl(signed);
    setOpen(true);
  };

  if (!url) return null;
  const isPdf = url.toLowerCase().includes('.pdf');

  return (
    <>
      <button
        type="button"
        onClick={handleView}
        className="flex items-center gap-1 text-primary underline hover:text-primary/80 disabled:opacity-50"
        disabled={loading}
      >
        {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <FileText className="h-3 w-3" />}
        {label}
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader><DialogTitle>{label}</DialogTitle></DialogHeader>
          {previewUrl && (
            isPdf ? (
              <iframe src={previewUrl} className="w-full h-[70vh] rounded border" />
            ) : (
              <img src={previewUrl} alt={label} className="w-full max-h-[70vh] object-contain rounded border" />
            )
          )}
          <DialogFooter>
            {previewUrl && (
              <a href={previewUrl} target="_blank" rel="noreferrer" className="text-sm text-primary underline">
                Open in new tab
              </a>
            )}
            <Button variant="outline" onClick={() => setOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

type Seller = {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  email: string | null;
  shop_farm_name: string | null;
  seller_sub_type: string | null;
  address: string;
  state: string | null;
  district: string | null;
  pincode: string;
  aadhaar_number: string;
  aadhaar_document_url: string | null;
  pan_card_url: string | null;
  photo_url: string | null;
  bank_account_holder: string | null;
  bank_account_number: string | null;
  bank_ifsc: string | null;
  status: string;
  rejection_reason: string | null;
  created_at: string;
  reviewed_at: string | null;
};

const COMMON_REASONS = [
  'Aadhaar number is invalid or unclear',
  'Aadhaar document is not readable',
  'PAN card is missing or unclear',
  'Bank IFSC code is incorrect',
  'Bank account details do not match name',
  'Phone number is invalid',
  'Address is incomplete',
  'Profile photo is missing or unclear',
];

const AdminSellers: React.FC<{ mode?: 'sellers' | 'farmers' }> = ({ mode = 'sellers' }) => {
  const sellerTypeFilter = mode === 'farmers' ? 'farmers_market' : 'agriculture_products';
  const pageTitle = mode === 'farmers' ? 'Admin · Farmer Approvals' : 'Admin · Seller Approvals';
  const entityLabel = mode === 'farmers' ? 'farmer' : 'seller';
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [rejectTarget, setRejectTarget] = useState<Seller | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/auth'); return; }
      const { data: roleData } = await (supabase.from('user_roles') as any)
        .select('role').eq('user_id', user.id).eq('role', 'admin').maybeSingle();
      if (!roleData) {
        toast({ title: 'Access denied', description: 'Admins only', variant: 'destructive' });
        navigate('/');
        return;
      }
      setIsAdmin(true);
      await fetchSellers();
      setLoading(false);
    })();
  }, [sellerTypeFilter]);

  const fetchSellers = async () => {
    const { data, error } = await (supabase.from('sellers') as any)
      .select('*')
      .eq('seller_type', sellerTypeFilter)
      .order('created_at', { ascending: false });
    if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
    setSellers((data || []) as Seller[]);
  };

  const updateStatus = async (id: string, status: 'approved' | 'rejected', reason?: string) => {
    setSubmitting(true);
    const { error } = await (supabase.from('sellers') as any)
      .update({
        status,
        rejection_reason: status === 'rejected' ? reason : null,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', id);
    setSubmitting(false);
    if (error) { toast({ title: 'Failed', description: error.message, variant: 'destructive' }); return; }
    toast({ title: status === 'approved' ? '✅ Seller approved' : '❌ Seller rejected' });
    setRejectTarget(null); setRejectReason('');
    await fetchSellers();
  };

  const filterByStatus = (status: string) => sellers.filter(s => s.status === status);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }
  if (!isAdmin) return null;

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

  const SellerCard = ({ seller }: { seller: Seller }) => (
    <Card className="border">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            {seller.photo_url ? (
              <img src={seller.photo_url} alt={seller.name} className="h-12 w-12 rounded-full object-cover border" />
            ) : (
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                {seller.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h3 className="font-bold text-foreground">{seller.name}</h3>
              <p className="text-xs text-muted-foreground">{seller.shop_farm_name} • {seller.seller_sub_type}</p>
            </div>
          </div>
          <StatusBadge status={seller.status} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-primary" />{seller.phone}</div>
          {seller.email && <div className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 text-primary" />{seller.email}</div>}
          <div className="flex items-center gap-1.5 col-span-full"><MapPin className="h-3.5 w-3.5 text-primary" />{seller.address}, {seller.district}, {seller.state} - {seller.pincode}</div>
          <div className="text-xs text-muted-foreground">Aadhaar: {seller.aadhaar_number}</div>
          {seller.bank_account_number && <div className="text-xs text-muted-foreground">Bank: {seller.bank_ifsc} / {seller.bank_account_number}</div>}
        </div>

        <div className="flex flex-wrap gap-3 text-xs">
          <DocLink url={seller.aadhaar_document_url} label="Aadhaar Doc" />
          <DocLink url={seller.pan_card_url} label="PAN Doc" />
          {!seller.aadhaar_document_url && !seller.pan_card_url && (
            <span className="text-muted-foreground italic">No documents uploaded</span>
          )}
        </div>

        {seller.status === 'rejected' && seller.rejection_reason && (
          <div className="bg-red-50 border border-red-200 rounded p-2 text-xs text-red-800">
            <strong>Rejection reason:</strong> {seller.rejection_reason}
          </div>
        )}

        {seller.status === 'pending' && (
          <div className="flex gap-2 pt-1">
            <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => updateStatus(seller.id, 'approved')} disabled={submitting}>
              <CheckCircle2 className="h-4 w-4 mr-1" /> Approve
            </Button>
            <Button size="sm" variant="destructive" className="flex-1" onClick={() => { setRejectTarget(seller); setRejectReason(''); }} disabled={submitting}>
              <XCircle className="h-4 w-4 mr-1" /> Reject
            </Button>
          </div>
        )}
        {seller.status !== 'pending' && (
          <Button size="sm" variant="outline" onClick={() => updateStatus(seller.id, 'pending' as any)} className="w-full text-xs">
            Move back to Pending
          </Button>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-50 bg-primary text-primary-foreground flex items-center gap-3 px-4 py-3">
        <button onClick={() => navigate('/')}><ArrowLeft className="h-6 w-6" /></button>
        <h1 className="text-lg font-bold">Admin · Seller Approvals</h1>
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
                <p className="text-center text-muted-foreground py-8">No {s} sellers</p>
              ) : (
                filterByStatus(s).map(seller => <SellerCard key={seller.id} seller={seller} />)
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>

      <Dialog open={!!rejectTarget} onOpenChange={(o) => !o && setRejectTarget(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Reject {rejectTarget?.name}</DialogTitle></DialogHeader>
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
              {submitting ? 'Rejecting...' : 'Reject Seller'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminSellers;
