'use client';

import Link from 'next/link';
import { type Listing } from '../lib/mockData';

function timeAgo(minutes: number): string {
  if (minutes < 60) return `${minutes}m ago`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
  return `${Math.floor(minutes / 1440)}d ago`;
}

function getDealBadge(profit: number, askingPrice: number) {
  const pct = (profit / askingPrice) * 100;
  if (pct >= 35) return { label: '🔥 Hot Deal', bg: '#FFF4EE', color: '#C44B0F', border: 'rgba(251,71,31,0.18)' };
  if (pct >= 20) return { label: '✦ Good Deal', bg: '#EDFBF3', color: '#15803D', border: 'rgba(21,128,61,0.18)' };
  if (pct >= 8) return { label: 'Fair Price', bg: '#F5F3F0', color: '#6B6560', border: 'rgba(107,101,96,0.15)' };
  return null;
}

export default function ListingCardGrid({ listing }: { listing: Listing }) {
  const badge = getDealBadge(listing.profit, listing.askingPrice);
  const profitPct = Math.round((listing.profit / listing.askingPrice) * 100);
  const barColor = profitPct >= 25 ? '#15803D' : profitPct >= 12 ? '#D97706' : '#D5CFC8';

  return (
    <Link
      href={listing.url || '#'}
      target="_blank"
      rel="noopener noreferrer"
      className="card-lift fade-up"
      style={{
        background: '#fff',
        borderRadius: 18,
        overflow: 'hidden',
        display: 'block',
        boxShadow: '0 1px 3px rgba(26,26,46,0.06), 0 4px 16px rgba(26,26,46,0.07)',
        border: '1px solid rgba(26,26,46,0.06)',
        textDecoration: 'none',
      }}
    >
      {/* Image */}
      <div style={{ position: 'relative' }}>
        <img
          src={listing.image}
          alt={listing.title}
          style={{ width: '100%', height: 190, objectFit: 'cover', display: 'block' }}
          loading="lazy"
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 45%, rgba(26,26,46,0.5) 100%)' }} />

        {badge && (
          <span style={{ position: 'absolute', top: 12, left: 12, background: badge.bg, color: badge.color, fontSize: 11.5, fontWeight: 700, padding: '5px 11px', borderRadius: 20, border: `1px solid ${badge.border}`, backdropFilter: 'blur(4px)' }}>
            {badge.label}
          </span>
        )}

        <span style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(26,26,46,0.50)', backdropFilter: 'blur(8px)', color: 'rgba(255,255,255,0.92)', fontSize: 11, fontWeight: 500, padding: '4px 9px', borderRadius: 20 }}>
          {timeAgo(listing.postedMinutesAgo)}
        </span>

        {/* Price overlay on image bottom */}
        <div style={{ position: 'absolute', bottom: 12, left: 14 }}>
          <span style={{ color: '#fff', fontWeight: 800, fontSize: 24, letterSpacing: -0.8, textShadow: '0 1px 8px rgba(26,26,46,0.5)' }}>
            ${listing.askingPrice.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Info */}
      <div style={{ padding: '14px 16px 16px' }}>
        <p style={{ color: '#1A1A2E', fontWeight: 700, fontSize: 15, lineHeight: 1.4, marginBottom: 8, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          {listing.title}
        </p>

        {/* Stats row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#9B9490', fontSize: 12, fontWeight: 500 }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#9B9490" strokeWidth="2"/><path d="M12 6v6l4 2" stroke="#9B9490" strokeWidth="2" strokeLinecap="round"/></svg>
            {(listing.mileage / 1000).toFixed(0)}k mi
          </span>
          <span style={{ color: '#9B9490', fontSize: 12, fontWeight: 500 }}>{listing.year}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#9B9490', fontSize: 12, fontWeight: 500 }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="#9B9490" strokeWidth="2"/><circle cx="12" cy="10" r="3" stroke="#9B9490" strokeWidth="2"/></svg>
            {listing.location.split(',')[0]}
          </span>
        </div>

        {/* Profit indicator */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ height: 4, flex: 1, background: '#F0ECE7', borderRadius: 4, overflow: 'hidden', marginRight: 12 }}>
            <div style={{ height: '100%', width: `${Math.min(profitPct * 2, 100)}%`, background: barColor, borderRadius: 4, transition: 'width 0.6s ease' }} />
          </div>
          {listing.profit > 0 && (
            <span style={{ background: 'rgba(21,128,61,0.09)', color: '#15803D', fontWeight: 700, fontSize: 12.5, padding: '4px 10px', borderRadius: 20, border: '1px solid rgba(21,128,61,0.15)', whiteSpace: 'nowrap' }}>
              +${listing.profit.toLocaleString()} est.
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
