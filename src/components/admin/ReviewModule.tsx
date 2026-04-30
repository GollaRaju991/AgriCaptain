import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, XCircle, Clock, Loader2, ChevronRight } from "lucide-react";

export type ReviewItem = {
  id: string;
  review_status: string;
  rejection_reason: string | null;
  [k: string]: any;
};

interface Props {
  title: string;
  table: "seller_products" | "farmer_crops";
  extraFilter?: { column: string; value: string };
  renderRow: (item: ReviewItem) => React.ReactNode;
  renderDetail: (item: ReviewItem) => React.ReactNode;
}

const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, { cls: string; icon: any; label: string }> = {
    pending:  { label: "Pending",  cls: "bg-amber-100 text-amber-800 border-amber-300", icon: Clock },
    approved: { label: "Approved", cls: "bg-green-100 text-green-800 border-green-300", icon: CheckCircle2 },
    rejected: { label: "Rejected", cls: "bg-red-100 text-red-800 border-red-300", icon: XCircle },
  };
  const m = map[status] || map.pending;
  const Icon = m.icon;
  return <Badge variant="outline" className={`${m.cls} gap-1`}><Icon className="h-3 w-3" />{m.label}</Badge>;
};

const ReviewModule: React.FC<Props> = ({ title, table, extraFilter, renderRow, renderDetail }) => {
  const { toast } = useToast();
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"pending" | "approved" | "rejected">("pending");
  const [detail, setDetail] = useState<ReviewItem | null>(null);
  const [rejectFor, setRejectFor] = useState<ReviewItem | null>(null);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    let q: any = (supabase.from(table) as any).select("*").order("created_at", { ascending: false });
    if (extraFilter) q = q.eq(extraFilter.column, extraFilter.value);
    const { data, error } = await q;
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    setItems((data || []) as ReviewItem[]);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [table, extraFilter?.value]);

  const update = async (id: string, status: "approved" | "rejected" | "pending", rejection_reason?: string | null) => {
    setSubmitting(true);
    const { error } = await (supabase.from(table) as any).update({
      review_status: status,
      rejection_reason: status === "rejected" ? rejection_reason : null,
      reviewed_at: new Date().toISOString(),
    }).eq("id", id);
    setSubmitting(false);
    if (error) { toast({ title: "Failed", description: error.message, variant: "destructive" }); return; }
    toast({ title: status === "approved" ? "✅ Approved" : status === "rejected" ? "❌ Rejected" : "Moved to pending" });
    setRejectFor(null); setReason(""); setDetail(null);
    fetchData();
  };

  const filtered = items.filter((i) => i.review_status === tab);
  const counts = {
    pending: items.filter(i => i.review_status === "pending").length,
    approved: items.filter(i => i.review_status === "approved").length,
    rejected: items.filter(i => i.review_status === "rejected").length,
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-sm text-muted-foreground">Tap an entry to review the full application.</p>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="pending">Pending ({counts.pending})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({counts.approved})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({counts.rejected})</TabsTrigger>
        </TabsList>
        <TabsContent value={tab} className="mt-4">
          {loading ? (
            <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">No {tab} entries</p>
          ) : (
            <div className="space-y-2">
              {filtered.map((item) => (
                <Card key={item.id} className="cursor-pointer hover:shadow-md transition" onClick={() => setDetail(item)}>
                  <CardContent className="p-3 flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">{renderRow(item)}</div>
                    <div className="flex items-center gap-2 shrink-0">
                      <StatusBadge status={item.review_status} />
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Detail dialog */}
      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between gap-3">
              <span>Application Details</span>
              {detail && <StatusBadge status={detail.review_status} />}
            </DialogTitle>
          </DialogHeader>
          {detail && (
            <div className="space-y-3">
              {renderDetail(detail)}
              {detail.rejection_reason && (
                <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-800">
                  <strong>Rejection reason:</strong> {detail.rejection_reason}
                </div>
              )}
            </div>
          )}
          <DialogFooter className="flex-col sm:flex-row gap-2">
            {detail?.review_status === "pending" ? (
              <>
                <Button variant="destructive" className="flex-1" disabled={submitting}
                  onClick={() => { setRejectFor(detail); setReason(""); }}>
                  <XCircle className="h-4 w-4 mr-1" /> Reject
                </Button>
                <Button className="flex-1 bg-green-600 hover:bg-green-700" disabled={submitting}
                  onClick={() => detail && update(detail.id, "approved")}>
                  <CheckCircle2 className="h-4 w-4 mr-1" /> Approve
                </Button>
              </>
            ) : (
              <Button variant="outline" className="w-full" disabled={submitting}
                onClick={() => detail && update(detail.id, "pending")}>
                Move back to Pending
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject reason dialog */}
      <Dialog open={!!rejectFor} onOpenChange={(o) => !o && setRejectFor(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Rejection reason</DialogTitle></DialogHeader>
          <Textarea rows={5} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Tell the user what to fix..." />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectFor(null)}>Cancel</Button>
            <Button variant="destructive" disabled={!reason.trim() || submitting}
              onClick={() => rejectFor && update(rejectFor.id, "rejected", reason.trim())}>
              {submitting ? "Rejecting..." : "Confirm Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReviewModule;
