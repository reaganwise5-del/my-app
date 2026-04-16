'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

function formatPlace(props: Record<string, string>): string {
  const parts: string[] = [];
  if (props.name) parts.push(props.name);
  if (props.city && props.city !== props.name) parts.push(props.city);
  if (props.state) parts.push(props.state);
  if (props.country) parts.push(props.country);
  return parts.filter(Boolean).join(', ');
}

export default function LocationInput({
  value,
  onChange,
  placeholder = 'City, State or Zip Code',
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const search = useCallback(async (q: string) => {
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    try {
      const res = await fetch(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=7`,
        { signal: abortRef.current.signal }
      );
      if (!res.ok) { setSuggestions([]); return; }
      const data = await res.json();
      const seen = new Set<string>();
      const results: string[] = [];
      for (const f of data.features ?? []) {
        if (f.properties?.country !== 'United States') continue;
        const label = formatPlace(f.properties);
        if (label && !seen.has(label)) { seen.add(label); results.push(label); }
      }
      setSuggestions(results);
      setOpen(results.length > 0);
    } catch (e: unknown) {
      if (e instanceof Error && e.name !== 'AbortError') setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  function handleInput(val: string) {
    onChange(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const trimmed = val.trim();
    if (!trimmed || trimmed.length < 2) { setSuggestions([]); setOpen(false); return; }
    debounceRef.current = setTimeout(() => search(trimmed), 300);
  }

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 shrink-0" width="16" height="16" fill="none" viewBox="0 0 24 24">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" fill="#9B9490" />
        </svg>
        <input
          type="text"
          value={value}
          onChange={e => handleInput(e.target.value)}
          onFocus={() => { if (suggestions.length > 0) setOpen(true); }}
          placeholder={placeholder}
          style={{ width: '100%', background: '#fff', border: '1px solid rgba(26,26,46,0.12)', color: '#1A1A2E', borderRadius: 12, paddingTop: 12, paddingBottom: 12, paddingLeft: 40, paddingRight: 40, fontSize: 14, outline: 'none' }}
        />
        {loading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div style={{ width: 16, height: 16, borderWidth: 2, borderStyle: 'solid', borderColor: '#E8601C', borderTopColor: 'transparent', borderRadius: '50%' }} className="animate-spin" />
          </div>
        )}
      </div>

      {open && suggestions.length > 0 && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 6, background: '#fff', border: '1px solid rgba(26,26,46,0.12)', borderRadius: 12, overflow: 'hidden', zIndex: 50, boxShadow: '0 8px 24px rgba(26,26,46,0.12)' }}>
          {suggestions.map((s, i) => (
            <button
              key={i}
              type="button"
              onMouseDown={() => { onChange(s); setOpen(false); }}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', textAlign: 'left', borderBottom: i < suggestions.length - 1 ? '0.5px solid rgba(26,26,46,0.06)' : 'none', background: 'transparent', cursor: 'pointer' }}
              className="hover:bg-stone-50 transition-colors"
            >
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" className="shrink-0">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" fill="#E8601C" />
              </svg>
              <span style={{ fontSize: 14, color: '#1A1A2E' }}>{s}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
