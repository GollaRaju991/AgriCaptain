// file: src/components/PaymentMethodsSection.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CreditCard, Smartphone, Building, Truck, CheckCircle } from 'lucide-react';
import CODAdvancePayment from './CODAdvancePayment';

interface PaymentMethodsSectionProps {
  paymentMethod: string;
  setPaymentMethod: (method: string) => void;
  upiId: string;
  setUpiId: (id: string) => void;
  cardNumber: string;
  setCardNumber: (number: string) => void;
  expiryDate: string;
  setExpiryDate: (date: string) => void;
  cvv: string;
  setCvv: (cvv: string) => void;
  nameOnCard: string;
  setNameOnCard: (name: string) => void;
  selectedBank: string;
  setSelectedBank: (bank: string) => void;
  selectedEMI: string;
  setSelectedEMI: (emi: string) => void;
  finalTotal: number;
  codAdvancePaid: boolean;
  onCodAdvancePayment: (method: string) => void;
  codPaymentProcessing: boolean;
}

const COD_ADVANCE_AMOUNT = 99;

const PaymentMethodsSection: React.FC<PaymentMethodsSectionProps> = ({
  paymentMethod,
  setPaymentMethod,
  upiId,
  setUpiId,
  cardNumber,
  setCardNumber,
  expiryDate,
  setExpiryDate,
  cvv,
  setCvv,
  nameOnCard,
  setNameOnCard,
  selectedBank,
  setSelectedBank,
  selectedEMI,
  setSelectedEMI,
  finalTotal,
  codAdvancePaid,
  onCodAdvancePayment,
  codPaymentProcessing
}) => {
  const [timeLeft, setTimeLeft] = useState(10 * 60); // 10 minutes in seconds

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="border border-gray-200">
      <CardHeader className="bg-blue-50 border-b">
        <CardTitle className="text-lg font-medium flex items-center">
          <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3">2</span>
          Choose Payment Method
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 flex items-center">
          <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold mr-3">4</div>
          <div>
            <p className="text-sm font-medium">PAYMENT OPTIONS</p>
            <div className="flex items-center text-xs text-gray-600 mt-1">
              <span className="mr-2">Complete payment in</span>
              <div className="bg-white px-2 py-1 rounded border font-mono">
                {formatTime(timeLeft)}
              </div>
            </div>
          </div>
        </div>

        <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-2">
          {/* UPI Payment */}
          <div className="border rounded-lg">
            <div className="flex items-start space-x-3 p-4 hover:bg-gray-50">
              <RadioGroupItem value="upi" id="upi" className="mt-1">
                <div className="radio-wrapper">
                  <div className="radio-circle" />
                </div>
              </RadioGroupItem>
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-1">
                  <Smartphone className="h-5 w-5 text-orange-500" />
                  <Label htmlFor="upi" className="text-base font-medium cursor-pointer">UPI</Label>
                </div>
                <p className="text-sm text-gray-600 mb-2">Pay by any UPI app</p>
                {paymentMethod === 'upi' && (
                  <div className="mt-4 space-y-3 border-t pt-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="upi-id" id="upi-id">
                        <div className="radio-wrapper">
                          <div className="radio-circle" />
                        </div>
                      </RadioGroupItem>
                      <Label htmlFor="upi-id" className="text-sm font-medium">Your UPI ID</Label>
                    </div>
                    <div className="flex space-x-2 ml-6">
                      <Input
                        placeholder="Enter UPI ID"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        className="flex-1"
                      />
                      <Button variant="outline" size="sm" className="text-blue-600">VERIFY</Button>
                      <Button size="sm" className="bg-gray-600 hover:bg-gray-700">PAY ₹{finalTotal}</Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Credit/Debit Card */}
          <div className="border rounded-lg">
            <div className="flex items-start space-x-3 p-4 hover:bg-gray-50">
              <RadioGroupItem value="card" id="card" className="mt-1">
                <div className="radio-wrapper">
                  <div className="radio-circle" />
                </div>
              </RadioGroupItem>
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-1">
                  <CreditCard className="h-5 w-5 text-gray-600" />
                  <Label htmlFor="card" className="text-base font-medium cursor-pointer">Credit / Debit / ATM Card</Label>
                </div>
                <p className="text-sm text-gray-600">Add and secure cards as per RBI guidelines</p>
                {paymentMethod === 'card' && (
                  <div className="mt-4 space-y-4 border-t pt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm">Card Number</Label>
                        <Input
                          placeholder="Enter Card Number"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label className="text-sm">Name on Card</Label>
                        <Input
                          placeholder="Enter Name on Card"
                          value={nameOnCard}
                          onChange={(e) => setNameOnCard(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label className="text-sm">Valid Thru</Label>
                        <Input
                          placeholder="MM/YY"
                          value={expiryDate}
                          onChange={(e) => setExpiryDate(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label className="text-sm">CVV</Label>
                        <Input
                          placeholder="CVV"
                          value={cvv}
                          onChange={(e) => setCvv(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Net Banking */}
          <div className="border rounded-lg">
            <div className="flex items-start space-x-3 p-4 hover:bg-gray-50">
              <RadioGroupItem value="netbanking" id="netbanking" className="mt-1">
                <div className="radio-wrapper">
                  <div className="radio-circle" />
                </div>
              </RadioGroupItem>
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-1">
                  <Building className="h-5 w-5 text-blue-600" />
                  <Label htmlFor="netbanking" className="text-base font-medium cursor-pointer">Net Banking</Label>
                </div>
                <p className="text-sm text-gray-600">This instrument has low success, use UPI or cards for better experience</p>
                {paymentMethod === 'netbanking' && (
                  <div className="mt-4 border-t pt-4">
                    <Label className="text-sm">Select Your Bank</Label>
                    <select 
                      value={selectedBank} 
                      onChange={(e) => setSelectedBank(e.target.value)}
                      className="w-full mt-1 p-2 border rounded focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Choose Bank</option>
                      <option value="sbi">State Bank of India</option>
                      <option value="hdfc">HDFC Bank</option>
                      <option value="icici">ICICI Bank</option>
                      <option value="axis">Axis Bank</option>
                      <option value="pnb">Punjab National Bank</option>
                      <option value="bob">Bank of Baroda</option>
                      <option value="other">Other Banks</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Cash on Delivery */}
          <div className="border rounded-lg">
            <div className="flex items-start space-x-3 p-4 hover:bg-gray-50">
              <RadioGroupItem value="cod" id="cod" className="mt-1">
                <div className="radio-wrapper">
                  <div className="radio-circle" />
                </div>
              </RadioGroupItem>
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-1">
                  <Truck className="h-5 w-5 text-green-600" />
                  <Label htmlFor="cod" className="text-base font-medium cursor-pointer">Cash on Delivery</Label>
                  {codAdvancePaid && (
                    <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full flex items-center">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      ₹{COD_ADVANCE_AMOUNT} Paid
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  Pay ₹{COD_ADVANCE_AMOUNT} now, remaining ₹{Math.max(0, finalTotal - COD_ADVANCE_AMOUNT)} on delivery
                </p>
                {paymentMethod === 'cod' && (
                  <>
                    {codAdvancePaid ? (
                      <div className="mt-4 border-t pt-4 bg-green-50 p-3 rounded">
                        <p className="text-sm text-green-700 font-medium flex items-center">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Advance payment of ₹{COD_ADVANCE_AMOUNT} completed!
                        </p>
                        <p className="text-xs text-green-600 mt-1">
                          Pay remaining ₹{Math.max(0, finalTotal - COD_ADVANCE_AMOUNT)} when your order is delivered
                        </p>
                      </div>
                    ) : (
                      <CODAdvancePayment
                        advanceAmount={COD_ADVANCE_AMOUNT}
                        onPaymentComplete={onCodAdvancePayment}
                        isProcessing={codPaymentProcessing}
                      />
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* EMI */}
          <div className="border rounded-lg">
            <div className="flex items-start space-x-3 p-4 hover:bg-gray-50">
              <RadioGroupItem value="emi" id="emi" className="mt-1">
                <div className="radio-wrapper">
                  <div className="radio-circle" />
                </div>
              </RadioGroupItem>
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-1">
                  <CreditCard className="h-5 w-5 text-purple-600" />
                  <Label htmlFor="emi" className="text-base font-medium cursor-pointer">EMI (Easy Installments)</Label>
                </div>
                <p className="text-sm text-gray-600">Get Debit and Cardless EMIs on HDFC Bank, SBI, ICICI Bank</p>
                {paymentMethod === 'emi' && (
                  <div className="mt-4 space-y-3 border-t pt-4">
                    <RadioGroup value={selectedEMI} onValueChange={setSelectedEMI}>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="3months" id="3months">
                            <div className="radio-wrapper">
                              <div className="radio-circle" />
                            </div>
                          </RadioGroupItem>
                          <Label htmlFor="3months" className="text-sm">3 Months - ₹{Math.ceil(finalTotal/3)}/month</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="6months" id="6months">
                            <div className="radio-wrapper">
                              <div className="radio-circle" />
                            </div>
                          </RadioGroupItem>
                          <Label htmlFor="6months" className="text-sm">6 Months - ₹{Math.ceil(finalTotal/6)}/month</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="12months" id="12months">
                            <div className="radio-wrapper">
                              <div className="radio-circle" />
                            </div>
                          </RadioGroupItem>
                          <Label htmlFor="12months" className="text-sm">12 Months - ₹{Math.ceil(finalTotal/12)}/month</Label>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>
                )}
              </div>
            </div>
          </div>
        </RadioGroup>
      </CardContent>
    </Card>
  );
};

export default PaymentMethodsSection;
