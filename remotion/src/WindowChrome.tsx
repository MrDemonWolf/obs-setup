import { radius } from "./theme";

// macOS window chrome, shared by every glass card (TitleChip + the transparent
// Countdown / LoadingBarks / Socials overlays) so they all read as the same
// little browser window.
//
// True macOS traffic-light hexes — the brand red/amber/green (#E0533D/#E6B34B/
// #3ED598) read brick/mint and break the instant-recognition job window chrome
// exists for. theme.* stays untouched for mascot/other uses.
export const MAC_DOT = { red: "#FF5F57", amber: "#FEBC2E", green: "#28C840" } as const;

// The three traffic lights. `size`/`gap` scale them for smaller cards.
export const WindowDots: React.FC<{ size?: number; gap?: number }> = ({ size = 15, gap = 10 }) => (
  <div style={{ display: "flex", alignItems: "center", gap }}>
    {[MAC_DOT.red, MAC_DOT.amber, MAC_DOT.green].map((c) => (
      <span key={c} style={{ width: size, height: size, borderRadius: radius.dot, background: c, display: "inline-block" }} />
    ))}
  </div>
);
