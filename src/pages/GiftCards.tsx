import { Gift } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import PurchaseGiftCardDialog from "@/components/PurchaseGiftCardDialog";
import RedeemGiftCardDialog from "@/components/RedeemGiftCardDialog";
import GiftCardItem from "@/components/GiftCardItem";

const GiftCards = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [giftCards, setGiftCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalBalance, setTotalBalance] = useState(0);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    } else {
      fetchGiftCards();
    }
  }, [user, navigate]);

  const fetchGiftCards = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('gift_cards')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setGiftCards(data || []);
      
      // Calculate total available balance
      const total = (data || []).reduce((sum, card) => {
        if (card.is_active && card.balance > 0) {
          if (!card.expires_at || new Date(card.expires_at) > new Date()) {
            return sum + Number(card.balance);
          }
        }
        return sum;
      }, 0);
      setTotalBalance(total);
    } catch (error: any) {
      console.error('Error fetching gift cards:', error);
      toast({
        title: "Error",
        description: "Failed to load gift cards",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Gift Cards</h1>
            {totalBalance > 0 && (
              <p className="text-muted-foreground mt-1">
                Total Balance: ₹{totalBalance.toFixed(2)}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <RedeemGiftCardDialog onSuccess={fetchGiftCards} />
            <PurchaseGiftCardDialog onSuccess={fetchGiftCards} />
          </div>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        ) : giftCards.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Gift className="w-24 h-24 text-muted-foreground mb-4" />
            <p className="text-xl text-muted-foreground mb-4">No Gift Cards</p>
            <p className="text-sm text-muted-foreground mb-6">
              Purchase or redeem a gift card to get started
            </p>
            <div className="flex gap-2">
              <RedeemGiftCardDialog onSuccess={fetchGiftCards} />
              <PurchaseGiftCardDialog onSuccess={fetchGiftCards} />
            </div>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {giftCards.map((card) => (
              <GiftCardItem key={card.id} giftCard={card} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default GiftCards;
