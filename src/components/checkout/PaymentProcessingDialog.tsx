import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { CheckCircle, XCircle, Loader2, Smartphone, CreditCard, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';

type PaymentStatus = 'processing' | 'success' | 'failed';

interface PaymentProcessingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paymentMethod: string;
  amount: number;
  paymentDetail: string; // UPI ID, card last4, bank name
  onSuccess: () => void;
  onRetry: () => void;
}

const PaymentProcessingDialog: React.FC<PaymentProcessingDialogProps> = ({
  open,
  onOpenChange,
  paymentMethod,
  amount,
  paymentDetail,
  onSuccess,
  onRetry,
}) => {
  const [status, setStatus] = useState<PaymentStatus>('processing');
  const [step, setStep] = useState(0);

  const steps: Record<string, string[]> = {
    upi: [
      'Sending payment request to UPI app...',
      'Waiting for approval on your phone...',
      'Verifying transaction...',
      'Payment confirmed!',
    ],
    card: [
      'Encrypting card details...',
      'Contacting bank for authorization...',
      'Processing transaction...',
      'Payment confirmed!',
    ],
    netbanking: [
      'Connecting to bank server...',
      'Authenticating your session...',
      'Processing net banking payment...',
      'Payment confirmed!',
    ],
    emi: [
      'Verifying EMI eligibility...',
      'Setting up installment plan...',
      'Processing first EMI payment...',
      'EMI activated!',
    ],
  };

  const currentSteps = steps[paymentMethod] || steps.card;

  useEffect(() => {
    if (!open) {
      setStatus('processing');
      setStep(0);
      return;
    }

    setStatus('processing');
    setStep(0);

    const timers: NodeJS.Timeout[] = [];

    currentSteps.forEach((_, i) => {
      timers.push(setTimeout(() => setStep(i), i * 1200));
    });

    // Simulate success (90% chance) or failure
    const willSucceed = Math.random() > 0.1;
    timers.push(
      setTimeout(() => {
        setStatus(willSucceed ? 'success' : 'failed');
      }, currentSteps.length * 1200 + 500)
    );

    return () => timers.forEach(clearTimeout);
  }, [open]);

  useEffect(() => {
    if (status === 'success') {
      const t = setTimeout(() => onSuccess(), 1800);
      return () => clearTimeout(t);
    }
  }, [status]);

  const getIcon = () => {
    if (paymentMethod === 'upi') return <Smartphone className="h-6 w-6" />;
    if (paymentMethod === 'netbanking') return <Building className="h-6 w-6" />;
    return <CreditCard className="h-6 w-6" />;
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (status !== 'processing') onOpenChange(v); }}>
      <DialogContent className="max-w-sm text-center [&>button]:hidden">
        {status === 'processing' && (
          <div className="py-6 space-y-6">
            <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
              <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
              <div className="text-primary">{getIcon()}</div>
            </div>
            <div>
              <p className="font-semibold text-lg text-foreground">Processing Payment</p>
              <p className="text-2xl font-bold text-primary mt-1">₹{amount.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-1">{paymentDetail}</p>
            </div>
            <div className="space-y-2 text-left px-4">
              {currentSteps.map((s, i) => (
                <div key={i} className={`flex items-center gap-2 text-sm transition-all duration-300 ${i <= step ? 'opacity-100' : 'opacity-30'}`}>
                  {i < step ? (
                    <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                  ) : i === step ? (
                    <Loader2 className="h-4 w-4 text-primary animate-spin shrink-0" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border border-muted-foreground/30 shrink-0" />
                  )}
                  <span className={i <= step ? 'text-foreground' : 'text-muted-foreground'}>{s}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">Do not close this window or press back</p>
          </div>
        )}

        {status === 'success' && (
          <div className="py-8 space-y-4">
            <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center animate-in zoom-in duration-300">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <div>
              <p className="font-semibold text-lg text-green-700">Payment Successful!</p>
              <p className="text-2xl font-bold text-foreground mt-1">₹{amount.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-1">Transaction ID: TXN{Date.now().toString().slice(-10)}</p>
            </div>
            <p className="text-sm text-muted-foreground">Redirecting to order confirmation...</p>
          </div>
        )}

        {status === 'failed' && (
          <div className="py-8 space-y-4">
            <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center animate-in zoom-in duration-300">
              <XCircle className="h-10 w-10 text-red-600" />
            </div>
            <div>
              <p className="font-semibold text-lg text-red-700">Payment Failed</p>
              <p className="text-sm text-muted-foreground mt-1">
                Transaction could not be completed. Your money has not been deducted.
              </p>
            </div>
            <div className="space-y-2 pt-2">
              <Button onClick={onRetry} className="w-full">
                Retry Payment
              </Button>
              <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full">
                Choose Another Method
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PaymentProcessingDialog;
