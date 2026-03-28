
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Navigation, MapPin, Loader2 } from 'lucide-react';
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
import SavedAddressPicker from '@/components/SavedAddressPicker';
import { useSavedFormAddresses, SavedFormAddress } from '@/hooks/useSavedFormAddresses';
import { useLanguage } from '@/contexts/LanguageContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { detectUserLocation, calculateDistance } from '@/utils/locationUtils';

const WORKER_TYPE_OPTIONS = ['Field Worker', 'Harvester', 'Planting Specialist', 'Irrigation Expert', 'Pesticide Applicator', 'General Laborer', 'Equipment Operator', 'Supervisor'];
const WORKER_CATEGORIES = ['Single', 'Group'];

const FarmWorker = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [locationMode, setLocationMode] = useState<'nearby' | 'manual'>('nearby');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('');
  const [selectedMandal, setSelectedMandal] = useState('');
  const [selectedVillage, setSelectedVillage] = useState('');
  const [selectedWorkerTypes, setSelectedWorkerTypes] = useState<string[]>([]);
  const [workerCategory, setWorkerCategory] = useState('');
  const [numberOfWorkers, setNumberOfWorkers] = useState('');
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearched, setIsSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [workerTypeDropdownOpen, setWorkerTypeDropdownOpen] = useState(false);
  const [detectingNearby, setDetectingNearby] = useState(false);
  const [userCoords, setUserCoords] = useState<{ lat: number; lon: number } | null>(null);

  const { addresses: savedAddresses, saveAddress, deleteAddress, isLimitReached } = useSavedFormAddresses();

  const label = (en: string, te: string) => language === 'te' ? te : en;

  const getDisplayName = (item: { name: string; nameTe?: string }) => {
    if (language === 'te' && item.nameTe) return item.nameTe;
    return item.name;
  };

  // Auto-detect location when nearby mode is active
  useEffect(() => {
    if (locationMode === 'nearby' && !userCoords && !detectingNearby) {
      handleDetectNearby();
    }
  }, [locationMode]);

  useEffect(() => { setSelectedState(''); setSelectedDistrict(''); setSelectedDivision(''); setSelectedMandal(''); setSelectedVillage(''); }, [selectedCountry]);
  useEffect(() => { setSelectedDistrict(''); setSelectedDivision(''); setSelectedMandal(''); setSelectedVillage(''); }, [selectedState]);
  useEffect(() => { setSelectedDivision(''); setSelectedMandal(''); setSelectedVillage(''); }, [selectedDistrict]);
  useEffect(() => { setSelectedMandal(''); setSelectedVillage(''); }, [selectedDivision]);
  useEffect(() => { setSelectedVillage(''); }, [selectedMandal]);
  useEffect(() => { setNumberOfWorkers(''); }, [workerCategory]);

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

  const toggleWorkerType = (type: string) => {
    setSelectedWorkerTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const handleDetectNearby = async () => {
    setDetectingNearby(true);
    try {
      const loc = await detectUserLocation();
      setUserCoords({ lat: loc.latitude, lon: loc.longitude });
      toast.success(label('Location detected!', 'లొకేషన్ గుర్తించబడింది!'));
    } catch {
      toast.error(label('Could not detect location. Try Add Location instead.', 'లొకేషన్ గుర్తించలేకపోయింది. లొకేషన్ జోడించండి ప్రయత్నించండి.'));
    } finally {
      setDetectingNearby(false);
    }
  };

  const handleSearch = async () => {
    if (selectedWorkerTypes.length === 0 || !workerCategory || !startDate || !endDate) return;
    if (workerCategory === 'Group' && !numberOfWorkers) return;
    if (locationMode === 'manual' && (!selectedCountry || !selectedState || !selectedDistrict)) return;
    if (locationMode === 'manual' && districtHasDivisions && !selectedDivision) return;
    if (locationMode === 'nearby' && !userCoords) {
      toast.error(label('Please wait for location detection or use Add Location', 'దయచేసి లొకేషన్ గుర్తించే వరకు వేచి ఉండండి'));
      return;
    }

    if (locationMode === 'manual') {
      saveAddress({
        country: selectedCountry,
        state: selectedState,
        district: selectedDistrict,
        division: selectedDivision,
        mandal: selectedMandal,
        village: selectedVillage,
        workType: selectedWorkerTypes.join(', '),
        category: workerCategory,
      });
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('farm_workers' as any)
        .select('*')
        .eq('is_active', true)
        .overlaps('worker_types', selectedWorkerTypes);

      if (error) throw error;

      let results = ((data as any[]) || []).map((w: any) => ({
        id: w.id,
        name: w.name,
        type: (w.worker_types as string[]).filter((t: string) => selectedWorkerTypes.includes(t)).join(', '),
        experience: w.experience || 'N/A',
        rating: w.rating || 0,
        rate: `₹${w.daily_rate || 0}/day`,
        location: `${w.district || ''}, ${w.state || ''}`,
        availability: w.availability || 'Available',
        category: w.category || 'Single',
        avatar: w.photo_url || '',
        phone: w.phone || '',
        latitude: w.latitude,
        longitude: w.longitude,
        distance: undefined as number | undefined,
      }));

      // Calculate distance if nearby mode
      if (locationMode === 'nearby' && userCoords) {
        results = results.map(w => ({
          ...w,
          distance: w.latitude && w.longitude
            ? calculateDistance(userCoords.lat, userCoords.lon, w.latitude, w.longitude)
            : undefined,
        }));
        results.sort((a, b) => (a.distance ?? 9999) - (b.distance ?? 9999));
        results = results.filter(w => w.distance !== undefined && w.distance <= 500);
      }

      setSearchResults(results);
      setIsSearched(true);

      if (results.length === 0) {
        toast.info(label('No workers found matching your criteria', 'మీ ప్రమాణాలకు సరిపోయే కార్మికులు కనుగొనబడలేదు'));
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
    setSelectedWorkerTypes([]); setWorkerCategory(''); setNumberOfWorkers('');
    setStartDate(undefined); setEndDate(undefined);
    setSearchResults([]); setIsSearched(false); setLocationMode('nearby'); setUserCoords(null);
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
    setSelectedWorkerTypes(addr.workType ? addr.workType.split(', ') : []);
    setWorkerCategory(addr.category);
  };

  const isFormValid = selectedWorkerTypes.length > 0 && workerCategory && startDate && endDate && (workerCategory === 'Single' || numberOfWorkers) &&
    (locationMode === 'nearby' ? !!userCoords : (selectedCountry && selectedState && selectedDistrict && (!districtHasDivisions || selectedDivision)));

  return (
    <div className="min-h-screen bg-background">
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
        {/* Nearby / Add Location Toggle */}
        <div className="flex gap-2">
          <Button
            variant={locationMode === 'nearby' ? 'default' : 'outline'}
            className={cn('flex-1 gap-2', locationMode === 'nearby' && 'bg-[#2d5a27] hover:bg-[#1e3d1a] text-white')}
            onClick={() => { setLocationMode('nearby'); if (!userCoords) handleDetectNearby(); }}
            disabled={detectingNearby}
          >
            {detectingNearby ? <Loader2 className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4" />}
            {label('Nearby', 'సమీపంలో')}
          </Button>
          <Button
            variant={locationMode === 'manual' ? 'default' : 'outline'}
            className={cn('flex-1 gap-2', locationMode === 'manual' && 'bg-[#2d5a27] hover:bg-[#1e3d1a] text-white')}
            onClick={() => setLocationMode('manual')}
          >
            <MapPin className="h-4 w-4" />
            {label('+ Add Location', '+ లొకేషన్ జోడించండి')}
          </Button>
        </div>

        {locationMode === 'nearby' && userCoords && (
          <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 rounded-lg px-3 py-2">
            <Navigation className="h-4 w-4" />
            {label('GPS location detected — showing workers within 500km', 'GPS లొకేషన్ గుర్తించబడింది — 500 కి.మీ. లోపల కార్మికులు చూపబడుతాయి')}
          </div>
        )}

        {locationMode === 'manual' && (
          <SavedAddressPicker addresses={savedAddresses} onSelect={handleSelectSavedAddress} onDelete={deleteAddress} isLimitReached={isLimitReached} />
        )}

        <div className="space-y-4">
          {/* Location fields - only in manual mode */}
          {locationMode === 'manual' && (
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

          {/* Worker Type - Multi Select */}
          <div>
            <Label className="text-sm font-medium">{label('Worker Type *', 'కార్మిక రకం *')}</Label>
            <Popover open={workerTypeDropdownOpen} onOpenChange={setWorkerTypeDropdownOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-between mt-1 font-normal h-auto min-h-10 text-left">
                  {selectedWorkerTypes.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {selectedWorkerTypes.map(t => (
                        <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                      ))}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">{label('Select worker types', 'కార్మిక రకాలు ఎంచుకోండి')}</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                <div className="max-h-60 overflow-y-auto">
                  {WORKER_TYPE_OPTIONS.map((type) => {
                    const isSelected = selectedWorkerTypes.includes(type);
                    return (
                      <button
                        key={type}
                        onClick={() => toggleWorkerType(type)}
                        className={cn(
                          "flex items-center gap-2 w-full px-3 py-2.5 text-sm text-left hover:bg-accent transition-colors",
                          isSelected && "bg-accent/50"
                        )}
                      >
                        <div className={cn(
                          "h-4 w-4 rounded border flex items-center justify-center shrink-0",
                          isSelected ? "bg-primary border-primary text-primary-foreground" : "border-input"
                        )}>
                          {isSelected && <Check className="h-3 w-3" />}
                        </div>
                        {type}
                      </button>
                    );
                  })}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Category */}
          <div>
            <Label className="text-sm font-medium">{label('Category *', 'వర్గం *')}</Label>
            <Select value={workerCategory} onValueChange={setWorkerCategory}>
              <SelectTrigger className="mt-1"><SelectValue placeholder={label('Single or Group', 'ఒంటరి లేదా గ్రూపు')} /></SelectTrigger>
              <SelectContent>{WORKER_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
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
          <Button onClick={handleSearch} disabled={!isFormValid || isLoading} className="flex-1 bg-[#2d5a27] hover:bg-[#1e3d1a] text-white">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
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
                <div key={worker.id} className="border border-border rounded-lg p-4 space-y-3 bg-card">
                  <div className="flex gap-3 items-start">
                    <Avatar className="h-14 w-14 shrink-0">
                      <AvatarImage src={worker.avatar} alt={worker.name} />
                      <AvatarFallback className="bg-primary/10 text-primary text-lg">{worker.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold">{worker.name}</h4>
                          <p className="text-sm text-muted-foreground">{worker.type} - {worker.category}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-semibold text-green-600">{worker.rate}</p>
                          <p className="text-sm text-yellow-600">★ {worker.rating}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  {worker.distance !== undefined && (
                    <Badge variant="outline" className="text-xs text-blue-600 border-blue-200">
                      📍 {worker.distance.toFixed(1)} km away
                    </Badge>
                  )}
                  {workerCategory === 'Group' && <p className="text-sm text-primary">{label(`Available for ${numberOfWorkers} workers`, `${numberOfWorkers} మంది కార్మికుల కోసం అందుబాటులో ఉంది`)}</p>}
                  <div className="text-sm space-y-1">
                    <p><strong>{label('Experience:', 'అనుభవం:')}</strong> {worker.experience}</p>
                    <p><strong>{label('Location:', 'ప్రాంతం:')}</strong> {worker.location}</p>
                    <p><strong>{label('Phone:', 'ఫోన్:')}</strong> {worker.phone}</p>
                    <p><strong>{label('Status:', 'స్థితి:')}</strong> <span className="text-green-600">{worker.availability}</span></p>
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
