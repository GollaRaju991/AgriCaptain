import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import appLogo from '@/assets/app-logo.png';

const Auth = () => {
  const { user, session, loading, redirectAfterLogin, setRedirectAfterLogin, sendOTP, verifyOTP } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [phoneForm, setPhoneForm] = useState({
    name: '',
    phone: '',
    referenceId: '',
    otp: ''
  });

  const [emailForm, setEmailForm] = useState({
    name: '',
    email: '',
    referenceId: '',
    otp: ''
  });

  const [otpStep, setOtpStep] = useState<'details' | 'otp'>('details');
  const [emailOtpStep, setEmailOtpStep] = useState<'details' | 'otp'>('details');
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120);
  const [timerActive, setTimerActive] = useState(false);
  const [activeTab, setActiveTab] = useState('phone');

  // Timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setTimerActive(false);
      toast({
        title: "OTP Expired",
        description: "Please request a new OTP",
        variant: "destructive"
      });
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft, toast]);

  // Handle successful authentication
  useEffect(() => {
    if (!loading && user && session) {
      const redirectPath = redirectAfterLogin || '/';
      setRedirectAfterLogin(undefined);
      navigate(redirectPath, { replace: true });
    }
  }, [user, session, loading, navigate, redirectAfterLogin, setRedirectAfterLogin]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Phone OTP handlers
  const handleSendPhoneOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneForm.name || !phoneForm.phone) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }
    if (phoneForm.phone.length !== 10) {
      toast({ title: "Invalid phone number", description: "Please enter a valid 10-digit phone number", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const result = await sendOTP(phoneForm.phone, phoneForm.name);
      if (result.success) {
        setOtpStep('otp');
        setTimeLeft(120);
        setTimerActive(true);
        toast({ title: "OTP Sent", description: `Verification code sent to +91${phoneForm.phone}` });
      } else {
        toast({ title: "Failed to send OTP", description: result.error || "Please try again", variant: "destructive" });
      }
    } catch {
      toast({ title: "Failed to send OTP", description: "Something went wrong.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyPhoneOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneForm.otp) {
      toast({ title: "Please enter OTP", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const result = await verifyOTP(phoneForm.phone, phoneForm.otp, phoneForm.name);
      if (result.success) {
        toast({ title: "Login Successful", description: `Welcome ${phoneForm.name}!` });
        setTimerActive(false);
      } else {
        toast({ title: "Invalid OTP", description: result.error || "Please check your OTP", variant: "destructive" });
      }
    } catch {
      toast({ title: "Verification failed", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendPhoneOTP = async () => {
    setIsLoading(true);
    try {
      const result = await sendOTP(phoneForm.phone, phoneForm.name);
      if (result.success) {
        setTimeLeft(120);
        setTimerActive(true);
        setPhoneForm({ ...phoneForm, otp: '' });
        toast({ title: "OTP Resent", description: `New code sent to +91${phoneForm.phone}` });
      } else {
        toast({ title: "Failed to resend OTP", description: result.error, variant: "destructive" });
      }
    } catch {
      toast({ title: "Failed to resend OTP", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  // Email OTP handlers
  const handleSendEmailOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailForm.name || !emailForm.email) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      // Use email as identifier for OTP
      const result = await sendOTP(emailForm.email, emailForm.name);
      if (result.success) {
        setEmailOtpStep('otp');
        setTimeLeft(120);
        setTimerActive(true);
        toast({ title: "OTP Sent", description: `Verification code sent to ${emailForm.email}` });
      } else {
        toast({ title: "Failed to send OTP", description: result.error || "Please try again", variant: "destructive" });
      }
    } catch {
      toast({ title: "Failed to send OTP", description: "Something went wrong.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyEmailOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailForm.otp) {
      toast({ title: "Please enter OTP", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const result = await verifyOTP(emailForm.email, emailForm.otp, emailForm.name);
      if (result.success) {
        toast({ title: "Login Successful", description: `Welcome ${emailForm.name}!` });
        setTimerActive(false);
      } else {
        toast({ title: "Invalid OTP", description: result.error || "Please check your OTP", variant: "destructive" });
      }
    } catch {
      toast({ title: "Verification failed", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmailOTP = async () => {
    setIsLoading(true);
    try {
      const result = await sendOTP(emailForm.email, emailForm.name);
      if (result.success) {
        setTimeLeft(120);
        setTimerActive(true);
        setEmailForm({ ...emailForm, otp: '' });
        toast({ title: "OTP Resent", description: `New code sent to ${emailForm.email}` });
      } else {
        toast({ title: "Failed to resend OTP", description: result.error, variant: "destructive" });
      }
    } catch {
      toast({ title: "Failed to resend OTP", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <span className="text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
      {/* Back Button */}
      <div className="absolute top-4 left-4 z-10">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/')}
          className="rounded-full bg-white/80 backdrop-blur-sm shadow-md hover:bg-white hover:shadow-lg transition-all h-10 w-10"
        >
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </Button>
      </div>

      {/* Agrizin Logo & Brand */}
      <div className="text-center py-8">
        <Link to="/" className="flex items-center justify-center space-x-3 mb-4 hover:opacity-80 transition-opacity">
          <img src={appLogo} alt="Agrizin Logo" className="w-12 h-12 rounded-full shadow-lg object-cover" />
          <span className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
            Agrizin
          </span>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Login</h1>
      </div>
      
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); }} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6 h-auto p-1">
                  <TabsTrigger value="phone" className="flex items-center justify-center gap-1.5 text-xs sm:text-sm py-2.5 px-3 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                    <span className="text-base">📱</span>
                    <span>Phone</span>
                  </TabsTrigger>
                  <TabsTrigger value="email" className="flex items-center justify-center gap-1.5 text-xs sm:text-sm py-2.5 px-3 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                    <span className="text-base">📧</span>
                    <span>Email</span>
                  </TabsTrigger>
                </TabsList>

                {/* Phone OTP Tab */}
                <TabsContent value="phone">
                  {otpStep === 'details' ? (
                    <form onSubmit={handleSendPhoneOTP} className="space-y-4">
                      <div>
                        <Label htmlFor="phone-name" className="text-sm font-medium">First Name *</Label>
                        <Input id="phone-name" type="text" placeholder="Enter your first name" value={phoneForm.name} onChange={(e) => setPhoneForm({ ...phoneForm, name: e.target.value })} className="mt-1 text-sm" />
                      </div>
                      <div>
                        <Label htmlFor="phone-number" className="text-sm font-medium">Phone Number *</Label>
                        <div className="flex mt-1">
                          <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">+91</span>
                          <Input id="phone-number" type="tel" placeholder="9876543210" value={phoneForm.phone} onChange={(e) => setPhoneForm({ ...phoneForm, phone: e.target.value })} className="rounded-l-none text-sm" maxLength={10} />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="phone-ref" className="text-sm font-medium">Reference ID</Label>
                        <Input id="phone-ref" type="text" placeholder="Enter reference ID (optional)" value={phoneForm.referenceId} onChange={(e) => setPhoneForm({ ...phoneForm, referenceId: e.target.value })} className="mt-1 text-sm" />
                      </div>
                      <Button type="submit" className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium py-3" disabled={isLoading}>
                        {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sending OTP...</> : 'Send OTP'}
                      </Button>
                    </form>
                  ) : (
                    <form onSubmit={handleVerifyPhoneOTP} className="space-y-4">
                      <div className="text-center mb-4">
                        <p className="text-sm text-gray-600">OTP sent to +91{phoneForm.phone}</p>
                        <Button type="button" variant="link" onClick={() => { setOtpStep('details'); setPhoneForm({ ...phoneForm, otp: '' }); setTimerActive(false); }} className="text-xs text-green-600">Change Number</Button>
                      </div>
                      <div>
                        <Label htmlFor="phone-otp" className="text-sm">Enter OTP</Label>
                        <Input id="phone-otp" type="text" placeholder="Enter 6-digit OTP" value={phoneForm.otp} onChange={(e) => setPhoneForm({ ...phoneForm, otp: e.target.value })} className="mt-1 text-sm text-center text-lg tracking-widest" maxLength={6} />
                        <div className="mt-2 flex justify-between items-center">
                          <p className="text-sm text-gray-500">Time remaining: <span className="font-semibold text-green-600">{formatTime(timeLeft)}</span></p>
                          {timeLeft === 0 && <Button type="button" variant="link" onClick={handleResendPhoneOTP} className="text-xs text-green-600" disabled={isLoading}>Resend OTP</Button>}
                        </div>
                      </div>
                      <Button type="submit" className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium py-3" disabled={isLoading}>
                        {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Verifying...</> : 'Verify & Login'}
                      </Button>
                    </form>
                  )}
                </TabsContent>

                {/* Email OTP Tab */}
                <TabsContent value="email">
                  {emailOtpStep === 'details' ? (
                    <form onSubmit={handleSendEmailOTP} className="space-y-4">
                      <div>
                        <Label htmlFor="email-name" className="text-sm font-medium">First Name *</Label>
                        <Input id="email-name" type="text" placeholder="Enter your first name" value={emailForm.name} onChange={(e) => setEmailForm({ ...emailForm, name: e.target.value })} className="mt-1 text-sm" />
                      </div>
                      <div>
                        <Label htmlFor="email-id" className="text-sm font-medium">Email ID *</Label>
                        <Input id="email-id" type="email" placeholder="Enter your email" value={emailForm.email} onChange={(e) => setEmailForm({ ...emailForm, email: e.target.value })} className="mt-1 text-sm" />
                      </div>
                      <div>
                        <Label htmlFor="email-ref" className="text-sm font-medium">Reference ID</Label>
                        <Input id="email-ref" type="text" placeholder="Enter reference ID (optional)" value={emailForm.referenceId} onChange={(e) => setEmailForm({ ...emailForm, referenceId: e.target.value })} className="mt-1 text-sm" />
                      </div>
                      <Button type="submit" className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium py-3" disabled={isLoading}>
                        {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sending OTP...</> : 'Send OTP'}
                      </Button>
                    </form>
                  ) : (
                    <form onSubmit={handleVerifyEmailOTP} className="space-y-4">
                      <div className="text-center mb-4">
                        <p className="text-sm text-gray-600">OTP sent to {emailForm.email}</p>
                        <Button type="button" variant="link" onClick={() => { setEmailOtpStep('details'); setEmailForm({ ...emailForm, otp: '' }); setTimerActive(false); }} className="text-xs text-green-600">Change Email</Button>
                      </div>
                      <div>
                        <Label htmlFor="email-otp" className="text-sm">Enter OTP</Label>
                        <Input id="email-otp" type="text" placeholder="Enter 6-digit OTP" value={emailForm.otp} onChange={(e) => setEmailForm({ ...emailForm, otp: e.target.value })} className="mt-1 text-sm text-center text-lg tracking-widest" maxLength={6} />
                        <div className="mt-2 flex justify-between items-center">
                          <p className="text-sm text-gray-500">Time remaining: <span className="font-semibold text-green-600">{formatTime(timeLeft)}</span></p>
                          {timeLeft === 0 && <Button type="button" variant="link" onClick={handleResendEmailOTP} className="text-xs text-green-600" disabled={isLoading}>Resend OTP</Button>}
                        </div>
                      </div>
                      <Button type="submit" className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium py-3" disabled={isLoading}>
                        {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Verifying...</> : 'Verify & Login'}
                      </Button>
                    </form>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Auth;
