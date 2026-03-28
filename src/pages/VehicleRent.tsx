
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, X, Navigation, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { countries, states, districts, divisions, mandals, villages, getMandalsForDistrict, hasDivisions } from '@/data/locationData';
import LocationDetector from '@/components/LocationDetector';
import SavedAddressPicker from '@/components/SavedAddressPicker';
import { useSavedFormAddresses, SavedFormAddress } from '@/hooks/useSavedFormAddresses';
import { useLanguage } from '@/contexts/LanguageContext';
import { detectUserLocation, calculateDistance } from '@/utils/locationUtils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const VEHICLE_TYPES = ['Auto', 'Mini Truck', 'Tractor', 'Lorry', 'Other'];

interface VehicleListing {
  id: string;
  owner_name: string;
  owner_phone: string;
  vehicle_type: string;
  vehicle_name: string | null;
  model_year: string | null;
  daily_rate: number;
  condition: string;
  availability: string;
  district: string | null;
  state: string | null;
  mandal: string | null;
  village: string | null;
  latitude: number | null;
  longitude: number | null;
  location_address: string | null;
  vehicle_images: string[] | null;
  description: string | null;
  distance?: number;
}

const VehicleRent = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('');
  const [selectedMandal, setSelectedMandal] = useState('');
  const [selectedVillage, setSelectedVillage] = useState('');
  const [selectedVehicleTypes, setSelectedVehicleTypes] = useState<string[]>([]);
  const [customVehicleType, setCustomVehicleType] = useState('');
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [searchResults, setSearchResults] = useState<VehicleListing[]>([]);
  const [isSearched, setIsSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [locationMode, setLocationMode] = useState<'nearby' | 'manual'>('nearby');
  const [detectingNearby, setDetectingNearby] = useState(false);
  const [userCoords, setUserCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [vehicleDropdownOpen, setVehicleDropdownOpen] = useState(false);

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

  const toggleVehicleType = (type: string) => {
    setSelectedVehicleTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const removeVehicleType = (type: string) => {
    setSelectedVehicleTypes(prev => prev.filter(t => t !== type));
    if (type === 'Other') setCustomVehicleType('');
  };

  const handleDetectNearby = async () => {
    setDetectingNearby(true);
    try {
      const loc = await detectUserLocation();
      setUserCoords({ lat: loc.latitude, lon: loc.longitude });
      toast.success(label('Location detected!', 'లొకేషన్ గుర్తించబడింది!'));
    } catch {
      toast.error(label('Could not detect location. Try Add Location instead.', 'లొకేషన్ గుర్తించలేకపోయింది.'));
    } finally {
      setDetectingNearby(false);
    }
  };

  const getEffectiveVehicleTypes = () => {
    const types = selectedVehicleTypes.filter(t => t !== 'Other');
    if (selectedVehicleTypes.includes('Other') && customVehicleType.trim()) {
      types.push(customVehicleType.trim());
    }
    return types;
  };

  const handleSearch = async () => {
    const effectiveTypes = getEffectiveVehicleTypes();
    if (effectiveTypes.length === 0 || !startDate || !endDate) {
      toast.error(label('Please select vehicle types and dates', 'దయచేసి వాహన రకాలు మరియు తేదీలు ఎంచుకోండి'));
      return;
    }

    setIsLoading(true);
    try {
      // Query vehicle_listings from Supabase
      let query = supabase
        .from('vehicle_listings')
        .select('*')
        .eq('is_active', true)
        .eq('availability', 'Available')
        .in('vehicle_type', effectiveTypes);

      // If not using nearby, filter by location fields
      if (locationMode === 'manual') {
        if (selectedState) query = query.ilike('state', `%${selectedState}%`);
        if (selectedDistrict) query = query.ilike('district', `%${selectedDistrict}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching vehicles:', error);
        toast.error(label('Error fetching vehicles', 'వాహనాలు పొందడంలో లోపం'));
        return;
      }

      let results: VehicleListing[] = (data || []).map((v: any) => ({
        id: v.id,
        owner_name: v.owner_name,
        owner_phone: v.owner_phone,
        vehicle_type: v.vehicle_type,
        vehicle_name: v.vehicle_name,
        model_year: v.model_year,
        daily_rate: v.daily_rate,
        condition: v.condition,
        availability: v.availability,
        district: v.district,
        state: v.state,
        mandal: v.mandal,
        village: v.village,
        latitude: v.latitude,
        longitude: v.longitude,
        location_address: v.location_address,
        vehicle_images: v.vehicle_images,
        description: v.description,
      }));

      // Calculate distance if user coords available
      if (userCoords) {
        results = results.map(v => ({
          ...v,
          distance: v.latitude && v.longitude
            ? calculateDistance(userCoords.lat, userCoords.lon, v.latitude, v.longitude)
            : undefined,
        }));
        // Sort by distance
        results.sort((a, b) => (a.distance ?? 9999) - (b.distance ?? 9999));
        // If nearby active, only show within 500km
        if (locationMode === 'nearby') {
          results = results.filter(v => v.distance !== undefined && v.distance <= 500);
        }
      }

      // Save address for future use
      if (selectedCountry && selectedState && selectedDistrict) {
        saveAddress({
          country: selectedCountry,
          state: selectedState,
          district: selectedDistrict,
          division: selectedDivision,
          mandal: selectedMandal,
          village: selectedVillage,
          workType: effectiveTypes.join(', '),
          category: 'Vehicle',
        });
      }

      setSearchResults(results);
      setIsSearched(true);

      if (results.length === 0) {
        toast.info(label('No vehicles found. Partner vehicles will appear here once listed.', 'వాహనాలు కనుగొనబడలేదు. భాగస్వామి వాహనాలు జాబితా చేసిన తర్వాత ఇక్కడ కనిపిస్తాయి.'));
      }
    } catch (err) {
      console.error('Search error:', err);
      toast.error(label('Search failed', 'శోధన విఫలమైంది'));
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedCountry(''); setSelectedState(''); setSelectedDistrict(''); setSelectedDivision(''); setSelectedMandal(''); setSelectedVillage('');
    setSelectedVehicleTypes([]); setCustomVehicleType(''); setStartDate(undefined); setEndDate(undefined);
    setSearchResults([]); setIsSearched(false); setLocationMode('nearby'); setUserCoords(null);
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
    if (addr.workType) {
      const types = addr.workType.split(',').map(t => t.trim());
      setSelectedVehicleTypes(types.filter(t => VEHICLE_TYPES.includes(t)));
    }
  };

  const effectiveTypes = getEffectiveVehicleTypes();
  const isFormValid = effectiveTypes.length > 0 && startDate && endDate && (nearbyActive || (selectedCountry && selectedState && selectedDistrict && (!districtHasDivisions || selectedDivision)));

  const label = (en: string, te: string) => language === 'te' ? te : en;

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-50 bg-[#2d5a27] text-white">
        <div className="flex items-center justify-between px-4 py-4">
          <button onClick={() => { if (window.history.length > 1) navigate(-1); else navigate('/'); }} className="p-1">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-bold">{label('Rent Farm Vehicles', 'వ్యవసాయ వాహనాలు అద్దెకు తీసుకోండి')}</h1>
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

        <div className="flex gap-2">
          <LocationDetector 
            enabled={autoDetectLocation} 
            onLocationDetected={handleLocationDetected}
          />
          <Button
            variant={nearbyActive ? 'default' : 'outline'}
            className={cn('gap-1.5', nearbyActive && 'bg-[#2d5a27] hover:bg-[#1e3d1a] text-white')}
            onClick={handleNearby}
            disabled={detectingNearby}
          >
            {detectingNearby ? <Loader2 className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4" />}
            {label('Nearby', 'సమీపంలో')}
          </Button>
        </div>

        <div className="space-y-4">
          {!nearbyActive && (
            <>
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
            </>
          )}

          {nearbyActive && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <Navigation className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-green-800">
                {label('📍 Nearby mode active — showing vehicles within 500 km of your location', '📍 సమీప మోడ్ యాక్టివ్ — మీ లొకేషన్ నుండి 500 కి.మీ లోపల వాహనాలు')}
              </p>
            </div>
          )}

          {/* Vehicle Type Multi-Select */}
          <div>
            <Label className="text-sm font-medium">{label('Vehicle Type *', 'వాహన రకం *')}</Label>
            
            {selectedVehicleTypes.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2 mb-2">
                {selectedVehicleTypes.map(type => (
                  <span key={type} className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-[#2d5a27] text-white">
                    {type === 'Other' && customVehicleType ? `Other: ${customVehicleType}` : type}
                    <button onClick={() => removeVehicleType(type)} className="ml-1 hover:bg-white/20 rounded-full p-0.5">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            <Popover open={vehicleDropdownOpen} onOpenChange={setVehicleDropdownOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal mt-1">
                  {selectedVehicleTypes.length === 0
                    ? <span className="text-muted-foreground">{label('Select vehicle types', 'వాహన రకాలు ఎంచుకోండి')}</span>
                    : <span>{selectedVehicleTypes.length} {label('selected', 'ఎంచుకున్నారు')}</span>
                  }
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-2" align="start">
                <div className="space-y-1">
                  {VEHICLE_TYPES.map(type => (
                    <label key={type} className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-accent cursor-pointer">
                      <Checkbox
                        checked={selectedVehicleTypes.includes(type)}
                        onCheckedChange={() => toggleVehicleType(type)}
                      />
                      <span className="text-sm">{type}</span>
                    </label>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            {selectedVehicleTypes.includes('Other') && (
              <Input
                className="mt-2"
                placeholder={label('Enter custom vehicle type', 'అనుకూల వాహన రకాన్ని నమోదు చేయండి')}
                value={customVehicleType}
                onChange={(e) => setCustomVehicleType(e.target.value)}
              />
            )}
          </div>

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

        <div className="flex gap-3">
          <Button onClick={handleSearch} disabled={!isFormValid || isLoading} className="flex-1 bg-[#2d5a27] hover:bg-[#1e3d1a] text-white">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            {label('Search Vehicles', 'వాహనాలను వెతకండి')}
          </Button>
          <Button variant="outline" onClick={resetForm}>{label('Reset', 'రీసెట్')}</Button>
        </div>

        {/* Search Results */}
        {isSearched && (
          <div className="space-y-4 pb-8">
            <h3 className="text-lg font-semibold">{label('Available Vehicles', 'అందుబాటులో ఉన్న వాహనాలు')} ({searchResults.length})</h3>
            
            {searchResults.length === 0 ? (
              <div className="text-center py-12 bg-card border border-border rounded-lg">
                <p className="text-muted-foreground text-lg mb-2">{label('No vehicles available yet', 'ఇంకా వాహనాలు అందుబాటులో లేవు')}</p>
                <p className="text-sm text-muted-foreground">{label('Partner vehicles will appear here once they are listed on the Agrizin platform.', 'అగ్రిజిన్ ప్లాట్‌ఫాంలో జాబితా చేయబడిన తర్వాత భాగస్వామి వాహనాలు ఇక్కడ కనిపిస్తాయి.')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {searchResults.map((vehicle) => (
                  <div key={vehicle.id} className="border border-border rounded-lg p-4 space-y-2 bg-card">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold">{vehicle.vehicle_name || vehicle.vehicle_type}</h4>
                        <p className="text-sm text-muted-foreground">{vehicle.vehicle_type}{vehicle.model_year ? ` - ${vehicle.model_year}` : ''}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">₹{vehicle.daily_rate}/day</p>
                        {vehicle.distance !== undefined && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{vehicle.distance} km</span>
                        )}
                      </div>
                    </div>
                    <div className="text-sm space-y-1">
                      <p><strong>{label('Owner:', 'యజమాని:')}</strong> {vehicle.owner_name}</p>
                      <p><strong>{label('Phone:', 'ఫోన్:')}</strong> {vehicle.owner_phone}</p>
                      <p><strong>{label('Location:', 'ప్రాంతం:')}</strong> {vehicle.location_address || `${vehicle.district || ''}, ${vehicle.state || ''}`}</p>
                      <p><strong>{label('Condition:', 'పరిస్థితి:')}</strong> {vehicle.condition}</p>
                      <p><strong>{label('Status:', 'స్థితి:')}</strong> <span className="text-green-600">{vehicle.availability}</span></p>
                    </div>
                    <Button className="w-full" size="sm">{label('Book Vehicle', 'వాహనాన్ని బుక్ చేయండి')}</Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VehicleRent;
