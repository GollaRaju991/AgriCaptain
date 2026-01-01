import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { CheckCircle, Loader2 } from 'lucide-react';

interface CODAdvancePaymentProps {
  advanceAmount: number;
  onPaymentComplete: (method: string) => void;
  isProcessing: boolean;
}

const CODAdvancePayment: React.FC<CODAdvancePaymentProps> = ({
  advanceAmount,
  onPaymentComplete,
  isProcessing
}) => {
  const [selectedUPIApp, setSelectedUPIApp] = useState('');

  const upiApps = [
    { id: 'phonepe', name: 'PhonePe', icon: '📱', color: 'bg-purple-100 border-purple-300' },
    { id: 'googlepay', name: 'Google Pay', icon: '💳', color: 'bg-blue-100 border-blue-300' },
    { id: 'paytm', name: 'Paytm', icon: '💰', color: 'bg-sky-100 border-sky-300' },
  ];

  return (
    <div className="mt-4 border-t pt-4">
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
        <p className="text-sm font-medium text-amber-800">
          💰 Pay ₹{advanceAmount} now, rest on delivery
        </p>
        <p className="text-xs text-amber-600 mt-1">
          Advance payment ensures order confirmation and faster delivery
        </p>
      </div>

      <p className="text-sm font-medium mb-3">Select UPI App for advance payment:</p>
      
      <RadioGroup value={selectedUPIApp} onValueChange={setSelectedUPIApp} className="space-y-2">
        {upiApps.map((app) => (
          <div 
            key={app.id}
            className={`border rounded-lg p-3 cursor-pointer transition-all ${
              selectedUPIApp === app.id 
                ? `${app.color} ring-2 ring-offset-1 ring-primary` 
                : 'bg-white hover:bg-gray-50'
            }`}
            onClick={() => setSelectedUPIApp(app.id)}
          >
            <div className="flex items-center space-x-3">
              <RadioGroupItem value={app.id} id={app.id} />
              <span className="text-xl">{app.icon}</span>
              <Label htmlFor={app.id} className="text-sm font-medium cursor-pointer flex-1">
                {app.name}
              </Label>
              {selectedUPIApp === app.id && (
                <CheckCircle className="h-4 w-4 text-green-600" />
              )}
            </div>
          </div>
        ))}
      </RadioGroup>

      <Button 
        onClick={() => onPaymentComplete(selectedUPIApp)}
        disabled={!selectedUPIApp || isProcessing}
        className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white"
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          `Pay ₹${advanceAmount} via ${selectedUPIApp ? upiApps.find(a => a.id === selectedUPIApp)?.name : 'UPI'}`
        )}
      </Button>

      <p className="text-xs text-gray-500 text-center mt-2">
        Secure payment powered by UPI
      </p>
    </div>
  );
};

export default CODAdvancePayment;
