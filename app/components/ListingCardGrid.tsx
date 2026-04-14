'use client';

import Link from 'next/link';
import { type Listing } from '../lib/mockData';

function timeAgo(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  return `${Math.floor(minutes / 60)}h`;
}

function getDealBadge(profit: number, askingPrice: number) {
  const pct = (profit / askingPrice) * 100;
  if (pct >= 35) return { label: '🔥 Steal', bg: '#22c55e', color: '#000' };
  if (pct >= 20) return { label: '✅ Great Deal', bg: '#16a34a', color: '#fff' };
  if (pct >= 10) return { label: '👍 Good Deal', bg: '#854d0e', color: '#fde68a' };
  return { label: 'Fair', bg: '#3A3A3C', color: '#adadad' };
}

export default function ListingCardGrid({ listing }: { listing: Listing }) {
  const profitPct = Math.round((listing.profit / listing.askingPrice) * 100);
  const badge = getDealBadge(listing.profit, listing.askingPrice);

  return (
    <Link
      href={`/feed/${listing.id}`}
      style={{ background: '#1C1C1E', borderRadius: 16, overflow: 'hidden', display: 'block' }}
      className="active:scale-95 transition-transform"
    >
      {/* Image */}
      <div className="relative">
        <img
          src={listing.image}
          alt={listing.title}
          className="w-full h-28 object-cover"
        />
        {/* Deal badge */}
        <div style={{ position: 'absolute', top: 8, left: 8, background: badge.bg, color: badge.color, fontSize: 11, fontWeight: 800, padding: '3px 8px', borderRadius: 20 }}>
          {badge.label}
        </div>
        {/* Time */}
        <div className="absolute bottom-1.5 right-2 bg-black/70 text-white text-xs font-semibold px-1.5 py-0.5 rounded-full">
          {timeAgo(listing.postedMinutesAgo)}
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-white font-bold text-xs leading-tight line-clamp-1">{listing.title}</p>
        <p className="text-zinc-500 text-xs mt-0.5">{(listing.mileage / 1000).toFixed(0)}k mi</p>

        {/* Profit — the big number */}
        <div style={{ marginTop: 10, background: 'rgba(34,197,94,0.1)', borderRadius: 10, padding: '8px 10px' }}>
          <p style={{ color: '#22c55e', fontWeight: 800, fontSize: 20, lineHeight: 1 }}>+${listing.profit.toLocaleString()}</p>
          <p style={{ color: '#636366', fontSize: 11, fontWeight: 600, marginTop: 3 }}>{profitPct}% margin</p>
        </div>

        {/* Asking vs KBB */}
        <div className="mt-2 flex justify-between">
          <div>
            <p className="text-zinc-500 text-xs">Ask</p>
            <p className="text-white font-bold text-xs">${(listing.askingPrice / 1000).toFixed(1)}k</p>
          </div>
          <div className="text-right">
            <p className="text-zinc-500 text-xs">KBB</p>
            <p className="text-zinc-300 font-bold text-xs">${(listing.marketValue / 1000).toFixed(1)}k</p>
          </div>
        </div>
      </div>
    </Link>
  );
}
