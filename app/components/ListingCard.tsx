'use client';

import { type Listing } from '../lib/mockData';

function timeAgo(minutes: number): string {
  if (minutes < 60) return `${minutes}m ago`;
  return `${Math.floor(minutes / 60)}h ago`;
}

function getDealBadge(profit: number, askingPrice: number) {
  const pct = (profit / askingPrice) * 100;
  if (pct >= 35) return { label: '🔥 STEAL', color: 'bg-green-500 text-black' };
  if (pct >= 20) return { label: '✅ Great Deal', color: 'bg-green-500/20 text-green-400 border border-green-500/40' };
  if (pct >= 10) return { label: '👍 Good Deal', color: 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30' };
  if (pct >= 0)  return { label: 'Fair Price', color: 'bg-zinc-800 text-zinc-400 border border-zinc-700' };
  return { label: 'Overpriced', color: 'bg-red-500/15 text-red-400 border border-red-500/30' };
}

export default function ListingCard({ listing }: { listing: Listing }) {
  const profitPct = Math.round((listing.profit / listing.askingPrice) * 100);
  const badge = getDealBadge(listing.profit, listing.askingPrice);

  return (
    <div className="bg-zinc-900/70 rounded-2xl overflow-hidden border border-zinc-800/80">
      {/* Image */}
      <div className="relative">
        <img src={listing.image} alt={listing.title} className="w-full h-48 object-cover" />

        {/* Deal badge — top center */}
        <div className={`absolute top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold ${badge.color}`}>
          {badge.label}
        </div>

        <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm text-white text-xs font-semibold px-2 py-1 rounded-full">
          {timeAgo(listing.postedMinutesAgo)}
        </div>
        <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-sm text-white text-xs font-semibold px-2 py-1 rounded-full">
          {listing.distance} mi away
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-white font-bold text-lg leading-tight">{listing.title}</h3>
        <p className="text-zinc-500 text-sm mt-0.5">{listing.mileage.toLocaleString()} miles · {listing.location}</p>

        {/* Profit — the hero number */}
        <div className="mt-4 bg-green-500/10 border border-green-500/25 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-zinc-400 text-xs font-medium">Est. Profit</p>
            <p className="text-green-400 font-black text-3xl tracking-tight mt-0.5">
              +${listing.profit.toLocaleString()}
            </p>
            <p className="text-green-500/70 text-xs font-semibold mt-0.5">{profitPct}% margin</p>
          </div>
          <div className="text-right">
            <p className="text-zinc-400 text-xs">Asking / Market</p>
            <p className="text-white font-bold text-base mt-1">${listing.askingPrice.toLocaleString()}</p>
            <p className="text-zinc-500 text-sm">${listing.marketValue.toLocaleString()} KBB</p>
          </div>
        </div>

        {/* Deal strength bar */}
        <div className="mt-3">
          <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full"
              style={{ width: `${Math.min(profitPct * 2, 100)}%` }}
            />
          </div>
        </div>

        {/* CTA */}
        <a
          href={listing.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 block w-full bg-white text-black font-bold text-center py-3.5 rounded-xl hover:bg-zinc-200 transition-colors text-sm"
        >
          View on Facebook Marketplace
        </a>
      </div>
    </div>
  );
}
