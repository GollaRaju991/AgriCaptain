import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Package, LogOut, ShieldCheck, Sprout, Package2, Wheat } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { adminPath } from '@/utils/subdomain';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState<string>('');
  const [counts, setCounts] = useState({ pendingSellers: 0, pendingOrders: 0, pendingProducts: 0, pendingCrops: 0 });

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setEmail(user?.email ?? '');

      const [{ count: ps }, { count: po }, { count: pp }, { count: pc }] = await Promise.all([
        supabase.from('sellers').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('seller_products').select('*', { count: 'exact', head: true }).eq('review_status', 'pending'),
        supabase.from('farmer_crops').select('*', { count: 'exact', head: true }).eq('review_status', 'pending'),
      ]);
      setCounts({ pendingSellers: ps ?? 0, pendingOrders: po ?? 0, pendingProducts: pp ?? 0, pendingCrops: pc ?? 0 });
    })();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({ title: 'Signed out' });
    navigate(adminPath('login'), { replace: true });
  };

  const tiles = [
    {
      title: 'Seller Approvals',
      desc: 'Review and approve seller registrations',
      icon: Users,
      count: counts.pendingSellers,
      route: adminPath('sellers'),
      color: 'bg-green-600',
    },
    {
      title: 'Product Approvals',
      desc: 'Review seller product listings',
      icon: Package2,
      count: counts.pendingProducts,
      route: adminPath('products'),
      color: 'bg-purple-600',
    },
    {
      title: 'Crop Approvals',
      desc: 'Sell Crop & Direct From Farm submissions',
      icon: Wheat,
      count: counts.pendingCrops,
      route: '/admin/crops',
      color: 'bg-amber-600',
    },
    {
      title: 'Orders',
      desc: 'Manage customer orders & delivery',
      icon: Package,
      count: counts.pendingOrders,
      route: '/admin/orders',
      color: 'bg-blue-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-green-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-base leading-tight">Admin Dashboard</h1>
              <p className="text-xs text-muted-foreground">{email}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-1" /> Logout
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 sm:p-6">
        <div className="mb-6 flex items-center gap-2">
          <Sprout className="w-5 h-5 text-green-600" />
          <h2 className="text-lg font-semibold">Manage your platform</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {tiles.map((t) => (
            <Card
              key={t.title}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigate(t.route)}
            >
              <CardContent className="p-5 flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl ${t.color} flex items-center justify-center flex-shrink-0`}>
                  <t.icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{t.title}</h3>
                    {t.count > 0 && (
                      <span className="text-xs font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                        {t.count} pending
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{t.desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
