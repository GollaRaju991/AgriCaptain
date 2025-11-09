import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Gift } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface GiftCardItemProps {
  giftCard: {
    id: string;
    code: string;
    balance: number;
    initial_amount: number;
    is_active: boolean;
    expires_at: string | null;
    created_at: string;
  };
}

const GiftCardItem = ({ giftCard }: GiftCardItemProps) => {
  const { toast } = useToast();

  const copyCode = () => {
    navigator.clipboard.writeText(giftCard.code);
    toast({
      title: "Copied!",
      description: "Gift card code copied to clipboard",
    });
  };

  const isExpired = giftCard.expires_at && new Date(giftCard.expires_at) < new Date();
  const balancePercentage = (giftCard.balance / giftCard.initial_amount) * 100;

  return (
    <Card className={!giftCard.is_active || isExpired ? "opacity-60" : ""}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-primary" />
            <span className="text-lg">Gift Card</span>
          </div>
          {!giftCard.is_active && (
            <Badge variant="secondary">Inactive</Badge>
          )}
          {isExpired && (
            <Badge variant="destructive">Expired</Badge>
          )}
          {giftCard.is_active && !isExpired && giftCard.balance <= 0 && (
            <Badge variant="secondary">Used</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Balance</span>
            <span className="text-2xl font-bold">₹{giftCard.balance}</span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${balancePercentage}%` }}
            />
          </div>
          <div className="text-xs text-muted-foreground">
            Initial: ₹{giftCard.initial_amount}
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <code className="bg-muted px-3 py-2 rounded text-sm flex-1">
              {giftCard.code}
            </code>
            <Button size="icon" variant="outline" onClick={copyCode}>
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <div>Created: {format(new Date(giftCard.created_at), 'PPP')}</div>
          {giftCard.expires_at && (
            <div>Expires: {format(new Date(giftCard.expires_at), 'PPP')}</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default GiftCardItem;
