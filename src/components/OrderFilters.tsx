import React, { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';

interface OrderFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilters: string[];
  onStatusFiltersChange: (filters: string[]) => void;
  timeFilter: string;
  onTimeFilterChange: (filter: string) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'On the way' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

const TIME_OPTIONS = [
  { value: 'last30', label: 'Last 30 days' },
  { value: '2026', label: '2026' },
  { value: '2025', label: '2025' },
  { value: 'older', label: 'Older' },
];

const OrderFilters: React.FC<OrderFiltersProps> = ({
  searchQuery,
  onSearchChange,
  statusFilters,
  onStatusFiltersChange,
  timeFilter,
  onTimeFilterChange,
  onClearFilters,
  hasActiveFilters,
}) => {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [tempStatus, setTempStatus] = useState<string[]>(statusFilters);
  const [tempTime, setTempTime] = useState(timeFilter);

  const openSheet = () => {
    setTempStatus(statusFilters);
    setTempTime(timeFilter);
    setSheetOpen(true);
  };

  const applyFilters = () => {
    onStatusFiltersChange(tempStatus);
    onTimeFilterChange(tempTime);
    setSheetOpen(false);
  };

  const clearSheetFilters = () => {
    setTempStatus([]);
    setTempTime('');
  };

  const toggleTempStatus = (status: string) => {
    setTempStatus(prev =>
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    );
  };

  const activeFilterCount = useMemo(() => {
    return statusFilters.length + (timeFilter ? 1 : 0);
  }, [statusFilters, timeFilter]);

  return (
    <>
      {/* Search + Filter Bar */}
      <div className="flex items-center gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search your order here"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 bg-background border-border"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={openSheet}
          className="flex items-center gap-1.5 shrink-0 relative"
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </div>

      {/* Active filter chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {statusFilters.map(s => {
            const label = STATUS_OPTIONS.find(o => o.value === s)?.label || s;
            return (
              <span key={s} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                {label}
                <button onClick={() => onStatusFiltersChange(statusFilters.filter(f => f !== s))}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            );
          })}
          {timeFilter && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
              {TIME_OPTIONS.find(o => o.value === timeFilter)?.label || timeFilter}
              <button onClick={() => onTimeFilterChange('')}>
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          <button onClick={onClearFilters} className="text-xs text-destructive font-medium ml-1">
            Clear All
          </button>
        </div>
      )}

      {/* Filter Sheet (Mobile-friendly bottom sheet, side sheet on desktop) */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl max-h-[70vh]">
          <SheetHeader className="flex flex-row items-center justify-between pb-2">
            <SheetTitle className="text-lg">Filters</SheetTitle>
            <button onClick={clearSheetFilters} className="text-sm text-primary font-medium">
              Clear Filter
            </button>
          </SheetHeader>

          <div className="space-y-5 py-4 overflow-y-auto">
            {/* Order Status */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3">Order Status</h4>
              <div className="flex flex-wrap gap-2">
                {STATUS_OPTIONS.map(opt => {
                  const isActive = tempStatus.includes(opt.value);
                  return (
                    <button
                      key={opt.value}
                      onClick={() => toggleTempStatus(opt.value)}
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full border text-sm transition-colors ${
                        isActive
                          ? 'border-primary bg-primary/10 text-primary font-medium'
                          : 'border-border text-muted-foreground hover:border-primary/50'
                      }`}
                    >
                      {opt.label}
                      <Plus className={`h-3.5 w-3.5 transition-transform ${isActive ? 'rotate-45' : ''}`} />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Order Time */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3">Order Time</h4>
              <div className="flex flex-wrap gap-2">
                {TIME_OPTIONS.map(opt => {
                  const isActive = tempTime === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setTempTime(isActive ? '' : opt.value)}
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full border text-sm transition-colors ${
                        isActive
                          ? 'border-primary bg-primary/10 text-primary font-medium'
                          : 'border-border text-muted-foreground hover:border-primary/50'
                      }`}
                    >
                      {opt.label}
                      <Plus className={`h-3.5 w-3.5 transition-transform ${isActive ? 'rotate-45' : ''}`} />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <SheetFooter className="flex flex-row gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setSheetOpen(false)}>
              Cancel
            </Button>
            <Button className="flex-1 bg-orange-500 hover:bg-orange-600 text-white" onClick={applyFilters}>
              Apply
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default OrderFilters;
