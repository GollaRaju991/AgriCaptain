import React from 'react';
import AddressManager from '@/components/AddressManager';

interface Props {
  userId: string;
}

const ManageAddressesDesktop: React.FC<Props> = ({ userId }) => {
  const handleAddressSelect = (address: any) => {
    console.log('Selected address:', address);
  };

  return (
    <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm">
      <h2 className="text-xl font-bold text-foreground mb-4">Manage Addresses</h2>
      <AddressManager onAddressSelect={handleAddressSelect} selectedAddressId="" />
    </div>
  );
};

export default ManageAddressesDesktop;
