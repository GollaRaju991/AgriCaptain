
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
import { countries, states, districts, divisions, mandals, villages, getMandalsForDistrict, hasDivisions } from '@/data/locationData';
import LocationDetector from './LocationDetector';
import SavedAddressPicker from './SavedAddressPicker';
import { useSavedFormAddresses, SavedFormAddress } from '@/hooks/useSavedFormAddresses';
import { useLanguage } from '@/contexts/LanguageContext';

interface RentVehicleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const RentVehicleDialog: React.FC<RentVehicleDialogProps> = ({ open, onOpenChange }) => {
  const { language } = useLanguage();
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

  const getDisplayName = (item: { name: string; nameTe?: string }) => {
    if (language === 'te' && item.nameTe) return item.nameTe;
    return item.name;
  };

  useEffect(() => { setSelectedState(''); setSelectedDistrict(''); setSelectedDivision(''); setSelectedMandal(''); setSelectedVillage(''); }, [selectedCountry]);
  useEffect(() => { setSelectedDistrict(''); setSelectedDivision(''); setSelectedMandal(''); setSelectedVillage(''); }, [selectedState]);
  useEffect(() => { setSelectedDivision(''); setSelectedMandal(''); setSelectedVillage(''); }, [selectedDistrict]);
  useEffect(() => { setSelectedMandal(''); setSelectedVillage(''); }, [selectedDivision]);
  useEffect(() => { setSelectedVillage(''); }, [selectedMandal]);

  const vehicleTypes = ['Tractor', 'Harvester', 'Cultivator', 'Seed Drill', 'Thresher', 'Rotavator', 'Plough', 'Sprayer', 'Truck', 'Trailer'];

  const getAvailableStates = () => selectedCountry ? states[selectedCountry as keyof typeof states] || [] : [];
  const getAvailableDistricts = () => selectedState ? districts[selectedState as keyof typeof districts] || [] : [];
  const getAvailableDivisions = () => selectedDistrict ? divisions[selectedDistrict as keyof typeof divisions] || [] : [];
  const districtHasDivisions = selectedDistrict ? hasDivisions(selectedDistrict) : false;
  const getAvailableMandals = () => {
    if (districtHasDivisions) {
      return selectedDivision ? mandals[selectedDivision as keyof typeof mandals] || [] : [];
    }
    return selectedDistrict ? getMandalsForDistrict(selectedDistrict) : [];
  };
  const getAvailableVillages = () => selectedMandal ? villages[selectedMandal as keyof typeof villages] || [] : [];

  const handleSearch = () => {
    if (!selectedCountry || !selectedState || !selectedDistrict || !vehicleType || !startDate || !endDate) return;
    if (districtHasDivisions && !selectedDivision) return;

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
    const mandalList = districtCode ? getMandalsForDistrict(districtCode) : [];
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

  const isFormValid = selectedCountry && selectedState && selectedDistrict && (!districtHasDivisions || selectedDivision) && vehicleType && startDate && endDate;

  const label = (en: string, te: string) => language === 'te' ? te : en;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{label('Rent Farm Vehicles', 'వ్యవసాయ వాహనాలు అద్దెకు తీసుకోండి')}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <SavedAddressPicker
            addresses={savedAddresses}
            onSelect={handleSelectSavedAddress}
            onDelete={deleteAddress}
            isLimitReached={isLimitReached}
          />

          <LocationDetector 
            enabled={autoDetectLocation} 
            onLocationDetected={handleLocationDetected}
          />
          
          {/* Location Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>{label('Country *', 'దేశం *')}</Label>
              <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                <SelectTrigger><SelectValue placeholder={label('Select country', 'దేశం ఎంచుకోండి')} /></SelectTrigger>
                <SelectContent>{countries.map((c) => <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>{label('State *', 'రాష్ట్రం *')}</Label>
              <Select value={selectedState} onValueChange={setSelectedState} disabled={!selectedCountry}>
                <SelectTrigger><SelectValue placeholder={label('Select state', 'రాష్ట్రం ఎంచుకోండి')} /></SelectTrigger>
                <SelectContent>{getAvailableStates().map((s) => <SelectItem key={s.code} value={s.code}>{s.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>{label('District *', 'జిల్లా *')}</Label>
              <Select value={selectedDistrict} onValueChange={setSelectedDistrict} disabled={!selectedState}>
                <SelectTrigger><SelectValue placeholder={label('Select district', 'జిల్లా ఎంచుకోండి')} /></SelectTrigger>
                <SelectContent>{getAvailableDistricts().map((d) => <SelectItem key={d.code} value={d.code}>{getDisplayName(d)}</SelectItem>)}</SelectContent>
              </Select>
            </div>

            {districtHasDivisions && (
              <div>
                <Label>{label('Division *', 'డివిజన్ *')}</Label>
                <Select value={selectedDivision} onValueChange={setSelectedDivision} disabled={!selectedDistrict}>
                  <SelectTrigger><SelectValue placeholder={label('Select division', 'డివిజన్ ఎంచుకోండి')} /></SelectTrigger>
                  <SelectContent>{getAvailableDivisions().map((d) => <SelectItem key={d.code} value={d.code}>{d.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label>{label('Mandal', 'మండలం')}</Label>
              {getAvailableMandals().length > 0 ? (
                <Select value={selectedMandal} onValueChange={setSelectedMandal} disabled={districtHasDivisions ? !selectedDivision : !selectedDistrict}>
                  <SelectTrigger><SelectValue placeholder={label('Select mandal', 'మండలం ఎంచుకోండి')} /></SelectTrigger>
                  <SelectContent>{getAvailableMandals().map((m) => <SelectItem key={m.code} value={m.code}>{getDisplayName(m)}</SelectItem>)}</SelectContent>
                </Select>
              ) : (
                <Input 
                  placeholder={label('Enter mandal', 'మండలం నమోదు చేయండి')} 
                  value={selectedMandal} 
                  onChange={(e) => setSelectedMandal(e.target.value)}
                  disabled={districtHasDivisions ? !selectedDivision : !selectedDistrict}
                />
              )}
            </div>
            <div>
              <Label>{label('Village', 'గ్రామం')}</Label>
              {getAvailableVillages().length > 0 ? (
                <Select value={selectedVillage} onValueChange={setSelectedVillage} disabled={!selectedMandal}>
                  <SelectTrigger><SelectValue placeholder={label('Select village', 'గ్రామం ఎంచుకోండి')} /></SelectTrigger>
                  <SelectContent>{getAvailableVillages().map((v) => <SelectItem key={v.code} value={v.code}>{v.name}</SelectItem>)}</SelectContent>
                </Select>
              ) : (
                <Input 
                  placeholder={label('Enter village', 'గ్రామం నమోదు చేయండి')} 
                  value={selectedVillage} 
                  onChange={(e) => setSelectedVillage(e.target.value)}
                  disabled={!selectedMandal}
                />
              )}
            </div>
          </div>

          {/* Vehicle Type and Dates */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>{label('Vehicle Type *', 'వాహన రకం *')}</Label>
              <Select value={vehicleType} onValueChange={setVehicleType}>
                <SelectTrigger><SelectValue placeholder={label('Select vehicle type', 'వాహన రకం ఎంచుకోండి')} /></SelectTrigger>
                <SelectContent>{vehicleTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>{label('Start Date *', 'ప్రారంభ తేదీ *')}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !startDate && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : <span>{label('Pick start date', 'ప్రారంభ తేదీ ఎంచుకోండి')}</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus className="pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label>{label('End Date *', 'ముగింపు తేదీ *')}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !endDate && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : <span>{label('Pick end date', 'ముగింపు తేదీ ఎంచుకోండి')}</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus className="pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSearch} disabled={!isFormValid}>{label('Search Vehicles', 'వాహనాలను వెతకండి')}</Button>
            <Button variant="outline" onClick={resetForm}>{label('Reset', 'రీసెట్')}</Button>
          </div>

          {isSearched && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">{label('Available Vehicles', 'అందుబాటులో ఉన్న వాహనాలు')} ({searchResults.length})</h3>
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
                      <p><strong>{label('Owner:', 'యజమాని:')}</strong> {vehicle.owner}</p>
                      <p><strong>{label('Location:', 'ప్రాంతం:')}</strong> {vehicle.location}</p>
                      <p><strong>{label('Condition:', 'పరిస్థితి:')}</strong> {vehicle.condition}</p>
                      <p><strong>{label('Status:', 'స్థితి:')}</strong> <span className={vehicle.availability === 'Available' ? 'text-green-600' : 'text-orange-600'}>{vehicle.availability}</span></p>
                    </div>
                    <Button className="w-full" size="sm">{label('Book Vehicle', 'వాహనాన్ని బుక్ చేయండి')}</Button>
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
