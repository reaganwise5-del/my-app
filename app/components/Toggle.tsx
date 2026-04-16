'use client';

export default function Toggle({ active, onToggle }: { active: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      style={{
        position: 'relative',
        width: 48,
        height: 28,
        borderRadius: 999,
        backgroundColor: active ? '#E8601C' : '#D5CFC8',
        border: 'none',
        cursor: 'pointer',
        flexShrink: 0,
        transition: 'background-color 0.2s ease',
      }}
    >
      <span style={{
        position: 'absolute',
        top: 3,
        left: active ? 23 : 3,
        width: 22,
        height: 22,
        borderRadius: '50%',
        backgroundColor: 'white',
        boxShadow: '0 1px 4px rgba(26,26,46,0.25)',
        transition: 'left 0.2s ease',
        display: 'block',
      }} />
    </button>
  );
}
