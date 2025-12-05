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

  // Validate gift card code format (XXXX-XXXX-XXXX-XXXX)
  const isValidGiftCardCode = (code: string): boolean => {
    const cleanCode = code.toUpperCase().trim();
    // Allow alphanumeric codes with optional dashes
    return /^[A-Z0-9]{4}-?[A-Z0-9]{4}-?[A-Z0-9]{4}-?[A-Z0-9]{4}$/.test(cleanCode);
  };

  const handleRedeem = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "Please login to redeem gift cards",
        variant: "destructive",
      });
      return;
    }

    const cleanCode = code.toUpperCase().trim().replace(/-/g, '');
    
    if (!code.trim()) {
      toast({
        title: "Error",
        description: "Please enter a gift card code",
        variant: "destructive",
      });
      return;
    }

    // Validate code format to prevent injection
    if (!isValidGiftCardCode(code)) {
      toast({
        title: "Error",
        description: "Invalid gift card code format",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Format code for database lookup (with dashes)
      const formattedCode = cleanCode.replace(/(.{4})/g, '$1-').slice(0, -1);
      
      // Check if gift card exists, is valid, AND is not already owned by another user
      // RLS policies will only return cards that either belong to the current user
      // or have no owner (user_id is null) - but since user_id is NOT NULL, 
      // we need to check if the card was purchased by the current user or is "unassigned"
      const { data: giftCard, error: fetchError } = await supabase
        .from('gift_cards')
        .select('*')
        .eq('code', formattedCode)
        .single();

      if (fetchError || !giftCard) {
        toast({
          title: "Error",
          description: "Invalid gift card code or card not found",
          variant: "destructive",
        });
        return;
      }

      // Security check: Only allow redemption if the card already belongs to this user
      // Gift cards should be purchased directly or transferred through a secure process
      if (giftCard.user_id !== user.id) {
        toast({
          title: "Error",
          description: "This gift card cannot be redeemed. Please contact support.",
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

      // Card is valid and belongs to user - show current balance
      toast({
        title: "Gift Card Valid",
        description: `Your gift card has a balance of ₹${giftCard.balance}`,
      });

      setOpen(false);
      setCode("");
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to verify gift card",
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
          Check Balance
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ticket className="w-5 h-5" />
            Check Gift Card Balance
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
            {loading ? "Checking..." : "Check Balance"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RedeemGiftCardDialog;