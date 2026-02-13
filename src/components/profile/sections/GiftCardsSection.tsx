import React from 'react';
import { Gift } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const GiftCardsSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-card border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-foreground">Gift Cards</h2>
        <Button size="sm" variant="outline" onClick={() => navigate('/gift-cards')}>
          View All Gift Cards
        </Button>
      </div>
      <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
        <Gift className="h-8 w-8 text-blue-600" />
        <div>
          <p className="font-semibold text-foreground">Balance: ₹0</p>
          <p className="text-sm text-muted-foreground">View and manage your gift cards</p>
        </div>
      </div>
    </div>
  );
};

export default GiftCardsSection;
