// Single paw print (one pad + four toes). Shared by Background + PawTrail.
export const Paw: React.FC<{ size: number; color: string; opacity?: number }> = ({ size, color, opacity = 1 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{ opacity, color }}>
    <ellipse cx="50" cy="64" rx="27" ry="23" fill="currentColor" />
    <circle cx="26" cy="40" r="11" fill="currentColor" />
    <circle cx="43" cy="26" r="11" fill="currentColor" />
    <circle cx="61" cy="26" r="11" fill="currentColor" />
    <circle cx="76" cy="40" r="11" fill="currentColor" />
  </svg>
);
