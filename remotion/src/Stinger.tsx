import {
  AbsoluteFill,
  Audio,
  Easing,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { theme, dotGridLayer, glassSheen, clamp01 } from "./theme";
import { Paw } from "./Paw";

// OBS "stinger" transition — Paw Swipe. A short full-frame alpha video that wipes
// across the screen during a scene cut. Structure: sweep IN (from the LEFT) ->
// HOLD fully covered -> sweep OUT (to the RIGHT). OBS swaps the underlying scene
// during the HOLD (around STINGER_COVER), so the cut is invisible. As the navy
// panel (bright cerulean leading edge, echoing the original stinger) wipes
// across left->right, paw prints STAMP in along a diagonal trail in lockstep with
// the wipe front; the wolf HEAD punches to center during the hold. The real SFX
// (reference/Stringer.wav -> public/stinger.wav) is delayed so its impact lands
// on the cover.
//
// Plays ONCE per cut — like Countdown, NOT a seamless loop, so motion is plain
// interpolate (no loop* helper).
export const STINGER_FPS = 60;
export const STINGER_SECONDS = 4; // total clip; ~1.3s is held fully covered
export const STINGER_DURATION = Math.round(STINGER_SECONDS * STINGER_FPS);

// Phase boundaries (fractions of the clip). Fully covered across [IN_END, OUT_START].
const IN_END = 0.34;
const OUT_START = 0.66;
export const STINGER_COVER = 0.5; // transition point = middle of the covered hold

// OBS Stinger "Transition Point" (ms) — a frame inside the fully-covered window.
export const STINGER_POINT_MS = Math.round(STINGER_COVER * STINGER_SECONDS * 1000);

// Where the whoosh impact sits inside Stringer.wav (~0.85s of its 2.16s) — used
// to delay the audio so the impact lands on the cover point.
const SFX_PEAK_S = 0.85;

// Navy-dominant cover panel (matches the original: solid navy, cerulean only on
// the leading edge). Dot grid + sheen sit over an OPAQUE navy gradient, so the
// panel fully blocks the screen at the hold.
const brandFill = `${dotGridLayer}, ${glassSheen}, linear-gradient(120deg, ${theme.navyDeep} 0%, ${theme.navyTop} 55%, ${theme.navyDeep} 100%)`;

// Even in-out sweep so the bright leading edge visibly crosses; ease-IN to
// accelerate the panel away on exit.
const EASE_SWEEP = Easing.inOut(Easing.cubic);
const EASE_IN = Easing.bezier(0.7, 0, 0.84, 0);

// Paw tracks laid LEFT->RIGHT walking across the CENTER of the frame — the trail
// IS the centerpiece. Alternating y = a gait; gentle diagonal flows with the
// wipe. No overlap.
const WALK = [
  { x: 10, y: 58, r: 10 },
  { x: 26, y: 46, r: 16 },
  { x: 42, y: 56, r: 10 },
  { x: 58, y: 44, r: 16 },
  { x: 74, y: 54, r: 10 },
  { x: 90, y: 42, r: 16 },
];

// Panel travel: -1.25 (off left) -> 0 (covering, held) -> +1.25 (off right).
// Shared by the panel and the paw exit (paws get wiped away by the same edge).
const panelXAt = (p: number) => {
  if (p <= IN_END) return -1.25 * (1 - EASE_SWEEP(clamp01(p / IN_END))); // enter from the left
  if (p < OUT_START) return 0; // HOLD fully covered
  return interpolate(p, [OUT_START, 1], [0, 1.25], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE_IN,
  }); // exit to the right
};

const usePanelX = () => {
  const frame = useCurrentFrame();
  const { durationInFrames: d } = useVideoConfig();
  const p = d > 1 ? frame / (d - 1) : 0;
  return { p, x: panelXAt(p) };
};

// Slow walking march IN: paw i stamps at an even time cadence (first lands as
// the sweep settles, last lands mid-hold) — reads as the wolf unhurriedly
// walking through while the screen is covered.
const STAMP_FIRST = 0.1975; // first paw slides in as the panel covers
const STAMP_LAST = 0.4875; // last paw lands mid-hold

// March OUT: paws fade LEFT->RIGHT (oldest print first — the trail evaporates
// behind the wolf in his direction of travel); whatever remains rides off with
// the panel (the paws are painted ON it).
// Paws hold through the whole cover, then fade L->R right as the exit begins
// (whatever's left rides off with the panel).
const UNSTAMP_FIRST = 0.8075; // leftmost paw lifts deep into the exit
const UNSTAMP_LAST = 0.9575; // rightmost paw lifts last (carried off by the swoosh)

// Paw prints painted ON the cover panel (rendered as its children), so they
// MOVE WITH the panel through the sweeps — one welded layer, no gating math.
// Positions are given in screen-% at the hold; the panel spans -25%..125% of the
// comp, so screen x% -> panel-local (x + 25) / 1.5 %.
const PawWalk: React.FC<{ p: number }> = ({ p }) => (
  <>
    {WALK.map((w, i) => {
      const stampP = STAMP_FIRST + (i * (STAMP_LAST - STAMP_FIRST)) / (WALK.length - 1);
      const appear = interpolate(p, [stampP - 0.04, stampP], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
      const pop = interpolate(appear, [0, 1], [1.35, 1]); // stamp-down pop
      // fade marches L->R: leftmost (oldest) print lifts first
      const unstampP = UNSTAMP_FIRST + (i * (UNSTAMP_LAST - UNSTAMP_FIRST)) / (WALK.length - 1);
      const leave = interpolate(p, [unstampP - 0.04, unstampP], [1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
      const lift = 1 + 0.3 * (1 - leave); // grows slightly as it lifts away
      return (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${(w.x + 25) / 1.5}%`,
            top: `${w.y}%`,
            // counter-skew so the paw isn't sheared by the panel's skewX(-9deg)
            transform: `translate(-50%, -50%) skewX(9deg) rotate(${w.r}deg) scale(${pop * lift})`,
            opacity: appear * leave * 0.92,
            filter: "drop-shadow(0 6px 14px rgba(0,0,0,0.35))",
          }}
        >
          <Paw size={210} color={theme.blueBright} />
        </div>
      );
    })}
  </>
);

export const Stinger: React.FC = () => {
  const { p, x } = usePanelX();
  const { fps, width } = useVideoConfig();
  const sfxDelay = Math.max(0, Math.round((STINGER_COVER * STINGER_SECONDS - SFX_PEAK_S) * fps));
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {/* cover panel — sized in COMPOSITION pixels (never vw/vh: in the Player
          preview the browser viewport ≠ the 1920×1080 canvas, so vw misplaces
          the panel and it fails to cover the frame) */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: -0.25 * width,
          width: 1.5 * width,
          height: "100%",
          background: brandFill,
          transform: `translateX(${x * 1.1 * width}px) skewX(-9deg)`,
        }}
      >
        {/* leading-edge stripes, FLUSH with the panel's right edge (white is the
            outermost tip, cerulean right behind it, then navy) — one welded unit
            so the edge reads as part of the panel, not floating bars */}
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 18,
            width: 56,
            height: "100%",
            background: theme.blue,
            boxShadow: `0 0 90px ${theme.blueBright}, 0 0 36px ${theme.blue}`,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: 18,
            height: "100%",
            background: theme.white,
          }}
        />
        {/* paws painted on the panel — they ride the sweep with it */}
        <PawWalk p={p} />
      </div>
      {/* real SFX, delayed so its impact lands on the cover point */}
      <Sequence from={sfxDelay}>
        <Audio src={staticFile("stinger.wav")} />
      </Sequence>
    </AbsoluteFill>
  );
};
