export default function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: { icon: 18, text: 'text-lg', gap: 'gap-1.5' },
    md: { icon: 24, text: 'text-2xl', gap: 'gap-2' },
    lg: { icon: 32, text: 'text-3xl', gap: 'gap-2.5' },
  };
  const s = sizes[size];

  return (
    <div className={`flex items-center ${s.gap}`}>
      {/* Icon: lightning bolt in green circle */}
      <div
        className="rounded-xl flex items-center justify-center bg-green-500 shrink-0"
        style={{ width: s.icon + 10, height: s.icon + 10 }}
      >
        <svg width={s.icon - 4} height={s.icon - 4} viewBox="0 0 16 16" fill="none">
          <path
            d="M9.5 1.5L4 9h5l-2.5 5.5L14 7H9L9.5 1.5z"
            fill="white"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <span className={`font-black tracking-tight text-white ${s.text}`}>
        Flip<span className="text-green-400">Alert</span>
      </span>
    </div>
  );
}
