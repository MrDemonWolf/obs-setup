import { useCurrentFrame } from "remotion";
import { theme, radius, loopSin, loopBreathe } from "./theme";
import { display, body } from "./fonts";
import { WindowTitleBar } from "./WindowChrome";

// Fixed chip width so StartingSoon / BRB / EndingStream are all the SAME size
// (text left-aligned inside). Sized to fit the widest title ("The Pack Gathers")
// at 108px with the L/R padding below. If you add a longer title, bump this and
// re-check the mascot overlap (right-anchored wolf must clear the chip's right edge).
const CHIP_WIDTH = 1160;

// Frosted macOS-glass panel: window dots + rounded title + one status line,
// ending in a blinking terminal cursor.
export const TitleChip: React.FC<{ title: string; status: string }> = ({ title, status }) => {
  const frame = useCurrentFrame();
  // The chip does NOT translate — it stays put. It just breathes: rests at its
  // base size, grows ~0.7% and eases back (loopBreathe: eased in AND out).
  // harmonic 2 → two 4s breaths per loop, matching the mascot's cadence; amp
  // 0.007 keeps the edge travel ~8px, UNDER the mascot's breathe so the panel
  // never out-breathes the wolf. transformOrigin left-center pins the left edge.
  const scale = 1 + 0.007 * loopBreathe(frame, 2);
  const glow = 14 + 8 * (0.5 + 0.5 * loopSin(frame, 0.5));
  const cursor = Math.floor(frame / 15) % 2 === 0; // blink ~every 0.5s @30fps

  return (
    <div
      style={{
        position: "absolute",
        left: 64,
        top: "34%",
        width: CHIP_WIDTH, // fixed → all three card scenes are the same size
        boxSizing: "border-box",
        transform: `scale(${scale})`,
        transformOrigin: "left center",
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
          fontSize: 108,
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
        {/* one metaphor only: terminal prompt + cursor. (The old pulsing green
            LED stacked a second signifier on the line AND reused the window-dot
            green for a different meaning.) Cursor in the text's own accent so it
            reads as part of the prompt, not a third color. */}
        <span>{status}</span>
        <span style={{ opacity: cursor ? 1 : 0 }}>▊</span>
      </div>
    </div>
  );
};
