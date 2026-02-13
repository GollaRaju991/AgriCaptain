import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Props {
  userId: string;
}

const PanCardSection: React.FC<Props> = ({ userId }) => {
  const { toast } = useToast();
  const [panCard, setPanCard] = useState('');
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const fetchPan = async () => {
      const { data } = await supabase.from('profiles').select('pan_card').eq('id', userId).single();
      if (data?.pan_card) setPanCard(data.pan_card);
    };
    fetchPan();
  }, [userId]);

  const handleSave = async () => {
    const { error } = await supabase
      .from('profiles')
      .update({ pan_card: panCard.trim().toUpperCase(), updated_at: new Date().toISOString() })
      .eq('id', userId);
    if (error) {
      toast({ title: 'Failed to update PAN', variant: 'destructive' });
    } else {
      toast({ title: 'PAN Card updated' });
      setEditing(false);
    }
  };

  return (
    <div className="bg-card border rounded-lg p-6">
      <h2 className="text-lg font-bold text-foreground mb-4">PAN Card Information</h2>
      {editing ? (
        <div className="flex gap-3 items-end max-w-md">
          <div className="flex-1">
            <Label>PAN Card Number</Label>
            <Input
              value={panCard}
              onChange={(e) => setPanCard(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
              placeholder="e.g. ABCDE1234F"
              maxLength={10}
            />
          </div>
          <Button size="sm" onClick={handleSave}>Save</Button>
          <Button size="sm" variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <div className="bg-muted/50 border rounded px-4 py-2.5 text-sm text-foreground max-w-md flex-1">
            {panCard || 'Not provided'}
          </div>
          <button className="text-blue-600 text-sm font-medium hover:underline" onClick={() => setEditing(true)}>
            Edit
          </button>
        </div>
      )}
    </div>
  );
};

export default PanCardSection;
