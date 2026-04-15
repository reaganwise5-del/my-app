'use client';

import Link from 'next/link';
import { type Listing } from '../lib/mockData';

function timeAgo(minutes: number): string {
  if (minutes < 60) return `${minutes}m ago`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
  return `${Math.floor(minutes / 1440)}d ago`;
}

function getDealTag(profit: number, askingPrice: number) {
  const pct = (profit / askingPrice) * 100;
  if (pct >= 35) return { label: 'HOT', color: '#ff6b35' };
  if (pct >= 20) return { label: 'DEAL', color: '#22c55e' };
  if (pct >= 10) return { label: 'GOOD', color: '#8E8E93' };
  return null; // no badge for fair deals
}

export default function ListingCardGrid({ listing }: { listing: Listing }) {
  const profitPct = Math.round((listing.profit / listing.askingPrice) * 100);
  const tag = getDealTag(listing.profit, listing.askingPrice);

  return (
    <Link
      href={`/feed/${listing.id}`}
      style={{ background: '#141414', borderRadius: 14, overflow: 'hidden', display: 'block', border: '1px solid rgba(255,255,255,0.06)' }}
      className="active:opacity-80 transition-opacity"
    >
      {/* Image */}
      <div style={{ position: 'relative' }}>
        <img
          src={listing.image}
          alt={listing.title}
          style={{ width: '100%', height: 118, objectFit: 'cover', display: 'block' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.55) 100%)' }} />

        {/* Tag — top left, small and clean */}
        {tag && (
          <span style={{ position: 'absolute', top: 8, left: 8, color: tag.color, fontSize: 10, fontWeight: 800, letterSpacing: 0.8 }}>
            {tag.label}
          </span>
        )}

        {/* Time — bottom right */}
        <span style={{ position: 'absolute', bottom: 7, right: 8, color: 'rgba(255,255,255,0.7)', fontSize: 10, fontWeight: 500 }}>
          {timeAgo(listing.postedMinutesAgo)}
        </span>
      </div>

      {/* Info */}
      <div style={{ padding: '10px 11px 12px' }}>
        <p style={{ color: '#fff', fontWeight: 600, fontSize: 12, lineHeight: 1.3, marginBottom: 2, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          {listing.title}
        </p>
        <p style={{ color: '#636366', fontSize: 11, marginBottom: 10 }}>
          {(listing.mileage / 1000).toFixed(0)}k mi · {listing.location.split(',')[0]}
        </p>

        {/* Price row */}
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <span style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>${listing.askingPrice.toLocaleString()}</span>
          <span style={{ color: '#22c55e', fontWeight: 700, fontSize: 13 }}>+${listing.profit.toLocaleString()}</span>
        </div>

        {/* Thin profit bar */}
        <div style={{ marginTop: 7, height: 3, background: '#2C2C2E', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${Math.min(profitPct * 2, 100)}%`, background: profitPct >= 25 ? '#22c55e' : profitPct >= 12 ? '#eab308' : '#636366', borderRadius: 3 }} />
        </div>
      </div>
    </Link>
  );
}
