import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CategoryNavigation from '@/components/CategoryNavigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, CheckCircle, CreditCard, Sprout, Tractor, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

type LoanType = 'crop' | 'equipment' | 'land' | 'kcc' | null;

interface LoanFormData {
  fullName: string;
  dateOfBirth: Date | undefined;
  address: string;
  phoneNumber: string;
  requiredAmount: string;
}

interface KCCFormData {
  creditCardNumber: string;
  fullName: string;
}

const Loans = () => {
  const { translations } = useLanguage();
  const [searchParams] = useSearchParams();
  const [selectedLoanType, setSelectedLoanType] = useState<LoanType>(null);
  const [loanSubmitted, setLoanSubmitted] = useState(false);
  const [kccDetails, setKccDetails] = useState<any>(null);
  
  const [loanFormData, setLoanFormData] = useState<LoanFormData>({
    fullName: '',
    dateOfBirth: undefined,
    address: '',
    phoneNumber: '',
    requiredAmount: '',
  });

  const [kccFormData, setKccFormData] = useState<KCCFormData>({
    creditCardNumber: '',
    fullName: '',
  });

  useEffect(() => {
    const type = searchParams.get('type');
    if (type && ['crop', 'equipment', 'land', 'kcc'].includes(type)) {
      setSelectedLoanType(type as LoanType);
      setLoanSubmitted(false);
      setKccDetails(null);
    }
  }, [searchParams]);

  const loanTypes = [
    { 
      id: 'crop', 
      name: 'Crop Loans', 
      icon: Sprout,
      description: 'Get financial assistance for your crop cultivation needs'
    },
    { 
      id: 'equipment', 
      name: 'Equipment Loans', 
      icon: Tractor,
      description: 'Finance your agricultural equipment purchases'
    },
    { 
      id: 'land', 
      name: 'Land Loans', 
      icon: MapPin,
      description: 'Secure loans for land purchase or development'
    },
    { 
      id: 'kcc', 
      name: 'Kisan Credit Card', 
      icon: CreditCard,
      description: 'Check your Kisan Credit Card details'
    },
  ];

  const handleLoanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loanFormData.fullName || !loanFormData.dateOfBirth || !loanFormData.address || 
        !loanFormData.phoneNumber || !loanFormData.requiredAmount) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive"
      });
      return;
    }

    // Validate phone number
    if (!/^[6-9]\d{9}$/.test(loanFormData.phoneNumber)) {
      toast({
        title: "Error",
        description: "Please enter a valid 10-digit phone number",
        variant: "destructive"
      });
      return;
    }

    setLoanSubmitted(true);
    setLoanFormData({
      fullName: '',
      dateOfBirth: undefined,
      address: '',
      phoneNumber: '',
      requiredAmount: '',
    });
  };

  const handleKCCSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!kccFormData.creditCardNumber || !kccFormData.fullName) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive"
      });
      return;
    }

    // Validate credit card number (16 digits)
    if (!/^\d{16}$/.test(kccFormData.creditCardNumber.replace(/\s/g, ''))) {
      toast({
        title: "Error",
        description: "Please enter a valid 16-digit credit card number",
        variant: "destructive"
      });
      return;
    }

    // Mock KCC details response
    setKccDetails({
      cardNumber: kccFormData.creditCardNumber,
      holderName: kccFormData.fullName,
      creditLimit: '₹2,50,000',
      availableBalance: '₹1,85,000',
      validUpto: '12/2027',
      bankName: 'State Bank of India',
      branchName: 'Agricultural Branch',
      accountType: 'Kisan Credit Card',
      interestRate: '7% p.a.',
      lastUpdated: format(new Date(), 'dd MMM yyyy'),
    });
  };

  const resetForm = () => {
    setLoanSubmitted(false);
    setKccDetails(null);
    setSelectedLoanType(null);
    setKccFormData({ creditCardNumber: '', fullName: '' });
  };

  const getLoanTitle = () => {
    switch (selectedLoanType) {
      case 'crop': return 'Crop Loan Application';
      case 'equipment': return 'Equipment Loan Application';
      case 'land': return 'Land Loan Application';
      case 'kcc': return 'Kisan Credit Card Details';
      default: return 'Loans';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="hidden lg:block">
        <CategoryNavigation />
      </div>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
          {getLoanTitle()}
        </h1>

        {/* Loan Type Selection */}
        {!selectedLoanType && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {loanTypes.map((loan) => {
              const Icon = loan.icon;
              return (
                <Card 
                  key={loan.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-green-500"
                  onClick={() => setSelectedLoanType(loan.id as LoanType)}
                >
                  <CardHeader className="text-center">
                    <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-3">
                      <Icon className="h-8 w-8 text-green-600" />
                    </div>
                    <CardTitle className="text-lg">{loan.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground text-center">{loan.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Loan Application Form (Crop, Equipment, Land) */}
        {selectedLoanType && selectedLoanType !== 'kcc' && !loanSubmitted && (
          <Card className="max-w-xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {loanTypes.find(l => l.id === selectedLoanType)?.icon && 
                  React.createElement(loanTypes.find(l => l.id === selectedLoanType)!.icon, { className: "h-5 w-5 text-green-600" })}
                {loanTypes.find(l => l.id === selectedLoanType)?.name} Application
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLoanSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    placeholder="Enter your full name"
                    value={loanFormData.fullName}
                    onChange={(e) => setLoanFormData(prev => ({ ...prev, fullName: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Date of Birth *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !loanFormData.dateOfBirth && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {loanFormData.dateOfBirth ? format(loanFormData.dateOfBirth, "PPP") : "Select date of birth"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={loanFormData.dateOfBirth}
                        onSelect={(date) => setLoanFormData(prev => ({ ...prev, dateOfBirth: date }))}
                        disabled={(date) => date > new Date() || date < new Date("1940-01-01")}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address *</Label>
                  <Input
                    id="address"
                    placeholder="Enter your full address"
                    value={loanFormData.address}
                    onChange={(e) => setLoanFormData(prev => ({ ...prev, address: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number *</Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    placeholder="Enter 10-digit phone number"
                    maxLength={10}
                    value={loanFormData.phoneNumber}
                    onChange={(e) => setLoanFormData(prev => ({ ...prev, phoneNumber: e.target.value.replace(/\D/g, '') }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="requiredAmount">Required Amount (₹) *</Label>
                  <Input
                    id="requiredAmount"
                    type="text"
                    placeholder="Enter required loan amount"
                    value={loanFormData.requiredAmount}
                    onChange={(e) => setLoanFormData(prev => ({ ...prev, requiredAmount: e.target.value.replace(/\D/g, '') }))}
                    required
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={resetForm} className="flex-1">
                    Back
                  </Button>
                  <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700">
                    Submit Application
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Success Message for Loan Applications */}
        {selectedLoanType && selectedLoanType !== 'kcc' && loanSubmitted && (
          <Card className="max-w-xl mx-auto text-center">
            <CardContent className="py-12">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">Thank You for Your Submission!</h2>
              <p className="text-muted-foreground mb-6">
                Our assistant will contact you shortly regarding your {loanTypes.find(l => l.id === selectedLoanType)?.name} application.
              </p>
              <Button onClick={resetForm} className="bg-green-600 hover:bg-green-700">
                Apply for Another Loan
              </Button>
            </CardContent>
          </Card>
        )}

        {/* KCC Form */}
        {selectedLoanType === 'kcc' && !kccDetails && (
          <Card className="max-w-xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-green-600" />
                Kisan Credit Card Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleKCCSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="creditCardNumber">Credit Card Number *</Label>
                  <Input
                    id="creditCardNumber"
                    placeholder="Enter 16-digit card number"
                    maxLength={16}
                    value={kccFormData.creditCardNumber}
                    onChange={(e) => setKccFormData(prev => ({ ...prev, creditCardNumber: e.target.value.replace(/\D/g, '') }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="kccFullName">Full Name *</Label>
                  <Input
                    id="kccFullName"
                    placeholder="Enter name as on card"
                    value={kccFormData.fullName}
                    onChange={(e) => setKccFormData(prev => ({ ...prev, fullName: e.target.value }))}
                    required
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={resetForm} className="flex-1">
                    Back
                  </Button>
                  <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700">
                    Get Details
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* KCC Details Display */}
        {selectedLoanType === 'kcc' && kccDetails && (
          <Card className="max-w-xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-green-600" />
                Kisan Credit Card Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-6 text-white mb-6">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <p className="text-xs opacity-75 mb-1">Bank Name</p>
                    <p className="font-semibold">{kccDetails.bankName}</p>
                  </div>
                  <CreditCard className="h-8 w-8" />
                </div>
                <p className="text-lg tracking-wider mb-4">
                  {kccDetails.cardNumber.replace(/(\d{4})/g, '$1 ').trim()}
                </p>
                <div className="flex justify-between">
                  <div>
                    <p className="text-xs opacity-75">Card Holder</p>
                    <p className="font-medium">{kccDetails.holderName}</p>
                  </div>
                  <div>
                    <p className="text-xs opacity-75">Valid Upto</p>
                    <p className="font-medium">{kccDetails.validUpto}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Credit Limit</span>
                  <span className="font-semibold">{kccDetails.creditLimit}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Available Balance</span>
                  <span className="font-semibold text-green-600">{kccDetails.availableBalance}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Interest Rate</span>
                  <span className="font-semibold">{kccDetails.interestRate}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Account Type</span>
                  <span className="font-semibold">{kccDetails.accountType}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Branch</span>
                  <span className="font-semibold">{kccDetails.branchName}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Last Updated</span>
                  <span className="font-semibold">{kccDetails.lastUpdated}</span>
                </div>
              </div>

              <Button onClick={resetForm} variant="outline" className="w-full mt-6">
                Check Another Card
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Loans;
