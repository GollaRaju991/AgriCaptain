import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Gift, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface PurchaseGiftCardDialogProps {
  onSuccess?: () => void;
}

const PurchaseGiftCardDialog = ({ onSuccess }: PurchaseGiftCardDialogProps) => {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handlePurchase = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "Please login to purchase gift cards",
        variant: "destructive",
      });
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Generate unique code
      const { data: codeData, error: codeError } = await supabase.rpc('generate_gift_card_code');
      
      if (codeError) throw codeError;

      // Create gift card
      const { data: giftCard, error: giftCardError } = await supabase
        .from('gift_cards')
        .insert({
          user_id: user.id,
          code: codeData,
          balance: parsedAmount,
          initial_amount: parsedAmount,
        })
        .select()
        .single();

      if (giftCardError) throw giftCardError;

      // Create transaction record
      const { error: transactionError } = await supabase
        .from('gift_card_transactions')
        .insert({
          gift_card_id: giftCard.id,
          user_id: user.id,
          transaction_type: 'purchase',
          amount: parsedAmount,
          description: 'Gift card purchased',
        });

      if (transactionError) throw transactionError;

      toast({
        title: "Success",
        description: `Gift card purchased successfully! Code: ${codeData}`,
      });

      setOpen(false);
      setAmount("");
      onSuccess?.();
    } catch (error: any) {
      console.error('Error purchasing gift card:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to purchase gift card",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const presetAmounts = [500, 1000, 2000, 5000];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Purchase Gift Card
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5" />
            Purchase Gift Card
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (₹)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Quick Select</Label>
            <div className="grid grid-cols-4 gap-2">
              {presetAmounts.map((preset) => (
                <Button
                  key={preset}
                  variant="outline"
                  size="sm"
                  onClick={() => setAmount(preset.toString())}
                >
                  ₹{preset}
                </Button>
              ))}
            </div>
          </div>
          <Button 
            onClick={handlePurchase} 
            disabled={loading || !amount}
            className="w-full"
          >
            {loading ? "Processing..." : "Purchase"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PurchaseGiftCardDialog;
