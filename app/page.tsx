'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Logo from './components/Logo';
import BottomNav from './components/BottomNav';
import NewSearchModal from './components/NewSearchModal';
import Toggle from './components/Toggle';
import { type Search } from './lib/mockData';

type ModalState = { mode: 'new' } | { mode: 'edit'; search: Search } | null;

function Chip({ label }: { label: string }) {
  return (
    <span style={{ background: '#2C2C2E', color: '#8E8E93', fontSize: 11, fontWeight: 500, padding: '3px 9px', borderRadius: 20 }}>
      {label}
    </span>
  );
}

function ActiveSearchCard({ search, onToggle, onEdit }: { search: Search; onToggle: (id: string) => void; onEdit: (s: Search) => void }) {
  return (
    <div style={{ background: '#141414', borderRadius: 14, padding: '14px 14px', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          <h3 style={{ color: '#fff', fontWeight: 600, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{search.name}</h3>
          {search.active && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
              <span style={{ width: 6, height: 6, background: '#22c55e', borderRadius: '50%' }} />
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            type="button"
            onClick={() => onEdit(search)}
            style={{ width: 28, height: 28, background: '#2C2C2E', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <svg width="12" height="12" fill="none" viewBox="0 0 24 24">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="#636366" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="#636366" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <Toggle active={search.active} onToggle={() => onToggle(search.id)} />
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        <Chip label={`${search.radius} mi`} />
        <Chip label={search.make === 'Any' ? 'Any Make' : search.make} />
        <Chip label={`Under $${(search.maxPrice / 1000).toFixed(0)}k`} />
        <Chip label={`Up to ${(search.maxMileage / 1000).toFixed(0)}k mi`} />
      </div>

      {search.active && search.alertsToday > 0 && (
        <p style={{ color: '#636366', fontSize: 12, marginTop: 10 }}>{search.alertsToday} new listings today</p>
      )}
    </div>
  );
}

export default function HomePage() {
  const [searches, setSearches] = useState<Search[]>([]);
  const [modal, setModal] = useState<ModalState>(null);

  // Load saved searches from localStorage on mount
  // Clear old mock data (ids '1','2','3') so only real searches show
  useEffect(() => {
    try {
      const raw = localStorage.getItem('flipalert_searches');
      if (raw) {
        const parsed: Search[] = JSON.parse(raw);
        const MOCK_IDS = new Set(['1', '2', '3']);
        const real = parsed.filter(s => !MOCK_IDS.has(s.id));
        if (real.length !== parsed.length) {
          // Had mock data — save cleaned version
          localStorage.setItem('flipalert_searches', JSON.stringify(real));
        }
        setSearches(real);
      }
    } catch { /* ignore */ }
  }, []);

  // Persist searches to localStorage so the feed page can read them
  function persist(updated: Search[]) {
    setSearches(updated);
    try { localStorage.setItem('flipalert_searches', JSON.stringify(updated)); } catch { /* ignore */ }
  }

  function toggleSearch(id: string) {
    persist(searches.map(s => s.id === id ? { ...s, active: !s.active } : s));
  }

  function saveSearch(updated: Search) {
    persist(searches.map(s => s.id === updated.id ? updated : s));
  }

  function addSearch(newSearch: Search) {
    persist([...searches, newSearch]);
  }

  const activeCount = searches.filter(s => s.active).length;
  const totalAlertsToday = searches.reduce((sum, s) => sum + (s.active ? (s.alertsToday || 0) : 0), 0);

  return (
    <div style={{ minHeight: '100vh', paddingBottom: 120, background: '#000' }}>

      {/* Header */}
      <div style={{ padding: '56px 20px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Logo size="md" />
        <button
          type="button"
          onClick={() => setModal({ mode: 'new' })}
          style={{ background: '#1C1C1E', color: '#fff', fontWeight: 600, fontSize: 14, padding: '8px 16px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 6, border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <svg width="12" height="12" fill="none" viewBox="0 0 24 24">
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
          New Alert
        </button>
      </div>

      {/* Today's summary — not a dashboard, just a quick line */}
      <div style={{ padding: '0 20px 24px' }}>
        <p style={{ color: '#fff', fontWeight: 700, fontSize: 26, letterSpacing: -0.5, lineHeight: 1.2 }}>
          {totalAlertsToday > 0
            ? <>{totalAlertsToday} new listings<br /><span style={{ color: '#8E8E93', fontWeight: 500, fontSize: 18 }}>found today across your searches</span></>
            : <>No new listings<br /><span style={{ color: '#636366', fontWeight: 500, fontSize: 18 }}>yet today — check back soon</span></>
          }
        </p>
      </div>

      {/* Quick links */}
      <div style={{ padding: '0 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 28 }}>
        <Link href="/feed" style={{ background: '#141414', borderRadius: 14, padding: '16px 14px', display: 'block', border: '1px solid rgba(255,255,255,0.06)' }}>
          <p style={{ color: '#22c55e', fontWeight: 700, fontSize: 22, letterSpacing: -0.5 }}>{totalAlertsToday}</p>
          <p style={{ color: '#8E8E93', fontSize: 13, marginTop: 2 }}>new today</p>
          <p style={{ color: '#636366', fontSize: 11, marginTop: 6 }}>View feed →</p>
        </Link>
        <Link href="/tracker" style={{ background: '#141414', borderRadius: 14, padding: '16px 14px', display: 'block', border: '1px solid rgba(255,255,255,0.06)' }}>
          <p style={{ color: '#fff', fontWeight: 700, fontSize: 22, letterSpacing: -0.5 }}>$4,200</p>
          <p style={{ color: '#8E8E93', fontSize: 13, marginTop: 2 }}>this month</p>
          <p style={{ color: '#636366', fontSize: 11, marginTop: 6 }}>View tracker →</p>
        </Link>
      </div>

      {/* Active searches */}
      <div style={{ padding: '0 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <p style={{ color: '#8E8E93', fontSize: 13 }}>Your alerts</p>
          <button type="button" onClick={() => setModal({ mode: 'new' })} style={{ color: '#22c55e', fontSize: 13, fontWeight: 600 }}>
            + Add
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {searches.length === 0 ? (
            <div style={{ background: '#141414', borderRadius: 14, padding: '28px 20px', textAlign: 'center', border: '1px dashed rgba(255,255,255,0.08)' }}>
              <p style={{ color: '#636366', fontSize: 14, marginBottom: 12 }}>No alerts yet</p>
              <button type="button" onClick={() => setModal({ mode: 'new' })}
                style={{ background: '#22c55e', color: '#000', fontWeight: 700, fontSize: 14, padding: '10px 20px', borderRadius: 20 }}>
                + Create your first alert
              </button>
            </div>
          ) : (
            searches.map((search) => (
              <ActiveSearchCard key={search.id} search={search} onToggle={toggleSearch} onEdit={s => setModal({ mode: 'edit', search: s })} />
            ))
          )}
        </div>

        {/* Slots */}
        <div style={{ marginTop: 12, padding: '14px 16px', background: '#141414', borderRadius: 14, border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ color: '#636366', fontSize: 13 }}>{activeCount} of 5 alerts used</span>
            <Link href="/settings" style={{ color: '#22c55e', fontSize: 12, fontWeight: 600 }}>Upgrade</Link>
          </div>
          <div style={{ height: 3, background: '#2C2C2E', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${(activeCount / 5) * 100}%`, background: '#22c55e', borderRadius: 3 }} />
          </div>
        </div>
      </div>

      <BottomNav />
      {modal?.mode === 'new' && <NewSearchModal onClose={() => setModal(null)} onAdd={addSearch} />}
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
