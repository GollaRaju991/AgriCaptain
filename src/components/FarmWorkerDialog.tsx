
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Navigation, MapPin, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { countries, states, districts, divisions, mandals, villages, getMandalsForDistrict, hasDivisions } from '@/data/locationData';
import SavedAddressPicker from './SavedAddressPicker';
import { useSavedFormAddresses, SavedFormAddress } from '@/hooks/useSavedFormAddresses';
import { useLanguage } from '@/contexts/LanguageContext';
import { detectUserLocation, calculateDistance } from '@/utils/locationUtils';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';

interface FarmWorkerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const FarmWorkerDialog: React.FC<FarmWorkerDialogProps> = ({ open, onOpenChange }) => {
  const { language } = useLanguage();
  const [locationMode, setLocationMode] = useState<'nearby' | 'manual'>('nearby');
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
  const [isLoading, setIsLoading] = useState(false);
  const [detectingNearby, setDetectingNearby] = useState(false);
  const [userCoords, setUserCoords] = useState<{ lat: number; lon: number } | null>(null);
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
  useEffect(() => { setNumberOfWorkers(''); }, [workerCategory]);

  // Auto-detect GPS when nearby mode is activated
  useEffect(() => {
    if (locationMode === 'nearby' && !userCoords && !detectingNearby) {
      handleDetectNearby();
    }
  }, [locationMode]);

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

  const handleSearch = async () => {
    if (!workerType || !workerCategory || !startDate || !endDate) return;
    if (workerCategory === 'Group' && !numberOfWorkers) return;
    if (locationMode === 'manual' && (!selectedCountry || !selectedState || !selectedDistrict)) return;
    if (locationMode === 'manual' && districtHasDivisions && !selectedDivision) return;

    if (locationMode === 'manual') {
      saveAddress({
        country: selectedCountry, state: selectedState, district: selectedDistrict,
        division: selectedDivision, mandal: selectedMandal, village: selectedVillage,
        workType: workerType, category: workerCategory,
      });
    }

    setIsLoading(true);
    try {
      let query = supabase
        .from('farm_workers' as any)
        .select('*')
        .eq('is_active', true)
        .contains('worker_types', [workerType]);

      if (locationMode === 'manual') {
        if (selectedState) query = query.ilike('state', `%${selectedState}%`);
        if (selectedDistrict) query = query.ilike('district', `%${selectedDistrict}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      const workers = (data as any[]) || [];
      let results = workers.map((w: any) => ({
        id: w.id,
        name: w.name,
        type: workerType,
        experience: w.experience || 'N/A',
        rating: w.rating || 0,
        rate: `₹${w.daily_rate || 0}/day`,
        location: `${w.district || ''}, ${w.state || ''}`,
        availability: w.availability || 'Available',
        category: w.category || workerCategory,
        avatar: w.photo_url || '',
        phone: w.phone || '',
        latitude: w.latitude,
        longitude: w.longitude,
        distance: userCoords && w.latitude && w.longitude
          ? calculateDistance(userCoords.lat, userCoords.lon, w.latitude, w.longitude)
          : undefined,
      }));

      if (locationMode === 'nearby' && userCoords) {
        results = results.filter((w: any) => w.distance !== undefined && w.distance <= 500);
        results.sort((a: any, b: any) => (a.distance ?? 9999) - (b.distance ?? 9999));
      }

      setSearchResults(results);
      setIsSearched(true);

      if (results.length === 0) {
        toast.info(label('No workers found', 'కార్మికులు కనుగొనబడలేదు'));
      }
    } catch (err) {
      console.error('Error searching workers:', err);
      toast.error(label('Failed to search workers', 'కార్మికులను వెతకడంలో విఫలమైంది'));
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedCountry(''); setSelectedState(''); setSelectedDistrict(''); setSelectedDivision(''); setSelectedMandal(''); setSelectedVillage('');
    setWorkerType(''); setWorkerCategory(''); setNumberOfWorkers('');
    setStartDate(undefined); setEndDate(undefined);
    setSearchResults([]); setIsSearched(false); setLocationMode('nearby'); setUserCoords(null);
  };

  const findCodeByName = (list: { code: string; name: string }[], name: string) => {
    if (!name || !list) return '';
    const lower = name.toLowerCase();
    const match = list.find(item => item.name.toLowerCase().includes(lower) || lower.includes(item.name.toLowerCase()));
    return match?.code || '';
  };

  const handleSelectSavedAddress = (addr: SavedFormAddress) => {
    setLocationMode('manual');
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

  const isFormValid = workerType && workerCategory && startDate && endDate && (workerCategory === 'Single' || numberOfWorkers) &&
    (locationMode === 'nearby' || (selectedCountry && selectedState && selectedDistrict && (!districtHasDivisions || selectedDivision)));

  const label = (en: string, te: string) => language === 'te' ? te : en;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{label('Find Farm Workers', 'వ్యవసాయ కార్మికులు కనుగొనండి')}</DialogTitle>
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
                  ? label('📍 Nearby mode — showing workers within 500 km of your location', '📍 సమీప మోడ్ — మీ లొకేషన్ నుండి 500 కి.మీ లోపల కార్మికులు')
                  : detectingNearby
                    ? label('Detecting your location...', 'మీ లొకేషన్ గుర్తిస్తోంది...')
                    : label('Click search to detect location and find nearby workers', 'సమీప కార్మికులను కనుగొనడానికి వెతకండి నొక్కండి')
                }
              </p>
            </div>
          )}

          {/* Manual Location Fields */}
          {locationMode === 'manual' && (
            <>
              <SavedAddressPicker
                addresses={savedAddresses}
                onSelect={handleSelectSavedAddress}
                onDelete={deleteAddress}
                isLimitReached={isLimitReached}
              />

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

          {/* Worker Type and Category */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>{label('Worker Type *', 'కార్మిక రకం *')}</Label>
              <Select value={workerType} onValueChange={setWorkerType}>
                <SelectTrigger><SelectValue placeholder={label('Select worker type', 'కార్మిక రకం ఎంచుకోండి')} /></SelectTrigger>
                <SelectContent>{workerTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>{label('Category *', 'వర్గం *')}</Label>
              <Select value={workerCategory} onValueChange={setWorkerCategory}>
                <SelectTrigger><SelectValue placeholder={label('Single or Group', 'ఒంటరి లేదా గ్రూపు')} /></SelectTrigger>
                <SelectContent>{workerCategories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            {workerCategory === 'Group' && (
              <div>
                <Label>{label('Number of Workers *', 'కార్మికుల సంఖ్య *')}</Label>
                <Input type="number" placeholder={label('Enter number', 'సంఖ్య నమోదు చేయండి')} value={numberOfWorkers} onChange={(e) => setNumberOfWorkers(e.target.value)} min="2" max="50" />
              </div>
            )}
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            <Button onClick={handleSearch} disabled={!isFormValid || isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {label('Search Workers', 'కార్మికులను వెతకండి')}
            </Button>
            <Button variant="outline" onClick={resetForm}>{label('Reset', 'రీసెట్')}</Button>
          </div>

          {isSearched && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">{label('Available Workers', 'అందుబాటులో ఉన్న కార్మికులు')} ({searchResults.length})</h3>
              {searchResults.length === 0 ? (
                <div className="text-center py-8 bg-muted/30 rounded-lg">
                  <p className="text-muted-foreground">{label('No workers found matching your criteria.', 'మీ ప్రమాణాలకు సరిపోలే కార్మికులు కనుగొనబడలేదు.')}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {searchResults.map((worker) => (
                    <div key={worker.id} className="border border-border rounded-lg p-4 space-y-2">
                      <div className="flex gap-3 items-start">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={worker.avatar} alt={worker.name} />
                          <AvatarFallback>{worker.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <div>
                              <h4 className="font-semibold">{worker.name}</h4>
                              <p className="text-sm text-muted-foreground">{worker.type} - {worker.category}</p>
                              {worker.phone && <p className="text-xs text-muted-foreground">{worker.phone}</p>}
                              {workerCategory === 'Group' && <p className="text-sm text-primary">{label(`Available for ${numberOfWorkers} workers`, `${numberOfWorkers} మంది కార్మికుల కోసం అందుబాటులో ఉంది`)}</p>}
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-green-600">{worker.rate}</p>
                              <p className="text-sm text-yellow-600">★ {worker.rating}</p>
                              {worker.distance !== undefined && (
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{worker.distance} km</span>
                              )}
                            </div>
                          </div>
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
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FarmWorkerDialog;
