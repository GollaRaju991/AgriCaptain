
import React, { useState } from 'react';
import Header from '@/components/Header';
import MobileBottomNav from "@/components/MobileBottomNav";
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Package, Truck, CheckCircle, Gift, AlertCircle, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import useScrollToTop from '@/hooks/useScrollToTop';

interface Notification {
  id: string;
  type: 'order' | 'delivery' | 'promotion' | 'system';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
}

const Notifications = () => {
  const { toast } = useToast();
  
  // Scroll to top when component mounts
  useScrollToTop();

  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'order',
      title: 'Order Confirmed',
      message: 'Your order #AG-2024-001 has been confirmed and is being processed.',
      timestamp: '2024-01-15T10:30:00Z',
      isRead: false,
      actionUrl: '/orders'
    },
    {
      id: '2',
      type: 'delivery',
      title: 'Order Shipped',
      message: 'Your order #AG-2024-002 has been shipped and will arrive in 2-3 days.',
      timestamp: '2024-01-14T15:45:00Z',
      isRead: true,
      actionUrl: '/orders'
    },
    {
      id: '3',
      type: 'promotion',
      title: 'New Coupon Available',
      message: 'Get 20% off on all products with code AGRI20. Valid till month end!',
      timestamp: '2024-01-13T09:00:00Z',
      isRead: false,
      actionUrl: '/coupons'
    },
    {
      id: '4',
      type: 'delivery',
      title: 'Order Delivered',
      message: 'Your order #AG-2024-003 has been successfully delivered.',
      timestamp: '2024-01-12T14:20:00Z',
      isRead: true,
      actionUrl: '/orders'
    },
    {
      id: '5',
      type: 'system',
      title: 'Profile Update Required',
      message: 'Please update your profile information to continue using all features.',
      timestamp: '2024-01-11T11:15:00Z',
      isRead: false,
      actionUrl: '/profile'
    }
  ]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <Package className="h-5 w-5 text-blue-600" />;
      case 'delivery':
        return <Truck className="h-5 w-5 text-green-600" />;
      case 'promotion':
        return <Gift className="h-5 w-5 text-purple-600" />;
      case 'system':
        return <AlertCircle className="h-5 w-5 text-orange-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'order':
        return 'bg-blue-100 text-blue-800';
      case 'delivery':
        return 'bg-green-100 text-green-800';
      case 'promotion':
        return 'bg-purple-100 text-purple-800';
      case 'system':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, isRead: true }))
    );
    toast({
      title: "All notifications marked as read",
    });
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
    toast({
      title: "Notification deleted",
    });
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`;
    } else {
      return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Notifications</h1>
              <p className="text-gray-600">
                Stay updated with your orders and latest offers
                {unreadCount > 0 && (
                  <Badge className="ml-2 bg-red-100 text-red-800">
                    {unreadCount} new
                  </Badge>
                )}
              </p>
            </div>
            {unreadCount > 0 && (
              <Button 
                variant="outline" 
                onClick={markAllAsRead}
                className="flex items-center space-x-2"
              >
                <CheckCircle className="h-4 w-4" />
                <span>Mark all as read</span>
              </Button>
            )}
          </div>
        </div>

        {notifications.length > 0 ? (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <Card 
                key={notification.id} 
                className={`hover:shadow-md transition-shadow cursor-pointer ${
                  !notification.isRead ? 'border-l-4 border-l-blue-500 bg-blue-50' : ''
                }`}
                onClick={() => markAsRead(notification.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className={`font-medium ${
                            !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            {notification.title}
                          </h3>
                          <Badge 
                            variant="secondary" 
                            className={`text-xs ${getNotificationColor(notification.type)}`}
                          >
                            {notification.type}
                          </Badge>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                          )}
                        </div>
                        <p className={`text-sm ${
                          !notification.isRead ? 'text-gray-700' : 'text-gray-600'
                        }`}>
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          {formatTimestamp(notification.timestamp)}
                        </p>
                        {notification.actionUrl && (
                          <Button 
                            variant="link" 
                            size="sm" 
                            className="p-0 h-auto mt-2 text-blue-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Navigate to the action URL
                              window.location.href = notification.actionUrl!;
                            }}
                          >
                            View Details →
                          </Button>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification.id);
                      }}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-16">
            <CardContent>
              <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No notifications</h3>
              <p className="text-gray-600 mb-6">You're all caught up! We'll notify you when something important happens.</p>
              <Button>Browse Products</Button>
            </CardContent>
          </Card>
        )}
      </div>
<div className="h-20 lg:hidden"></div>

<MobileBottomNav />
      <Footer />
    </div>
  );
};

export default Notifications;
