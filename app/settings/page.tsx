'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Logo from '../components/Logo';
import BottomNav from '../components/BottomNav';
import Toggle from '../components/Toggle';
import { useTheme } from '../components/ThemeProvider';

const chevron = (
  <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
    <path d="M9 18l6-6-6-6" stroke="#C0B9B2" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

function Row({ label, value, action, onTap, destructive }: {
  label: string; value?: string; action?: string; onTap?: () => void; destructive?: boolean;
}) {
  return (
    <div onClick={onTap} role={onTap ? 'button' : undefined}
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '0.5px solid rgba(26,26,46,0.08)', cursor: onTap ? 'pointer' : 'default' }}
      className="last:border-0 active:opacity-60 transition-opacity">
      <span style={{ color: destructive ? '#ff453a' : '#1A1A2E', fontSize: 15 }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {value && <span style={{ color: '#9B9490', fontSize: 15 }}>{value}</span>}
        {action && <span style={{ color: '#FB471F', fontSize: 15 }}>{action}</span>}
        {onTap && chevron}
      </div>
    </div>
  );
}

function ToggleRow({ label, active, onToggle }: { label: string; active: boolean; onToggle: () => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '0.5px solid rgba(26,26,46,0.08)' }} className="last:border-0">
      <span style={{ color: '#1A1A2E', fontSize: 15 }}>{label}</span>
      <Toggle active={active} onToggle={onToggle} />
    </div>
  );
}

function EditRow({ label, value, onSave }: { label: string; value: string; onSave: (v: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  return (
    <div style={{ padding: '14px 0', borderBottom: '0.5px solid rgba(26,26,46,0.08)' }} className="last:border-0">
      {editing ? (
        <div>
          <p style={{ color: '#9B9490', fontSize: 12, marginBottom: 6 }}>{label}</p>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              autoFocus
              value={draft}
              onChange={e => setDraft(e.target.value)}
              style={{ flex: 1, background: '#F5F3F0', color: '#1A1A2E', fontSize: 15, padding: '8px 12px', borderRadius: 10, border: '1px solid rgba(26,26,46,0.10)', outline: 'none' }}
            />
            <button type="button" onClick={() => { onSave(draft); setEditing(false); }}
              style={{ background: '#FB471F', color: '#fff', fontWeight: 700, fontSize: 13, padding: '8px 14px', borderRadius: 10 }}>
              Save
            </button>
            <button type="button" onClick={() => { setDraft(value); setEditing(false); }}
              style={{ background: '#F0ECE7', color: '#6B6560', fontWeight: 600, fontSize: 13, padding: '8px 12px', borderRadius: 10 }}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div onClick={() => setEditing(true)} role="button" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
          className="active:opacity-60 transition-opacity">
          <span style={{ color: '#1A1A2E', fontSize: 15 }}>{label}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ color: '#9B9490', fontSize: 15 }}>{value}</span>
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
      <p style={{ color: '#9B9490', fontSize: 13, padding: '0 20px', marginBottom: 6 }}>{title}</p>
      <div style={{ background: '#fff', borderRadius: 16, padding: '0 16px', margin: '0 16px', border: '1px solid rgba(26,26,46,0.06)' }}>
        {children}
      </div>
    </div>
  );
}

// Coming soon sheet
function ComingSoon({ label, onClose }: { label: string; onClose: () => void }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', zIndex: 100, display: 'flex', alignItems: 'flex-end' }}>
      <div style={{ background: '#FAF8F5', borderRadius: '20px 20px 0 0', width: '100%', padding: '24px 20px 40px', textAlign: 'center' }}>
        <div style={{ width: 36, height: 5, background: '#E0D9D0', borderRadius: 3, margin: '0 auto 24px' }} />
        <div style={{ width: 52, height: 52, background: '#F0ECE7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="#FB471F" strokeWidth="1.8" strokeLinejoin="round"/>
          </svg>
        </div>
        <p style={{ color: '#1A1A2E', fontWeight: 700, fontSize: 18, marginBottom: 8 }}>{label}</p>
        <p style={{ color: '#9B9490', fontSize: 14, marginBottom: 28 }}>This feature will be available when FlipAlert launches. Stay tuned!</p>
        <button type="button" onClick={onClose} style={{ width: '100%', background: '#F0ECE7', color: '#6B6560', fontWeight: 600, fontSize: 17, padding: '14px 0', borderRadius: 14 }}>
          Got it
        </button>
      </div>
    </div>
  );
}

// ─── Connect Data Sheet ───────────────────────────────────────────────
function ConnectDataSheet({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(1);
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', zIndex: 100, display: 'flex', alignItems: 'flex-end' }}>
      <div style={{ background: '#FAF8F5', borderRadius: '20px 20px 0 0', width: '100%', padding: '0 0 44px', maxHeight: '88vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
          <div style={{ width: 36, height: 5, background: '#E0D9D0', borderRadius: 3 }} />
        </div>
        <div style={{ padding: '8px 20px 4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ color: '#1A1A2E', fontWeight: 800, fontSize: 20 }}>Connect Live Data</h2>
          <button type="button" onClick={onClose} style={{ width: 30, height: 30, background: '#F0ECE7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" stroke="#6B6560" strokeWidth="2" strokeLinecap="round"/></svg>
          </button>
        </div>
        <p style={{ color: '#9B9490', fontSize: 13, padding: '0 20px 20px' }}>Pull real Facebook Marketplace listings in 3 steps.</p>

        <div style={{ padding: '0 20px' }}>
          {/* Step 1 */}
          <StepCard num={1} active={step === 1} done={step > 1}
            title="Create a free Apify account"
            desc="Apify is the service that scrapes Facebook Marketplace for us. Free tier included."
            action={<a href="https://apify.com/sign-up" target="_blank" rel="noreferrer"
              style={{ display: 'inline-block', background: '#FB471F', color: '#fff', fontWeight: 700, fontSize: 14, padding: '10px 20px', borderRadius: 12 }}>
              Sign Up Free →
            </a>}
            onContinue={() => setStep(2)}
          />

          {/* Step 2 */}
          <StepCard num={2} active={step === 2} done={step > 2}
            title="Copy your Apify API key"
            desc={<>After signing up, go to <strong style={{ color: '#1A1A2E' }}>apify.com/account → Integrations</strong> and copy your Personal API token.</>}
            action={
              <div style={{ background: '#F5F3F0', borderRadius: 12, padding: 12, border: '1px solid rgba(26,26,46,0.08)' }}>
                <p style={{ color: '#9B9490', fontSize: 11, marginBottom: 4 }}>It looks like this:</p>
                <code style={{ color: '#FB471F', fontSize: 13 }}>apify_api_xxxxxxxxxxxxxxxxxxxxxxxxxxxx</code>
              </div>
            }
            onContinue={() => setStep(3)}
          />

          {/* Step 3 */}
          <StepCard num={3} active={step === 3} done={false}
            title="Add your key to .env.local"
            desc={<>Open the file <strong style={{ color: '#1A1A2E' }}>.env.local</strong> in your FlipAlert project folder and paste your key next to <code style={{ color: '#FB471F' }}>APIFY_API_KEY=</code></>}
            action={
              <div>
                <div style={{ background: '#1A1A2E', borderRadius: 12, padding: 12, fontFamily: 'monospace' }}>
                  <p style={{ color: '#6B6560', fontSize: 12 }}># .env.local</p>
                  <p style={{ color: '#FB471F', fontSize: 13 }}>APIFY_API_KEY=apify_api_your_key_here</p>
                </div>
                <p style={{ color: '#9B9490', fontSize: 12, marginTop: 8 }}>Then restart the dev server (<code style={{ color: '#6B6560' }}>npm run dev</code>) and refresh the app. The feed will automatically switch to live listings.</p>
              </div>
            }
            onContinue={onClose}
            continueLabel="Done ✓"
          />
        </div>
      </div>
    </div>
  );
}

function StepCard({ num, active, done, title, desc, action, onContinue, continueLabel = 'Continue' }: {
  num: number; active: boolean; done: boolean;
  title: string; desc: React.ReactNode; action: React.ReactNode;
  onContinue: () => void; continueLabel?: string;
}) {
  return (
    <div style={{ background: active ? '#fff' : done ? 'rgba(251,71,31,0.05)' : '#F5F3F0', border: '1px solid rgba(26,26,46,0.08)', borderRadius: 16, padding: 16, marginBottom: 12, opacity: (!active && !done) ? 0.5 : 1, transition: 'all 0.2s' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <div style={{ width: 28, height: 28, borderRadius: '50%', background: done ? '#FB471F' : active ? '#1A1A2E' : '#F0ECE7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {done
            ? <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            : <span style={{ color: active ? '#fff' : '#9B9490', fontSize: 13, fontWeight: 700 }}>{num}</span>
          }
        </div>
        <p style={{ color: done ? '#FB471F' : '#1A1A2E', fontWeight: 700, fontSize: 15 }}>{title}</p>
      </div>
      {active && (
        <>
          <p style={{ color: '#9B9490', fontSize: 13, marginBottom: 14, lineHeight: 1.5 }}>{desc}</p>
          <div style={{ marginBottom: 14 }}>{action}</div>
          <button type="button" onClick={onContinue}
            style={{ width: '100%', background: '#FB471F', color: '#fff', fontWeight: 700, fontSize: 15, padding: '12px 0', borderRadius: 12 }}>
            {continueLabel}
          </button>
        </>
      )}
    </div>
  );
}

export default function SettingsPage() {
  const { theme, toggle: toggleTheme } = useTheme();
  const [pushNotifs, setPushNotifs] = useState(true);
  const [alertSound, setAlertSound] = useState(true);
  const [name, setName] = useState('Your Name');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [comingSoon, setComingSoon] = useState<string | null>(null);
  const [shareCopied, setShareCopied] = useState(false);
  const [showConnectData, setShowConnectData] = useState(false);
  const [apifyConnected, setApifyConnected] = useState<boolean | null>(null);

  useEffect(() => {
    fetch('/api/status').then(r => r.json()).then(d => setApifyConnected(d.apifyConnected)).catch(() => {});
  }, []);

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
    <div className="min-h-screen pb-safe" style={{ background: '#FAF8F5' }}>
      <div className="px-5 pt-14 pb-5">
        <Logo size="sm" />
        <h1 style={{ color: '#1A1A2E', fontWeight: 800, fontSize: 28, marginTop: 16, letterSpacing: -0.5 }}>Settings</h1>
      </div>

      {/* Plan banner */}
      <div style={{ margin: '0 16px 20px', background: 'rgba(251,71,31,0.08)', border: '1px solid rgba(251,71,31,0.15)', borderRadius: 16, padding: 16 }}>
        <div className="flex items-center justify-between">
          <div>
            <p style={{ color: '#FB471F', fontWeight: 700, fontSize: 15 }}>Basic Plan</p>
            <p style={{ color: '#9B9490', fontSize: 13, marginTop: 2 }}>5 searches · Facebook Marketplace</p>
          </div>
          <button type="button" onClick={() => soon('Upgrade to Pro')}
            style={{ background: '#FB471F', color: '#fff', fontWeight: 700, fontSize: 13, padding: '7px 14px', borderRadius: 20 }}>
            Upgrade
          </button>
        </div>
        <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
          <p style={{ color: '#6B6560', fontSize: 13 }}>✓ 5 active searches</p>
          <p style={{ color: '#C0B9B2', fontSize: 13 }}>✗ Unlimited searches</p>
          <p style={{ color: '#6B6560', fontSize: 13 }}>✓ Push notifications</p>
          <p style={{ color: '#C0B9B2', fontSize: 13 }}>✗ SMS alerts</p>
        </div>
      </div>

      <Section title="Account">
        <EditRow label="Name" value={name} onSave={setName} />
        <Row label="Email" value="you@email.com" onTap={() => soon('Change Email')} />
        <Row label="Phone" value="Not set" action="Add" onTap={() => soon('Add Phone')} />
      </Section>

      <Section title="Data Source">
        <div onClick={() => setShowConnectData(true)} role="button"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '0.5px solid rgba(26,26,46,0.08)', cursor: 'pointer' }}
          className="active:opacity-60 transition-opacity">
          <div>
            <p style={{ color: '#1A1A2E', fontSize: 15 }}>Facebook Marketplace</p>
            <p style={{ color: apifyConnected ? '#FB471F' : '#eab308', fontSize: 12, marginTop: 2 }}>
              {apifyConnected === null ? 'Checking…' : apifyConnected ? '● Live — Apify connected' : '● Demo mode — tap to connect'}
            </p>
          </div>
          {chevron}
        </div>
        <Row label="KBB / Market Values" value="MarketCheck API" onTap={() => soon('MarketCheck Integration')} />
      </Section>

      <Section title="Appearance">
        <ToggleRow label="Dark Mode" active={theme === 'dark'} onToggle={toggleTheme} />
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
        <Link href="/privacy" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '0.5px solid rgba(26,26,46,0.08)' }}>
          <span style={{ color: '#1A1A2E', fontSize: 15 }}>Privacy Policy</span>
          {chevron}
        </Link>
        <Link href="/terms" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0' }}>
          <span style={{ color: '#1A1A2E', fontSize: 15 }}>Terms of Service</span>
          {chevron}
        </Link>
      </Section>

      <div style={{ padding: '0 16px', marginTop: 4 }}>
        <button type="button" onClick={() => soon('Sign Out')}
          style={{ width: '100%', background: '#fff', border: '1px solid rgba(26,26,46,0.08)', color: '#ff453a', fontWeight: 600, fontSize: 17, padding: '14px 0', borderRadius: 16, marginBottom: 10 }}>
          Sign Out
        </button>

        {!showDeleteConfirm ? (
          <button type="button" onClick={() => setShowDeleteConfirm(true)}
            style={{ width: '100%', background: 'transparent', color: '#9B9490', fontSize: 13, padding: '10px 0' }}>
            Delete Account & Data
          </button>
        ) : (
          <div style={{ background: '#fff', border: '1px solid rgba(26,26,46,0.08)', borderRadius: 16, padding: 16, textAlign: 'center' }}>
            <p style={{ color: '#1A1A2E', fontWeight: 700, fontSize: 15, marginBottom: 6 }}>Delete your account?</p>
            <p style={{ color: '#9B9490', fontSize: 13, marginBottom: 16 }}>This permanently deletes your account, searches, and all data. This cannot be undone.</p>
            <button
              type="button"
              onClick={() => { setShowDeleteConfirm(false); soon('Account Deletion Submitted'); }}
              style={{ width: '100%', background: 'rgba(255,69,58,0.12)', color: '#ff453a', fontWeight: 700, fontSize: 15, padding: '12px 0', borderRadius: 12, marginBottom: 8 }}>
              Yes, Delete My Account
            </button>
            <button type="button" onClick={() => setShowDeleteConfirm(false)}
              style={{ width: '100%', background: '#F0ECE7', color: '#6B6560', fontWeight: 600, fontSize: 15, padding: '12px 0', borderRadius: 12 }}>
              Cancel
            </button>
          </div>
        )}
      </div>

      <BottomNav />

      {comingSoon && <ComingSoon label={comingSoon} onClose={() => setComingSoon(null)} />}
      {showConnectData && <ConnectDataSheet onClose={() => setShowConnectData(false)} />}
    </div>
  );
}
