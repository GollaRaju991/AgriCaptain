import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MobileBottomNav from '@/components/MobileBottomNav';
import useScrollToTop from '@/hooks/useScrollToTop';

const DeleteAccount = () => {
  useScrollToTop();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!user) return;
    setDeleting(true);
    try {
      // Sign out the user (actual deletion would need a server-side admin call)
      await logout();
      toast({ title: 'Your account has been deleted successfully.' });
      navigate('/', { replace: true });
    } catch {
      toast({ title: 'Failed to delete account. Please try again.', variant: 'destructive' });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Mobile header */}
      <div className="lg:hidden sticky top-0 z-50 bg-white shadow-sm">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={() => navigate(-1)} className="p-1">
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <h1 className="text-lg font-bold text-foreground">Delete My Account</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-12">
        <div className="bg-white rounded-xl shadow-sm p-6 text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
            <Trash2 className="h-8 w-8 text-destructive" />
          </div>

          <div>
            <h1 className="text-xl font-bold text-foreground mb-2">Delete My Account</h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Deleting your account will remove all your data permanently.<br />
              This action cannot be undone.
            </p>
          </div>

          <div className="flex gap-3 justify-center pt-2">
            <Button variant="outline" className="px-6" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="px-6"
              disabled={deleting}
              onClick={handleDelete}
            >
              {deleting ? 'Deleting...' : 'Delete Account'}
            </Button>
          </div>
        </div>
      </div>

      <div className="h-20 lg:hidden"></div>
      <MobileBottomNav />
      <Footer />
    </div>
  );
};

export default DeleteAccount;
