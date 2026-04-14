'use client';

import { useState } from 'react';
import Link from 'next/link';
import Logo from './components/Logo';
import BottomNav from './components/BottomNav';
import NewSearchModal from './components/NewSearchModal';
import Toggle from './components/Toggle';
import { mockSearches, type Search } from './lib/mockData';

type ModalState = { mode: 'new' } | { mode: 'edit'; search: Search } | null;

function Chip({ label }: { label: string }) {
  return (
    <span style={{ background: '#2C2C2E', color: '#EBEBF599', fontSize: 12, fontWeight: 500, padding: '4px 10px', borderRadius: 20 }}>
      {label}
    </span>
  );
}

function ActiveSearchCard({ search, onToggle, onEdit }: { search: Search; onToggle: (id: string) => void; onEdit: (s: Search) => void }) {
  return (
    <div style={{ background: '#1C1C1E', borderRadius: 16 }} className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <h3 className="text-white font-semibold text-sm truncate">{search.name}</h3>
          {search.active && (
            <span className="flex items-center gap-1 shrink-0">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              <span className="text-green-400 text-xs">Active</span>
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onEdit(search)}
            style={{ width: 28, height: 28, background: '#2C2C2E', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="#8E8E93" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="#8E8E93" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <Toggle active={search.active} onToggle={() => onToggle(search.id)} />
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <Chip label={`${search.radius} mi`} />
        <Chip label={search.make === 'Any' ? 'Any Make' : search.make} />
        <Chip label={`Under $${(search.maxPrice / 1000).toFixed(0)}k`} />
        <Chip label={`Up to ${(search.maxMileage / 1000).toFixed(0)}k mi`} />
      </div>

      {search.active && (
        <p style={{ color: '#8E8E93', fontSize: 12, marginTop: 10 }}>🔔 {search.alertsToday} alerts today</p>
      )}
    </div>
  );
}

export default function HomePage() {
  const [searches, setSearches] = useState<Search[]>(mockSearches);
  const [modal, setModal] = useState<ModalState>(null);

  function toggleSearch(id: string) {
    setSearches(prev => prev.map(s => s.id === id ? { ...s, active: !s.active } : s));
  }

  function saveSearch(updated: Search) {
    setSearches(prev => prev.map(s => s.id === updated.id ? updated : s));
  }

  const monthlyProfit = 4200;
  const totalFlips = 3;
  const activeCount = searches.filter(s => s.active).length;

  return (
    <div className="min-h-screen pb-32" style={{ background: '#000000' }}>
      {/* Header */}
      <div className="px-5 pt-14 pb-5 flex items-center justify-between">
        <Logo size="md" />
        <button
          type="button"
          onClick={() => setModal({ mode: 'new' })}
          style={{ background: '#22c55e', color: '#000', fontWeight: 700, fontSize: 14, padding: '8px 16px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <svg width="13" height="13" fill="none" viewBox="0 0 24 24">
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
          New Search
        </button>
      </div>

      {/* Profit hero */}
      <div className="mx-5 mb-5">
        <div style={{ background: '#1C1C1E', borderRadius: 20, padding: 20 }}>
          <div className="flex items-start justify-between">
            <div>
              <p style={{ color: '#8E8E93', fontSize: 13, fontWeight: 500 }}>Monthly Profit</p>
              <p style={{ color: '#fff', fontWeight: 800, fontSize: 38, letterSpacing: -1, marginTop: 2 }}>
                ${monthlyProfit.toLocaleString()}
              </p>
              <span style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e', fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 20, display: 'inline-block', marginTop: 8 }}>
                +{totalFlips} flips this month
              </span>
            </div>
            <Link href="/tracker"
              style={{ background: '#2C2C2E', color: '#EBEBF599', fontSize: 12, fontWeight: 600, padding: '6px 12px', borderRadius: 20 }}>
              Stats →
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-5">
            {[
              { label: 'Avg Profit', value: '$1,400' },
              { label: 'Active Alerts', value: activeCount.toString() },
              { label: 'Alerts Today', value: '11' },
            ].map((stat) => (
              <div key={stat.label} style={{ background: '#2C2C2E', borderRadius: 12, padding: '12px 8px', textAlign: 'center' }}>
                <p style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>{stat.value}</p>
                <p style={{ color: '#8E8E93', fontSize: 11, marginTop: 2 }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="px-5 mb-6 grid grid-cols-2 gap-3">
        <Link href="/feed"
          style={{ background: 'rgba(34,197,94,0.1)', borderRadius: 16, padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, background: 'rgba(34,197,94,0.18)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
              <path d="M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z" stroke="#22c55e" strokeWidth="1.8" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <p style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>AI Picks</p>
            <p style={{ color: '#8E8E93', fontSize: 12 }}>Best flips now</p>
          </div>
        </Link>
        <Link href="/tracker"
          style={{ background: '#1C1C1E', borderRadius: 16, padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, background: '#2C2C2E', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
              <path d="M3 3v18h18M7 16l4-5 4 3 4-6" stroke="#8E8E93" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <p style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>Tracker</p>
            <p style={{ color: '#8E8E93', fontSize: 12 }}>Your inventory</p>
          </div>
        </Link>
      </div>

      {/* Active searches */}
      <div className="px-5">
        <div className="flex items-center justify-between mb-3">
          <p style={{ color: '#8E8E93', fontSize: 13, fontWeight: 600 }}>Active Searches</p>
          <button type="button" onClick={() => setModal({ mode: 'new' })} style={{ color: '#22c55e', fontSize: 14, fontWeight: 600 }}>
            + Add
          </button>
        </div>

        <div className="space-y-2">
          {searches.map((search) => (
            <ActiveSearchCard key={search.id} search={search} onToggle={toggleSearch} onEdit={s => setModal({ mode: 'edit', search: s })} />
          ))}
        </div>

        {/* Slots */}
        <div style={{ background: '#1C1C1E', borderRadius: 16, padding: 16, marginTop: 12 }}>
          <div className="flex justify-between items-center mb-2">
            <span style={{ color: '#8E8E93', fontSize: 13 }}>Search slots</span>
            <span style={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>{activeCount} / 5</span>
          </div>
          <div style={{ height: 4, background: '#3A3A3C', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${(activeCount / 5) * 100}%`, background: '#22c55e', borderRadius: 4 }} />
          </div>
          <p style={{ color: '#636366', fontSize: 12, marginTop: 8 }}>
            Basic plan · <span style={{ color: '#22c55e', fontWeight: 600 }}>Upgrade to Pro for unlimited</span>
          </p>
        </div>
      </div>

      <BottomNav />
      {modal?.mode === 'new' && <NewSearchModal onClose={() => setModal(null)} />}
      {modal?.mode === 'edit' && (
        <NewSearchModal
          onClose={() => setModal(null)}
          editSearch={modal.search}
          onSave={updated => { saveSearch(updated); setModal(null); }}
        />
      )}
    </div>
  );
}
