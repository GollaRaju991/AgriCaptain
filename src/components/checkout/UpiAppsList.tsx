import React from 'react';
import { Info } from 'lucide-react';

// ── UPI App Icons (realistic styled) ──

const GooglePayIcon = () => (
  <div className="w-10 h-10 rounded-lg bg-white border border-border/40 flex items-center justify-center shadow-sm">
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  </div>
);

const PhonePeIcon = () => (
  <div className="w-10 h-10 rounded-lg bg-[#5f259f] flex items-center justify-center shadow-sm">
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path d="M7.5 4L16.5 4C17.33 4 18 4.67 18 5.5L18 7L13.5 12L18 17V18.5C18 19.33 17.33 20 16.5 20H12L6 14V5.5C6 4.67 6.67 4 7.5 4Z" fill="white"/>
    </svg>
  </div>
);

const PaytmIcon = () => (
  <div className="w-10 h-10 rounded-lg bg-[#00BAF2] flex items-center justify-center shadow-sm">
    <span className="text-white text-xs font-extrabold tracking-tight">pay<span className="text-[#002970]">tm</span></span>
  </div>
);

const CREDIcon = () => (
  <div className="w-10 h-10 rounded-lg bg-[#1A1A2E] flex items-center justify-center shadow-sm">
    <span className="text-white text-[10px] font-bold tracking-wider">CRED</span>
  </div>
);

export const upiAppsData = [
  { id: 'gpay', name: 'Google Pay', icon: <GooglePayIcon />, badge: 'popular', subtitle: 'Pay instantly from any bank account' },
  { id: 'phonepe', name: 'PhonePe', icon: <PhonePeIcon />, subtitle: 'You will be redirected to PhonePe' },
  { id: 'paytm', name: 'Paytm', icon: <PaytmIcon />, subtitle: 'You will be redirected to Paytm' },
  { id: 'cred', name: 'CRED', icon: <CREDIcon />, subtitle: 'Pay via CRED app' },
];

interface UpiAppsListProps {
  selectedApp: string;
  onSelect: (appId: string) => void;
}

const UpiAppsList: React.FC<UpiAppsListProps> = ({ selectedApp, onSelect }) => {
  return (
    <div className="divide-y divide-border/30">
      {upiAppsData.map((app) => (
        <button
          key={app.id}
          type="button"
          onClick={() => onSelect(app.id)}
          className="w-full flex items-center gap-3.5 px-1 py-3.5 text-left transition-colors hover:bg-muted/20"
        >
          {/* Radio indicator */}
          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
            selectedApp === app.id
              ? 'border-primary bg-white'
              : 'border-muted-foreground/30'
          }`}>
            {selectedApp === app.id && (
              <div className="w-2.5 h-2.5 rounded-full bg-primary" />
            )}
          </div>

          {/* App icon */}
          {app.icon}

          {/* Name + badge + subtitle */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground">{app.name}</span>
              {app.badge && (
                <span className="text-[10px] font-medium text-muted-foreground border border-border rounded-full px-2 py-0.5">
                  {app.badge}
                </span>
              )}
            </div>
            {/* Show redirect info when selected */}
            {selectedApp === app.id && (
              <div className="mt-1.5 bg-primary/5 rounded-lg px-3 py-1.5 flex items-center gap-2">
                <Info className="h-3.5 w-3.5 text-primary shrink-0" />
                <span className="text-xs text-primary font-medium">{app.subtitle}</span>
              </div>
            )}
          </div>
        </button>
      ))}
    </div>
  );
};

export default UpiAppsList;
