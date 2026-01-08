import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, Package, Truck, MapPin, Calendar } from 'lucide-react';

interface TrackingUpdate {
  status: string;
  title: string;
  description: string;
  timestamp: string;
  location?: string;
}

interface OrderTrackingProps {
  isOpen: boolean;
  onClose: () => void;
  orderNumber: string;
  currentStatus: string;
  estimatedDelivery: string | null;
  trackingUpdates: TrackingUpdate[];
  createdAt: string;
}

const OrderTracking: React.FC<OrderTrackingProps> = ({
  isOpen,
  onClose,
  orderNumber,
  currentStatus,
  estimatedDelivery,
  trackingUpdates,
  createdAt
}) => {
  const statusSteps = [
    { key: 'pending', label: 'Order Placed', icon: Package },
    { key: 'processing', label: 'Processing', icon: Clock },
    { key: 'shipped', label: 'Shipped', icon: Truck },
    { key: 'out_for_delivery', label: 'Out for Delivery', icon: MapPin },
    { key: 'delivered', label: 'Delivered', icon: CheckCircle }
  ];

  const getStepStatus = (stepKey: string): 'completed' | 'current' | 'upcoming' => {
    const statusOrder = ['pending', 'processing', 'shipped', 'out_for_delivery', 'delivered'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    const stepIndex = statusOrder.indexOf(stepKey);

    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'upcoming';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatEstimatedDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Generate default tracking updates if none exist
  const defaultUpdates: TrackingUpdate[] = [
    {
      status: 'pending',
      title: 'Order Placed',
      description: 'Your order has been placed successfully',
      timestamp: createdAt,
      location: 'Online'
    }
  ];

  const displayUpdates = trackingUpdates.length > 0 ? trackingUpdates : defaultUpdates;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-primary" />
            Track Order #{orderNumber}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Estimated Delivery */}
          {estimatedDelivery && currentStatus !== 'delivered' && currentStatus !== 'cancelled' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-800">
                <Calendar className="h-5 w-5" />
                <div>
                  <p className="text-sm font-medium">Estimated Delivery</p>
                  <p className="text-lg font-bold">{formatEstimatedDate(estimatedDelivery)}</p>
                </div>
              </div>
            </div>
          )}

          {currentStatus === 'delivered' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-800">
                <CheckCircle className="h-5 w-5" />
                <p className="font-medium">Your order has been delivered!</p>
              </div>
            </div>
          )}

          {/* Status Progress */}
          <div className="relative">
            <h3 className="font-semibold mb-4">Order Status</h3>
            <div className="space-y-0">
              {statusSteps.map((step, index) => {
                const stepStatus = getStepStatus(step.key);
                const Icon = step.icon;
                
                return (
                  <div key={step.key} className="flex items-start gap-3 relative">
                    {/* Connector Line */}
                    {index < statusSteps.length - 1 && (
                      <div 
                        className={`absolute left-4 top-8 w-0.5 h-8 ${
                          stepStatus === 'completed' ? 'bg-green-500' : 'bg-gray-200'
                        }`}
                      />
                    )}
                    
                    {/* Step Icon */}
                    <div className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full shrink-0 ${
                      stepStatus === 'completed' ? 'bg-green-500 text-white' :
                      stepStatus === 'current' ? 'bg-blue-500 text-white animate-pulse' :
                      'bg-gray-200 text-gray-500'
                    }`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    
                    {/* Step Content */}
                    <div className="pb-6">
                      <p className={`font-medium ${
                        stepStatus === 'upcoming' ? 'text-gray-400' : 'text-gray-900'
                      }`}>
                        {step.label}
                      </p>
                      {stepStatus === 'current' && (
                        <Badge className="bg-blue-100 text-blue-800 mt-1">Current</Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tracking History */}
          <div>
            <h3 className="font-semibold mb-4">Tracking History</h3>
            <div className="space-y-4">
              {displayUpdates.slice().reverse().map((update, index) => (
                <div key={index} className="border-l-2 border-gray-200 pl-4 pb-4 last:pb-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-gray-900">{update.title}</p>
                      <p className="text-sm text-gray-600">{update.description}</p>
                      {update.location && (
                        <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3" />
                          {update.location}
                        </p>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{formatDate(update.timestamp)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderTracking;