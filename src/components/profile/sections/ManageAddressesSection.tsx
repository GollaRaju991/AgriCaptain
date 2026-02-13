import React from 'react';
import AddressManager from '@/components/AddressManager';

const ManageAddressesSection: React.FC = () => {
  const handleAddressSelect = (address: any) => {
    console.log('Selected address:', address);
  };

  return (
    <div className="bg-card border rounded-lg p-6">
      <AddressManager onAddressSelect={handleAddressSelect} selectedAddressId="" />
    </div>
  );
};

export default ManageAddressesSection;
