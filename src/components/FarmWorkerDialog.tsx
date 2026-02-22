
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
  const [workerCategory, setWorkerCategory] = useState(''); // Single or Group
  const [numberOfWorkers, setNumberOfWorkers] = useState('');
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearched, setIsSearched] = useState(false);
  const [autoDetectLocation, setAutoDetectLocation] = useState(true);

  // Reset dependent selections when parent changes
  useEffect(() => {
    setSelectedState('');
    setSelectedDistrict('');
    setSelectedDivision('');
    setSelectedMandal('');
    setSelectedVillage('');
  }, [selectedCountry]);

  useEffect(() => {
    setSelectedDistrict('');
    setSelectedDivision('');
    setSelectedMandal('');
    setSelectedVillage('');
  }, [selectedState]);

  useEffect(() => {
    setSelectedDivision('');
    setSelectedMandal('');
    setSelectedVillage('');
  }, [selectedDistrict]);

  useEffect(() => {
    setSelectedMandal('');
    setSelectedVillage('');
  }, [selectedDivision]);

  useEffect(() => {
    setSelectedVillage('');
  }, [selectedMandal]);

  // Reset number of workers when category changes
  useEffect(() => {
    setNumberOfWorkers('');
  }, [workerCategory]);

  const workerTypes = [
    'Field Worker',
    'Harvester',
    'Planting Specialist',
    'Irrigation Expert',
    'Pesticide Applicator',
    'General Laborer',
    'Equipment Operator',
    'Supervisor'
  ];

  const workerCategories = ['Single', 'Group'];

  const getAvailableStates = () => {
    return selectedCountry ? states[selectedCountry as keyof typeof states] || [] : [];
  };

  const getAvailableDistricts = () => {
    return selectedState ? districts[selectedState as keyof typeof districts] || [] : [];
  };

  const getAvailableDivisions = () => {
    return selectedDistrict ? divisions[selectedDistrict as keyof typeof divisions] || [] : [];
  };

  const getAvailableMandals = () => {
    return selectedDivision ? mandals[selectedDivision as keyof typeof mandals] || [] : [];
  };

  const getAvailableVillages = () => {
    return selectedMandal ? villages[selectedMandal as keyof typeof villages] || [] : [];
  };

  const handleSearch = () => {
    if (!selectedCountry || !selectedState || !selectedDistrict || !selectedDivision || !workerType || !workerCategory || !startDate || !endDate) {
      return;
    }

    if (workerCategory === 'Group' && !numberOfWorkers) {
      return;
    }

    // Simulate search results
    const mockResults = [
      {
        id: 1,
        name: 'Rajesh Kumar',
        type: workerType,
        experience: '5 years',
        rating: 4.5,
        rate: '₹500/day',
        location: `${selectedDistrict}, ${selectedState}`,
        availability: 'Available',
        category: workerCategory
      },
      {
        id: 2,
        name: 'Suresh Patel',
        type: workerType,
        experience: '8 years',
        rating: 4.8,
        rate: '₹600/day',
        location: `${selectedDistrict}, ${selectedState}`,
        availability: 'Available',
        category: workerCategory
      }
    ];
    setSearchResults(mockResults);
    setIsSearched(true);
  };

  const resetForm = () => {
    setSelectedCountry('');
    setSelectedState('');
    setSelectedDistrict('');
    setSelectedDivision('');
    setSelectedMandal('');
    setSelectedVillage('');
    setWorkerType('');
    setWorkerCategory('');
    setNumberOfWorkers('');
    setStartDate(undefined);
    setEndDate(undefined);
    setSearchResults([]);
    setIsSearched(false);
    setAutoDetectLocation(true);
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

  const isFormValid = selectedCountry && selectedState && selectedDistrict && selectedDivision && workerType && workerCategory && startDate && endDate && (workerCategory === 'Single' || numberOfWorkers);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Find Farm Workers</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Auto Location Detection */}
          <LocationDetector 
            enabled={autoDetectLocation} 
            onLocationDetected={handleLocationDetected}
          />
          
          {/* Location Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="country">Country *</Label>
              <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                <SelectTrigger>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="state">State *</Label>
              <Select value={selectedState} onValueChange={setSelectedState} disabled={!selectedCountry}>
                <SelectTrigger>
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableStates().map((state) => (
                    <SelectItem key={state.code} value={state.code}>
                      {state.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="district">District *</Label>
              <Select value={selectedDistrict} onValueChange={setSelectedDistrict} disabled={!selectedState}>
                <SelectTrigger>
                  <SelectValue placeholder="Select district" />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableDistricts().map((district) => (
                    <SelectItem key={district.code} value={district.code}>
                      {district.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="division">Division *</Label>
              <Select value={selectedDivision} onValueChange={setSelectedDivision} disabled={!selectedDistrict}>
                <SelectTrigger>
                  <SelectValue placeholder="Select division" />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableDivisions().map((division) => (
                    <SelectItem key={division.code} value={division.code}>
                      {division.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="mandal">Mandal (Optional)</Label>
              <Select value={selectedMandal} onValueChange={setSelectedMandal} disabled={!selectedDivision}>
                <SelectTrigger>
                  <SelectValue placeholder="Select mandal" />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableMandals().map((mandal) => (
                    <SelectItem key={mandal.code} value={mandal.code}>
                      {mandal.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="village">Village (Optional)</Label>
              <Select value={selectedVillage} onValueChange={setSelectedVillage} disabled={!selectedMandal}>
                <SelectTrigger>
                  <SelectValue placeholder="Select village" />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableVillages().map((village) => (
                    <SelectItem key={village.code} value={village.code}>
                      {village.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Worker Type and Category */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="worker-type">Worker Type *</Label>
              <Select value={workerType} onValueChange={setWorkerType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select worker type" />
                </SelectTrigger>
                <SelectContent>
                  {workerTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="worker-category">Category *</Label>
              <Select value={workerCategory} onValueChange={setWorkerCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Single or Group" />
                </SelectTrigger>
                <SelectContent>
                  {workerCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {workerCategory === 'Group' && (
              <div>
                <Label htmlFor="number-of-workers">Number of Workers *</Label>
                <Input
                  id="number-of-workers"
                  type="number"
                  placeholder="Enter number"
                  value={numberOfWorkers}
                  onChange={(e) => setNumberOfWorkers(e.target.value)}
                  min="2"
                  max="50"
                />
              </div>
            )}

            <div>
              <Label>Start Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : <span>Pick start date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                    className="pointer-events-auto"
                  />
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
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : <span>Pick end date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSearch} disabled={!isFormValid}>
              Search Workers
            </Button>
            <Button variant="outline" onClick={resetForm}>
              Reset
            </Button>
          </div>

          {/* Search Results */}
          {isSearched && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Available Workers ({searchResults.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {searchResults.map((worker) => (
                  <div key={worker.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold">{worker.name}</h4>
                        <p className="text-sm text-gray-600">{worker.type} - {worker.category}</p>
                        {workerCategory === 'Group' && (
                          <p className="text-sm text-blue-600">Available for {numberOfWorkers} workers</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">{worker.rate}</p>
                        <p className="text-sm text-yellow-600">★ {worker.rating}</p>
                      </div>
                    </div>
                    <div className="text-sm space-y-1">
                      <p><strong>Experience:</strong> {worker.experience}</p>
                      <p><strong>Location:</strong> {worker.location}</p>
                      <p><strong>Status:</strong> 
                        <span className={worker.availability === 'Available' ? 'text-green-600' : 'text-orange-600'}>
                          {worker.availability}
                        </span>
                      </p>
                    </div>
                    <Button className="w-full" size="sm">
                      Contact Worker
                    </Button>
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
