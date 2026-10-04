import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";

/** Transparent foreground: place above the model, below chat/widgets in OBS. */
export const DeskForeground: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const cycle = frame / durationInFrames;
  return (
    <AbsoluteFill>
      <svg width="1920" height="1080" viewBox="0 0 1920 1080">
        <defs>
          <linearGradient id="desk-top" x2="0" y2="1">
            <stop stopColor="#3c3435" />
            <stop offset="0.22" stopColor="#29262d" />
            <stop offset="1" stopColor="#171a25" />
          </linearGradient>
          <linearGradient id="desk-front" x2="0" y2="1">
            <stop stopColor="#151922" />
            <stop offset="1" stopColor="#070d18" />
          </linearGradient>
          <linearGradient id="mug" x2="1" y2="0">
            <stop stopColor="#152c40" />
            <stop offset="0.45" stopColor="#2b4d63" />
            <stop offset="1" stopColor="#112637" />
          </linearGradient>
          <linearGradient id="steam" x2="0" y2="1">
            <stop stopColor="#d4e9f2" stopOpacity="0" />
            <stop offset="0.45" stopColor="#d4e9f2" stopOpacity="0.55" />
            <stop offset="1" stopColor="#d4e9f2" stopOpacity="0" />
          </linearGradient>
          <filter id="steam-soft"><feGaussianBlur stdDeviation="2.5" /></filter>
        </defs>
        {/* The solid leading edge intentionally masks a model's lower crop. */}
        <path d="M0 860 H1920 V988 H0 Z" fill="url(#desk-top)" />
        <path d="M0 988 H1920 V1080 H0 Z" fill="url(#desk-front)" />
        <path d="M0 861 H1920" stroke="#adc9db" strokeOpacity="0.28" strokeWidth="3" />
        <path d="M0 984 H1920" stroke="#050b14" strokeWidth="8" />
        {Array.from({ length: 13 }, (_, i) => (
          <path key={i} d={`M0 ${873 + i * 8} C420 ${866 + i * 8}, 1040 ${881 + i * 8},1920 ${873 + i * 8}`} fill="none" stroke={i % 2 ? "#8c7870" : "#090e19"} strokeOpacity="0.12" strokeWidth="1.5" />
        ))}
        <ellipse cx="1146" cy="893" rx="104" ry="19" fill="#050b14" fillOpacity="0.48" />
        <ellipse cx="1146" cy="888" rx="90" ry="13" fill="#394655" />
        <ellipse cx="1146" cy="886" rx="77" ry="9" fill="#637584" fillOpacity="0.5" />
        <path d="M1185 802 C1247 785 1247 877 1188 864" fill="none" stroke="#28465a" strokeWidth="18" />
        <path d="M1090 797 H1195 L1187 875 Q1144 896 1098 875 Z" fill="url(#mug)" />
        <ellipse cx="1142" cy="797" rx="53" ry="12" fill="#768f9f" />
        <ellipse cx="1142" cy="798" rx="46" ry="8" fill="#211916" />
        <path d="M1104 815 L1109 861" stroke="#91c5d9" strokeWidth="3" strokeOpacity="0.23" strokeLinecap="round" />
        {[0, 1, 2].map((i) => {
          const phase = (cycle * 2 + i / 3) % 1;
          const opacity = Math.sin(Math.PI * phase) * 0.3;
          const drift = Math.sin(2 * Math.PI * (cycle + i / 3)) * 12;
          return <path key={i} d="M0 0 C-18 -25,24 -44,4 -68 C-14 -88,16 -102,3 -126" transform={`translate(${1120 + i * 20 + drift} ${806 - phase * 52})`} fill="none" stroke="url(#steam)" strokeWidth="6" strokeLinecap="round" opacity={opacity} filter="url(#steam-soft)" />;
        })}
      </svg>
    </AbsoluteFill>
  );
};
