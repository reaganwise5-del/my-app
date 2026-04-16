export default function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const s = size === 'sm' ? { box: 30, icon: 14, fontSize: 17 }
           : size === 'lg' ? { box: 44, icon: 20, fontSize: 26 }
           : { box: 36, icon: 17, fontSize: 21 };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
      <div style={{ width: s.box, height: s.box, borderRadius: 10, background: '#E8601C', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 2px 8px rgba(232,96,28,0.35)' }}>
        <svg width={s.icon} height={s.icon} viewBox="0 0 16 16" fill="none">
          <path d="M9.5 1.5L4 9h5l-2.5 5.5L14 7H9L9.5 1.5z" fill="white" />
        </svg>
      </div>
      <span style={{ fontWeight: 800, fontSize: s.fontSize, letterSpacing: -0.6, color: '#1A1A2E', lineHeight: 1 }}>
        Flip<span style={{ color: '#E8601C' }}>Alert</span>
      </span>
    </div>
  );
}
