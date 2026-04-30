import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Users, Package, Sprout, Tractor, Wheat } from "lucide-react";

type Counts = {
  sellers: number;
  products: number;
  cropPerson: number;
  directFromFarm: number;
  sellCrop: number;
};

const AdminDashboard = () => {
  const [counts, setCounts] = useState<Counts>({ sellers: 0, products: 0, cropPerson: 0, directFromFarm: 0, sellCrop: 0 });

  useEffect(() => {
    (async () => {
      const [s, p, all, dff, sc] = await Promise.all([
        (supabase.from("sellers") as any).select("id", { count: "exact", head: true }).eq("status", "pending"),
        (supabase.from("seller_products") as any).select("id", { count: "exact", head: true }).eq("review_status", "pending"),
        (supabase.from("farmer_crops") as any).select("id", { count: "exact", head: true }).eq("review_status", "pending"),
        (supabase.from("farmer_crops") as any).select("id", { count: "exact", head: true }).eq("review_status", "pending").eq("listing_type", "direct_from_farm"),
        (supabase.from("farmer_crops") as any).select("id", { count: "exact", head: true }).eq("review_status", "pending").eq("listing_type", "sell_crop"),
      ]);
      setCounts({
        sellers: s.count || 0,
        products: p.count || 0,
        cropPerson: all.count || 0,
        directFromFarm: dff.count || 0,
        sellCrop: sc.count || 0,
      });
    })();
  }, []);

  const tiles = [
    { to: "/admin/sellers", label: "Sellers", icon: Users, count: counts.sellers, color: "from-blue-500 to-blue-600" },
    { to: "/admin/products", label: "Seller Products", icon: Package, count: counts.products, color: "from-purple-500 to-purple-600" },
    { to: "/admin/crop-person", label: "Crop Person", icon: Sprout, count: counts.cropPerson, color: "from-green-500 to-green-600" },
    { to: "/admin/direct-from-farm", label: "Direct From Farm", icon: Tractor, count: counts.directFromFarm, color: "from-orange-500 to-orange-600" },
    { to: "/admin/sell-crop", label: "Sell Crop", icon: Wheat, count: counts.sellCrop, color: "from-amber-500 to-amber-600" },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Application Review</h1>
        <p className="text-sm text-muted-foreground">Click any module below to review pending applications.</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
        {tiles.map((t) => (
          <Link key={t.to} to={t.to}>
            <Card className="p-4 hover:shadow-md transition cursor-pointer h-full">
              <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${t.color} text-white flex items-center justify-center mb-3`}>
                <t.icon className="h-5 w-5" />
              </div>
              <p className="text-sm text-muted-foreground">{t.label}</p>
              <p className="text-2xl font-bold">{t.count}</p>
              <p className="text-xs text-muted-foreground">pending review</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
