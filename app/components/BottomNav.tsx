'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const ORANGE = '#FB471F';
const INACTIVE = '#A09890';

const tabs = [
  {
    href: '/',
    label: 'Home',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M3 12L12 4l9 8v8a1 1 0 01-1 1h-5v-5H9v5H4a1 1 0 01-1-1v-8z"
          fill={active ? ORANGE : 'none'}
          stroke={active ? ORANGE : INACTIVE}
          strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: '/feed',
    label: 'Feed',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M4 6h16M4 10h16M4 14h10M4 18h7" stroke={active ? ORANGE : INACTIVE} strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: '/tracker',
    label: 'Tracker',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M3 3v18h18" stroke={active ? ORANGE : INACTIVE} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M7 16l4-5 4 3 4-6" stroke={active ? ORANGE : INACTIVE} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: '/settings',
    label: 'Settings',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="3" stroke={active ? ORANGE : INACTIVE} strokeWidth="1.8" />
        <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke={active ? ORANGE : INACTIVE} strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50" style={{ background: 'rgba(250,248,245,0.92)', backdropFilter: 'blur(20px) saturate(180%)', WebkitBackdropFilter: 'blur(20px) saturate(180%)', borderTop: '1px solid rgba(26,26,46,0.08)' }}>
      <div className="flex">
        {tabs.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link key={tab.href} href={tab.href}
              className="flex-1 flex flex-col items-center justify-center pt-2.5 pb-1 gap-1"
              style={{ transition: 'opacity 0.15s' }}>
              {tab.icon(active)}
              <span style={{ fontSize: 10, fontWeight: active ? 700 : 500, color: active ? ORANGE : INACTIVE, letterSpacing: 0.1, transition: 'color 0.15s' }}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
      <div style={{ height: 'env(safe-area-inset-bottom, 16px)' }} />
    </nav>
  );
}
