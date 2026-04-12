'use client';

export default function Toggle({ active, onToggle }: { active: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      style={{
        position: 'relative',
        width: 52,
        height: 30,
        borderRadius: 999,
        backgroundColor: active ? '#22c55e' : '#3f3f46',
        border: 'none',
        cursor: 'pointer',
        flexShrink: 0,
        transition: 'background-color 0.2s',
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: 4,
          left: active ? 26 : 4,
          width: 22,
          height: 22,
          borderRadius: '50%',
          backgroundColor: 'white',
          boxShadow: '0 1px 4px rgba(0,0,0,0.4)',
          transition: 'left 0.2s',
          display: 'block',
        }}
      />
    </button>
  );
}
