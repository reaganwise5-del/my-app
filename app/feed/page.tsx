'use client';

import { useState, useEffect, useCallback } from 'react';
import Logo from '../components/Logo';
import BottomNav from '../components/BottomNav';
import ListingCardGrid from '../components/ListingCardGrid';
import NewSearchModal from '../components/NewSearchModal';
import { mockListings, type Listing } from '../lib/mockData';

type Tab = 'picks' | 'all';
type DataSource = 'live' | 'demo' | 'loading' | 'error';

export default function FeedPage() {
  const [tab, setTab] = useState<Tab>('picks');
  const [showModal, setShowModal] = useState(false);
  const [listings, setListings] = useState<Listing[]>(mockListings);
  const [source, setSource] = useState<DataSource>('demo');
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Try fetching real listings from Apify on mount
  const fetchRealListings = useCallback(async (silent = false) => {
    if (!silent) setSource('loading');
    setRefreshing(true);
    try {
      const res = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: 'used car', maxResults: 50 }),
      });
      const data = await res.json();

      if (res.ok && data.listings?.length > 0) {
        setListings(data.listings);
        setSource('live');
        setLastRefresh(new Date());
      } else if (data.error?.includes('APIFY_API_KEY not set')) {
        // No key yet — stay on demo
        setSource('demo');
        setListings(mockListings);
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

  const aiPicks = [...listings]
    .filter(l => (l.profit / l.askingPrice) >= 0.15)
    .sort((a, b) => (b.profit / b.askingPrice) - (a.profit / a.askingPrice));

  const allListings = [...listings].sort((a, b) => a.postedMinutesAgo - b.postedMinutesAgo);

  const displayListings = tab === 'picks' ? aiPicks : allListings;

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
          <button
            type="button"
            onClick={() => setShowModal(true)}
            style={{ background: '#22c55e', color: '#000', fontWeight: 700, fontSize: 13, padding: '7px 14px', borderRadius: 20 }}
          >
            + New Search
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            onClick={() => setTab('picks')}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 20, fontSize: 14, fontWeight: 700, background: tab === 'picks' ? '#22c55e' : '#1C1C1E', color: tab === 'picks' ? '#000' : '#8E8E93', transition: 'all 0.2s' }}
          >
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24">
              <path d="M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z" stroke={tab === 'picks' ? '#000' : '#8E8E93'} strokeWidth="2" strokeLinejoin="round" />
            </svg>
            Top Deals
            {tab === 'picks' && (
              <span style={{ background: 'rgba(0,0,0,0.2)', color: '#000', fontSize: 11, fontWeight: 800, padding: '2px 6px', borderRadius: 10 }}>
                {aiPicks.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setTab('all')}
            style={{ padding: '8px 16px', borderRadius: 20, fontSize: 14, fontWeight: 700, background: tab === 'all' ? '#fff' : '#1C1C1E', color: tab === 'all' ? '#000' : '#8E8E93', transition: 'all 0.2s' }}
          >
            All Listings
          </button>
        </div>
      </div>

      {/* Data source banner */}
      <DataBanner source={source} lastRefresh={lastRefresh} refreshing={refreshing} onRefresh={() => fetchRealListings(false)} timeSince={timeSince} />

      {/* AI Picks description */}
      {tab === 'picks' && (
        <div style={{ margin: '4px 16px 0', background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.15)', borderRadius: 16, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
            <path d="M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z" stroke="#22c55e" strokeWidth="2" strokeLinejoin="round" />
          </svg>
          <p style={{ color: '#8E8E93', fontSize: 12, lineHeight: 1.4 }}>
            <span style={{ color: '#22c55e', fontWeight: 700 }}>Top Deals</span> — sorted by profit margin. Cars only, no junk.
          </p>
        </div>
      )}

      {/* Feed — 2 column grid */}
      <div style={{ padding: '12px 12px 0' }}>
        {source === 'loading' ? (
          <LoadingSkeleton />
        ) : displayListings.length === 0 ? (
          <div style={{ textAlign: 'center', paddingTop: 80 }}>
            <p style={{ color: '#636366', fontSize: 15 }}>No listings yet.</p>
            <p style={{ color: '#3A3A3C', fontSize: 13, marginTop: 4 }}>Create a search to start getting alerts.</p>
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

// ─── Data Source Banner ───────────────────────────────────────────────
function DataBanner({ source, lastRefresh, refreshing, onRefresh, timeSince }: {
  source: DataSource;
  lastRefresh: Date | null;
  refreshing: boolean;
  onRefresh: () => void;
  timeSince: (d: Date) => string;
}) {
  if (source === 'live') {
    return (
      <div style={{ margin: '12px 16px 0', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.18)', borderRadius: 14, padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 8, height: 8, background: '#22c55e', borderRadius: '50%', display: 'inline-block', boxShadow: '0 0 6px #22c55e' }} />
          <span style={{ color: '#22c55e', fontSize: 13, fontWeight: 700 }}>Live Data</span>
          {lastRefresh && <span style={{ color: '#636366', fontSize: 12 }}>· {timeSince(lastRefresh)}</span>}
        </div>
        <button type="button" onClick={onRefresh} disabled={refreshing}
          style={{ color: '#22c55e', fontSize: 12, fontWeight: 600, opacity: refreshing ? 0.5 : 1 }}>
          {refreshing ? 'Refreshing…' : '↻ Refresh'}
        </button>
      </div>
    );
  }

  if (source === 'demo') {
    return (
      <div style={{ margin: '12px 16px 0', background: 'rgba(234,179,8,0.07)', border: '1px solid rgba(234,179,8,0.2)', borderRadius: 14, padding: '10px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 14 }}>🎭</span>
            <span style={{ color: '#eab308', fontSize: 13, fontWeight: 700 }}>Demo Mode</span>
          </div>
          <a href="/settings" style={{ color: '#eab308', fontSize: 12, fontWeight: 600 }}>Connect →</a>
        </div>
        <p style={{ color: '#636366', fontSize: 12, marginTop: 4, lineHeight: 1.4 }}>
          Showing sample data. Go to <strong style={{ color: '#8E8E93' }}>Settings → Connect Data</strong> to pull real Facebook Marketplace listings.
        </p>
      </div>
    );
  }

  if (source === 'error') {
    return (
      <div style={{ margin: '12px 16px 0', background: 'rgba(255,69,58,0.07)', border: '1px solid rgba(255,69,58,0.2)', borderRadius: 14, padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 14 }}>⚠️</span>
          <span style={{ color: '#ff453a', fontSize: 13, fontWeight: 700 }}>Connection error — showing demo data</span>
        </div>
        <button type="button" onClick={onRefresh}
          style={{ color: '#ff453a', fontSize: 12, fontWeight: 600 }}>
          Retry
        </button>
      </div>
    );
  }

  // loading
  return (
    <div style={{ margin: '12px 16px 0', background: '#1C1C1E', borderRadius: 14, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ width: 8, height: 8, background: '#3A3A3C', borderRadius: '50%', display: 'inline-block', animation: 'pulse 1s infinite' }} />
      <span style={{ color: '#636366', fontSize: 13 }}>Checking for live listings…</span>
    </div>
  );
}

// ─── Loading Skeleton ─────────────────────────────────────────────────
function LoadingSkeleton() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
      {[...Array(6)].map((_, i) => (
        <div key={i} style={{ background: '#1C1C1E', borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ height: 130, background: '#2C2C2E' }} />
          <div style={{ padding: 10 }}>
            <div style={{ height: 12, background: '#2C2C2E', borderRadius: 6, marginBottom: 8, width: '80%' }} />
            <div style={{ height: 18, background: '#2C2C2E', borderRadius: 6, marginBottom: 6, width: '60%' }} />
            <div style={{ height: 10, background: '#2C2C2E', borderRadius: 6, width: '40%' }} />
          </div>
        </div>
      ))}
    </div>
  );
}
