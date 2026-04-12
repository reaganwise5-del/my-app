'use client';

import { useState } from 'react';
import Link from 'next/link';
import Logo from '../components/Logo';
import BottomNav from '../components/BottomNav';
import Toggle from '../components/Toggle';

const chevron = (
  <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
    <path d="M9 18l6-6-6-6" stroke="#3A3A3C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

function Row({ label, value, action, onTap, destructive }: {
  label: string; value?: string; action?: string; onTap?: () => void; destructive?: boolean;
}) {
  return (
    <div onClick={onTap} role={onTap ? 'button' : undefined}
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '0.5px solid rgba(255,255,255,0.06)', cursor: onTap ? 'pointer' : 'default' }}
      className="last:border-0 active:opacity-60 transition-opacity">
      <span style={{ color: destructive ? '#ff453a' : '#fff', fontSize: 15 }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {value && <span style={{ color: '#8E8E93', fontSize: 15 }}>{value}</span>}
        {action && <span style={{ color: '#22c55e', fontSize: 15 }}>{action}</span>}
        {onTap && chevron}
      </div>
    </div>
  );
}

function ToggleRow({ label, active, onToggle }: { label: string; active: boolean; onToggle: () => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '0.5px solid rgba(255,255,255,0.06)' }} className="last:border-0">
      <span style={{ color: '#fff', fontSize: 15 }}>{label}</span>
      <Toggle active={active} onToggle={onToggle} />
    </div>
  );
}

function EditRow({ label, value, onSave }: { label: string; value: string; onSave: (v: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  return (
    <div style={{ padding: '14px 0', borderBottom: '0.5px solid rgba(255,255,255,0.06)' }} className="last:border-0">
      {editing ? (
        <div>
          <p style={{ color: '#8E8E93', fontSize: 12, marginBottom: 6 }}>{label}</p>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              autoFocus
              value={draft}
              onChange={e => setDraft(e.target.value)}
              style={{ flex: 1, background: '#2C2C2E', color: '#fff', fontSize: 15, padding: '8px 12px', borderRadius: 10, border: 'none', outline: 'none' }}
            />
            <button onClick={() => { onSave(draft); setEditing(false); }}
              style={{ background: '#22c55e', color: '#000', fontWeight: 700, fontSize: 13, padding: '8px 14px', borderRadius: 10 }}>
              Save
            </button>
            <button onClick={() => { setDraft(value); setEditing(false); }}
              style={{ background: '#3A3A3C', color: '#fff', fontWeight: 600, fontSize: 13, padding: '8px 12px', borderRadius: 10 }}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div onClick={() => setEditing(true)} role="button" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
          className="active:opacity-60 transition-opacity">
          <span style={{ color: '#fff', fontSize: 15 }}>{label}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ color: '#8E8E93', fontSize: 15 }}>{value}</span>
            {chevron}
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <p style={{ color: '#8E8E93', fontSize: 13, padding: '0 20px', marginBottom: 6 }}>{title}</p>
      <div style={{ background: '#1C1C1E', borderRadius: 16, padding: '0 16px', margin: '0 16px' }}>
        {children}
      </div>
    </div>
  );
}

// Coming soon sheet
function ComingSoon({ label, onClose }: { label: string; onClose: () => void }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', zIndex: 100, display: 'flex', alignItems: 'flex-end' }}>
      <div style={{ background: '#1C1C1E', borderRadius: '20px 20px 0 0', width: '100%', padding: '24px 20px 40px', textAlign: 'center' }}>
        <div style={{ width: 36, height: 5, background: '#3A3A3C', borderRadius: 3, margin: '0 auto 24px' }} />
        <div style={{ width: 52, height: 52, background: '#2C2C2E', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="#22c55e" strokeWidth="1.8" strokeLinejoin="round"/>
          </svg>
        </div>
        <p style={{ color: '#fff', fontWeight: 700, fontSize: 18, marginBottom: 8 }}>{label}</p>
        <p style={{ color: '#8E8E93', fontSize: 14, marginBottom: 28 }}>This feature will be available when FlipAlert launches. Stay tuned!</p>
        <button onClick={onClose} style={{ width: '100%', background: '#2C2C2E', color: '#fff', fontWeight: 600, fontSize: 17, padding: '14px 0', borderRadius: 14 }}>
          Got it
        </button>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const [pushNotifs, setPushNotifs] = useState(true);
  const [alertSound, setAlertSound] = useState(true);
  const [name, setName] = useState('Your Name');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [comingSoon, setComingSoon] = useState<string | null>(null);
  const [shareCopied, setShareCopied] = useState(false);

  function soon(label: string) { setComingSoon(label); }

  function handleShare() {
    if (navigator.share) {
      navigator.share({ title: 'FlipAlert', text: 'Check out FlipAlert — the best car flip deal alert app!', url: 'https://flipalert.app' });
    } else {
      navigator.clipboard.writeText('https://flipalert.app').then(() => {
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 2000);
      });
    }
  }

  return (
    <div className="min-h-screen pb-safe" style={{ background: '#000' }}>
      <div className="px-5 pt-14 pb-5">
        <Logo size="sm" />
        <h1 style={{ color: '#fff', fontWeight: 800, fontSize: 28, marginTop: 16, letterSpacing: -0.5 }}>Settings</h1>
      </div>

      {/* Plan banner */}
      <div style={{ margin: '0 16px 20px', background: 'rgba(34,197,94,0.08)', borderRadius: 16, padding: 16 }}>
        <div className="flex items-center justify-between">
          <div>
            <p style={{ color: '#22c55e', fontWeight: 700, fontSize: 15 }}>Basic Plan</p>
            <p style={{ color: '#8E8E93', fontSize: 13, marginTop: 2 }}>5 searches · Facebook Marketplace</p>
          </div>
          <button onClick={() => soon('Upgrade to Pro')}
            style={{ background: '#22c55e', color: '#000', fontWeight: 700, fontSize: 13, padding: '7px 14px', borderRadius: 20 }}>
            Upgrade
          </button>
        </div>
        <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
          <p style={{ color: '#8E8E93', fontSize: 13 }}>✓ 5 active searches</p>
          <p style={{ color: '#3A3A3C', fontSize: 13 }}>✗ Unlimited searches</p>
          <p style={{ color: '#8E8E93', fontSize: 13 }}>✓ Push notifications</p>
          <p style={{ color: '#3A3A3C', fontSize: 13 }}>✗ SMS alerts</p>
        </div>
      </div>

      <Section title="Account">
        <EditRow label="Name" value={name} onSave={setName} />
        <Row label="Email" value="you@email.com" onTap={() => soon('Change Email')} />
        <Row label="Phone" value="Not set" action="Add" onTap={() => soon('Add Phone')} />
      </Section>

      <Section title="Notifications">
        <ToggleRow label="Push Notifications" active={pushNotifs} onToggle={() => setPushNotifs(v => !v)} />
        <Row label="SMS Alerts" value="Pro only" onTap={() => soon('SMS Alerts')} />
        <ToggleRow label="Alert Sound" active={alertSound} onToggle={() => setAlertSound(v => !v)} />
      </Section>

      <Section title="Subscription">
        <Row label="Current Plan" value="Basic · $14.99/mo" onTap={() => soon('Manage Plan')} />
        <Row label="Next Billing Date" value="Apr 30, 2026" onTap={() => soon('Billing')} />
        <Row label="Upgrade to Pro" action="$24.99/mo" onTap={() => soon('Upgrade to Pro')} />
      </Section>

      <Section title="App">
        <Row label="Version" value="1.0.0" />
        <Row label="Rate FlipAlert" onTap={() => soon('Rate FlipAlert')} />
        <Row label={shareCopied ? 'Link copied!' : 'Share with a Friend'} onTap={handleShare} action={shareCopied ? '✓' : undefined} />
      </Section>

      <Section title="Legal">
        <Link href="/privacy" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
          <span style={{ color: '#fff', fontSize: 15 }}>Privacy Policy</span>
          {chevron}
        </Link>
        <Link href="/terms" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0' }}>
          <span style={{ color: '#fff', fontSize: 15 }}>Terms of Service</span>
          {chevron}
        </Link>
      </Section>

      <div style={{ padding: '0 16px', marginTop: 4 }}>
        <button onClick={() => soon('Sign Out')}
          style={{ width: '100%', background: '#1C1C1E', color: '#ff453a', fontWeight: 600, fontSize: 17, padding: '14px 0', borderRadius: 16, marginBottom: 10 }}>
          Sign Out
        </button>

        {!showDeleteConfirm ? (
          <button onClick={() => setShowDeleteConfirm(true)}
            style={{ width: '100%', background: 'transparent', color: '#636366', fontSize: 13, padding: '10px 0' }}>
            Delete Account & Data
          </button>
        ) : (
          <div style={{ background: '#1C1C1E', borderRadius: 16, padding: 16, textAlign: 'center' }}>
            <p style={{ color: '#fff', fontWeight: 700, fontSize: 15, marginBottom: 6 }}>Delete your account?</p>
            <p style={{ color: '#8E8E93', fontSize: 13, marginBottom: 16 }}>This permanently deletes your account, searches, and all data. This cannot be undone.</p>
            <button
              onClick={() => { setShowDeleteConfirm(false); soon('Account Deletion Submitted'); }}
              style={{ width: '100%', background: 'rgba(255,69,58,0.12)', color: '#ff453a', fontWeight: 700, fontSize: 15, padding: '12px 0', borderRadius: 12, marginBottom: 8 }}>
              Yes, Delete My Account
            </button>
            <button onClick={() => setShowDeleteConfirm(false)}
              style={{ width: '100%', background: '#2C2C2E', color: '#fff', fontWeight: 600, fontSize: 15, padding: '12px 0', borderRadius: 12 }}>
              Cancel
            </button>
          </div>
        )}
      </div>

      <BottomNav />

      {comingSoon && <ComingSoon label={comingSoon} onClose={() => setComingSoon(null)} />}
    </div>
  );
}
