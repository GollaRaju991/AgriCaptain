import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, Package, Truck, Gift, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNotificationCount } from '@/hooks/useNotificationCount';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  created_at: string;
  is_read: boolean;
  action_url?: string | null;
}

const NotificationDropdown = ({ variant = 'desktop' }: { variant?: 'desktop' | 'mobile' | 'sticky' }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const unreadCount = useNotificationCount();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const fetchLatest = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5);
    setNotifications(data || []);
    setLoading(false);
  };

  const handleToggle = () => {
    if (!open) fetchLatest();
    setOpen(!open);
  };

  const handleNotificationClick = async (n: Notification) => {
    if (!n.is_read) {
      await supabase.from('notifications').update({ is_read: true }).eq('id', n.id);
    }
    setOpen(false);
    if (n.action_url) navigate(n.action_url);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'order': return <Package className="h-4 w-4 text-blue-600 flex-shrink-0" />;
      case 'delivery': return <Truck className="h-4 w-4 text-green-600 flex-shrink-0" />;
      case 'promotion': return <Gift className="h-4 w-4 text-purple-600 flex-shrink-0" />;
      case 'system': return <AlertCircle className="h-4 w-4 text-orange-600 flex-shrink-0" />;
      default: return <Bell className="h-4 w-4 text-muted-foreground flex-shrink-0" />;
    }
  };

  const formatTime = (ts: string) => {
    const diff = (Date.now() - new Date(ts).getTime()) / 3600000;
    if (diff < 1) return 'Just now';
    if (diff < 24) return `${Math.floor(diff)}h ago`;
    return new Date(ts).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  };

  // Bell button styles per variant
  const bellButton = variant === 'mobile' ? (
    <button
      onClick={handleToggle}
      className="relative flex items-center justify-center w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full shadow-sm"
    >
      <Bell className="h-4.5 w-4.5 text-green-700" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full px-1 shadow-sm">
          {unreadCount}
        </span>
      )}
    </button>
  ) : (
    <button
      onClick={handleToggle}
      className="relative inline-flex items-center justify-center rounded-md text-sm font-medium text-green-700 hover:bg-accent hover:text-accent-foreground h-10 w-10 transition-colors"
    >
      <Bell className={variant === 'sticky' ? 'h-5 w-5' : 'h-6 w-6'} />
      {unreadCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold min-w-[20px] h-[20px] flex items-center justify-center rounded-full px-1 shadow-sm">
          {unreadCount}
        </span>
      )}
    </button>
  );

  return (
    <div className="relative" ref={dropdownRef}>
      {bellButton}

      {open && (
        <div className={`absolute z-[100] bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden ${
          variant === 'mobile' 
            ? 'right-0 top-12 w-[calc(100vw-24px)] max-w-[360px]' 
            : 'right-0 top-12 w-[380px]'
        }`}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-green-50 to-emerald-50 border-b">
            <h3 className="font-bold text-gray-900 text-base">Notifications</h3>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
                {unreadCount} new
              </span>
            )}
          </div>

          {/* Content */}
          <div className="max-h-[340px] overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-green-600" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-10 px-4">
                <Bell className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-500">No notifications yet</p>
                <p className="text-xs text-gray-400 mt-1">We'll notify you when something happens</p>
              </div>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                    !n.is_read ? 'bg-blue-50/60' : ''
                  }`}
                >
                  <div className="mt-0.5">{getIcon(n.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`text-sm font-medium truncate ${!n.is_read ? 'text-gray-900' : 'text-gray-600'}`}>
                        {n.title}
                      </p>
                      {!n.is_read && <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                    <p className="text-[11px] text-gray-400 mt-1">{formatTime(n.created_at)}</p>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Footer - View All */}
          <Link
            to="/notifications"
            onClick={() => setOpen(false)}
            className="block text-center py-3 text-sm font-semibold text-green-700 hover:bg-green-50 border-t border-gray-200 transition-colors"
          >
            View All Notifications →
          </Link>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
