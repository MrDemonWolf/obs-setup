import { useCurrentFrame } from "remotion";
import { Paw } from "./Paw";
import { theme, loopSin } from "./theme";

// Wolf-themed loading indicator: a row of paws pulsing in a traveling wave
// (the paw version of typing dots). Reusable — parent positions it; drop it
// into a status line, a chip, or absolutely anywhere. Seamless: an integer
// `harmonic` returns every paw to its start at the loop seam.
export const PawLoader: React.FC<{
  count?: number;
  size?: number;
  gap?: number;
  color?: string;
  harmonic?: number;
}> = ({ count = 4, size = 30, gap = 10, color = theme.blueBright, harmonic = 2 }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap }}>
      {Array.from({ length: count }).map((_, i) => {
        const pulse = 0.5 + 0.5 * loopSin(f, -i / count, harmonic); // wave sweeps →
        return (
          <div key={i} style={{ transform: `scale(${0.82 + 0.18 * pulse})`, opacity: 0.3 + 0.7 * pulse }}>
            <Paw size={size} color={color} />
          </div>
        );
      })}
    </div>
  );
};
