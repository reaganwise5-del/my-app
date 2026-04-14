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
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" fill="#52525b" />
        </svg>
        <input
          type="text"
          value={value}
          onChange={e => handleInput(e.target.value)}
          onFocus={() => { if (suggestions.length > 0) setOpen(true); }}
          placeholder={placeholder}
          className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-xl pl-10 pr-10 py-3 text-sm placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500"
        />
        {loading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {open && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-zinc-900 border border-zinc-700 rounded-xl overflow-hidden z-50 shadow-xl">
          {suggestions.map((s, i) => (
            <button
              key={i}
              type="button"
              onMouseDown={() => { onChange(s); setOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-3 transition-colors text-left border-b border-zinc-800/60 last:border-0 hover:bg-zinc-800"
            >
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" className="shrink-0">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" fill="#22c55e" />
              </svg>
              <span className="text-sm text-white">{s}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
