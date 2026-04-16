'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Logo from '../components/Logo';
import BottomNav from '../components/BottomNav';
import ListingCardGrid from '../components/ListingCardGrid';
import NewSearchModal from '../components/NewSearchModal';
import { mockListings, mockSearches, type Listing, type Search } from '../lib/mockData';

type Tab = 'picks' | 'all';
type DataSource = 'live' | 'demo' | 'loading' | 'error';

function getSavedSearches(): Search[] {
  if (typeof window === 'undefined') return mockSearches;
  try {
    const raw = localStorage.getItem('flipalert_searches');
    if (raw) return JSON.parse(raw) as Search[];
  } catch { /* ignore */ }
  return mockSearches;
}

export default function FeedPage() {
  const [tab, setTab] = useState<Tab>('picks');
  const [showModal, setShowModal] = useState(false);
  const [listings, setListings] = useState<Listing[]>(mockListings);
  const [source, setSource] = useState<DataSource>('demo');
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [searchProgress, setSearchProgress] = useState('');

  const [pullY, setPullY] = useState(0);
  const touchStartY = useRef(0);
  const isPulling = useRef(false);
  const PULL_THRESHOLD = 80;

  const fetchRealListings = useCallback(async () => {
    setSource('loading');
    setRefreshing(true);
    setSearchProgress('');
    try {
      const searches = getSavedSearches().filter(s => s.active);
      if (searches.length === 0) {
        searches.push({ id: 'default', name: 'Used Cars', make: 'Any', model: 'Any', minYear: 2012, maxYear: 2024, maxPrice: 20000, maxMileage: 150000, zipCode: '', radius: 50, active: true, alertsToday: 0 });
      }

      const allListings: Listing[] = [];
      const seen = new Set<string>();

      for (let i = 0; i < searches.length; i++) {
        const s = searches[i];
        setSearchProgress(`Searching "${s.name}" (${i + 1}/${searches.length})…`);
        try {
          const res = await fetch('/api/listings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ make: s.make, model: s.model, maxPrice: s.maxPrice, maxMileage: s.maxMileage, minYear: s.minYear, location: s.zipCode, radius: s.radius, maxResults: 30 }),
          });
          const data = await res.json();
          if (data.error?.includes('APIFY_API_KEY not set')) { setSource('demo'); setListings(mockListings); return; }
          if (data.listings?.length) {
            for (const l of data.listings) {
              if (!seen.has(l.id)) { seen.add(l.id); allListings.push(l as Listing); }
            }
          }
        } catch { continue; }
      }

      setSearchProgress('');
      if (allListings.length > 0) { setListings(allListings); setSource('live'); setLastRefresh(new Date()); }
      else { setSource('error'); setListings(mockListings); }
    } catch { setSource('error'); setListings(mockListings); }
    finally { setRefreshing(false); }
  }, []);

  useEffect(() => { fetchRealListings(); }, [fetchRealListings]);

  const topDeals = [...listings].filter(l => (l.profit / l.askingPrice) >= 0.15).sort((a, b) => (b.profit / b.askingPrice) - (a.profit / a.askingPrice));
  const allSorted = [...listings].sort((a, b) => a.postedMinutesAgo - b.postedMinutesAgo);
  const displayListings = tab === 'picks' ? topDeals : allSorted;

  function timeSince(d: Date) {
    const mins = Math.floor((Date.now() - d.getTime()) / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    return `${Math.floor(mins / 60)}h ago`;
  }

  function onTouchStart(e: React.TouchEvent) {
    if (window.scrollY === 0) { touchStartY.current = e.touches[0].clientY; isPulling.current = true; }
  }
  function onTouchMove(e: React.TouchEvent) {
    if (!isPulling.current || refreshing) return;
    const dy = e.touches[0].clientY - touchStartY.current;
    if (dy > 0) setPullY(Math.min(dy, PULL_THRESHOLD + 20));
  }
  function onTouchEnd() {
    if (pullY >= PULL_THRESHOLD && !refreshing) fetchRealListings();
    setPullY(0);
    isPulling.current = false;
  }

  return (
    <div className="min-h-screen pb-28" style={{ background: '#FAF8F5' }}
      onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>

      {/* Pull indicator */}
      {pullY > 0 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: pullY, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, opacity: pullY / PULL_THRESHOLD }}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" className={pullY >= PULL_THRESHOLD ? 'spinning' : ''} style={{ transform: pullY < PULL_THRESHOLD ? `rotate(${(pullY / PULL_THRESHOLD) * 180}deg)` : undefined }}>
              <path d="M23 4v6h-6M1 20v-6h6" stroke="#9B9490" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" stroke="#9B9490" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span style={{ color: '#9B9490', fontSize: 13, fontWeight: 500 }}>{pullY >= PULL_THRESHOLD ? 'Release to refresh' : 'Pull to refresh'}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="sticky top-0 z-40 px-5 pt-12 pb-3" style={{ background: 'rgba(250,248,245,0.92)', backdropFilter: 'blur(20px) saturate(180%)', borderBottom: '1px solid rgba(26,26,46,0.07)' }}>
        <div className="flex items-center justify-between mb-4">
          <Logo size="sm" />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button type="button" onClick={fetchRealListings} disabled={refreshing}
              style={{ width: 36, height: 36, background: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(26,26,46,0.10)', boxShadow: '0 1px 3px rgba(26,26,46,0.06)', opacity: refreshing ? 0.4 : 1 }}>
              <svg width="15" height="15" fill="none" viewBox="0 0 24 24" className={refreshing ? 'spinning' : ''}>
                <path d="M23 4v6h-6M1 20v-6h6" stroke="#6B6560" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" stroke="#6B6560" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button type="button" onClick={() => setShowModal(true)}
              style={{ background: '#E8601C', color: '#fff', fontWeight: 700, fontSize: 13, padding: '8px 16px', borderRadius: 20, border: 'none', boxShadow: '0 2px 8px rgba(232,96,28,0.30)' }}>
              + Alert
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 6, background: 'rgba(26,26,46,0.06)', borderRadius: 12, padding: 3 }}>
          {(['picks', 'all'] as Tab[]).map(t => (
            <button key={t} type="button" onClick={() => setTab(t)}
              style={{ flex: 1, padding: '8px 0', borderRadius: 10, fontSize: 13, fontWeight: 600, color: tab === t ? '#1A1A2E' : '#9B9490', background: tab === t ? '#fff' : 'transparent', boxShadow: tab === t ? '0 1px 4px rgba(26,26,46,0.10)' : 'none', transition: 'all 0.2s' }}>
              {t === 'picks' ? '⚡ Top Deals' : 'All Listings'}
            </button>
          ))}
        </div>
      </div>

      {/* Status banner */}
      <StatusBanner source={source} lastRefresh={lastRefresh} refreshing={refreshing} progress={searchProgress} onRefresh={fetchRealListings} timeSince={timeSince} />

      {/* Feed */}
      <div style={{ padding: '16px 14px 0' }}>
        {source === 'loading' ? (
          <LoadingSkeleton progress={searchProgress} />
        ) : displayListings.length === 0 ? (
          <EmptyState onAdd={() => setShowModal(true)} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {displayListings.map((listing) => (
              <ListingCardGrid key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </div>

      <BottomNav />
      {showModal && <NewSearchModal onClose={() => setShowModal(false)} />}
    </div>
  );
}

function StatusBanner({ source, lastRefresh, refreshing, progress, onRefresh, timeSince }: {
  source: DataSource; lastRefresh: Date | null; refreshing: boolean; progress: string; onRefresh: () => void; timeSince: (d: Date) => string;
}) {
  const base: React.CSSProperties = { margin: '12px 14px 0', borderRadius: 12, padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13 };

  if (source === 'live') return (
    <div style={{ ...base, background: 'rgba(21,128,61,0.07)', border: '1px solid rgba(21,128,61,0.14)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
        <span style={{ width: 7, height: 7, background: '#15803D', borderRadius: '50%', display: 'inline-block', boxShadow: '0 0 6px rgba(21,128,61,0.5)' }} />
        <span style={{ color: '#15803D', fontWeight: 600 }}>Live data</span>
        {lastRefresh && <span style={{ color: '#9B9490', fontSize: 12 }}>· {timeSince(lastRefresh)}</span>}
      </div>
      <button type="button" onClick={onRefresh} disabled={refreshing} style={{ color: '#6B6560', fontSize: 12, fontWeight: 600, opacity: refreshing ? 0.4 : 1, background: 'none', border: 'none', cursor: 'pointer' }}>
        {refreshing ? 'Refreshing…' : 'Refresh'}
      </button>
    </div>
  );

  if (source === 'loading') return (
    <div style={{ ...base, background: 'rgba(26,26,46,0.04)', border: '1px solid rgba(26,26,46,0.07)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#D5CFC8' }} className="skeleton" />
        <span style={{ color: '#6B6560', fontWeight: 500 }}>{progress || 'Scanning listings…'}</span>
      </div>
    </div>
  );

  if (source === 'demo') return (
    <div style={{ ...base, background: 'rgba(232,96,28,0.06)', border: '1px solid rgba(232,96,28,0.12)' }}>
      <span style={{ color: '#9B6B4A', fontWeight: 500 }}>Sample listings — connect your city to go live</span>
      <a href="/settings" style={{ color: '#E8601C', fontSize: 12, fontWeight: 700, textDecoration: 'none' }}>Setup →</a>
    </div>
  );

  return (
    <div style={{ ...base, background: 'rgba(26,26,46,0.04)', border: '1px solid rgba(26,26,46,0.07)' }}>
      <span style={{ color: '#9B9490' }}>Couldn't load live data</span>
      <button type="button" onClick={onRefresh} style={{ color: '#E8601C', fontSize: 12, fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}>Retry</button>
    </div>
  );
}

function LoadingSkeleton({ progress }: { progress: string }) {
  return (
    <div>
      {progress && <p style={{ color: '#9B9490', fontSize: 12, textAlign: 'center', marginBottom: 16, fontWeight: 500 }}>{progress}</p>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {[...Array(4)].map((_, i) => (
          <div key={i} style={{ background: '#fff', borderRadius: 18, overflow: 'hidden', border: '1px solid rgba(26,26,46,0.06)', boxShadow: '0 1px 3px rgba(26,26,46,0.05)' }}>
            <div className="skeleton" style={{ height: 190 }} />
            <div style={{ padding: '14px 16px 16px' }}>
              <div className="skeleton" style={{ height: 14, borderRadius: 6, marginBottom: 8, width: '75%' }} />
              <div className="skeleton" style={{ height: 11, borderRadius: 6, marginBottom: 16, width: '45%' }} />
              <div className="skeleton" style={{ height: 4, borderRadius: 4 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 32px', background: '#fff', borderRadius: 18, border: '1px solid rgba(26,26,46,0.06)', boxShadow: '0 1px 3px rgba(26,26,46,0.05)' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🚗</div>
      <p style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, color: '#1A1A2E', marginBottom: 8 }}>No deals yet</p>
      <p style={{ color: '#9B9490', fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>Create an alert and we'll scan Facebook Marketplace for deals in your area.</p>
      <button type="button" onClick={onAdd}
        style={{ background: '#E8601C', color: '#fff', fontWeight: 700, fontSize: 15, padding: '13px 28px', borderRadius: 24, border: 'none', cursor: 'pointer', boxShadow: '0 4px 14px rgba(232,96,28,0.35)' }}>
        Create your first alert
      </button>
    </div>
  );
}
