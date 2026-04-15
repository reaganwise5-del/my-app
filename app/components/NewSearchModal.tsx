'use client';

import { useState, useRef } from 'react';
import Toggle from './Toggle';
import LocationInput from './LocationInput';
import { type Search } from '../lib/mockData';

const ALL_MAKES = [
  'Acura','Audi','BMW','Buick','Cadillac','Chevrolet','Chrysler','Dodge',
  'Ford','GMC','Honda','Hyundai','Infiniti','Jeep','Kia','Land Rover',
  'Lexus','Lincoln','Mazda','Mercedes-Benz','Mitsubishi','Nissan','Porsche',
  'Ram','Rolls-Royce','Subaru','Tesla','Toyota','Volkswagen','Volvo',
];

const STEPS = ['Location', 'Makes', 'Filters', 'Review'];

export default function NewSearchModal({
  onClose,
  editSearch,
  onSave,
  onAdd,
}: {
  onClose: () => void;
  editSearch?: Search;
  onSave?: (updated: Search) => void;
  onAdd?: (newSearch: Search) => void;
}) {
  const isEditing = !!editSearch;
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef<number | null>(null);
  const dragCurrentY = useRef(0);

  function onTouchStart(e: React.TouchEvent) {
    dragStartY.current = e.touches[0].clientY;
  }
  function onTouchMove(e: React.TouchEvent) {
    if (dragStartY.current === null) return;
    const dy = e.touches[0].clientY - dragStartY.current;
    if (dy < 0) return;
    dragCurrentY.current = dy;
    if (sheetRef.current) sheetRef.current.style.transform = `translateY(${dy}px)`;
  }
  function onTouchEnd() {
    if (dragCurrentY.current > 120) { onClose(); return; }
    if (sheetRef.current) sheetRef.current.style.transform = '';
    dragStartY.current = null;
    dragCurrentY.current = 0;
  }

  const [step, setStep] = useState(0);
  const [saved, setSaved] = useState(false);
  const [name, setName] = useState(editSearch?.name ?? '');
  const [location, setLocation] = useState(editSearch?.zipCode ?? '');
  const [radius, setRadius] = useState(String(editSearch?.radius ?? 50));
  const [anyMake, setAnyMake] = useState(editSearch ? editSearch.make === 'Any' : true);
  const [selectedMakes, setSelectedMakes] = useState<Set<string>>(
    editSearch && editSearch.make !== 'Any'
      ? new Set([editSearch.make])
      : new Set(ALL_MAKES)
  );
  const [minYear, setMinYear] = useState(editSearch?.minYear ? String(editSearch.minYear) : '');
  const [maxYear, setMaxYear] = useState(editSearch?.maxYear ? String(editSearch.maxYear) : '');
  const [maxMileage, setMaxMileage] = useState(editSearch?.maxMileage ? String(editSearch.maxMileage) : '');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState(editSearch?.maxPrice ? String(editSearch.maxPrice) : '');
  const [blockSalvage, setBlockSalvage] = useState(true);

  function toggleMake(make: string) {
    const next = new Set(selectedMakes);
    if (next.has(make)) next.delete(make); else next.add(make);
    setSelectedMakes(next);
  }

  function canNext() {
    if (step === 0) return name.trim().length > 0 && location.trim().length > 0;
    return true;
  }

  function handleSave() {
    if (isEditing && editSearch && onSave) {
      onSave({
        ...editSearch,
        name: name.trim(),
        zipCode: location,
        radius: Number(radius),
        make: anyMake ? 'Any' : (selectedMakes.size === 1 ? [...selectedMakes][0] : 'Any'),
        model: anyMake ? 'Any' : 'Any',
        minYear: minYear ? Number(minYear) : editSearch.minYear,
        maxYear: maxYear ? Number(maxYear) : editSearch.maxYear,
        maxMileage: maxMileage ? Number(maxMileage) : editSearch.maxMileage,
        maxPrice: maxPrice ? Number(maxPrice) : editSearch.maxPrice,
      });
      onClose();
    } else {
      // Build the new search object and pass it back to the parent
      const newSearch: Search = {
        id: String(Date.now()),
        name: name.trim(),
        zipCode: location,
        radius: Number(radius),
        make: anyMake ? 'Any' : (selectedMakes.size === 1 ? [...selectedMakes][0] : 'Any'),
        model: 'Any',
        minYear: minYear ? Number(minYear) : 2010,
        maxYear: maxYear ? Number(maxYear) : new Date().getFullYear(),
        maxMileage: maxMileage ? Number(maxMileage) : 150000,
        maxPrice: maxPrice ? Number(maxPrice) : 30000,
        active: true,
        alertsToday: 0,
      };
      onAdd?.(newSearch);
      setSaved(true);

      // Kick off Apify immediately in the background — don't wait for the feed page
      fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          make: newSearch.make,
          model: newSearch.model,
          maxPrice: newSearch.maxPrice,
          maxMileage: newSearch.maxMileage,
          minYear: newSearch.minYear,
          location: newSearch.zipCode,
          radius: newSearch.radius,
          maxResults: 30,
        }),
      }).catch(() => { /* silently ignore — feed page will retry */ });
    }
  }

  const makeSummary = anyMake ? 'Any Cars & Trucks' : `${selectedMakes.size} makes selected`;

  return (
    <div className="fixed inset-0 z-50 flex items-end" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}>
      <div
        ref={sheetRef}
        style={{ background: '#1C1C1E', borderRadius: '20px 20px 0 0', width: '100%', maxHeight: '92vh', display: 'flex', flexDirection: 'column', transition: 'transform 0.15s ease', willChange: 'transform', position: 'relative', overflow: 'hidden' }}
      >
        {/* Drag handle */}
        <div
          className="flex justify-center pt-3 pb-1"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          style={{ cursor: 'grab' }}
        >
          <div style={{ width: 36, height: 5, background: '#3A3A3C', borderRadius: 3 }} />
        </div>

        <div className="px-5 pt-2 pb-3" style={{ borderBottom: '0.5px solid rgba(255,255,255,0.1)' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-black text-xl">{isEditing ? 'Edit Search' : 'New Alert Search'}</h2>
            <button type="button" onClick={onClose} style={{ width: 30, height: 30, background: '#3A3A3C', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                <path d="M6 18L18 6M6 6l12 12" stroke="#a1a1aa" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-1.5">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center gap-1.5">
                <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-colors ${
                  i === step ? 'bg-green-500 text-black' :
                  i < step ? 'bg-green-500/20 text-green-400' :
                  'bg-zinc-800 text-zinc-600'
                }`}>
                  {i < step ? '✓' : i + 1} {i === step ? s : ''}
                </div>
                {i < STEPS.length - 1 && <div className={`h-px w-3 ${i < step ? 'bg-green-500/40' : 'bg-zinc-800'}`} />}
              </div>
            ))}
          </div>
        </div>

        {/* Step content */}
        <div className="flex-1 px-5 py-5 scroll-ios" style={{ overflowY: 'auto' }}>

          {/* Step 0: Location */}
          {step === 0 && (
            <div className="space-y-5">
              <div>
                <p className="text-white font-black text-lg mb-1">Where are you searching?</p>
                <p className="text-zinc-500 text-sm">Name your search and pick your area.</p>
              </div>
              <div>
                <label className="text-zinc-400 text-sm font-semibold block mb-2">Search Name</label>
                <input type="text" placeholder='e.g. "Dallas Car Search"'
                  value={name} onChange={e => setName(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-xl px-4 py-3 text-sm placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500" />
              </div>
              <div>
                <label className="text-zinc-400 text-sm font-semibold block mb-2">City / Location</label>
                <LocationInput value={location} onChange={setLocation} placeholder="City, State or Zip Code" />
              </div>
              <div>
                <label className="text-zinc-400 text-sm font-semibold block mb-2">Search Radius</label>
                <div className="grid grid-cols-3 gap-2">
                  {['10','25','50','75','100','150'].map(r => (
                    <button key={r} type="button" onClick={() => setRadius(r)}
                      className={`py-2.5 rounded-xl text-sm font-bold border transition-colors ${
                        radius === r
                          ? 'bg-green-500/15 border-green-500/50 text-green-400'
                          : 'bg-zinc-900 border-zinc-700 text-zinc-400'
                      }`}>
                      {r} mi
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Makes */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <p className="text-white font-black text-lg mb-1">Which makes?</p>
                <p className="text-zinc-500 text-sm">Select all, or tap to deselect ones you don't want.</p>
              </div>
              <button type="button" onClick={() => { setAnyMake(!anyMake); if (!anyMake) setSelectedMakes(new Set(ALL_MAKES)); }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-bold transition-colors ${
                  anyMake ? 'bg-green-500/15 border-green-500/40 text-green-400' : 'bg-zinc-800 border-zinc-700 text-zinc-400'
                }`}>
                <span>{anyMake ? '✓ Any Cars & Trucks' : 'Custom selection'}</span>
                <span className="text-zinc-600 text-xs">{anyMake ? 'tap to filter' : 'tap to reset'}</span>
              </button>

              <div className="flex flex-wrap gap-2">
                {ALL_MAKES.map(make => (
                  <button key={make} type="button"
                    onClick={() => { setAnyMake(false); toggleMake(make); }}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                      selectedMakes.has(make)
                        ? 'bg-zinc-700 border-zinc-600 text-white'
                        : 'bg-transparent border-zinc-800 text-zinc-600 line-through'
                    }`}>
                    {make}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Filters */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <p className="text-white font-black text-lg mb-1">Set your filters</p>
                <p className="text-zinc-500 text-sm">Leave blank for no limit.</p>
              </div>

              <div>
                <label className="text-zinc-400 text-sm font-semibold block mb-2">Year Range</label>
                <div className="grid grid-cols-2 gap-3">
                  <input type="number" placeholder="Min year" value={minYear} onChange={e => setMinYear(e.target.value)}
                    className="bg-zinc-900 border border-zinc-700 text-white rounded-xl px-4 py-3 text-sm placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500" />
                  <input type="number" placeholder="Max year" value={maxYear} onChange={e => setMaxYear(e.target.value)}
                    className="bg-zinc-900 border border-zinc-700 text-white rounded-xl px-4 py-3 text-sm placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500" />
                </div>
              </div>

              <div>
                <label className="text-zinc-400 text-sm font-semibold block mb-2">Max Mileage</label>
                <input type="number" placeholder="Any mileage" value={maxMileage} onChange={e => setMaxMileage(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-xl px-4 py-3 text-sm placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500" />
              </div>

              <div>
                <label className="text-zinc-400 text-sm font-semibold block mb-2">Price Range</label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">$</span>
                    <input type="number" placeholder="Min" value={minPrice} onChange={e => setMinPrice(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-xl pl-8 pr-4 py-3 text-sm placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500" />
                  </div>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">$</span>
                    <input type="number" placeholder="Max" value={maxPrice} onChange={e => setMaxPrice(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-xl pl-8 pr-4 py-3 text-sm placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500" />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3.5">
                <div>
                  <p className="text-white font-semibold text-sm">Block Salvage Vehicles</p>
                  <p className="text-zinc-500 text-xs mt-0.5">Hide rebuilt/salvage title listings</p>
                </div>
                <Toggle active={blockSalvage} onToggle={() => setBlockSalvage(!blockSalvage)} />
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <p className="text-white font-black text-lg mb-1">{isEditing ? 'Review changes' : 'Ready to launch'}</p>
                <p className="text-zinc-500 text-sm">{isEditing ? 'Confirm your updated settings.' : 'Review your search before going live.'}</p>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-3">
                {[
                  { label: 'Search Name', value: name },
                  { label: 'Location', value: `${location} · ${radius} mi radius` },
                  { label: 'Makes', value: makeSummary },
                  { label: 'Years', value: minYear || maxYear ? `${minYear || 'Any'} – ${maxYear || 'Any'}` : 'Any' },
                  { label: 'Mileage', value: maxMileage ? `Up to ${parseInt(maxMileage).toLocaleString()} mi` : 'Any' },
                  { label: 'Price', value: minPrice || maxPrice ? `$${minPrice || '0'} – $${maxPrice || '∞'}` : 'Any' },
                  { label: 'Block Salvage', value: blockSalvage ? 'Yes' : 'No' },
                ].map(row => (
                  <div key={row.label} className="flex justify-between items-center py-1 border-b border-zinc-800/50 last:border-0">
                    <span className="text-zinc-500 text-sm">{row.label}</span>
                    <span className="text-white text-sm font-semibold">{row.value}</span>
                  </div>
                ))}
              </div>

              {!isEditing && (
                <div className="flex items-center gap-2 bg-green-500/8 border border-green-500/20 rounded-xl px-4 py-3">
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                    <path d="M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z" stroke="#22c55e" strokeWidth="2" strokeLinejoin="round" />
                  </svg>
                  <p className="text-green-400 text-xs font-semibold">Alerts go live instantly — under 5 min from posting</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Success state overlay */}
        {saved && (
          <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center" style={{ background: '#1C1C1E', borderRadius: '20px 20px 0 0', zIndex: 10 }}>
            <div style={{ width: 72, height: 72, background: 'rgba(34,197,94,0.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              <svg width="36" height="36" fill="none" viewBox="0 0 24 24">
                <path d="M20 6L9 17l-5-5" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p style={{ color: '#fff', fontWeight: 800, fontSize: 22, marginBottom: 8 }}>Alert is Live!</p>
            <p style={{ color: '#8E8E93', fontSize: 14, lineHeight: 1.6, marginBottom: 32 }}>
              <span style={{ color: '#22c55e', fontWeight: 700 }}>"{name}"</span> is now active. You'll get notified within minutes when a matching deal is posted.
            </p>
            <button
              type="button"
              onClick={onClose}
              style={{ width: '100%', background: '#22c55e', color: '#000', fontWeight: 800, fontSize: 17, padding: '15px 0', borderRadius: 14 }}
            >
              Done
            </button>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="px-5 pt-3 flex gap-3 safe-bottom" style={{ borderTop: '0.5px solid rgba(255,255,255,0.1)', paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 24px)' }}>
          {step > 0 ? (
            <button type="button" onClick={() => setStep(s => s - 1)}
              className="flex-1 bg-zinc-800 text-zinc-300 font-bold py-4 rounded-xl text-sm">
              Previous
            </button>
          ) : (
            <button type="button" onClick={onClose}
              className="flex-1 bg-zinc-800 text-zinc-300 font-bold py-4 rounded-xl text-sm">
              Cancel
            </button>
          )}
          {step < STEPS.length - 1 ? (
            <button type="button" onClick={() => setStep(s => s + 1)} disabled={!canNext()}
              className="flex-1 bg-green-500 hover:bg-green-400 disabled:opacity-40 text-black font-black py-4 rounded-xl text-sm transition-colors">
              Next
            </button>
          ) : (
            <button type="button" onClick={handleSave}
              className="flex-1 bg-green-500 hover:bg-green-400 text-black font-black py-4 rounded-xl text-sm transition-colors">
              {isEditing ? 'Save Changes' : 'Start Alert'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
