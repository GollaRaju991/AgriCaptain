import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Gift, Loader2, ArrowRight } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const ReferralEarningsCard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [referralCount, setReferralCount] = useState(0);
  const [referralEarnings, setReferralEarnings] = useState(0);
  const [loading, setLoading] = useState(true);
  const [withdrawing, setWithdrawing] = useState(false);

  useEffect(() => {
    if (user) fetchReferralData();
  }, [user]);

  const fetchReferralData = async () => {
    try {
      setLoading(true);
      const { count } = await supabase
        .from('referrals')
        .select('*', { count: 'exact', head: true })
        .eq('referrer_id', user!.id)
        .eq('status', 'completed');
      
      const completedCount = count || 0;
      setReferralCount(completedCount);
      setReferralEarnings(completedCount * 5);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return null;
  if (referralCount === 0) return null;

  const progressPercent = Math.min((referralCount % 10 === 0 && referralCount > 0 ? 10 : referralCount % 10) / 10 * 100, 100);
  const completedSets = Math.floor(referralCount / 10);
  const currentSetCount = referralCount % 10;
  const canWithdraw = referralCount >= 10;
  const withdrawableAmount = completedSets * 50;

  return (
    <Card className="mb-6 border-primary/20 bg-primary/5">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold">Referral Earnings</p>
              <p className="text-xs text-muted-foreground">{referralCount} successful referral{referralCount !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <span className="text-lg font-bold text-primary">₹{referralEarnings}</span>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Progress to next milestone</span>
            <span>{currentSetCount}/10</span>
          </div>
          <Progress value={currentSetCount === 0 && referralCount > 0 ? 100 : (currentSetCount / 10) * 100} className="h-2" />
        </div>

        {canWithdraw ? (
          <div className="flex items-center justify-between bg-green-50 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <Gift className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-xs font-medium text-green-700">Withdrawal unlocked!</p>
                <p className="text-xs text-green-600">₹{withdrawableAmount} available to withdraw or use for purchases</p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground text-center">
            {10 - currentSetCount} more referral{10 - currentSetCount !== 1 ? 's' : ''} to unlock withdrawal & purchases
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default ReferralEarningsCard;
