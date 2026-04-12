'use client';

import { useState } from 'react';
import BottomNav from '../components/BottomNav';
import NewSearchModal from '../components/NewSearchModal';
import { mockSearches, type Search } from '../lib/mockData';

function SearchCard({ search, onToggle }: { search: Search; onToggle: (id: string) => void }) {
  return (
    <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-white font-bold text-base truncate">{search.name}</h3>
            {search.active && (
              <span className="flex items-center gap-1 bg-green-500/15 border border-green-500/30 text-green-400 text-xs font-semibold px-2 py-0.5 rounded-full shrink-0">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                Live
              </span>
            )}
          </div>
          <p className="text-zinc-400 text-sm">
            {search.make !== 'Any' ? search.make : 'Any make'} {search.model !== 'Any' ? search.model : ''}
            {' · '}{search.minYear}–{search.maxYear}
          </p>
          <p className="text-zinc-500 text-xs mt-1">
            Under ${search.maxPrice.toLocaleString()} · Under {search.maxMileage.toLocaleString()} mi · {search.radius} mi radius
          </p>
        </div>

        {/* Toggle */}
        <button
          onClick={() => onToggle(search.id)}
          className={`ml-3 shrink-0 w-12 h-6 rounded-full transition-colors relative ${
            search.active ? 'bg-white' : 'bg-zinc-700'
          }`}
        >
          <span
            className={`absolute top-0.5 w-5 h-5 bg-black rounded-full transition-transform shadow-md ${
              search.active ? 'translate-x-6' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>

      {/* Stats */}
      {search.active && (
        <div className="mt-3 pt-3 border-t border-zinc-800 flex items-center gap-1">
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
            <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" stroke="#71717a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-zinc-400 text-xs">{search.alertsToday} alerts today</span>
        </div>
      )}
    </div>
  );
}

export default function AlertsPage() {
  const [searches, setSearches] = useState<Search[]>(mockSearches);
  const [showModal, setShowModal] = useState(false);

  function toggleSearch(id: string) {
    setSearches((prev) =>
      prev.map((s) => (s.id === id ? { ...s, active: !s.active } : s))
    );
  }

  const activeCount = searches.filter((s) => s.active).length;
  const maxSearches = 5;

  return (
    <div className="min-h-screen bg-black pb-24">
      {/* Header */}
      <div className="sticky top-0 bg-black/95 backdrop-blur-sm border-b border-zinc-900 z-40 px-4 pt-12 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-white font-black text-2xl tracking-tight">My Alerts</h1>
            <p className="text-zinc-500 text-xs mt-0.5">{activeCount} active · {maxSearches - activeCount} remaining</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-white text-black font-bold text-sm px-4 py-2 rounded-full flex items-center gap-1.5"
          >
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
            New Search
          </button>
        </div>
      </div>

      {/* Search limit bar */}
      <div className="px-4 pt-4">
        <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800 mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-zinc-400 text-sm font-medium">Search slots used</span>
            <span className="text-white text-sm font-bold">{activeCount} / {maxSearches}</span>
          </div>
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all"
              style={{ width: `${(activeCount / maxSearches) * 100}%` }}
            />
          </div>
          <p className="text-zinc-500 text-xs mt-2">Basic plan · <span className="text-white underline cursor-pointer">Upgrade for unlimited</span></p>
        </div>
      </div>

      {/* Searches */}
      <div className="px-4 space-y-3">
        {searches.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-zinc-500 text-base">No searches yet.</p>
            <p className="text-zinc-600 text-sm mt-1">Tap "New Search" to get started.</p>
          </div>
        ) : (
          searches.map((search) => (
            <SearchCard key={search.id} search={search} onToggle={toggleSearch} />
          ))
        )}
      </div>

      <BottomNav />
      {showModal && <NewSearchModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
