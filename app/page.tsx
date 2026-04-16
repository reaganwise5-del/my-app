'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Logo from './components/Logo';
import BottomNav from './components/BottomNav';
import NewSearchModal from './components/NewSearchModal';
import Toggle from './components/Toggle';
import { type Search } from './lib/mockData';

type ModalState = { mode: 'new' } | { mode: 'edit'; search: Search } | null;

function SearchCard({ search, onToggle, onEdit }: { search: Search; onToggle: (id: string) => void; onEdit: (s: Search) => void }) {
  return (
    <div className="card-lift" style={{ background: '#fff', borderRadius: 16, padding: '16px', border: '1px solid rgba(26,26,46,0.07)', boxShadow: '0 1px 3px rgba(26,26,46,0.05), 0 4px 14px rgba(26,26,46,0.06)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          {search.active && <span style={{ width: 7, height: 7, background: '#15803D', borderRadius: '50%', flexShrink: 0, boxShadow: '0 0 6px rgba(21,128,61,0.5)' }} />}
          <h3 style={{ color: '#1A1A2E', fontWeight: 700, fontSize: 15, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{search.name}</h3>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button type="button" onClick={() => onEdit(search)}
            style={{ width: 30, height: 30, background: '#F5F3F0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}>
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="#6B6560" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="#6B6560" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <Toggle active={search.active} onToggle={() => onToggle(search.id)} />
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {[
          `${search.radius} mi`,
          search.make === 'Any' ? 'Any Make' : search.make,
          `Under $${(search.maxPrice / 1000).toFixed(0)}k`,
          `≤${(search.maxMileage / 1000).toFixed(0)}k mi`,
        ].map(label => (
          <span key={label} style={{ background: '#F5F3F0', color: '#6B6560', fontSize: 11.5, fontWeight: 600, padding: '4px 10px', borderRadius: 20, border: '1px solid rgba(26,26,46,0.07)' }}>
            {label}
          </span>
        ))}
      </div>

      {search.active && search.alertsToday > 0 && (
        <p style={{ color: '#E8601C', fontSize: 12, fontWeight: 600, marginTop: 10 }}>{search.alertsToday} new listings today</p>
      )}
    </div>
  );
}

export default function HomePage() {
  const [searches, setSearches] = useState<Search[]>([]);
  const [modal, setModal] = useState<ModalState>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('flipalert_searches');
      if (raw) {
        const parsed: Search[] = JSON.parse(raw);
        const MOCK_IDS = new Set(['1', '2', '3']);
        const real = parsed.filter(s => !MOCK_IDS.has(s.id));
        if (real.length !== parsed.length) localStorage.setItem('flipalert_searches', JSON.stringify(real));
        setSearches(real);
      }
    } catch { /* ignore */ }
  }, []);

  function persist(updated: Search[]) {
    setSearches(updated);
    try { localStorage.setItem('flipalert_searches', JSON.stringify(updated)); } catch { /* ignore */ }
  }

  function addSearch(s: Search) { persist([...searches, s]); }
  function toggleSearch(id: string) { persist(searches.map(s => s.id === id ? { ...s, active: !s.active } : s)); }
  function saveSearch(updated: Search) { persist(searches.map(s => s.id === updated.id ? updated : s)); }

  const activeCount = searches.filter(s => s.active).length;
  const totalAlertsToday = searches.reduce((sum, s) => sum + (s.active ? (s.alertsToday || 0) : 0), 0);

  return (
    <div style={{ minHeight: '100vh', paddingBottom: 120, background: '#FAF8F5' }}>

      {/* Header */}
      <div style={{ padding: '56px 20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Logo size="md" />
        <button type="button" onClick={() => setModal({ mode: 'new' })}
          style={{ background: '#E8601C', color: '#fff', fontWeight: 700, fontSize: 14, padding: '9px 18px', borderRadius: 22, display: 'flex', alignItems: 'center', gap: 6, border: 'none', cursor: 'pointer', boxShadow: '0 2px 10px rgba(232,96,28,0.30)' }}>
          <svg width="12" height="12" fill="none" viewBox="0 0 24 24">
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
          New Alert
        </button>
      </div>

      {/* Hero headline */}
      <div style={{ padding: '0 20px 28px' }}>
        <p style={{ fontFamily: "'DM Serif Display', serif", fontSize: 32, color: '#1A1A2E', lineHeight: 1.2, marginBottom: 6, letterSpacing: -0.5 }}>
          {totalAlertsToday > 0
            ? <>{totalAlertsToday} new deals<br />found today</>
            : <>Find cars worth<br />flipping for profit</>
          }
        </p>
        <p style={{ color: '#9B9490', fontSize: 15, fontWeight: 500 }}>
          {totalAlertsToday > 0 ? 'Across your active searches' : 'Set up an alert — we\'ll do the scanning'}
        </p>
      </div>

      {/* Quick stats */}
      <div style={{ padding: '0 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 28 }}>
        <Link href="/feed" style={{ background: '#fff', borderRadius: 16, padding: '18px 16px', display: 'block', border: '1px solid rgba(26,26,46,0.07)', boxShadow: '0 1px 3px rgba(26,26,46,0.05)', textDecoration: 'none' }}>
          <p style={{ color: '#E8601C', fontWeight: 800, fontSize: 28, letterSpacing: -1, lineHeight: 1 }}>{totalAlertsToday}</p>
          <p style={{ color: '#6B6560', fontSize: 13, fontWeight: 500, marginTop: 4 }}>new today</p>
          <p style={{ color: '#C0B9B2', fontSize: 11, fontWeight: 600, marginTop: 8 }}>View feed →</p>
        </Link>
        <Link href="/tracker" style={{ background: '#fff', borderRadius: 16, padding: '18px 16px', display: 'block', border: '1px solid rgba(26,26,46,0.07)', boxShadow: '0 1px 3px rgba(26,26,46,0.05)', textDecoration: 'none' }}>
          <p style={{ color: '#1A1A2E', fontWeight: 800, fontSize: 28, letterSpacing: -1, lineHeight: 1 }}>$4,200</p>
          <p style={{ color: '#6B6560', fontSize: 13, fontWeight: 500, marginTop: 4 }}>this month</p>
          <p style={{ color: '#C0B9B2', fontSize: 11, fontWeight: 600, marginTop: 8 }}>View tracker →</p>
        </Link>
      </div>

      {/* Alerts list */}
      <div style={{ padding: '0 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <p style={{ color: '#1A1A2E', fontWeight: 700, fontSize: 17 }}>Your Alerts</p>
          <button type="button" onClick={() => setModal({ mode: 'new' })} style={{ color: '#E8601C', fontSize: 13, fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}>
            + Add
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {searches.length === 0 ? (
            <div style={{ background: '#fff', borderRadius: 18, padding: '40px 24px', textAlign: 'center', border: '1px dashed rgba(26,26,46,0.12)' }}>
              <div style={{ fontSize: 40, marginBottom: 14 }}>🔍</div>
              <p style={{ fontFamily: "'DM Serif Display', serif", fontSize: 20, color: '#1A1A2E', marginBottom: 8 }}>No alerts yet</p>
              <p style={{ color: '#9B9490', fontSize: 14, lineHeight: 1.6, marginBottom: 22 }}>Tell us what you're looking for and we'll find deals before anyone else does.</p>
              <button type="button" onClick={() => setModal({ mode: 'new' })}
                style={{ background: '#E8601C', color: '#fff', fontWeight: 700, fontSize: 15, padding: '13px 28px', borderRadius: 24, border: 'none', cursor: 'pointer', boxShadow: '0 4px 14px rgba(232,96,28,0.30)' }}>
                Create your first alert
              </button>
            </div>
          ) : (
            searches.map((search) => (
              <SearchCard key={search.id} search={search} onToggle={toggleSearch} onEdit={s => setModal({ mode: 'edit', search: s })} />
            ))
          )}
        </div>

        {/* Alert slots progress */}
        {searches.length > 0 && (
          <div style={{ marginTop: 14, padding: '14px 16px', background: '#fff', borderRadius: 14, border: '1px solid rgba(26,26,46,0.07)', boxShadow: '0 1px 3px rgba(26,26,46,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ color: '#6B6560', fontSize: 13, fontWeight: 500 }}>{activeCount} of 5 alerts active</span>
              <Link href="/settings" style={{ color: '#E8601C', fontSize: 12, fontWeight: 700, textDecoration: 'none' }}>Upgrade plan</Link>
            </div>
            <div style={{ height: 4, background: '#F0ECE7', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${(activeCount / 5) * 100}%`, background: '#E8601C', borderRadius: 4, transition: 'width 0.4s ease' }} />
            </div>
          </div>
        )}
      </div>

      <BottomNav />
      {modal?.mode === 'new' && <NewSearchModal onClose={() => setModal(null)} onAdd={addSearch} />}
      {modal?.mode === 'edit' && <NewSearchModal onClose={() => setModal(null)} editSearch={modal.search} onSave={updated => { saveSearch(updated); setModal(null); }} />}
    </div>
  );
}
