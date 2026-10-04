// Single wolf paw print (metacarpal pad + four toes), toes pointing up.
// Pad is ONE smooth rounded shape — the old three-rear-lobe cutouts read as
// "bites" at large sizes (e.g. the stinger's 210px paws).
// Shared by Background + PawTrail.
export const Paw: React.FC<{ size: number; color: string; opacity?: number; x?: number; y?: number; stroke?: string; strokeWidth?: number }> = ({ size, color, opacity = 1, x = 0, y = 0, stroke, strokeWidth }) => (
  <svg x={x} y={y} width={size} height={size} viewBox="0 0 100 100" style={{ opacity, color }}>
    {/* metacarpal pad — smooth rounded triangle, no notches */}
    <path
      d="M50 46 C64 46 74 56 73 67 C72 77 64 83 50 83 C36 83 28 77 27 67 C26 56 36 46 50 46 Z"
      fill="currentColor"
      stroke={stroke}
      strokeWidth={strokeWidth}
    />
    {/* four toe pads — teardrop ovals, splayed toward travel */}
    <ellipse cx="24" cy="45" rx="8" ry="11" fill="currentColor" stroke={stroke} strokeWidth={strokeWidth} transform="rotate(-28 24 45)" />
    <ellipse cx="40" cy="29" rx="8" ry="12" fill="currentColor" stroke={stroke} strokeWidth={strokeWidth} transform="rotate(-12 40 29)" />
    <ellipse cx="60" cy="29" rx="8" ry="12" fill="currentColor" stroke={stroke} strokeWidth={strokeWidth} transform="rotate(12 60 29)" />
    <ellipse cx="76" cy="45" rx="8" ry="11" fill="currentColor" stroke={stroke} strokeWidth={strokeWidth} transform="rotate(28 76 45)" />
  </svg>
);
