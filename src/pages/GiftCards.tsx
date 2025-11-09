import { Gift } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const GiftCards = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  // For now, showing empty state. In future, this can fetch from database
  const giftCards: any[] = [];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Gift Cards</h1>
        
        {giftCards.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Gift className="w-24 h-24 text-muted-foreground mb-4" />
            <p className="text-xl text-muted-foreground">No Gift Cards</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {giftCards.map((card) => (
              <div key={card.id} className="border rounded-lg p-4">
                {/* Gift card content will go here */}
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default GiftCards;
