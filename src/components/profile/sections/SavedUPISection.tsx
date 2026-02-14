import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, X, CreditCard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface SavedUPI {
  id: string;
  upi_id: string;
  provider: string | null;
  is_default: boolean;
}

const SavedUPISection: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [upiList, setUpiList] = useState<SavedUPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<SavedUPI | null>(null);
  const [upiId, setUpiId] = useState('');
  const [provider, setProvider] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (user) fetchUPI(); }, [user]);

  const fetchUPI = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('saved_upi').select('*').eq('user_id', user!.id).order('created_at', { ascending: false });
    if (!error) setUpiList((data as any[]) || []);
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!upiId.trim()) { toast({ title: 'Please enter UPI ID', variant: 'destructive' }); return; }
    setSaving(true);
    const payload = { user_id: user!.id, upi_id: upiId.trim(), provider: provider.trim() || null, is_default: upiList.length === 0 };

    if (editing) {
      const { error } = await supabase.from('saved_upi').update({ upi_id: payload.upi_id, provider: payload.provider, updated_at: new Date().toISOString() }).eq('id', editing.id).eq('user_id', user!.id);
      if (error) { toast({ title: 'Failed to update', variant: 'destructive' }); } else { toast({ title: 'UPI updated' }); }
    } else {
      const { error } = await supabase.from('saved_upi').insert([payload]);
      if (error) { toast({ title: 'Failed to add UPI', variant: 'destructive' }); } else { toast({ title: 'UPI added' }); }
    }
    setSaving(false);
    resetForm();
    fetchUPI();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('saved_upi').delete().eq('id', id).eq('user_id', user!.id);
    if (!error) { toast({ title: 'UPI deleted' }); fetchUPI(); }
  };

  const startEdit = (item: SavedUPI) => { setEditing(item); setUpiId(item.upi_id); setProvider(item.provider || ''); setShowForm(true); };
  const resetForm = () => { setEditing(null); setUpiId(''); setProvider(''); setShowForm(false); };

  if (loading) return <div className="flex items-center justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  return (
    <div className="bg-card border rounded-xl p-8 shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Saved UPI</h2>
        <Button size="sm" onClick={() => { resetForm(); setShowForm(true); }} className="gap-2">
          <Plus className="h-4 w-4" /> Add UPI
        </Button>
      </div>

      {showForm && (
        <Card className="border-2 border-primary">
          <CardContent className="pt-6">
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <Label>UPI ID *</Label>
                <Input value={upiId} onChange={(e) => setUpiId(e.target.value)} placeholder="yourname@upi" required className="mt-1" />
              </div>
              <div>
                <Label>Provider (optional)</Label>
                <Input value={provider} onChange={(e) => setProvider(e.target.value)} placeholder="e.g. Google Pay, PhonePe" className="mt-1" />
              </div>
              <div className="flex gap-3">
                <Button type="submit" disabled={saving}>{saving ? 'Saving...' : editing ? 'Update' : 'Save'}</Button>
                <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {upiList.length > 0 ? (
        <div className="space-y-3">
          {upiList.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium text-foreground">{item.upi_id}</p>
                  {item.provider && <p className="text-sm text-muted-foreground">{item.provider}</p>}
                </div>
                {item.is_default && <Badge variant="secondary" className="text-xs">Default</Badge>}
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => startEdit(item)}><Edit className="h-4 w-4" /></Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            </div>
          ))}
        </div>
      ) : !showForm && (
        <div className="text-center py-8">
          <CreditCard className="h-16 w-16 mx-auto mb-4 text-muted-foreground/40" />
          <p className="text-muted-foreground">No saved UPI IDs. Add one to get started.</p>
        </div>
      )}
    </div>
  );
};

export default SavedUPISection;
