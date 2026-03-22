
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
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
import LocationDetector from '@/components/LocationDetector';
import SavedAddressPicker from '@/components/SavedAddressPicker';
import { useSavedFormAddresses, SavedFormAddress } from '@/hooks/useSavedFormAddresses';
import { useLanguage } from '@/contexts/LanguageContext';

const FarmWorker = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('');
  const [selectedMandal, setSelectedMandal] = useState('');
  const [selectedVillage, setSelectedVillage] = useState('');
  const [workerTypes, setWorkerTypes] = useState<string[]>([]);
  const [workerCategory, setWorkerCategory] = useState('');
  const [numberOfWorkers, setNumberOfWorkers] = useState('');
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
  useEffect(() => { setNumberOfWorkers(''); }, [workerCategory]);

  const workerTypes = ['Field Worker', 'Harvester', 'Planting Specialist', 'Irrigation Expert', 'Pesticide Applicator', 'General Laborer', 'Equipment Operator', 'Supervisor'];
  const workerCategories = ['Single', 'Group'];

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
    if (!selectedCountry || !selectedState || !selectedDistrict || !workerType || !workerCategory || !startDate || !endDate) return;
    if (districtHasDivisions && !selectedDivision) return;
    if (workerCategory === 'Group' && !numberOfWorkers) return;

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
    setWorkerType(addr.workType);
    setWorkerCategory(addr.category);
  };

  const isFormValid = selectedCountry && selectedState && selectedDistrict && (!districtHasDivisions || selectedDivision) && workerType && workerCategory && startDate && endDate && (workerCategory === 'Single' || numberOfWorkers);

  const label = (en: string, te: string) => language === 'te' ? te : en;

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-[#2d5a27] text-white">
        <div className="flex items-center justify-between px-4 py-4">
          <button onClick={() => { if (window.history.length > 1) navigate(-1); else navigate('/'); }} className="p-1">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-bold">{label('Find Farm Workers', 'వ్యవసాయ కార్మికులు కనుగొనండి')}</h1>
          <div className="w-5" />
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
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

        {/* Location Fields */}
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium">{label('Country *', 'దేశం *')}</Label>
            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
              <SelectTrigger className="mt-1"><SelectValue placeholder={label('Select country', 'దేశం ఎంచుకోండి')} /></SelectTrigger>
              <SelectContent>{countries.map((c) => <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm font-medium">{label('State *', 'రాష్ట్రం *')}</Label>
            <Select value={selectedState} onValueChange={setSelectedState} disabled={!selectedCountry}>
              <SelectTrigger className="mt-1"><SelectValue placeholder={label('Select state', 'రాష్ట్రం ఎంచుకోండి')} /></SelectTrigger>
              <SelectContent>{getAvailableStates().map((s) => <SelectItem key={s.code} value={s.code}>{s.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm font-medium">{label('District *', 'జిల్లా *')}</Label>
            <Select value={selectedDistrict} onValueChange={setSelectedDistrict} disabled={!selectedState}>
              <SelectTrigger className="mt-1"><SelectValue placeholder={label('Select district', 'జిల్లా ఎంచుకోండి')} /></SelectTrigger>
              <SelectContent>{getAvailableDistricts().map((d) => <SelectItem key={d.code} value={d.code}>{getDisplayName(d)}</SelectItem>)}</SelectContent>
            </Select>
          </div>

          {districtHasDivisions && (
            <div>
              <Label className="text-sm font-medium">{label('Division *', 'డివిజన్ *')}</Label>
              <Select value={selectedDivision} onValueChange={setSelectedDivision} disabled={!selectedDistrict}>
                <SelectTrigger className="mt-1"><SelectValue placeholder={label('Select division', 'డివిజన్ ఎంచుకోండి')} /></SelectTrigger>
                <SelectContent>{getAvailableDivisions().map((d) => <SelectItem key={d.code} value={d.code}>{d.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label className="text-sm font-medium">{label('Mandal', 'మండలం')}</Label>
            {getAvailableMandals().length > 0 ? (
              <Select value={selectedMandal} onValueChange={setSelectedMandal} disabled={districtHasDivisions ? !selectedDivision : !selectedDistrict}>
                <SelectTrigger className="mt-1"><SelectValue placeholder={label('Select mandal', 'మండలం ఎంచుకోండి')} /></SelectTrigger>
                <SelectContent>{getAvailableMandals().map((m) => <SelectItem key={m.code} value={m.code}>{getDisplayName(m)}</SelectItem>)}</SelectContent>
              </Select>
            ) : (
              <Input className="mt-1" placeholder={label('Enter mandal', 'మండలం నమోదు చేయండి')} value={selectedMandal} onChange={(e) => setSelectedMandal(e.target.value)} disabled={districtHasDivisions ? !selectedDivision : !selectedDistrict} />
            )}
          </div>
          <div>
            <Label className="text-sm font-medium">{label('Village', 'గ్రామం')}</Label>
            {getAvailableVillages().length > 0 ? (
              <Select value={selectedVillage} onValueChange={setSelectedVillage} disabled={!selectedMandal}>
                <SelectTrigger className="mt-1"><SelectValue placeholder={label('Select village', 'గ్రామం ఎంచుకోండి')} /></SelectTrigger>
                <SelectContent>{getAvailableVillages().map((v) => <SelectItem key={v.code} value={v.code}>{v.name}</SelectItem>)}</SelectContent>
              </Select>
            ) : (
              <Input className="mt-1" placeholder={label('Enter village', 'గ్రామం నమోదు చేయండి')} value={selectedVillage} onChange={(e) => setSelectedVillage(e.target.value)} disabled={!selectedMandal} />
            )}
          </div>

          {/* Worker Type */}
          <div>
            <Label className="text-sm font-medium">{label('Worker Type *', 'కార్మిక రకం *')}</Label>
            <Select value={workerType} onValueChange={setWorkerType}>
              <SelectTrigger className="mt-1"><SelectValue placeholder={label('Select worker type', 'కార్మిక రకం ఎంచుకోండి')} /></SelectTrigger>
              <SelectContent>{workerTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm font-medium">{label('Category *', 'వర్గం *')}</Label>
            <Select value={workerCategory} onValueChange={setWorkerCategory}>
              <SelectTrigger className="mt-1"><SelectValue placeholder={label('Single or Group', 'ఒంటరి లేదా గ్రూపు')} /></SelectTrigger>
              <SelectContent>{workerCategories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          {workerCategory === 'Group' && (
            <div>
              <Label className="text-sm font-medium">{label('Number of Workers *', 'కార్మికుల సంఖ్య *')}</Label>
              <Input className="mt-1" type="number" placeholder={label('Enter number', 'సంఖ్య నమోదు చేయండి')} value={numberOfWorkers} onChange={(e) => setNumberOfWorkers(e.target.value)} min="2" max="50" />
            </div>
          )}

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">{label('Start Date *', 'ప్రారంభ తేదీ *')}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal mt-1", !startDate && "text-muted-foreground")}>
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
              <Label className="text-sm font-medium">{label('End Date *', 'ముగింపు తేదీ *')}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal mt-1", !endDate && "text-muted-foreground")}>
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
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button onClick={handleSearch} disabled={!isFormValid} className="flex-1 bg-[#2d5a27] hover:bg-[#1e3d1a] text-white">
            {label('Search Workers', 'కార్మికులను వెతకండి')}
          </Button>
          <Button variant="outline" onClick={resetForm}>{label('Reset', 'రీసెట్')}</Button>
        </div>

        {/* Search Results */}
        {isSearched && (
          <div className="space-y-4 pb-8">
            <h3 className="text-lg font-semibold">{label('Available Workers', 'అందుబాటులో ఉన్న కార్మికులు')} ({searchResults.length})</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {searchResults.map((worker) => (
                <div key={worker.id} className="border border-border rounded-lg p-4 space-y-2 bg-card">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">{worker.name}</h4>
                      <p className="text-sm text-muted-foreground">{worker.type} - {worker.category}</p>
                      {workerCategory === 'Group' && <p className="text-sm text-primary">{label(`Available for ${numberOfWorkers} workers`, `${numberOfWorkers} మంది కార్మికుల కోసం అందుబాటులో ఉంది`)}</p>}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">{worker.rate}</p>
                      <p className="text-sm text-yellow-600">★ {worker.rating}</p>
                    </div>
                  </div>
                  <div className="text-sm space-y-1">
                    <p><strong>{label('Experience:', 'అనుభవం:')}</strong> {worker.experience}</p>
                    <p><strong>{label('Location:', 'ప్రాంతం:')}</strong> {worker.location}</p>
                    <p><strong>{label('Status:', 'స్థితి:')}</strong> <span className={worker.availability === 'Available' ? 'text-green-600' : 'text-orange-600'}>{worker.availability}</span></p>
                  </div>
                  <Button className="w-full" size="sm">{label('Contact Worker', 'కార్మికుడిని సంప్రదించండి')}</Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FarmWorker;
