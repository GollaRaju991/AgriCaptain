import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Phone, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Auth = () => {
  const { user, session, loading, redirectAfterLogin, setRedirectAfterLogin, sendOTP, verifyOTP, testLogin } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });

  const [otpForm, setOtpForm] = useState({
    phone: '',
    otp: ''
  });

  const [signupForm, setSignupForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Test OTP for development
  const TEST_OTP = '123456';

  // Handle successful authentication
  useEffect(() => {
    if (!loading && user && session) {
      console.log('User authenticated, redirecting to:', redirectAfterLogin || '/');
      const redirectPath = redirectAfterLogin || '/';
      setRedirectAfterLogin(undefined);
      navigate(redirectPath, { replace: true });
    }
  }, [user, session, loading, navigate, redirectAfterLogin, setRedirectAfterLogin]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginForm.email || !loginForm.password) {
      toast({
        title: "Please fill all fields",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginForm.email,
        password: loginForm.password
      });

      if (error) {
        toast({
          title: "Login Failed",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Login Successful",
        description: "Welcome back to AgriCaptain!"
      });
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!signupForm.name || !signupForm.email || !signupForm.password || !signupForm.confirmPassword) {
      toast({
        title: "Please fill all fields",
        variant: "destructive"
      });
      return;
    }

    if (signupForm.password !== signupForm.confirmPassword) {
      toast({
        title: "Passwords do not match",
        variant: "destructive"
      });
      return;
    }

    if (signupForm.password.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const { supabase } = await import('@/integrations/supabase/client');
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email: signupForm.email,
        password: signupForm.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            name: signupForm.name
          }
        }
      });

      if (error) {
        toast({
          title: "Signup Failed",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Signup Successful",
        description: "Please check your email to verify your account. For testing, you may need to disable 'Confirm email' in Supabase settings.",
      });

      // Clear form
      setSignupForm({ name: '', email: '', password: '', confirmPassword: '' });
    } catch (error) {
      console.error('Signup error:', error);
      toast({
        title: "Signup Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpForm.phone || !otpForm.otp) {
      toast({
        title: "Please fill all fields",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // Check if it's the test OTP
      if (otpForm.otp === TEST_OTP) {
        console.log('Using test OTP for login');
        const result = await testLogin(otpForm.phone);
        if (result.success) {
          toast({
            title: "Login Successful",
            description: "Welcome to AgriCaptain!"
          });
          return;
        } else {
          toast({
            title: "Login Failed",
            description: result.error || "Test login failed",
            variant: "destructive"
          });
        }
      } else {
        // Try real OTP verification
        const result = await verifyOTP(otpForm.phone, otpForm.otp);
        if (result.success) {
          toast({
            title: "Login Successful",
            description: "Welcome to AgriCaptain!"
          });
        } else {
          toast({
            title: "Invalid OTP",
            description: result.error || "Please check your OTP and try again",
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      toast({
        title: "Verification failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpForm.phone) {
      toast({
        title: "Please enter phone number",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await sendOTP(otpForm.phone);
      if (result.success) {
        setOtpSent(true);
        toast({
          title: "OTP Sent",
          description: `Verification code sent to ${otpForm.phone}. For testing, use OTP: ${TEST_OTP}`,
        });
      } else {
        toast({
          title: "Failed to send OTP",
          description: result.error || "Please try again",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Send OTP error:', error);
      toast({
        title: "Failed to send OTP",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
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
      <div className="text-center py-8">
        <Link to="/" className="flex items-center justify-center space-x-3 mb-4 hover:opacity-80 transition-opacity">
          <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-green-700 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-xl">A</span>
          </div>
          <span className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
            AgriCaptain
          </span>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h1>
        <p className="text-gray-600">Sign in to your account or create a new one</p>
      </div>
      
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-center mb-6">Authentication</h2>
              <Tabs defaultValue="otp" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="email" className="text-xs">📧 Email</TabsTrigger>
                  <TabsTrigger value="otp" className="text-xs">📱 OTP</TabsTrigger>
                  <TabsTrigger value="signup" className="text-xs">📝 Signup</TabsTrigger>
                </TabsList>

                <TabsContent value="otp">
                  <form onSubmit={otpSent ? handleVerifyOTP : handleSendOTP} className="space-y-4">
                    <div>
                      <Label htmlFor="phone" className="text-sm font-medium">Phone Number *</Label>
                      <div className="flex mt-1">
                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                          +91
                        </span>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="9876543210"
                          value={otpForm.phone}
                          onChange={(e) => setOtpForm({ ...otpForm, phone: e.target.value })}
                          className="rounded-l-none text-sm"
                          disabled={otpSent}
                          maxLength={10}
                        />
                      </div>
                    </div>

                    {otpSent && (
                      <div>
                        <Label htmlFor="otp" className="text-sm">Enter OTP</Label>
                        <Input
                          id="otp"
                          type="text"
                          placeholder="Enter 6-digit OTP"
                          value={otpForm.otp}
                          onChange={(e) => setOtpForm({ ...otpForm, otp: e.target.value })}
                          className="mt-1 text-sm"
                          maxLength={6}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          For testing, use OTP: {TEST_OTP}
                        </p>
                      </div>
                    )}

                    <Button type="submit" className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium py-3" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {otpSent ? 'Verifying...' : 'Sending...'}
                        </>
                      ) : (
                        <>
                          <Phone className="mr-2 h-4 w-4" />
                          {otpSent ? 'Verify OTP' : 'Send OTP'}
                        </>
                      )}
                    </Button>

                    {otpSent && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setOtpSent(false);
                          setOtpForm({ ...otpForm, otp: '' });
                        }}
                        className="w-full text-sm"
                      >
                        Change Phone Number
                      </Button>
                    )}
                  </form>
                </TabsContent>

                <TabsContent value="email">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <Label htmlFor="email" className="text-sm">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={loginForm.email}
                        onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                        className="text-sm"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="password" className="text-sm">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        value={loginForm.password}
                        onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                        className="text-sm"
                        required
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium py-3"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Logging in...
                        </>
                      ) : (
                        'Login'
                      )}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup">
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div>
                      <Label htmlFor="signup-name" className="text-sm">Full Name</Label>
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="Enter your full name"
                        value={signupForm.name}
                        onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}
                        className="text-sm"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="signup-email" className="text-sm">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="Enter your email"
                        value={signupForm.email}
                        onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                        className="text-sm"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="signup-password" className="text-sm">Password</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="At least 6 characters"
                        value={signupForm.password}
                        onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                        className="text-sm"
                        required
                        minLength={6}
                      />
                    </div>
                    <div>
                      <Label htmlFor="signup-confirm-password" className="text-sm">Confirm Password</Label>
                      <Input
                        id="signup-confirm-password"
                        type="password"
                        placeholder="Confirm your password"
                        value={signupForm.confirmPassword}
                        onChange={(e) => setSignupForm({ ...signupForm, confirmPassword: e.target.value })}
                        className="text-sm"
                        required
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium py-3"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating account...
                        </>
                      ) : (
                        'Sign Up'
                      )}
                    </Button>
                  </form>
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
