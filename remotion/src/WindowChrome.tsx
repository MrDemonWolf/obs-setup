import { theme, radius } from "./theme";
import { body } from "./fonts";

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

// Full title bar: traffic lights + a domain tag on ONE row. This is what makes
// the dots read as window chrome (bare dots just look like orphaned circles).
// Shared by TitleChip and the big transparent overlays (Countdown/LoadingBarks)
// so every card reads as the same mrdemonwolf.com window. `size` scales dots +
// label together (label ≈ 1.6× a dot, matching the card chip's 24px:15px).
export const WindowTitleBar: React.FC<{ size?: number; gap?: number; label?: string }> = ({
  size = 15,
  gap = 10,
  label = "mrdemonwolf.com",
}) => (
  <div style={{ display: "flex", alignItems: "center", gap }}>
    <WindowDots size={size} gap={gap} />
    {label && (
      <span
        style={{
          marginLeft: 14,
          fontFamily: body,
          fontSize: Math.round(size * 1.6),
          color: theme.textDim,
          letterSpacing: 1.5,
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </span>
    )}
  </div>
);
