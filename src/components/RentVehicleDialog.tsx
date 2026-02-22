
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { countries, states, districts, divisions, mandals, villages } from '@/data/locationData';
import LocationDetector from './LocationDetector';
import SavedAddressPicker from './SavedAddressPicker';
import { useSavedFormAddresses, SavedFormAddress } from '@/hooks/useSavedFormAddresses';

interface RentVehicleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const RentVehicleDialog: React.FC<RentVehicleDialogProps> = ({ open, onOpenChange }) => {
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('');
  const [selectedMandal, setSelectedMandal] = useState('');
  const [selectedVillage, setSelectedVillage] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearched, setIsSearched] = useState(false);
  const [autoDetectLocation, setAutoDetectLocation] = useState(true);

  const { addresses: savedAddresses, saveAddress, deleteAddress, isLimitReached } = useSavedFormAddresses();

  useEffect(() => { setSelectedState(''); setSelectedDistrict(''); setSelectedDivision(''); setSelectedMandal(''); setSelectedVillage(''); }, [selectedCountry]);
  useEffect(() => { setSelectedDistrict(''); setSelectedDivision(''); setSelectedMandal(''); setSelectedVillage(''); }, [selectedState]);
  useEffect(() => { setSelectedDivision(''); setSelectedMandal(''); setSelectedVillage(''); }, [selectedDistrict]);
  useEffect(() => { setSelectedMandal(''); setSelectedVillage(''); }, [selectedDivision]);
  useEffect(() => { setSelectedVillage(''); }, [selectedMandal]);

  const vehicleTypes = ['Tractor', 'Harvester', 'Cultivator', 'Seed Drill', 'Thresher', 'Rotavator', 'Plough', 'Sprayer', 'Truck', 'Trailer'];

  const getAvailableStates = () => selectedCountry ? states[selectedCountry as keyof typeof states] || [] : [];
  const getAvailableDistricts = () => selectedState ? districts[selectedState as keyof typeof districts] || [] : [];
  const getAvailableDivisions = () => selectedDistrict ? divisions[selectedDistrict as keyof typeof divisions] || [] : [];
  const getAvailableMandals = () => selectedDivision ? mandals[selectedDivision as keyof typeof mandals] || [] : [];
  const getAvailableVillages = () => selectedMandal ? villages[selectedMandal as keyof typeof villages] || [] : [];

  const handleSearch = () => {
    if (!selectedCountry || !selectedState || !selectedDistrict || !selectedDivision || !vehicleType || !startDate || !endDate) return;

    // Auto-save address on search
    saveAddress({
      country: selectedCountry,
      state: selectedState,
      district: selectedDistrict,
      division: selectedDivision,
      mandal: selectedMandal,
      village: selectedVillage,
      workType: vehicleType,
      category: 'Vehicle',
    });

    const mockResults = [
      { id: 1, name: 'John Deere 5050D', type: vehicleType, model: '2022', rate: '₹1500/day', location: `${selectedDistrict}, ${selectedState}`, owner: 'Ram Singh', condition: 'Excellent', availability: 'Available' },
      { id: 2, name: 'Mahindra 575 DI', type: vehicleType, model: '2021', rate: '₹1200/day', location: `${selectedDistrict}, ${selectedState}`, owner: 'Suresh Kumar', condition: 'Good', availability: 'Available' }
    ];
    setSearchResults(mockResults);
    setIsSearched(true);
  };

  const resetForm = () => {
    setSelectedCountry(''); setSelectedState(''); setSelectedDistrict(''); setSelectedDivision(''); setSelectedMandal(''); setSelectedVillage('');
    setVehicleType(''); setStartDate(undefined); setEndDate(undefined);
    setSearchResults([]); setIsSearched(false); setAutoDetectLocation(true);
  };

  const findCodeByName = (list: { code: string; name: string }[], name: string) => {
    if (!name || !list) return '';
    const lower = name.toLowerCase();
    const match = list.find(item => item.name.toLowerCase().includes(lower) || lower.includes(item.name.toLowerCase()));
    return match?.code || '';
  };

  const handleLocationDetected = (location: any) => {
    const countryMatch = countries.find(c => c.name.toLowerCase() === (location.country || '').toLowerCase());
    const countryCode = countryMatch?.code || '';
    if (countryCode) setSelectedCountry(countryCode);
    const stateList = countryCode ? states[countryCode as keyof typeof states] || [] : [];
    const stateCode = findCodeByName(stateList, location.state);
    if (stateCode) setSelectedState(stateCode);
    const districtList = stateCode ? districts[stateCode as keyof typeof districts] || [] : [];
    const districtCode = findCodeByName(districtList, location.district);
    if (districtCode) setSelectedDistrict(districtCode);
    const divisionList = districtCode ? divisions[districtCode as keyof typeof divisions] || [] : [];
    const divisionCode = findCodeByName(divisionList, location.division);
    if (divisionCode) setSelectedDivision(divisionCode);
    const mandalList = divisionCode ? mandals[divisionCode as keyof typeof mandals] || [] : [];
    const mandalCode = findCodeByName(mandalList, location.mandal);
    if (mandalCode) setSelectedMandal(mandalCode);
    const villageList = mandalCode ? villages[mandalCode as keyof typeof villages] || [] : [];
    const villageCode = findCodeByName(villageList, location.village);
    if (villageCode) setSelectedVillage(villageCode);
    setAutoDetectLocation(false);
  };

  const handleSelectSavedAddress = (addr: SavedFormAddress) => {
    setSelectedCountry(addr.country);
    setTimeout(() => {
      setSelectedState(addr.state);
      setTimeout(() => {
        setSelectedDistrict(addr.district);
        setTimeout(() => {
          setSelectedDivision(addr.division);
          setTimeout(() => {
            setSelectedMandal(addr.mandal);
            setTimeout(() => {
              setSelectedVillage(addr.village);
            }, 50);
          }, 50);
        }, 50);
      }, 50);
    }, 50);
    setVehicleType(addr.workType);
  };

  const isFormValid = selectedCountry && selectedState && selectedDistrict && selectedDivision && vehicleType && startDate && endDate;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Rent Farm Vehicles</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Saved Addresses */}
          <SavedAddressPicker
            addresses={savedAddresses}
            onSelect={handleSelectSavedAddress}
            onDelete={deleteAddress}
            isLimitReached={isLimitReached}
          />

          {/* Auto Location Detection */}
          <LocationDetector 
            enabled={autoDetectLocation} 
            onLocationDetected={handleLocationDetected}
          />
          
          {/* Location Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Country *</Label>
              <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                <SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger>
                <SelectContent>{countries.map((c) => <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>State *</Label>
              <Select value={selectedState} onValueChange={setSelectedState} disabled={!selectedCountry}>
                <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
                <SelectContent>{getAvailableStates().map((s) => <SelectItem key={s.code} value={s.code}>{s.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>District *</Label>
              <Select value={selectedDistrict} onValueChange={setSelectedDistrict} disabled={!selectedState}>
                <SelectTrigger><SelectValue placeholder="Select district" /></SelectTrigger>
                <SelectContent>{getAvailableDistricts().map((d) => <SelectItem key={d.code} value={d.code}>{d.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Division *</Label>
              <Select value={selectedDivision} onValueChange={setSelectedDivision} disabled={!selectedDistrict}>
                <SelectTrigger><SelectValue placeholder="Select division" /></SelectTrigger>
                <SelectContent>{getAvailableDivisions().map((d) => <SelectItem key={d.code} value={d.code}>{d.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Mandal (Optional)</Label>
              <Select value={selectedMandal} onValueChange={setSelectedMandal} disabled={!selectedDivision}>
                <SelectTrigger><SelectValue placeholder="Select mandal" /></SelectTrigger>
                <SelectContent>{getAvailableMandals().map((m) => <SelectItem key={m.code} value={m.code}>{m.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Village (Optional)</Label>
              <Select value={selectedVillage} onValueChange={setSelectedVillage} disabled={!selectedMandal}>
                <SelectTrigger><SelectValue placeholder="Select village" /></SelectTrigger>
                <SelectContent>{getAvailableVillages().map((v) => <SelectItem key={v.code} value={v.code}>{v.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>

          {/* Vehicle Type and Dates */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Vehicle Type *</Label>
              <Select value={vehicleType} onValueChange={setVehicleType}>
                <SelectTrigger><SelectValue placeholder="Select vehicle type" /></SelectTrigger>
                <SelectContent>{vehicleTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Start Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !startDate && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : <span>Pick start date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus className="pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label>End Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !endDate && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : <span>Pick end date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus className="pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSearch} disabled={!isFormValid}>Search Vehicles</Button>
            <Button variant="outline" onClick={resetForm}>Reset</Button>
          </div>

          {/* Search Results */}
          {isSearched && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Available Vehicles ({searchResults.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {searchResults.map((vehicle) => (
                  <div key={vehicle.id} className="border border-border rounded-lg p-4 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold">{vehicle.name}</h4>
                        <p className="text-sm text-muted-foreground">{vehicle.type} - {vehicle.model}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">{vehicle.rate}</p>
                      </div>
                    </div>
                    <div className="text-sm space-y-1">
                      <p><strong>Owner:</strong> {vehicle.owner}</p>
                      <p><strong>Location:</strong> {vehicle.location}</p>
                      <p><strong>Condition:</strong> {vehicle.condition}</p>
                      <p><strong>Status:</strong> <span className={vehicle.availability === 'Available' ? 'text-green-600' : 'text-orange-600'}>{vehicle.availability}</span></p>
                    </div>
                    <Button className="w-full" size="sm">Book Vehicle</Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RentVehicleDialog;
