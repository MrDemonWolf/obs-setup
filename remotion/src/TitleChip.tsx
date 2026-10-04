import { useCurrentFrame } from "remotion";
import { theme, radius, loopSin } from "./theme";
import { display, body } from "./fonts";
import { WindowTitleBar } from "./WindowChrome";

// Fixed chip width so StartingSoon / BRB / EndingStream are all the SAME size
// (text left-aligned inside). Sized for the longest standby title at 108px with
// the L/R padding below. If you add a longer title, bump this and re-check it
// in the preview.
const CHIP_WIDTH = 1160;

// Frosted macOS-glass panel: window dots + rounded title + one clear status line.
export const TitleChip: React.FC<{ title: string; status: string }> = ({ title, status }) => {
  const frame = useCurrentFrame();
  // One slow, restrained edge pulse; the title and status stay still.
  const glow = 14 + 8 * (0.5 + 0.5 * loopSin(frame, 0.5));
  const titleSize = title.length > 20 ? 80 : title.length > 17 ? 96 : 108;

  return (
    <div
      style={{
        position: "absolute",
        left: 64,
        top: "34%",
        width: CHIP_WIDTH, // fixed → all three card scenes are the same size
        boxSizing: "border-box",
        // roomy, even inner padding; text is left-aligned (block default)
        padding: "44px 64px 48px",
        borderRadius: radius.card,
        // Opaque on purpose (equal-width boxes must read against the dark bg),
        // but GLASS, not flat: a diagonal sheen + vertical light-from-above
        // gradient fake the vibrancy that backdrop-filter would give (banned —
        // render cost). Both static → zero loop/perf impact.
        background: `linear-gradient(115deg, rgba(255,255,255,0.05) 0%, transparent 40%), linear-gradient(180deg, rgba(32,54,116,0.92) 0%, rgba(16,29,70,0.90) 100%)`,
        border: `1px solid rgba(255,255,255,0.22)`,
        boxShadow: `0 30px 80px rgba(0,0,0,0.45), inset 0 1.5px 0 rgba(255,255,255,0.22), 0 0 ${glow}px rgba(0,172,237,0.28)`,
      }}
    >
      {/* window traffic lights + tag (shared with the transparent overlays) */}
      <div style={{ marginBottom: 22 }}>
        <WindowTitleBar />
      </div>

      <div
        style={{
          fontFamily: display,
          fontWeight: 800,
          fontSize: titleSize,
          lineHeight: 1,
          whiteSpace: "nowrap",
          color: theme.white,
          letterSpacing: -1.5, // display-size extrabold tracks TIGHT (positive tracking read loose)
          textShadow: "0 3px 18px rgba(0,0,0,0.35)",
        }}
      >
        {title}
      </div>

      <div
        style={{
          marginTop: 20,
          display: "flex",
          alignItems: "center",
          gap: 12,
          fontFamily: body,
          fontSize: 36,
          color: theme.blueBright,
        }}
      >
        <span>{status}</span>
      </div>
    </div>
  );
};
