import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, Package, Truck, Gift, AlertCircle, CheckCircle, Tag, ArrowDownCircle, Loader2 } from 'lucide-react';
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

  const getIconWithBg = (type: string) => {
    switch (type) {
      case 'order':
        return (
          <div className="w-11 h-11 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
        );
      case 'delivery':
        return (
          <div className="w-11 h-11 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            <Truck className="h-6 w-6 text-blue-600" />
          </div>
        );
      case 'promotion':
        return (
          <div className="w-11 h-11 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
            <Tag className="h-6 w-6 text-emerald-600" />
          </div>
        );
      case 'system':
        return (
          <div className="w-11 h-11 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
            <ArrowDownCircle className="h-6 w-6 text-red-500" />
          </div>
        );
      default:
        return (
          <div className="w-11 h-11 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
            <Bell className="h-6 w-6 text-orange-500" />
          </div>
        );
    }
  };

  const formatTime = (ts: string) => {
    const diffMs = Date.now() - new Date(ts).getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin} min ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr} hour${diffHr > 1 ? 's' : ''} ago`;
    return new Date(ts).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  };

  // Bell button per variant
  const bellButton = variant === 'mobile' ? (
    <button
      onClick={handleToggle}
      className="relative flex items-center justify-center w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full shadow-sm"
    >
      <Bell className="h-5 w-5 text-green-700" />
      {unreadCount > 0 && (
        <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full px-1 shadow">
          {unreadCount}
        </span>
      )}
    </button>
  ) : (
    <button
      onClick={handleToggle}
      className="relative inline-flex items-center justify-center rounded-full text-green-700 hover:bg-gray-100 transition-colors h-11 w-11"
    >
      <Bell className={variant === 'sticky' ? 'h-5 w-5' : 'h-6 w-6'} />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold min-w-[20px] h-[20px] flex items-center justify-center rounded-full px-1 shadow">
          {unreadCount}
        </span>
      )}
    </button>
  );

  return (
    <div className="relative" ref={dropdownRef}>
      {bellButton}

      {open && (
        <div className={`absolute z-[100] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden ${
          variant === 'mobile'
            ? 'right-0 top-12 w-[calc(100vw-24px)] max-w-[380px]'
            : 'right-0 top-14 w-[400px]'
        }`}>
          {/* Header with View All */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-900 text-lg">Notifications</h3>
            <Link
              to="/notifications"
              onClick={() => setOpen(false)}
              className="text-sm font-semibold text-green-600 hover:text-green-700 transition-colors"
            >
              View All
            </Link>
          </div>

          {/* Notification list */}
          <div className="max-h-[400px] overflow-y-auto divide-y divide-gray-100">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-7 w-7 animate-spin text-green-600" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-12 px-4">
                <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-base font-semibold text-gray-500">No notifications yet</p>
                <p className="text-sm text-gray-400 mt-1">We'll notify you when something happens</p>
              </div>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`w-full text-left px-5 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors ${
                    !n.is_read ? 'bg-blue-50/40' : ''
                  }`}
                >
                  {getIconWithBg(n.type)}
                  <div className="flex-1 min-w-0">
                    <p className={`text-[15px] font-semibold leading-tight ${!n.is_read ? 'text-gray-900' : 'text-gray-700'}`}>
                      {n.title}
                    </p>
                    <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{n.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{formatTime(n.created_at)}</p>
                  </div>
                  {!n.is_read && (
                    <div className="w-2.5 h-2.5 bg-blue-500 rounded-full flex-shrink-0 ml-1" />
                  )}
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <Link
              to="/notifications"
              onClick={() => setOpen(false)}
              className="block text-center py-3.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 border-t border-gray-100 transition-colors"
            >
              View All Notifications
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
