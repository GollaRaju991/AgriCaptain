import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, Check, Loader2, Users, Gift } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';

interface ReferralDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ReferralDialog: React.FC<ReferralDialogProps> = ({ open, onOpenChange }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [referralCount, setReferralCount] = useState(0);
  const [referralEarnings, setReferralEarnings] = useState(0);

  useEffect(() => {
    if (open && user) {
      fetchOrCreateReferralCode();
    }
  }, [open, user]);

  const fetchOrCreateReferralCode = async () => {
    setLoading(true);
    try {
      const { data: existing } = await supabase
        .from('referrals')
        .select('*')
        .eq('referrer_id', user!.id)
        .order('created_at', { ascending: true })
        .limit(1);

      if (existing && existing.length > 0) {
        setReferralCode(existing[0].referral_code);
        const { count } = await supabase
          .from('referrals')
          .select('*', { count: 'exact', head: true })
          .eq('referrer_id', user!.id)
          .eq('status', 'completed');
        const completedCount = count || 0;
        setReferralCount(completedCount);
        setReferralEarnings(completedCount * 5);
      } else {
        const { data: codeData } = await supabase.rpc('generate_referral_code');
        const code = codeData as string;

        await supabase.from('referrals').insert({
          referrer_id: user!.id,
          referral_code: code,
          bonus_amount: 5,
        });

        setReferralCode(code);
        setReferralCount(0);
        setReferralEarnings(0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    toast({ title: 'Referral code copied!' });
    setTimeout(() => setCopied(false), 2000);
  };

  const shareText = `Join Agrizin using my referral code: ${referralCode} and get started! Download now: ${window.location.origin}/auth?ref=${referralCode}`;

  const handleShare = async (platform?: 'whatsapp' | 'facebook') => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join Agrizin',
          text: shareText,
          url: `${window.location.origin}/auth?ref=${referralCode}`,
        });
        return;
      } catch (e) {}
    }

    let url = '';
    if (platform === 'whatsapp') {
      url = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    } else if (platform === 'facebook') {
      url = `https://www.facebook.com/sharer/sharer.php?quote=${encodeURIComponent(shareText)}`;
    }

    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      copyCode();
    }
  };

  const progressPercent = Math.min((referralCount / 10) * 100, 100);
  const canWithdraw = referralCount >= 10;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Refer & Earn ₹5</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-5">
            <p className="text-sm text-muted-foreground">
              Share Agrizin with your friends. Earn <span className="font-bold text-primary">₹5</span> for each successful referral! 
              Complete <span className="font-bold">10 referrals</span> to earn <span className="font-bold text-primary">₹50</span> and unlock withdrawal.
            </p>

            {/* Referral Progress */}
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Referral Progress</span>
                </div>
                <span className="text-sm font-bold text-primary">{referralCount}/10</span>
              </div>
              <Progress value={progressPercent} className="h-2" />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Earned: ₹{referralEarnings}</span>
                {canWithdraw ? (
                  <span className="text-green-600 font-medium flex items-center gap-1">
                    <Gift className="h-3 w-3" /> Withdrawal unlocked!
                  </span>
                ) : (
                  <span>{10 - referralCount} more to unlock</span>
                )}
              </div>
            </div>

            {/* Referral Code Display */}
            <div className="flex items-center gap-2">
              <Input
                value={referralCode}
                readOnly
                className="text-center font-mono text-lg font-bold tracking-wider"
              />
              <Button variant="outline" size="icon" onClick={copyCode}>
                {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>

            {/* Share Buttons */}
            <div className="space-y-3">
              <Button
                className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white"
                onClick={() => handleShare('whatsapp')}
              >
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Share on WhatsApp
              </Button>
              <Button
                className="w-full bg-[#1877F2] hover:bg-[#166fe5] text-white"
                onClick={() => handleShare('facebook')}
              >
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Share on Facebook
              </Button>
              <Button
                className="w-full bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] hover:opacity-90 text-white"
                onClick={() => handleShare()}
              >
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
                Share via Other Apps
              </Button>
            </div>

            {/* Earnings Info */}
            <div className="bg-primary/5 rounded-lg p-3 space-y-1">
              <p className="text-xs font-semibold text-primary">How it works:</p>
              <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                <li>1 referral = <span className="font-bold">₹5</span> added to your Agrizin Money</li>
                <li>10 referrals = <span className="font-bold">₹50</span> total earnings</li>
                <li>Use earnings to buy products or withdraw after <span className="font-bold">10 referrals</span></li>
              </ul>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ReferralDialog;
