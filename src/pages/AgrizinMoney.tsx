import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MobileBottomNav from '@/components/MobileBottomNav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Wallet, Plus, ArrowDownLeft, ArrowUpRight, Loader2, Share2 } from 'lucide-react';
import ReferralEarningsCard from '@/components/ReferralEarningsCard';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import ReferralDialog from '@/components/ReferralDialog';
import { openRazorpayCheckout } from '@/utils/razorpay';

const RECHARGE_AMOUNTS = [100, 200, 500, 1000, 2000];

const AgrizinMoney = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [rechargeAmount, setRechargeAmount] = useState('');
  const [showRecharge, setShowRecharge] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [showReferral, setShowReferral] = useState(false);

  useEffect(() => {
    if (user) {
      fetchWalletData();
    }
  }, [user]);

  const fetchWalletData = async () => {
    try {
      setLoadingData(true);

      // Get or create wallet
      let { data: wallet, error } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', user!.id)
        .maybeSingle();

      if (!wallet) {
        const { data: newWallet, error: insertErr } = await supabase
          .from('wallets')
          .insert({ user_id: user!.id, balance: 0 })
          .select()
          .single();
        if (insertErr) console.error(insertErr);
        wallet = newWallet;
      }

      setBalance(wallet?.balance ?? 0);

      // Fetch transactions
      const { data: txns } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(50);

      setTransactions(txns || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingData(false);
    }
  };

  const handleRecharge = async () => {
    const amount = parseFloat(rechargeAmount);
    if (!amount || amount < 1) {
      toast({ title: 'Enter a valid amount', variant: 'destructive' });
      return;
    }
    setProcessing(true);
    try {
      const result = await openRazorpayCheckout({
        amount,
        customerName: user?.user_metadata?.name || 'Customer',
        customerEmail: user?.email || '',
        customerPhone: user?.phone || '',
        description: 'Agrizin Wallet Recharge',
      });

      if (!result.success || !result.paymentId) {
        throw new Error('Payment was not completed');
      }

      const { data, error } = await supabase.functions.invoke('wallet-recharge', {
        body: {
          amount,
          razorpay_payment_id: result.paymentId,
          razorpay_order_id: result.orderId || '',
          razorpay_signature: result.signature || '',
        },
      });

      if (error || !data?.success) {
        throw new Error(data?.error || 'Recharge failed');
      }

      toast({ title: `₹${amount} added to Agrizin Money!` });
      setRechargeAmount('');
      setShowRecharge(false);
      fetchWalletData();
    } catch (err: any) {
      toast({ title: err.message || 'Recharge failed', variant: 'destructive' });
    } finally {
      setProcessing(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Mobile back bar */}
      {isMobile && (
        <div className="sticky top-0 z-30 bg-white border-b px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-base font-bold">Agrizin Money</h1>
        </div>
      )}

      <div className={isMobile ? 'px-4 pb-28 pt-4' : 'max-w-2xl mx-auto px-6 py-10'}>
        {!isMobile && (
          <h1 className="text-2xl font-bold mb-6">Agrizin Money</h1>
        )}

        {/* Balance Card */}
        <Card className="mb-6 bg-gradient-to-r from-green-600 to-green-700 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Wallet className="h-8 w-8" />
              <span className="text-sm opacity-90">Available Balance</span>
            </div>
            <p className="text-3xl font-bold mb-4">₹{balance.toFixed(2)}</p>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                size="sm"
                className="bg-white/20 hover:bg-white/30 text-white border-0"
                onClick={() => setShowRecharge(true)}
              >
                <Plus className="h-4 w-4 mr-1" /> Add Money
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="bg-white/20 hover:bg-white/30 text-white border-0"
                onClick={() => setShowReferral(true)}
              >
                <Share2 className="h-4 w-4 mr-1" /> Refer & Earn ₹5
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Referral Earnings */}
        <ReferralEarningsCard />

        {/* Recharge Section */}
        {showRecharge && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-base">Add Money to Wallet</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {RECHARGE_AMOUNTS.map((amt) => (
                  <Button
                    key={amt}
                    variant={rechargeAmount === String(amt) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setRechargeAmount(String(amt))}
                  >
                    ₹{amt}
                  </Button>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={rechargeAmount}
                  onChange={(e) => setRechargeAmount(e.target.value)}
                  min={1}
                />
                <Button onClick={handleRecharge} disabled={processing}>
                  {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add'}
                </Button>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowRecharge(false)}>
                Cancel
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Transaction History */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Transaction History</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingData ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : transactions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No transactions yet</p>
            ) : (
              <div className="space-y-3">
                {transactions.map((txn) => (
                  <div key={txn.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div className="flex items-center gap-3">
                      {txn.type === 'credit' ? (
                        <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                          <ArrowDownLeft className="h-4 w-4 text-green-600" />
                        </div>
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                          <ArrowUpRight className="h-4 w-4 text-red-600" />
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium">{txn.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(txn.created_at).toLocaleDateString('en-IN', {
                            day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    <span className={`text-sm font-semibold ${txn.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                      {txn.type === 'credit' ? '+' : '-'}₹{Math.abs(txn.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <ReferralDialog open={showReferral} onOpenChange={setShowReferral} />
      <div className="h-20 lg:hidden" />
      <MobileBottomNav />
      <Footer />
    </div>
  );
};

export default AgrizinMoney;
