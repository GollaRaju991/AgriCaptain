
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
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

interface FarmWorkerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const FarmWorkerDialog: React.FC<FarmWorkerDialogProps> = ({ open, onOpenChange }) => {
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('');
  const [selectedMandal, setSelectedMandal] = useState('');
  const [selectedVillage, setSelectedVillage] = useState('');
  const [workerType, setWorkerType] = useState('');
  const [workerCategory, setWorkerCategory] = useState('');
  const [numberOfWorkers, setNumberOfWorkers] = useState('');
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearched, setIsSearched] = useState(false);
  const [autoDetectLocation, setAutoDetectLocation] = useState(true);

  const { addresses: savedAddresses, saveAddress, deleteAddress, isLimitReached } = useSavedFormAddresses();

  // Reset dependent selections when parent changes
  useEffect(() => { setSelectedState(''); setSelectedDistrict(''); setSelectedDivision(''); setSelectedMandal(''); setSelectedVillage(''); }, [selectedCountry]);
  useEffect(() => { setSelectedDistrict(''); setSelectedDivision(''); setSelectedMandal(''); setSelectedVillage(''); }, [selectedState]);
  useEffect(() => { setSelectedDivision(''); setSelectedMandal(''); setSelectedVillage(''); }, [selectedDistrict]);
  useEffect(() => { setSelectedMandal(''); setSelectedVillage(''); }, [selectedDivision]);
  useEffect(() => { setSelectedVillage(''); }, [selectedMandal]);
  useEffect(() => { setNumberOfWorkers(''); }, [workerCategory]);

  const workerTypes = ['Field Worker', 'Harvester', 'Planting Specialist', 'Irrigation Expert', 'Pesticide Applicator', 'General Laborer', 'Equipment Operator', 'Supervisor'];
  const workerCategories = ['Single', 'Group'];

  const getAvailableStates = () => selectedCountry ? states[selectedCountry as keyof typeof states] || [] : [];
  const getAvailableDistricts = () => selectedState ? districts[selectedState as keyof typeof districts] || [] : [];
  const getAvailableDivisions = () => selectedDistrict ? divisions[selectedDistrict as keyof typeof divisions] || [] : [];
  const getAvailableMandals = () => selectedDivision ? mandals[selectedDivision as keyof typeof mandals] || [] : [];
  const getAvailableVillages = () => selectedMandal ? villages[selectedMandal as keyof typeof villages] || [] : [];

  const handleSearch = () => {
    if (!selectedCountry || !selectedState || !selectedDistrict || !selectedDivision || !workerType || !workerCategory || !startDate || !endDate) return;
    if (workerCategory === 'Group' && !numberOfWorkers) return;

    // Auto-save the address on search
    saveAddress({
      country: selectedCountry,
      state: selectedState,
      district: selectedDistrict,
      division: selectedDivision,
      mandal: selectedMandal,
      village: selectedVillage,
      workType: workerType,
      category: workerCategory,
    });

    const mockResults = [
      { id: 1, name: 'Rajesh Kumar', type: workerType, experience: '5 years', rating: 4.5, rate: '₹500/day', location: `${selectedDistrict}, ${selectedState}`, availability: 'Available', category: workerCategory },
      { id: 2, name: 'Suresh Patel', type: workerType, experience: '8 years', rating: 4.8, rate: '₹600/day', location: `${selectedDistrict}, ${selectedState}`, availability: 'Available', category: workerCategory }
    ];
    setSearchResults(mockResults);
    setIsSearched(true);
  };

  const resetForm = () => {
    setSelectedCountry(''); setSelectedState(''); setSelectedDistrict(''); setSelectedDivision(''); setSelectedMandal(''); setSelectedVillage('');
    setWorkerType(''); setWorkerCategory(''); setNumberOfWorkers('');
    setStartDate(undefined); setEndDate(undefined);
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
    // Use setTimeout to allow cascading state updates
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
    setWorkerType(addr.workType);
    setWorkerCategory(addr.category);
  };

  const isFormValid = selectedCountry && selectedState && selectedDistrict && selectedDivision && workerType && workerCategory && startDate && endDate && (workerCategory === 'Single' || numberOfWorkers);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Find Farm Workers</DialogTitle>
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

          {/* Worker Type and Category */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Worker Type *</Label>
              <Select value={workerType} onValueChange={setWorkerType}>
                <SelectTrigger><SelectValue placeholder="Select worker type" /></SelectTrigger>
                <SelectContent>{workerTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Category *</Label>
              <Select value={workerCategory} onValueChange={setWorkerCategory}>
                <SelectTrigger><SelectValue placeholder="Single or Group" /></SelectTrigger>
                <SelectContent>{workerCategories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            {workerCategory === 'Group' && (
              <div>
                <Label>Number of Workers *</Label>
                <Input type="number" placeholder="Enter number" value={numberOfWorkers} onChange={(e) => setNumberOfWorkers(e.target.value)} min="2" max="50" />
              </div>
            )}
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
          </div>

          {/* End Date */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            <Button onClick={handleSearch} disabled={!isFormValid}>Search Workers</Button>
            <Button variant="outline" onClick={resetForm}>Reset</Button>
          </div>

          {/* Search Results */}
          {isSearched && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Available Workers ({searchResults.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {searchResults.map((worker) => (
                  <div key={worker.id} className="border border-border rounded-lg p-4 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold">{worker.name}</h4>
                        <p className="text-sm text-muted-foreground">{worker.type} - {worker.category}</p>
                        {workerCategory === 'Group' && <p className="text-sm text-primary">Available for {numberOfWorkers} workers</p>}
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">{worker.rate}</p>
                        <p className="text-sm text-yellow-600">★ {worker.rating}</p>
                      </div>
                    </div>
                    <div className="text-sm space-y-1">
                      <p><strong>Experience:</strong> {worker.experience}</p>
                      <p><strong>Location:</strong> {worker.location}</p>
                      <p><strong>Status:</strong> <span className={worker.availability === 'Available' ? 'text-green-600' : 'text-orange-600'}>{worker.availability}</span></p>
                    </div>
                    <Button className="w-full" size="sm">Contact Worker</Button>
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

export default FarmWorkerDialog;
