import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// Global event emitter for notification count refresh
const listeners = new Set<() => void>();

export const refreshNotificationCount = () => {
  listeners.forEach(fn => fn());
};

export const useNotificationCount = () => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchCount = async () => {
    if (!user) return;
    const { count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_read', false);
    setUnreadCount(count || 0);
  };

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    fetchCount();

    // Register for manual refresh
    listeners.add(fetchCount);

    // Subscribe to realtime changes
    const channel = supabase
      .channel('notifications-count')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`,
      }, () => {
        fetchCount();
      })
      .subscribe();

    return () => {
      listeners.delete(fetchCount);
      supabase.removeChannel(channel);
    };
  }, [user]);

  return unreadCount;
};

