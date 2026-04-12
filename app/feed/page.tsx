'use client';

import { useState } from 'react';
import Logo from '../components/Logo';
import BottomNav from '../components/BottomNav';
import ListingCardGrid from '../components/ListingCardGrid';
import NewSearchModal from '../components/NewSearchModal';
import { mockListings } from '../lib/mockData';

type Tab = 'picks' | 'all';

export default function FeedPage() {
  const [tab, setTab] = useState<Tab>('picks');
  const [showModal, setShowModal] = useState(false);

  const aiPicks = [...mockListings]
    .filter(l => (l.profit / l.askingPrice) >= 0.15)
    .sort((a, b) => (b.profit / b.askingPrice) - (a.profit / a.askingPrice));

  const allListings = [...mockListings].sort((a, b) => a.postedMinutesAgo - b.postedMinutesAgo);

  const listings = tab === 'picks' ? aiPicks : allListings;

  return (
    <div className="min-h-screen bg-[#050505] pb-28">
      {/* Header */}
      <div className="sticky top-0 bg-[#050505]/95 backdrop-blur-md border-b border-zinc-900/80 z-40 px-5 pt-12 pb-3">
        <div className="flex items-center justify-between mb-4">
          <Logo size="sm" />
          <button
            onClick={() => setShowModal(true)}
            className="bg-green-500 hover:bg-green-400 transition-colors text-black font-bold text-xs px-3 py-1.5 rounded-full"
          >
            + New Search
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setTab('picks')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold transition-all ${
              tab === 'picks'
                ? 'bg-green-500 text-black'
                : 'bg-zinc-900 text-zinc-400'
            }`}
          >
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
              <path d="M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z"
                stroke={tab === 'picks' ? 'black' : '#71717a'} strokeWidth="2" strokeLinejoin="round" />
            </svg>
            AI Picks
            {tab === 'picks' && (
              <span className="bg-black/20 text-black text-xs font-bold px-1.5 py-0.5 rounded-full ml-0.5">
                {aiPicks.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setTab('all')}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
              tab === 'all'
                ? 'bg-white text-black'
                : 'bg-zinc-900 text-zinc-400'
            }`}
          >
            All Listings
          </button>
        </div>
      </div>

      {/* AI Picks description */}
      {tab === 'picks' && (
        <div className="mx-5 mt-4 mb-2 bg-green-500/8 border border-green-500/20 rounded-2xl px-4 py-3 flex items-center gap-3">
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" className="shrink-0">
            <path d="M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z" stroke="#22c55e" strokeWidth="2" strokeLinejoin="round" />
          </svg>
          <p className="text-zinc-400 text-xs leading-relaxed">
            <span className="text-green-400 font-bold">AI Picks</span> — highest margin flips in your area. Cars only. No junk.
          </p>
        </div>
      )}

      {/* Feed — 2 column grid */}
      <div className="px-3 pt-3">
        {listings.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-zinc-500">No listings yet.</p>
            <p className="text-zinc-600 text-sm mt-1">Create a search to start getting alerts.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {listings.map((listing) => (
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
