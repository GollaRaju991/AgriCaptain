import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Package, ShoppingCart, IndianRupee, Edit, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const SellerDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalProducts: 0, totalSales: 0 });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate('/auth'); return; }

    const { data, error } = await (supabase.from('seller_products') as any)
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setProducts(data);
      setStats({ totalProducts: data.length, totalSales: 0 });
    }
    setLoading(false);
  };

  const deleteProduct = async (id: string) => {
    const { error } = await (supabase.from('seller_products') as any).delete().eq('id', id);
    if (error) {
      toast({ title: 'Delete failed', variant: 'destructive' });
    } else {
      toast({ title: 'Product deleted' });
      loadProducts();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="lg:hidden sticky top-0 z-50 bg-primary text-primary-foreground flex items-center gap-3 px-4 py-3">
        <button onClick={() => navigate(-1)}><ArrowLeft className="h-6 w-6" /></button>
        <h1 className="text-lg font-bold">Seller Dashboard</h1>
      </div>
      <div className="hidden lg:block"><Header /></div>

      <div className="container mx-auto px-4 py-6 max-w-3xl">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card className="bg-primary/10 border-primary/20">
            <CardContent className="p-4 text-center">
              <Package className="h-6 w-6 mx-auto text-primary mb-1" />
              <p className="text-2xl font-bold text-foreground">{stats.totalProducts}</p>
              <p className="text-xs text-muted-foreground">Products</p>
            </CardContent>
          </Card>
          <Card className="bg-accent/10 border-accent/20">
            <CardContent className="p-4 text-center">
              <ShoppingCart className="h-6 w-6 mx-auto text-accent mb-1" />
              <p className="text-2xl font-bold text-foreground">0</p>
              <p className="text-xs text-muted-foreground">Orders</p>
            </CardContent>
          </Card>
          <Card className="bg-secondary border-secondary">
            <CardContent className="p-4 text-center">
              <IndianRupee className="h-6 w-6 mx-auto text-primary mb-1" />
              <p className="text-2xl font-bold text-foreground">₹0</p>
              <p className="text-xs text-muted-foreground">Earnings</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">My Products</h2>
          <Button onClick={() => navigate('/seller/add-product')} size="sm" className="rounded-full">
            <Plus className="h-4 w-4 mr-1" /> Add Product
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading...</div>
        ) : products.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Package className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground mb-4">No products yet</p>
              <Button onClick={() => navigate('/seller/add-product')}>Add Your First Product</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {products.map((product) => (
              <Card key={product.id} className="overflow-hidden">
                <CardContent className="p-0 flex">
                  <div className="w-24 h-24 flex-shrink-0">
                    {product.product_images?.[0] ? (
                      <img src={product.product_images[0]} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <Package className="h-8 w-8 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 p-3">
                    <h3 className="font-semibold text-sm line-clamp-1">{product.product_name}</h3>
                    <p className="text-xs text-muted-foreground">{product.category} • {product.brand}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-bold text-sm">₹{product.selling_price}</span>
                      {product.mrp_price > product.selling_price && (
                        <span className="text-xs text-muted-foreground line-through">₹{product.mrp_price}</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">Stock: {product.stock_quantity} {product.unit_type}</p>
                  </div>
                  <div className="flex flex-col justify-center gap-2 p-2">
                    <button onClick={() => navigate(`/seller/edit-product/${product.id}`)} className="text-primary hover:bg-primary/10 p-1.5 rounded">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button onClick={() => deleteProduct(product.id)} className="text-destructive hover:bg-destructive/10 p-1.5 rounded">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default SellerDashboard;
