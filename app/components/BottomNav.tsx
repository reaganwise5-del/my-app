'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  {
    href: '/',
    label: 'Home',
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M3 12L12 4l9 8v8a1 1 0 01-1 1h-5v-5H9v5H4a1 1 0 01-1-1v-8z"
          fill={active ? '#22c55e' : 'none'}
          stroke={active ? '#22c55e' : '#636366'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: '/feed',
    label: 'Feed',
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="7" height="7" rx="2" fill={active ? '#22c55e' : 'none'} stroke={active ? '#22c55e' : '#636366'} strokeWidth="1.8" />
        <rect x="14" y="3" width="7" height="7" rx="2" fill={active ? '#22c55e' : 'none'} stroke={active ? '#22c55e' : '#636366'} strokeWidth="1.8" />
        <rect x="3" y="14" width="7" height="7" rx="2" fill={active ? '#22c55e' : 'none'} stroke={active ? '#22c55e' : '#636366'} strokeWidth="1.8" />
        <rect x="14" y="14" width="7" height="7" rx="2" fill={active ? '#22c55e' : 'none'} stroke={active ? '#22c55e' : '#636366'} strokeWidth="1.8" />
      </svg>
    ),
  },
  {
    href: '/tracker',
    label: 'Tracker',
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M3 3v18h18" stroke={active ? '#22c55e' : '#636366'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M7 16l4-5 4 3 4-6" stroke={active ? '#22c55e' : '#636366'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: '/settings',
    label: 'Settings',
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="3" stroke={active ? '#22c55e' : '#636366'} strokeWidth="1.8" />
        <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
          stroke={active ? '#22c55e' : '#636366'} strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50" style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(20px) saturate(180%)', WebkitBackdropFilter: 'blur(20px) saturate(180%)', borderTop: '0.5px solid rgba(255,255,255,0.12)' }}>
      <div className="flex">
        {tabs.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link key={tab.href} href={tab.href}
              className="flex-1 flex flex-col items-center justify-center pt-2.5 pb-1 gap-1">
              {tab.icon(active)}
              <span style={{ fontSize: 10, fontWeight: active ? 600 : 400, color: active ? '#22c55e' : '#636366', letterSpacing: 0.2 }}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
      <div style={{ height: 'env(safe-area-inset-bottom, 20px)' }} />
    </nav>
  );
}
