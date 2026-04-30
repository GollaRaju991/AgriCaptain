import React, { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, LayoutDashboard, Users, Package, Sprout, Tractor, Wheat, LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/sellers", label: "Sellers", icon: Users },
  { to: "/admin/products", label: "Seller Products", icon: Package },
  { to: "/admin/crop-person", label: "Crop Person", icon: Sprout },
  { to: "/admin/direct-from-farm", label: "Direct From Farm", icon: Tractor },
  { to: "/admin/sell-crop", label: "Sell Crop", icon: Wheat },
];

const NavList = ({ onClick }: { onClick?: () => void }) => (
  <nav className="flex flex-col gap-1 p-3">
    {NAV.map((item) => (
      <NavLink
        key={item.to}
        to={item.to}
        end={item.end}
        onClick={onClick}
        className={({ isActive }) =>
          cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition",
            isActive
              ? "bg-primary text-primary-foreground"
              : "text-foreground hover:bg-muted"
          )
        }
      >
        <item.icon className="h-4 w-4" />
        <span>{item.label}</span>
      </NavLink>
    ))}
  </nav>
);

const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [ok, setOk] = useState(false);
  const [email, setEmail] = useState<string>("");
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/admin/login"); return; }
      const { data } = await (supabase.from("user_roles") as any)
        .select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle();
      if (!data) { navigate("/admin/login"); return; }
      setEmail(user.email || "");
      setOk(true);
      setLoading(false);
    })();
  }, [navigate]);

  const logout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }
  if (!ok) return null;

  return (
    <div className="min-h-screen flex bg-muted/30">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-card border-r min-h-screen sticky top-0">
        <div className="px-5 py-4 border-b">
          <h1 className="text-lg font-bold text-primary">Agrizin Admin</h1>
          <p className="text-xs text-muted-foreground truncate">{email}</p>
        </div>
        <div className="flex-1 overflow-y-auto"><NavList /></div>
        <div className="p-3 border-t">
          <Button variant="outline" className="w-full" onClick={logout}>
            <LogOut className="h-4 w-4 mr-2" /> Sign out
          </Button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0">
        {/* Mobile header */}
        <header className="lg:hidden sticky top-0 z-40 bg-primary text-primary-foreground flex items-center justify-between px-3 py-3">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <button className="p-1.5 rounded-md hover:bg-white/10"><Menu className="h-6 w-6" /></button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72">
              <div className="px-5 py-4 border-b">
                <h1 className="text-lg font-bold text-primary">Agrizin Admin</h1>
                <p className="text-xs text-muted-foreground truncate">{email}</p>
              </div>
              <NavList onClick={() => setMobileOpen(false)} />
              <div className="p-3 border-t">
                <Button variant="outline" className="w-full" onClick={logout}>
                  <LogOut className="h-4 w-4 mr-2" /> Sign out
                </Button>
              </div>
            </SheetContent>
          </Sheet>
          <h1 className="text-base font-bold">Admin Panel</h1>
          <div className="w-9" />
        </header>

        <div className="p-3 lg:p-6 max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
