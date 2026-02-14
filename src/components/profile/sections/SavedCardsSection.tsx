import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, CreditCard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface SavedCard {
  id: string;
  card_number_last4: string;
  card_holder_name: string;
  card_type: string;
  bank_name: string | null;
  expiry_month: number;
  expiry_year: number;
  is_default: boolean;
}

const SavedCardsSection: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [cards, setCards] = useState<SavedCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<SavedCard | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ last4: '', holderName: '', cardType: 'debit', bankName: '', expiryMonth: '', expiryYear: '' });

  useEffect(() => { if (user) fetchCards(); }, [user]);

  const fetchCards = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('saved_cards').select('*').eq('user_id', user!.id).order('created_at', { ascending: false });
    if (!error) setCards((data as any[]) || []);
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.last4 || !form.holderName || !form.expiryMonth || !form.expiryYear) {
      toast({ title: 'Please fill all required fields', variant: 'destructive' }); return;
    }
    setSaving(true);
    const payload = {
      user_id: user!.id,
      card_number_last4: form.last4.trim(),
      card_holder_name: form.holderName.trim(),
      card_type: form.cardType,
      bank_name: form.bankName.trim() || null,
      expiry_month: parseInt(form.expiryMonth),
      expiry_year: parseInt(form.expiryYear),
      is_default: cards.length === 0,
    };

    if (editing) {
      const { error } = await supabase.from('saved_cards').update({ ...payload, updated_at: new Date().toISOString() }).eq('id', editing.id).eq('user_id', user!.id);
      if (error) toast({ title: 'Failed to update', variant: 'destructive' }); else toast({ title: 'Card updated' });
    } else {
      const { error } = await supabase.from('saved_cards').insert([payload]);
      if (error) toast({ title: 'Failed to add card', variant: 'destructive' }); else toast({ title: 'Card added' });
    }
    setSaving(false);
    resetForm();
    fetchCards();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('saved_cards').delete().eq('id', id).eq('user_id', user!.id);
    if (!error) { toast({ title: 'Card deleted' }); fetchCards(); }
  };

  const startEdit = (c: SavedCard) => {
    setEditing(c);
    setForm({ last4: c.card_number_last4, holderName: c.card_holder_name, cardType: c.card_type, bankName: c.bank_name || '', expiryMonth: String(c.expiry_month), expiryYear: String(c.expiry_year) });
    setShowForm(true);
  };

  const resetForm = () => { setEditing(null); setForm({ last4: '', holderName: '', cardType: 'debit', bankName: '', expiryMonth: '', expiryYear: '' }); setShowForm(false); };

  if (loading) return <div className="flex items-center justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  return (
    <div className="bg-card border rounded-xl p-8 shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Saved Cards</h2>
        <Button size="sm" onClick={() => { resetForm(); setShowForm(true); }} className="gap-2">
          <Plus className="h-4 w-4" /> Add Card
        </Button>
      </div>

      {showForm && (
        <Card className="border-2 border-primary">
          <CardContent className="pt-6">
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Last 4 Digits *</Label>
                  <Input value={form.last4} onChange={(e) => setForm({ ...form, last4: e.target.value })} placeholder="1234" maxLength={4} required className="mt-1" />
                </div>
                <div>
                  <Label>Card Holder Name *</Label>
                  <Input value={form.holderName} onChange={(e) => setForm({ ...form, holderName: e.target.value })} placeholder="Name on card" required className="mt-1" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Card Type</Label>
                  <Select value={form.cardType} onValueChange={(v) => setForm({ ...form, cardType: v })}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="debit">Debit Card</SelectItem>
                      <SelectItem value="credit">Credit Card</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Expiry Month *</Label>
                  <Input type="number" min="1" max="12" value={form.expiryMonth} onChange={(e) => setForm({ ...form, expiryMonth: e.target.value })} placeholder="MM" required className="mt-1" />
                </div>
                <div>
                  <Label>Expiry Year *</Label>
                  <Input type="number" min="2024" max="2040" value={form.expiryYear} onChange={(e) => setForm({ ...form, expiryYear: e.target.value })} placeholder="YYYY" required className="mt-1" />
                </div>
              </div>
              <div>
                <Label>Bank Name (optional)</Label>
                <Input value={form.bankName} onChange={(e) => setForm({ ...form, bankName: e.target.value })} placeholder="e.g. SBI, HDFC" className="mt-1" />
              </div>
              <div className="flex gap-3">
                <Button type="submit" disabled={saving}>{saving ? 'Saving...' : editing ? 'Update' : 'Save'}</Button>
                <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {cards.length > 0 ? (
        <div className="space-y-3">
          {cards.map((card) => (
            <div key={card.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium text-foreground">•••• •••• •••• {card.card_number_last4}</p>
                  <p className="text-sm text-muted-foreground">{card.card_holder_name} · {card.card_type === 'credit' ? 'Credit' : 'Debit'} · Exp {String(card.expiry_month).padStart(2, '0')}/{card.expiry_year}</p>
                  {card.bank_name && <p className="text-xs text-muted-foreground">{card.bank_name}</p>}
                </div>
                {card.is_default && <Badge variant="secondary" className="text-xs">Default</Badge>}
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => startEdit(card)}><Edit className="h-4 w-4" /></Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(card.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            </div>
          ))}
        </div>
      ) : !showForm && (
        <div className="text-center py-8">
          <CreditCard className="h-16 w-16 mx-auto mb-4 text-muted-foreground/40" />
          <p className="text-muted-foreground">No saved cards. Add one to get started.</p>
        </div>
      )}
    </div>
  );
};

export default SavedCardsSection;
