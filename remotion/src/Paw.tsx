// Single wolf paw print (metacarpal pad + four toes), toes pointing up.
// Realistic shape: pad is a rounded triangle with three rear lobes; toes are
// splayed teardrop ovals, inner pair forward, outer pair lower and angled out.
// Shared by Background + PawTrail.
export const Paw: React.FC<{ size: number; color: string; opacity?: number }> = ({ size, color, opacity = 1 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{ opacity, color }}>
    {/* metacarpal pad — rounded triangle, three lobes at the rear */}
    <path
      d="M50 46 C64 46 74 56 73 67 C72.5 73 70 77 66 82 Q62 80 60 76 Q56 84 50 83 Q44 84 40 76 Q38 80 34 82 C30 77 27.5 73 27 67 C26 56 36 46 50 46 Z"
      fill="currentColor"
    />
    {/* four toe pads — teardrop ovals, splayed toward travel */}
    <ellipse cx="24" cy="45" rx="8" ry="11" fill="currentColor" transform="rotate(-28 24 45)" />
    <ellipse cx="40" cy="29" rx="8" ry="12" fill="currentColor" transform="rotate(-12 40 29)" />
    <ellipse cx="60" cy="29" rx="8" ry="12" fill="currentColor" transform="rotate(12 60 29)" />
    <ellipse cx="76" cy="45" rx="8" ry="11" fill="currentColor" transform="rotate(28 76 45)" />
  </svg>
);
