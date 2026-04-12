'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { mockListings } from '../../lib/mockData';

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const listing = mockListings.find(l => l.id === id);
  const [saved, setSaved] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);

  if (!listing) return (
    <div style={{ background: '#000', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#8E8E93' }}>Listing not found.</p>
    </div>
  );

  const profitPct = Math.round((listing.profit / listing.askingPrice) * 100);

  // Value scale: ratio of asking vs market value (lower = better deal)
  // 0.5 = asking is 50% of KBB (amazing), 1.0 = asking equals KBB (fair), 1.1+ = overpriced
  const ratio = listing.askingPrice / listing.marketValue;
  // Bar fill: how good is the deal? invert ratio, clamp 0–100
  const barFill = Math.round(Math.max(0, Math.min(100, (1 - ratio) * 250 + 30)));
  // Bar color: green if good deal, yellow if fair, red if overpriced
  const barColor = ratio < 0.75 ? '#22c55e' : ratio < 0.90 ? '#eab308' : '#ef4444';
  // Needle position on the scale (0=far left=steal, 100=far right=overpriced)
  const needlePos = Math.round(Math.max(5, Math.min(95, ratio * 80)));

  // Deal label
  const dealLabel = profitPct >= 35 ? '🔥 Steal' : profitPct >= 20 ? '✅ Great Deal' : profitPct >= 10 ? '👍 Good Deal' : 'Fair';
  const dealLabelBg = profitPct >= 35 ? '#22c55e' : profitPct >= 20 ? '#16a34a' : profitPct >= 10 ? '#854d0e' : '#3A3A3C';
  const dealLabelColor = profitPct >= 10 ? (profitPct >= 20 ? '#fff' : '#fde68a') : '#adadad';

  return (
    <div style={{ background: '#000', minHeight: '100vh', paddingBottom: 40 }}>
      {/* Header */}
      <div style={{ position: 'sticky', top: 0, zIndex: 20, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: '0.5px solid rgba(255,255,255,0.08)', padding: '52px 16px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={() => router.back()} style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#22c55e', fontSize: 17, background: 'none', padding: 0 }}>
          <svg width="10" height="17" fill="none" viewBox="0 0 10 17">
            <path d="M9 1L1 8.5 9 16" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Feed
        </button>
        <button onClick={() => setSaved(v => !v)} style={{ background: 'none', padding: 4 }}>
          <svg width="24" height="24" fill={saved ? '#22c55e' : 'none'} viewBox="0 0 24 24">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" stroke={saved ? '#22c55e' : '#8E8E93'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* Hero image */}
      <div style={{ position: 'relative' }}>
        <img src={listing.image} alt={listing.title} style={{ width: '100%', height: 240, objectFit: 'cover' }} />
        <div style={{ position: 'absolute', top: 12, left: 12, background: dealLabelBg, color: dealLabelColor, fontSize: 12, fontWeight: 800, padding: '4px 10px', borderRadius: 20 }}>
          {dealLabel}
        </div>
      </div>

      <div style={{ padding: '20px 16px 0' }}>
        {/* Title + price */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
          <h1 style={{ color: '#fff', fontWeight: 800, fontSize: 22, letterSpacing: -0.5, flex: 1, paddingRight: 12 }}>{listing.title}</h1>
          <p style={{ color: '#fff', fontWeight: 800, fontSize: 22, letterSpacing: -0.5, whiteSpace: 'nowrap' }}>${listing.askingPrice.toLocaleString()}</p>
        </div>

        {/* Posted info */}
        <p style={{ color: '#8E8E93', fontSize: 13, marginBottom: 16 }}>
          Posted {listing.postedAt} · {listing.platform} · {listing.distance} mi away
        </p>

        {/* Profit highlight */}
        <div style={{ background: 'rgba(34,197,94,0.1)', borderRadius: 14, padding: '14px 16px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ color: '#8E8E93', fontSize: 12 }}>Est. Profit</p>
            <p style={{ color: '#22c55e', fontWeight: 800, fontSize: 28, letterSpacing: -1 }}>+${listing.profit.toLocaleString()}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ color: '#8E8E93', fontSize: 12 }}>Margin</p>
            <p style={{ color: '#22c55e', fontWeight: 700, fontSize: 20 }}>{profitPct}%</p>
          </div>
        </div>

        {/* KBB + Value Scale */}
        <div style={{ background: '#1C1C1E', borderRadius: 14, padding: 16, marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <div>
              <p style={{ color: '#8E8E93', fontSize: 12 }}>Asking Price</p>
              <p style={{ color: '#fff', fontWeight: 700, fontSize: 17 }}>${listing.askingPrice.toLocaleString()}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ color: '#8E8E93', fontSize: 12 }}>KBB Est. Value</p>
              <p style={{ color: '#fff', fontWeight: 700, fontSize: 17 }}>${listing.marketValue.toLocaleString()}</p>
            </div>
          </div>

          {/* Scale bar — red to green gradient, needle shows where this deal sits */}
          <p style={{ color: '#8E8E93', fontSize: 12, marginBottom: 8 }}>Deal Scale</p>
          <div style={{ position: 'relative', height: 10, borderRadius: 10, background: 'linear-gradient(to right, #22c55e, #eab308, #ef4444)', marginBottom: 6 }}>
            {/* Needle */}
            <div style={{ position: 'absolute', top: -4, left: `${needlePos}%`, transform: 'translateX(-50%)', width: 18, height: 18, background: '#fff', borderRadius: '50%', boxShadow: '0 0 0 3px ' + barColor, border: '2px solid #000' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#22c55e', fontSize: 10, fontWeight: 600 }}>Steal</span>
            <span style={{ color: '#eab308', fontSize: 10, fontWeight: 600 }}>Fair</span>
            <span style={{ color: '#ef4444', fontSize: 10, fontWeight: 600 }}>Overpriced</span>
          </div>
        </div>

        {/* AI Evaluate button */}
        <button
          onClick={() => setAiOpen(true)}
          style={{ width: '100%', background: 'linear-gradient(135deg, #1a3a1a, #22c55e22)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 14, padding: '14px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 16 }}
        >
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
            <path d="M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z" stroke="#22c55e" strokeWidth="2" strokeLinejoin="round" />
          </svg>
          <span style={{ color: '#22c55e', fontWeight: 700, fontSize: 15 }}>Evaluate with AI</span>
        </button>

        {/* Details */}
        <div style={{ background: '#1C1C1E', borderRadius: 14, padding: '0 16px', marginBottom: 16 }}>
          {[
            { label: 'Location', value: listing.location },
            { label: 'Distance', value: `${listing.distance} miles` },
            { label: 'Mileage', value: `${listing.mileage.toLocaleString()} mi` },
            { label: 'Year', value: String(listing.year) },
            { label: 'Platform', value: listing.platform },
          ].map((row, i, arr) => (
            <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '13px 0', borderBottom: i < arr.length - 1 ? '0.5px solid rgba(255,255,255,0.06)' : 'none' }}>
              <span style={{ color: '#8E8E93', fontSize: 14 }}>{row.label}</span>
              <span style={{ color: '#fff', fontSize: 14, fontWeight: 500 }}>{row.value}</span>
            </div>
          ))}
        </div>

        {/* Description */}
        <div style={{ background: '#1C1C1E', borderRadius: 14, padding: 16, marginBottom: 20 }}>
          <p style={{ color: '#8E8E93', fontSize: 12, marginBottom: 6 }}>Seller Description</p>
          <p style={{ color: '#fff', fontSize: 14, lineHeight: 1.6 }}>{listing.description}</p>
        </div>

        {/* View on Facebook button */}
        <a href={listing.url} target="_blank" rel="noopener noreferrer"
          style={{ display: 'block', width: '100%', background: '#1877F2', borderRadius: 14, padding: '15px 0', textAlign: 'center', color: '#fff', fontWeight: 700, fontSize: 16 }}>
          View on {listing.platform}
        </a>
      </div>

      {/* AI Coming Soon sheet */}
      {aiOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 100, display: 'flex', alignItems: 'flex-end' }}>
          <div style={{ background: '#1C1C1E', borderRadius: '20px 20px 0 0', width: '100%', padding: '24px 20px 48px', textAlign: 'center' }}>
            <div style={{ width: 36, height: 5, background: '#3A3A3C', borderRadius: 3, margin: '0 auto 24px' }} />
            <div style={{ width: 56, height: 56, background: 'rgba(34,197,94,0.12)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
                <path d="M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z" stroke="#22c55e" strokeWidth="2" strokeLinejoin="round" />
              </svg>
            </div>
            <p style={{ color: '#fff', fontWeight: 700, fontSize: 18, marginBottom: 8 }}>AI Deal Evaluation</p>
            <p style={{ color: '#8E8E93', fontSize: 14, lineHeight: 1.6, marginBottom: 28 }}>
              AI will analyze the photo, description, price, and market data to give you a full breakdown — best case, worst case, risks, and a flip strategy. Coming at launch.
            </p>
            <button onClick={() => setAiOpen(false)} style={{ width: '100%', background: '#2C2C2E', color: '#fff', fontWeight: 600, fontSize: 17, padding: '14px 0', borderRadius: 14 }}>
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
