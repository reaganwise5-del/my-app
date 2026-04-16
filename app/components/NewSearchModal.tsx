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

  const inputStyle = {
    width: '100%',
    background: '#fff',
    border: '1px solid rgba(26,26,46,0.12)',
    color: '#1A1A2E',
    borderRadius: 12,
    padding: '12px 16px',
    fontSize: 14,
    outline: 'none',
  } as React.CSSProperties;

  return (
    <div className="fixed inset-0 z-50 flex items-end" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}>
      <div
        ref={sheetRef}
        style={{ background: '#FAF8F5', borderRadius: '20px 20px 0 0', width: '100%', maxHeight: '92vh', display: 'flex', flexDirection: 'column', transition: 'transform 0.15s ease', willChange: 'transform', position: 'relative', overflow: 'hidden' }}
      >
        {/* Drag handle */}
        <div
          className="flex justify-center pt-3 pb-1"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          style={{ cursor: 'grab' }}
        >
          <div style={{ width: 36, height: 5, background: '#E0D9D0', borderRadius: 3 }} />
        </div>

        <div className="px-5 pt-2 pb-3" style={{ borderBottom: '0.5px solid rgba(26,26,46,0.08)' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 style={{ color: '#1A1A2E', fontWeight: 900, fontSize: 20 }}>{isEditing ? 'Edit Search' : 'New Alert Search'}</h2>
            <button type="button" onClick={onClose} style={{ width: 30, height: 30, background: '#F0ECE7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                <path d="M6 18L18 6M6 6l12 12" stroke="#6B6560" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-1.5">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center gap-1.5">
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  padding: '4px 10px', borderRadius: 999, fontSize: 12, fontWeight: 700,
                  background: i === step ? '#FB471F' : i < step ? 'rgba(251,71,31,0.12)' : '#F0ECE7',
                  color: i === step ? '#fff' : i < step ? '#FB471F' : '#9B9490',
                }}>
                  {i < step ? '✓' : i + 1} {i === step ? s : ''}
                </div>
                {i < STEPS.length - 1 && (
                  <div style={{ height: 1, width: 12, background: i < step ? 'rgba(251,71,31,0.3)' : '#E0D9D0' }} />
                )}
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
                <p style={{ color: '#1A1A2E', fontWeight: 900, fontSize: 18, marginBottom: 4 }}>Where are you searching?</p>
                <p style={{ color: '#9B9490', fontSize: 14 }}>Name your search and pick your area.</p>
              </div>
              <div>
                <label style={{ color: '#6B6560', fontSize: 14, fontWeight: 600, display: 'block', marginBottom: 8 }}>Search Name</label>
                <input
                  type="text"
                  placeholder='e.g. "Dallas Car Search"'
                  value={name}
                  onChange={e => setName(e.target.value)}
                  style={{ ...inputStyle }}
                />
              </div>
              <div>
                <label style={{ color: '#6B6560', fontSize: 14, fontWeight: 600, display: 'block', marginBottom: 8 }}>City / Location</label>
                <LocationInput value={location} onChange={setLocation} placeholder="City, State or Zip Code" />
              </div>
              <div>
                <label style={{ color: '#6B6560', fontSize: 14, fontWeight: 600, display: 'block', marginBottom: 8 }}>Search Radius</label>
                <div className="grid grid-cols-3 gap-2">
                  {['10','25','50','75','100','150'].map(r => (
                    <button key={r} type="button" onClick={() => setRadius(r)}
                      style={{
                        padding: '10px 0', borderRadius: 12, fontSize: 14, fontWeight: 700,
                        background: radius === r ? 'rgba(251,71,31,0.10)' : '#fff',
                        border: radius === r ? '1px solid rgba(251,71,31,0.35)' : '1px solid rgba(26,26,46,0.10)',
                        color: radius === r ? '#FB471F' : '#6B6560',
                      }}>
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
                <p style={{ color: '#1A1A2E', fontWeight: 900, fontSize: 18, marginBottom: 4 }}>Which makes?</p>
                <p style={{ color: '#9B9490', fontSize: 14 }}>Select all, or tap to deselect ones you don't want.</p>
              </div>
              <button type="button" onClick={() => { setAnyMake(!anyMake); if (!anyMake) setSelectedMakes(new Set(ALL_MAKES)); }}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 16px', borderRadius: 12, fontSize: 14, fontWeight: 700,
                  background: anyMake ? 'rgba(251,71,31,0.10)' : '#F5F3F0',
                  border: anyMake ? '1px solid rgba(251,71,31,0.3)' : '1px solid rgba(26,26,46,0.10)',
                  color: anyMake ? '#FB471F' : '#6B6560',
                }}>
                <span>{anyMake ? '✓ Any Cars & Trucks' : 'Custom selection'}</span>
                <span style={{ color: '#9B9490', fontSize: 12 }}>{anyMake ? 'tap to filter' : 'tap to reset'}</span>
              </button>

              <div className="flex flex-wrap gap-2">
                {ALL_MAKES.map(make => (
                  <button key={make} type="button"
                    onClick={() => { setAnyMake(false); toggleMake(make); }}
                    style={{
                      padding: '6px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600,
                      background: selectedMakes.has(make) ? '#F0ECE7' : 'transparent',
                      border: selectedMakes.has(make) ? '1px solid rgba(26,26,46,0.12)' : '1px solid rgba(26,26,46,0.08)',
                      color: selectedMakes.has(make) ? '#1A1A2E' : '#C0B9B2',
                      textDecoration: selectedMakes.has(make) ? 'none' : 'line-through',
                    }}>
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
                <p style={{ color: '#1A1A2E', fontWeight: 900, fontSize: 18, marginBottom: 4 }}>Set your filters</p>
                <p style={{ color: '#9B9490', fontSize: 14 }}>Leave blank for no limit.</p>
              </div>

              <div>
                <label style={{ color: '#6B6560', fontSize: 14, fontWeight: 600, display: 'block', marginBottom: 8 }}>Year Range</label>
                <div className="grid grid-cols-2 gap-3">
                  <input type="number" placeholder="Min year" value={minYear} onChange={e => setMinYear(e.target.value)}
                    style={{ ...inputStyle, width: undefined }} />
                  <input type="number" placeholder="Max year" value={maxYear} onChange={e => setMaxYear(e.target.value)}
                    style={{ ...inputStyle, width: undefined }} />
                </div>
              </div>

              <div>
                <label style={{ color: '#6B6560', fontSize: 14, fontWeight: 600, display: 'block', marginBottom: 8 }}>Max Mileage</label>
                <input type="number" placeholder="Any mileage" value={maxMileage} onChange={e => setMaxMileage(e.target.value)}
                  style={{ ...inputStyle }} />
              </div>

              <div>
                <label style={{ color: '#6B6560', fontSize: 14, fontWeight: 600, display: 'block', marginBottom: 8 }}>Price Range</label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9B9490', fontSize: 14 }}>$</span>
                    <input type="number" placeholder="Min" value={minPrice} onChange={e => setMinPrice(e.target.value)}
                      style={{ ...inputStyle, width: undefined, paddingLeft: 28 }} />
                  </div>
                  <div className="relative">
                    <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9B9490', fontSize: 14 }}>$</span>
                    <input type="number" placeholder="Max" value={maxPrice} onChange={e => setMaxPrice(e.target.value)}
                      style={{ ...inputStyle, width: undefined, paddingLeft: 28 }} />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F5F3F0', border: '1px solid rgba(26,26,46,0.08)', borderRadius: 12, padding: '14px 16px' }}>
                <div>
                  <p style={{ color: '#1A1A2E', fontWeight: 600, fontSize: 14 }}>Block Salvage Vehicles</p>
                  <p style={{ color: '#9B9490', fontSize: 12, marginTop: 2 }}>Hide rebuilt/salvage title listings</p>
                </div>
                <Toggle active={blockSalvage} onToggle={() => setBlockSalvage(!blockSalvage)} />
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <p style={{ color: '#1A1A2E', fontWeight: 900, fontSize: 18, marginBottom: 4 }}>{isEditing ? 'Review changes' : 'Ready to launch'}</p>
                <p style={{ color: '#9B9490', fontSize: 14 }}>{isEditing ? 'Confirm your updated settings.' : 'Review your search before going live.'}</p>
              </div>

              <div style={{ background: '#F5F3F0', border: '1px solid rgba(26,26,46,0.08)', borderRadius: 16, padding: 16 }}>
                {[
                  { label: 'Search Name', value: name },
                  { label: 'Location', value: `${location} · ${radius} mi radius` },
                  { label: 'Makes', value: makeSummary },
                  { label: 'Years', value: minYear || maxYear ? `${minYear || 'Any'} – ${maxYear || 'Any'}` : 'Any' },
                  { label: 'Mileage', value: maxMileage ? `Up to ${parseInt(maxMileage).toLocaleString()} mi` : 'Any' },
                  { label: 'Price', value: minPrice || maxPrice ? `$${minPrice || '0'} – $${maxPrice || '∞'}` : 'Any' },
                  { label: 'Block Salvage', value: blockSalvage ? 'Yes' : 'No' },
                ].map(row => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '0.5px solid rgba(26,26,46,0.08)' }} className="last:border-0">
                    <span style={{ color: '#9B9490', fontSize: 14 }}>{row.label}</span>
                    <span style={{ color: '#1A1A2E', fontSize: 14, fontWeight: 600 }}>{row.value}</span>
                  </div>
                ))}
              </div>

              {!isEditing && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(251,71,31,0.08)', border: '1px solid rgba(251,71,31,0.15)', borderRadius: 12, padding: '12px 16px' }}>
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                    <path d="M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z" stroke="#FB471F" strokeWidth="2" strokeLinejoin="round" />
                  </svg>
                  <p style={{ color: '#C44B0F', fontSize: 12, fontWeight: 600 }}>Alerts go live instantly — under 5 min from posting</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Success state overlay */}
        {saved && (
          <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center" style={{ background: '#FAF8F5', borderRadius: '20px 20px 0 0', zIndex: 10 }}>
            <div style={{ width: 72, height: 72, background: 'rgba(251,71,31,0.12)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              <svg width="36" height="36" fill="none" viewBox="0 0 24 24">
                <path d="M20 6L9 17l-5-5" stroke="#FB471F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p style={{ color: '#1A1A2E', fontWeight: 800, fontSize: 22, marginBottom: 8 }}>Alert is Live!</p>
            <p style={{ color: '#6B6560', fontSize: 14, lineHeight: 1.6, marginBottom: 32 }}>
              <span style={{ color: '#FB471F', fontWeight: 700 }}>"{name}"</span> is now active. You'll get notified within minutes when a matching deal is posted.
            </p>
            <button
              type="button"
              onClick={onClose}
              style={{ width: '100%', background: '#FB471F', color: '#fff', fontWeight: 800, fontSize: 17, padding: '15px 0', borderRadius: 14 }}
            >
              Done
            </button>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="px-5 pt-3 flex gap-3 safe-bottom" style={{ borderTop: '0.5px solid rgba(26,26,46,0.08)', background: '#FAF8F5', paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 24px)' }}>
          {step > 0 ? (
            <button type="button" onClick={() => setStep(s => s - 1)}
              style={{ flex: 1, background: '#F0ECE7', color: '#6B6560', fontWeight: 700, padding: '16px 0', borderRadius: 12, fontSize: 14 }}>
              Previous
            </button>
          ) : (
            <button type="button" onClick={onClose}
              style={{ flex: 1, background: '#F0ECE7', color: '#6B6560', fontWeight: 700, padding: '16px 0', borderRadius: 12, fontSize: 14 }}>
              Cancel
            </button>
          )}
          {step < STEPS.length - 1 ? (
            <button type="button" onClick={() => setStep(s => s + 1)} disabled={!canNext()}
              style={{ flex: 1, background: '#FB471F', color: '#fff', fontWeight: 900, padding: '16px 0', borderRadius: 12, fontSize: 14, boxShadow: '0 2px 10px rgba(251,71,31,0.30)', opacity: canNext() ? 1 : 0.4 }}>
              Next
            </button>
          ) : (
            <button type="button" onClick={handleSave}
              style={{ flex: 1, background: '#FB471F', color: '#fff', fontWeight: 900, padding: '16px 0', borderRadius: 12, fontSize: 14, boxShadow: '0 2px 10px rgba(251,71,31,0.30)' }}>
              {isEditing ? 'Save Changes' : 'Start Alert'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
