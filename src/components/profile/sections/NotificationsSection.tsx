import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Package, Truck, Gift, AlertCircle, Trash2, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface Props {
  userId: string;
}

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  created_at: string;
  is_read: boolean;
}

const NotificationsSection: React.FC<Props> = ({ userId }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false });
      setNotifications(data || []);
      setLoading(false);
    };
    fetch();
  }, [userId]);

  const markAllAsRead = async () => {
    const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
    if (!unreadIds.length) return;
    await supabase.from('notifications').update({ is_read: true }).in('id', unreadIds);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    toast.success("All marked as read");
  };

  const deleteNotification = async (id: string) => {
    await supabase.from('notifications').delete().eq('id', id);
    setNotifications(prev => prev.filter(n => n.id !== id));
    toast.success("Deleted");
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'order': return <Package className="h-5 w-5 text-blue-600" />;
      case 'delivery': return <Truck className="h-5 w-5 text-green-600" />;
      case 'promotion': return <Gift className="h-5 w-5 text-purple-600" />;
      case 'system': return <AlertCircle className="h-5 w-5 text-orange-600" />;
      default: return <Bell className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const formatTime = (ts: string) => {
    const diff = (Date.now() - new Date(ts).getTime()) / 3600000;
    if (diff < 1) return 'Just now';
    if (diff < 24) return `${Math.floor(diff)}h ago`;
    return new Date(ts).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (loading) return <div className="bg-card border rounded-xl p-10 flex justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <div className="bg-card border rounded-xl p-8 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-foreground">
          All Notifications
          {unreadCount > 0 && <Badge className="ml-2 bg-red-100 text-red-800">{unreadCount} new</Badge>}
        </h2>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllAsRead}>
            <CheckCircle className="h-4 w-4 mr-1" /> Mark all read
          </Button>
        )}
      </div>
      {notifications.length === 0 ? (
        <div className="text-center py-12">
          <Bell className="h-16 w-16 text-muted-foreground/40 mx-auto mb-4" />
          <p className="text-lg font-bold text-foreground mb-1">No notifications</p>
          <p className="text-sm text-muted-foreground">You're all caught up!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map(n => (
            <Card key={n.id} className={!n.is_read ? 'border-l-4 border-l-blue-500 bg-blue-50/50' : ''}>
              <CardContent className="p-4 flex items-start gap-3">
                {getIcon(n.type)}
                <div className="flex-1 min-w-0">
                  <p className={`font-medium text-sm ${!n.is_read ? 'text-foreground' : 'text-muted-foreground'}`}>{n.title}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{n.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">{formatTime(n.created_at)}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => deleteNotification(n.id)} className="text-muted-foreground hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsSection;
