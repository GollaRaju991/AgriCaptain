
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, X, Navigation, MapPin, Loader2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { countries, states, districts, divisions, mandals, villages, getMandalsForDistrict, hasDivisions } from '@/data/locationData';
import SavedAddressPicker from './SavedAddressPicker';
import { useSavedFormAddresses, SavedFormAddress } from '@/hooks/useSavedFormAddresses';
import { useLanguage } from '@/contexts/LanguageContext';
import { detectUserLocation, calculateDistance } from '@/utils/locationUtils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const VEHICLE_TYPES = ['Auto', 'Mini Truck', 'Tractor', 'Lorry', 'Other'];

interface RentVehicleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const RentVehicleDialog: React.FC<RentVehicleDialogProps> = ({ open, onOpenChange }) => {
  const { language } = useLanguage();
  const [locationMode, setLocationMode] = useState<'nearby' | 'manual'>('nearby');
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
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearched, setIsSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [detectingNearby, setDetectingNearby] = useState(false);
  const [userCoords, setUserCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [vehicleDropdownOpen, setVehicleDropdownOpen] = useState(false);
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);
  const today = new Date(); today.setHours(0, 0, 0, 0);

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

  // Auto-detect GPS when nearby mode is activated
  useEffect(() => {
    if (locationMode === 'nearby' && !userCoords && !detectingNearby) {
      handleDetectNearby();
    }
  }, [locationMode]);

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
      toast.error(label('Could not detect location', 'లొకేషన్ గుర్తించలేకపోయింది'));
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
    if (effectiveTypes.length === 0 || !startDate || !endDate) return;
    if (endDate < startDate) {
      toast.error(label('End date cannot be earlier than start date', 'ముగింపు తేదీ ప్రారంభ తేదీ కంటే ముందు ఉండకూడదు'));
      return;
    }
    if (locationMode === 'manual' && (!selectedCountry || !selectedState || !selectedDistrict)) return;

    setIsLoading(true);
    try {
      let query = supabase
        .from('vehicle_listings')
        .select('*')
        .eq('is_active', true)
        .eq('availability', 'Available')
        .in('vehicle_type', effectiveTypes);

      if (locationMode === 'manual') {
        if (selectedState) query = query.ilike('state', `%${selectedState}%`);
        if (selectedDistrict) query = query.ilike('district', `%${selectedDistrict}%`);
      }

      const { data, error } = await query;
      if (error) { toast.error('Error fetching vehicles'); return; }

      let results = (data || []).map((v: any) => ({
        ...v,
        distance: userCoords && v.latitude && v.longitude
          ? calculateDistance(userCoords.lat, userCoords.lon, v.latitude, v.longitude)
          : undefined,
      }));

      if (locationMode === 'nearby' && userCoords) {
        results = results.filter((v: any) => v.distance !== undefined && v.distance <= 500);
        results.sort((a: any, b: any) => (a.distance ?? 9999) - (b.distance ?? 9999));
      }

      if (locationMode === 'manual' && selectedCountry && selectedState && selectedDistrict) {
        saveAddress({ country: selectedCountry, state: selectedState, district: selectedDistrict, division: selectedDivision, mandal: selectedMandal, village: selectedVillage, workType: effectiveTypes.join(', '), category: 'Vehicle' });
      }

      setSearchResults(results);
      setIsSearched(true);
      if (results.length === 0) toast.info(label('No vehicles found yet. Partner vehicles will appear once listed.', 'వాహనాలు కనుగొనబడలేదు.'));
    } catch {
      toast.error('Search failed');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedCountry(''); setSelectedState(''); setSelectedDistrict(''); setSelectedDivision(''); setSelectedMandal(''); setSelectedVillage('');
    setSelectedVehicleTypes([]); setCustomVehicleType(''); setStartDate(undefined); setEndDate(undefined);
    setSearchResults([]); setIsSearched(false); setLocationMode('nearby'); setUserCoords(null);
  };

  const handleSelectSavedAddress = (addr: SavedFormAddress) => {
    setLocationMode('manual');
    setSelectedCountry(addr.country);
    setTimeout(() => { setSelectedState(addr.state);
      setTimeout(() => { setSelectedDistrict(addr.district);
        setTimeout(() => { setSelectedDivision(addr.division);
          setTimeout(() => { setSelectedMandal(addr.mandal);
            setTimeout(() => { setSelectedVillage(addr.village); }, 50);
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
  const isFormValid = effectiveTypes.length > 0 && startDate && endDate &&
    (locationMode === 'nearby' || (selectedCountry && selectedState && selectedDistrict && (!districtHasDivisions || selectedDivision)));

  const label = (en: string, te: string) => language === 'te' ? te : en;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{label('Rent Farm Vehicles', 'వ్యవసాయ వాహనాలు అద్దెకు తీసుకోండి')}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Location Mode Toggle Buttons */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant={locationMode === 'nearby' ? 'default' : 'outline'}
              className={cn(
                'gap-2 flex-1 sm:flex-none',
                locationMode === 'nearby' && 'bg-[#2d5a27] hover:bg-[#1e3d1a] text-white'
              )}
              onClick={() => setLocationMode('nearby')}
            >
              {detectingNearby && locationMode === 'nearby' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Navigation className="h-4 w-4" />
              )}
              {label('Nearby', 'సమీపంలో')}
            </Button>
            <Button
              type="button"
              variant={locationMode === 'manual' ? 'default' : 'outline'}
              className={cn(
                'gap-2 flex-1 sm:flex-none',
                locationMode === 'manual' && 'bg-[#2d5a27] hover:bg-[#1e3d1a] text-white'
              )}
              onClick={() => setLocationMode('manual')}
            >
              <MapPin className="h-4 w-4" />
              {label('+ Add Location', '+ లొకేషన్ జోడించండి')}
            </Button>
          </div>

          {/* Nearby Mode Info */}
          {locationMode === 'nearby' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <Navigation className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-green-800">
                {userCoords
                  ? label('📍 Nearby mode — showing vehicles within 500 km', '📍 సమీప మోడ్ — 500 కి.మీ లోపల వాహనాలు')
                  : detectingNearby
                    ? label('Detecting your location...', 'మీ లొకేషన్ గుర్తిస్తోంది...')
                    : label('Click search to detect location and find nearby vehicles', 'సమీప వాహనాలను కనుగొనడానికి వెతకండి నొక్కండి')
                }
              </p>
            </div>
          )}

          {/* Manual Location Fields */}
          {locationMode === 'manual' && (
            <>
              <SavedAddressPicker addresses={savedAddresses} onSelect={handleSelectSavedAddress} onDelete={deleteAddress} isLimitReached={isLimitReached} />

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
                    <Input placeholder={label('Enter mandal', 'మండలం నమోదు చేయండి')} value={selectedMandal} onChange={(e) => setSelectedMandal(e.target.value)} disabled={districtHasDivisions ? !selectedDivision : !selectedDistrict} />
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
                    <Input placeholder={label('Enter village', 'గ్రామం నమోదు చేయండి')} value={selectedVillage} onChange={(e) => setSelectedVillage(e.target.value)} disabled={!selectedMandal} />
                  )}
                </div>
              </div>
            </>
          )}

          {/* Vehicle Type Multi-Select */}
          <div>
            <Label>{label('Vehicle Type *', 'వాహన రకం *')}</Label>
            {selectedVehicleTypes.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2 mb-2">
                {selectedVehicleTypes.map(type => (
                  <span key={type} className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-[#2d5a27] text-white">
                    {type === 'Other' && customVehicleType ? `Other: ${customVehicleType}` : type}
                    <button onClick={() => removeVehicleType(type)} className="ml-1 hover:bg-white/20 rounded-full p-0.5"><X className="h-3 w-3" /></button>
                  </span>
                ))}
              </div>
            )}
            <Popover open={vehicleDropdownOpen} onOpenChange={setVehicleDropdownOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  {selectedVehicleTypes.length === 0
                    ? <span className="text-muted-foreground">{label('Select vehicle types', 'వాహన రకాలు ఎంచుకోండి')}</span>
                    : <span>{selectedVehicleTypes.length} {label('selected', 'ఎంచుకున్నారు')}</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-2" align="start">
                <div className="space-y-1">
                  {VEHICLE_TYPES.map(type => (
                    <label key={type} className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-accent cursor-pointer">
                      <Checkbox checked={selectedVehicleTypes.includes(type)} onCheckedChange={() => toggleVehicleType(type)} />
                      <span className="text-sm">{type}</span>
                    </label>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
            {selectedVehicleTypes.includes('Other') && (
              <Input className="mt-2" placeholder={label('Enter custom vehicle type', 'అనుకూల వాహన రకాన్ని నమోదు చేయండి')} value={customVehicleType} onChange={(e) => setCustomVehicleType(e.target.value)} />
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>{label('Start Date *', 'ప్రారంభ తేదీ *')}</Label>
              <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !startDate && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : <span>{label('Pick start date', 'ప్రారంభ తేదీ ఎంచుకోండి')}</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={startDate} onSelect={(d) => { setStartDate(d); setStartDateOpen(false); if (d && endDate && endDate < d) setEndDate(undefined); }} disabled={(date) => date < today} initialFocus className="pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label>{label('End Date *', 'ముగింపు తేదీ *')}</Label>
              <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !endDate && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : <span>{label('Pick end date', 'ముగింపు తేదీ ఎంచుకోండి')}</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={endDate} onSelect={(d) => { setEndDate(d); setEndDateOpen(false); }} disabled={(date) => date < (startDate || today)} initialFocus className="pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSearch} disabled={!isFormValid || isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {label('Search Vehicles', 'వాహనాలను వెతకండి')}
            </Button>
            <Button variant="outline" onClick={resetForm}>{label('Reset', 'రీసెట్')}</Button>
          </div>

          {isSearched && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">{label('Available Vehicles', 'అందుబాటులో ఉన్న వాహనాలు')} ({searchResults.length})</h3>
              {searchResults.length === 0 ? (
                <div className="text-center py-8 bg-muted/30 rounded-lg">
                  <p className="text-muted-foreground">{label('No vehicles available yet. Partner vehicles will appear once listed.', 'ఇంకా వాహనాలు అందుబాటులో లేవు.')}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {searchResults.map((vehicle: any) => (
                    <div key={vehicle.id} className="border border-border rounded-lg p-4 space-y-2">
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
                      </div>
                      <Button className="w-full" size="sm">{label('Book Vehicle', 'వాహనాన్ని బుక్ చేయండి')}</Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RentVehicleDialog;
