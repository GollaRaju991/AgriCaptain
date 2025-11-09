import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Ticket } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface RedeemGiftCardDialogProps {
  onSuccess?: () => void;
}

const RedeemGiftCardDialog = ({ onSuccess }: RedeemGiftCardDialogProps) => {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleRedeem = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "Please login to redeem gift cards",
        variant: "destructive",
      });
      return;
    }

    if (!code.trim()) {
      toast({
        title: "Error",
        description: "Please enter a gift card code",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Check if gift card exists and is valid
      const { data: giftCard, error: fetchError } = await supabase
        .from('gift_cards')
        .select('*')
        .eq('code', code.toUpperCase().trim())
        .single();

      if (fetchError || !giftCard) {
        toast({
          title: "Error",
          description: "Invalid gift card code",
          variant: "destructive",
        });
        return;
      }

      if (!giftCard.is_active) {
        toast({
          title: "Error",
          description: "This gift card is no longer active",
          variant: "destructive",
        });
        return;
      }

      if (giftCard.expires_at && new Date(giftCard.expires_at) < new Date()) {
        toast({
          title: "Error",
          description: "This gift card has expired",
          variant: "destructive",
        });
        return;
      }

      if (giftCard.balance <= 0) {
        toast({
          title: "Error",
          description: "This gift card has no balance remaining",
          variant: "destructive",
        });
        return;
      }

      // Transfer gift card to user
      const { error: updateError } = await supabase
        .from('gift_cards')
        .update({ user_id: user.id })
        .eq('id', giftCard.id);

      if (updateError) throw updateError;

      // Create transaction record
      const { error: transactionError } = await supabase
        .from('gift_card_transactions')
        .insert({
          gift_card_id: giftCard.id,
          user_id: user.id,
          transaction_type: 'credit',
          amount: giftCard.balance,
          description: 'Gift card redeemed',
        });

      if (transactionError) throw transactionError;

      toast({
        title: "Success",
        description: `Gift card redeemed! Balance: ₹${giftCard.balance}`,
      });

      setOpen(false);
      setCode("");
      onSuccess?.();
    } catch (error: any) {
      console.error('Error redeeming gift card:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to redeem gift card",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Ticket className="w-4 h-4" />
          Redeem Code
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ticket className="w-5 h-5" />
            Redeem Gift Card
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">Gift Card Code</Label>
            <Input
              id="code"
              type="text"
              placeholder="XXXX-XXXX-XXXX-XXXX"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              maxLength={19}
            />
          </div>
          <Button 
            onClick={handleRedeem} 
            disabled={loading || !code}
            className="w-full"
          >
            {loading ? "Validating..." : "Redeem"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RedeemGiftCardDialog;
