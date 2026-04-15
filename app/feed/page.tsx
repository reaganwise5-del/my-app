'use client';

import { useState, useEffect, useCallback } from 'react';
import Logo from '../components/Logo';
import BottomNav from '../components/BottomNav';
import ListingCardGrid from '../components/ListingCardGrid';
import NewSearchModal from '../components/NewSearchModal';
import { mockListings, mockSearches, type Listing, type Search } from '../lib/mockData';

type Tab = 'picks' | 'all';
type DataSource = 'live' | 'demo' | 'loading' | 'error';

// Read saved searches from localStorage, fall back to mockSearches
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

  const fetchRealListings = useCallback(async () => {
    setSource('loading');
    setRefreshing(true);
    setSearchProgress('');

    try {
      // Get the customer's active search alerts
      const searches = getSavedSearches().filter(s => s.active);

      if (searches.length === 0) {
        // No active searches — do a generic search
        searches.push({
          id: 'default', name: 'Used Cars', make: 'Any', model: 'Any',
          minYear: 2012, maxYear: 2024, maxPrice: 20000, maxMileage: 150000,
          zipCode: '', radius: 50, active: true, alertsToday: 0,
        });
      }

      // Run one Apify search per active alert, collect all results
      const allListings: Listing[] = [];
      const seen = new Set<string>();

      for (let i = 0; i < searches.length; i++) {
        const s = searches[i];
        setSearchProgress(`Searching "${s.name}" (${i + 1}/${searches.length})…`);

        try {
          const res = await fetch('/api/listings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              make: s.make,
              model: s.model,
              maxPrice: s.maxPrice,
              maxMileage: s.maxMileage,
              minYear: s.minYear,
              location: s.zipCode,
              radius: s.radius,
              maxResults: 30,
            }),
          });

          const data = await res.json();

          if (data.error?.includes('APIFY_API_KEY not set')) {
            setSource('demo');
            setListings(mockListings);
            return;
          }

          if (data.listings?.length) {
            for (const l of data.listings) {
              if (!seen.has(l.id)) {
                seen.add(l.id);
                allListings.push(l as Listing);
              }
            }
          }
        } catch {
          // one search failed — continue to next
          continue;
        }
      }

      setSearchProgress('');

      if (allListings.length > 0) {
        setListings(allListings);
        setSource('live');
        setLastRefresh(new Date());
      } else {
        setSource('error');
        setListings(mockListings);
      }

    } catch {
      setSource('error');
      setListings(mockListings);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchRealListings();
  }, [fetchRealListings]);

  const topDeals = [...listings]
    .filter(l => (l.profit / l.askingPrice) >= 0.15)
    .sort((a, b) => (b.profit / b.askingPrice) - (a.profit / a.askingPrice));

  const allSorted = [...listings].sort((a, b) => a.postedMinutesAgo - b.postedMinutesAgo);
  const displayListings = tab === 'picks' ? topDeals : allSorted;

  function timeSince(d: Date) {
    const mins = Math.floor((Date.now() - d.getTime()) / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    return `${Math.floor(mins / 60)}h ago`;
  }

  return (
    <div className="min-h-screen pb-28" style={{ background: '#000' }}>
      {/* Header */}
      <div className="sticky top-0 z-40 px-5 pt-12 pb-3" style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(20px) saturate(180%)', borderBottom: '0.5px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center justify-between mb-4">
          <Logo size="sm" />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Refresh button — always visible */}
            <button
              type="button"
              onClick={fetchRealListings}
              disabled={refreshing}
              style={{ width: 34, height: 34, background: '#1C1C1E', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.08)', opacity: refreshing ? 0.4 : 1 }}
            >
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24"
                className={refreshing ? 'spinning' : ''}>
                <path d="M23 4v6h-6M1 20v-6h6" stroke="#8E8E93" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" stroke="#8E8E93" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button
              type="button"
              onClick={() => setShowModal(true)}
              style={{ background: '#1C1C1E', color: '#fff', fontWeight: 600, fontSize: 13, padding: '7px 14px', borderRadius: 20, border: '1px solid rgba(255,255,255,0.08)' }}
            >
              + New Alert
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 6, background: '#1C1C1E', borderRadius: 10, padding: 3 }}>
          {(['picks', 'all'] as Tab[]).map(t => (
            <button key={t} type="button" onClick={() => setTab(t)}
              style={{ flex: 1, padding: '7px 0', borderRadius: 8, fontSize: 13, fontWeight: 600, color: tab === t ? '#fff' : '#636366', background: tab === t ? '#3A3A3C' : 'transparent', transition: 'all 0.2s' }}>
              {t === 'picks' ? 'Top Deals' : 'All Listings'}
            </button>
          ))}
        </div>
      </div>

      {/* Status banner */}
      <StatusBanner source={source} lastRefresh={lastRefresh} refreshing={refreshing}
        progress={searchProgress} onRefresh={fetchRealListings} timeSince={timeSince} />

      {/* Feed */}
      <div style={{ padding: '12px 12px 0' }}>
        {source === 'loading' ? (
          <LoadingSkeleton progress={searchProgress} />
        ) : displayListings.length === 0 ? (
          <div style={{ textAlign: 'center', paddingTop: 80 }}>
            <p style={{ color: '#636366', fontSize: 15 }}>No listings found.</p>
            <p style={{ color: '#3A3A3C', fontSize: 13, marginTop: 4 }}>Try adjusting your search filters.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
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

// ─── Status Banner ────────────────────────────────────────────
function StatusBanner({ source, lastRefresh, refreshing, progress, onRefresh, timeSince }: {
  source: DataSource; lastRefresh: Date | null; refreshing: boolean;
  progress: string; onRefresh: () => void; timeSince: (d: Date) => string;
}) {
  if (source === 'live') {
    return (
      <div style={{ margin: '12px 16px 0', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.15)', borderRadius: 14, padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 7, height: 7, background: '#22c55e', borderRadius: '50%', display: 'inline-block' }} />
          <span style={{ color: '#22c55e', fontSize: 13, fontWeight: 600 }}>Live</span>
          {lastRefresh && <span style={{ color: '#636366', fontSize: 12 }}>· {timeSince(lastRefresh)}</span>}
        </div>
        <button type="button" onClick={onRefresh} disabled={refreshing}
          style={{ color: '#8E8E93', fontSize: 12, fontWeight: 500, opacity: refreshing ? 0.4 : 1 }}>
          {refreshing ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>
    );
  }

  if (source === 'demo') {
    return (
      <div style={{ margin: '12px 16px 0', background: '#1C1C1E', borderRadius: 14, padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ color: '#636366', fontSize: 13 }}>Showing demo listings</span>
        <a href="/settings" style={{ color: '#8E8E93', fontSize: 12 }}>Connect data →</a>
      </div>
    );
  }

  if (source === 'error') {
    return (
      <div style={{ margin: '12px 16px 0', background: '#1C1C1E', borderRadius: 14, padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ color: '#636366', fontSize: 13 }}>Showing demo listings</span>
        <button type="button" onClick={onRefresh} style={{ color: '#8E8E93', fontSize: 12 }}>Retry</button>
      </div>
    );
  }

  // loading
  return (
    <div style={{ margin: '12px 16px 0', background: '#1C1C1E', borderRadius: 14, padding: '10px 14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ width: 7, height: 7, background: '#636366', borderRadius: '50%', display: 'inline-block' }} />
        <span style={{ color: '#636366', fontSize: 13 }}>{progress || 'Loading listings…'}</span>
      </div>
    </div>
  );
}

// ─── Loading Skeleton ─────────────────────────────────────────
function LoadingSkeleton({ progress }: { progress: string }) {
  return (
    <div>
      {progress && (
        <p style={{ color: '#636366', fontSize: 12, textAlign: 'center', marginBottom: 16 }}>{progress}</p>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {[...Array(6)].map((_, i) => (
          <div key={i} style={{ background: '#141414', borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ height: 118, background: '#1C1C1E' }} />
            <div style={{ padding: '10px 11px 12px' }}>
              <div style={{ height: 11, background: '#1C1C1E', borderRadius: 4, marginBottom: 6, width: '80%' }} />
              <div style={{ height: 9, background: '#1C1C1E', borderRadius: 4, marginBottom: 12, width: '50%' }} />
              <div style={{ height: 14, background: '#1C1C1E', borderRadius: 4, width: '70%' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
