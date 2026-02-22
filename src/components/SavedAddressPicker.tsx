import React, { useState } from 'react';
import { SavedFormAddress } from '@/hooks/useSavedFormAddresses';
import { Button } from '@/components/ui/button';
import { Bookmark, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

interface SavedAddressPickerProps {
  addresses: SavedFormAddress[];
  onSelect: (address: SavedFormAddress) => void;
  onDelete: (id: string) => void;
  isLimitReached: boolean;
}

const SavedAddressPicker: React.FC<SavedAddressPickerProps> = ({
  addresses,
  onSelect,
  onDelete,
  isLimitReached,
}) => {
  const [expanded, setExpanded] = useState(false);

  if (addresses.length === 0) return null;

  const displayAddresses = expanded ? addresses : addresses.slice(0, 3);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Bookmark className="h-4 w-4 text-primary" />
          Saved Addresses ({addresses.length}/10)
        </div>
        {isLimitReached && (
          <span className="text-xs text-destructive">Limit reached – delete one to add new</span>
        )}
      </div>
      <div className="grid grid-cols-1 gap-2">
        {displayAddresses.map((addr) => (
          <div
            key={addr.id}
            className="flex items-center justify-between border border-border rounded-lg p-3 hover:bg-accent/50 cursor-pointer transition-colors"
            onClick={() => onSelect(addr)}
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground truncate">{addr.label}</p>
              <p className="text-xs text-muted-foreground truncate">
                {[addr.workType, addr.category].filter(Boolean).join(' · ')}
                {addr.mandal && ` · ${addr.mandal}`}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(addr.id);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
      {addresses.length > 3 && (
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-xs text-muted-foreground"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? (
            <><ChevronUp className="h-3 w-3 mr-1" /> Show Less</>
          ) : (
            <><ChevronDown className="h-3 w-3 mr-1" /> Show All ({addresses.length})</>
          )}
        </Button>
      )}
    </div>
  );
};

export default SavedAddressPicker;
