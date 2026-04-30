import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { adminPath } from '@/utils/subdomain';

interface Props {
  children: React.ReactNode;
}

const AdminGuard: React.FC<Props> = ({ children }) => {
  const navigate = useNavigate();
  const [state, setState] = useState<'loading' | 'ok' | 'denied'>('loading');

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate(adminPath('login'), { replace: true });
        return;
      }
      const { data: role } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();
      setState(role ? 'ok' : 'denied');
    })();
  }, [navigate]);

  if (state === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-green-600" />
      </div>
    );
  }

  if (state === 'denied') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-4">
        <ShieldAlert className="w-12 h-12 text-red-500" />
        <h1 className="text-xl font-semibold">Access Denied</h1>
        <p className="text-muted-foreground text-sm">You are not authorized to view this area.</p>
        <Button onClick={() => navigate(adminPath('login'))} className="bg-green-600 hover:bg-green-700">
          Go to Admin Login
        </Button>
      </div>
    );
  }

  return <>{children}</>;
};

export default AdminGuard;
